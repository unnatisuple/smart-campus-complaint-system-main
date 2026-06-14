import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Role } from '../types';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Role[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate portal
    const redirectMap: Record<Role, string> = {
      student: '/student/dashboard',
      staff: '/staff/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={redirectMap[user.role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
