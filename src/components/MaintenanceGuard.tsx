import React from 'react';
import { useMaintenanceCheck } from '@/hooks/useMaintenanceCheck';
import { useAuth } from '@/contexts/AuthContext';
import MaintenancePage from '@/pages/MaintenancePage';
import LoadingScreen from '@/components/layout/LoadingScreen';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
  const { isMaintenanceMode, loading } = useMaintenanceCheck();
  const { isSupport } = useAuth();

  // Don't block admins/support from accessing the site
  if (isSupport) {
    return <>{children}</>;
  }

  if (loading) {
    return <LoadingScreen message="Verificando sistema..." variant="auth" />;
  }

  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
