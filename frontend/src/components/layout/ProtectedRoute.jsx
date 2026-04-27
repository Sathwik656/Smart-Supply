import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  // Also check local storage as a quick synchronous guard
  const token = localStorage.getItem('access_token');
  
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
