import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage = ({ mode = 'login' }) => {
  const isRegisterMode = mode === 'register';
  const [username, setUsername] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    setError('');
    if (isRegisterMode && username === 'admin') {
      setUsername('');
      setPassword('');
    }
    if (!isRegisterMode && !username) {
      setUsername('admin');
      setPassword('password');
    }
  }, [isRegisterMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || (isRegisterMode && !email)) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await register({ username, email, password });
      } else {
        await login(username, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
      <div className="max-w-md w-full glass p-8 rounded-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">SmartLogis</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isRegisterMode ? 'Create an operator account' : 'Sign in to the operator dashboard'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 rounded-lg bg-gray-100 dark:bg-dark-800 p-1">
          <Link
            to="/login"
            className={`text-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              !isRegisterMode ? 'bg-white dark:bg-dark-700 text-brand-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`text-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isRegisterMode ? 'bg-white dark:bg-dark-700 text-brand-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Register
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegisterMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Please wait...' : isRegisterMode ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {!isRegisterMode && (
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-5">
            Admin access remains available with the seeded admin credentials.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
