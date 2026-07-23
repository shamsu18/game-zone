import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import Spinner from './Spinner.jsx';

// Guards routes by auth and (optionally) allowed roles.
export default function ProtectedRoute({ children, roles }) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) return <Spinner label="Checking session…" />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
