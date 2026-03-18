import { useState, useEffect, useRef } from 'react';
import { useApiDashboardAdmin } from '@/hooks/useApiDashboardAdmin';

export const useOnlineUsersAdmin = () => {
  const { stats, loadStats } = useApiDashboardAdmin();
  const [currentOnlineCount, setCurrentOnlineCount] = useState(0);
  const previousCountRef = useRef(0);

  // Monitorar mudanças no localStorage para detectar novos logins
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Detectar quando um novo usuário faz login (novo user_online_* é criado)
      if (e.key && e.key.startsWith('user_online_') && e.newValue && !e.oldValue) {
        console.log('Novo usuário logou:', e.key);
        // Recarregar imediatamente
        loadStats();
      }
    };

    // Escutar mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);

    // Polling mais frequente para garantir dados atualizados (a cada 5 segundos)
    const intervalId = setInterval(() => {
      loadStats();
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [loadStats]);

  // Atualizar contador quando os dados mudam
  useEffect(() => {
    if (stats?.users_online !== undefined) {
      const newCount = stats.users_online;
      setCurrentOnlineCount(newCount);
      previousCountRef.current = newCount;
    }
  }, [stats?.users_online]);

  return {
    onlineCount: currentOnlineCount,
    refresh: loadStats
  };
};