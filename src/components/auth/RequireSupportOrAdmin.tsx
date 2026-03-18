import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
};

const RequireSupportOrAdmin: React.FC<Props> = ({ children, redirectTo = '/dashboard' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  const role = (user as any)?.user_role as string | undefined;
  const allowed = role === 'suporte' || role === 'admin';

  if (!user || !allowed) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default RequireSupportOrAdmin;
