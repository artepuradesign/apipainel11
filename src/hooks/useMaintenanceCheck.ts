import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';

export const useMaintenanceCheck = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const url = getApiUrl('/system-config/get?category=system');
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const maintenanceConfig = data.data.find(
            (c: any) => c.config_key === 'maintenance_mode'
          );
          if (maintenanceConfig) {
            const val = String(maintenanceConfig.config_value).toLowerCase();
            setIsMaintenanceMode(val === 'true' || val === '1');
          }
        }
      } catch (error) {
        console.warn('⚠️ [MAINTENANCE] Erro ao verificar modo de manutenção:', error);
        // Em caso de erro, não bloquear o acesso
        setIsMaintenanceMode(false);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();

    // Re-check every 60 seconds
    const interval = setInterval(checkMaintenance, 60000);
    return () => clearInterval(interval);
  }, []);

  return { isMaintenanceMode, loading };
};
