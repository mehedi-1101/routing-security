import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // Pass current location as state so DemoApp can navigate back after login.
    // location.pathname here is e.g. "/admin" — the page they tried to reach.
    return <Navigate to="/demo" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default ProtectedRoute;