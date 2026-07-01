import { Outlet } from 'react-router';
import { AuthProvider } from '../contexts/AuthContext';

/**
 * Root layout that provides AuthContext to all routes.
 * Placed as the top-level route component so that every page
 * rendered via <Outlet /> has access to useAuth() AND useNavigate().
 */
export default function AuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
