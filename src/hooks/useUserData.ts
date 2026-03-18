
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiAccessLogs } from './useApiAccessLogs';

export const useUserData = (painelId: string | undefined) => {
  const { user } = useAuth();
  const { logPageAccess } = useApiAccessLogs();
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);

  const loadUserData = async () => {
    if (!user) return;

    // Usar histórico específico do usuário
    const history = JSON.parse(localStorage.getItem(`consultation_history_${user.id}`) || "[]");
    setConsultationHistory(history);

    // Initialize access logs (mantém localStorage como backup)
    const logs = JSON.parse(localStorage.getItem(`access_logs_${user.id}`) || "[]");
    setAccessLogs(logs);

    // Capturar a página atual
    const currentPath = window.location.pathname;
    
    // Registrar acesso na API (com fallback para localStorage)
    try {
      await logPageAccess(currentPath);
    } catch (error) {
      console.warn('Falha ao registrar na API, usando fallback local:', error);
      
      // Fallback para localStorage
      const currentAccess = {
        id: Date.now().toString(),
        device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Computer',
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        timestamp: new Date().toISOString(),
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                 navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                 navigator.userAgent.includes('Safari') ? 'Safari' : 'Outro',
        page: currentPath
      };

      const updatedLogs = [currentAccess, ...logs].slice(0, 15);
      setAccessLogs(updatedLogs);
      localStorage.setItem(`access_logs_${user.id}`, JSON.stringify(updatedLogs));
      
      // Também salvar no log global
      const globalLogs = JSON.parse(localStorage.getItem('global_access_logs') || '[]');
      const updatedGlobalLogs = [currentAccess, ...globalLogs].slice(0, 50);
      localStorage.setItem('global_access_logs', JSON.stringify(updatedGlobalLogs));
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, window.location.pathname]);

  return { consultationHistory, accessLogs };
};
