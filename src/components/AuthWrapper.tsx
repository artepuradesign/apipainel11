import React from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  // Proteção de rotas habilitada - verifica autenticação em cada mudança de rota
  useAuthGuard();
  
  return <>{children}</>;
};

export default AuthWrapper;