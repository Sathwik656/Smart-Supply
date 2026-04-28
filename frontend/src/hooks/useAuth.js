import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuthState();

  return createElement(AuthContext.Provider, { value: auth }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (localStorage.getItem('access_token')) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error("Token invalid", error);
        }
      }
      setLoading(false);
    };

    const handleUnauthorized = () => {
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('auth:logout', handleUnauthorized);
    fetchUser();

    return () => window.removeEventListener('auth:logout', handleUnauthorized);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem('access_token', res.data.access_token);
    const userRes = await api.get('/auth/me');
    setUser(userRes.data);
  };

  const register = async ({ username, email, password }) => {
    await api.post('/auth/register', { username, email, password });
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [user, loading]
  );
};
