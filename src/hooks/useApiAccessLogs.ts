
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface AccessLog {
  id: string;
  device: string;
  ip: string;
  timestamp: string;
  browser: string;
  page: string;
}

export const useApiAccessLogs = () => {
  const { user } = useAuth();
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLocalAccessLog = (page: string): AccessLog => {
    return {
      id: Date.now().toString(),
      device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Computer',
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
               navigator.userAgent.includes('Firefox') ? 'Firefox' : 
               navigator.userAgent.includes('Safari') ? 'Safari' : 'Outro',
      page: page
    };
  };

  const logPageAccess = async (page: string) => {
    if (!user) {
      console.warn('Usuário não autenticado para registrar acesso');
      return;
    }

    try {
      // Verificar se há token de sessão
      const sessionToken = localStorage.getItem('session_token');
      
      if (!sessionToken) {
        console.warn('Token de sessão não encontrado para registrar acesso');
        
        // Usar fallback local
        const localLog = generateLocalAccessLog(page);
        const userLogs = JSON.parse(localStorage.getItem(`access_logs_${user.id}`) || '[]');
        const updatedLogs = [localLog, ...userLogs].slice(0, 15);
        
        setAccessLogs(updatedLogs);
        localStorage.setItem(`access_logs_${user.id}`, JSON.stringify(updatedLogs));
        return;
      }

      // Tentar registrar via API
      const response = await fetch('https://api.apipainel.com.br/access-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
          'X-API-Key': import.meta.env.VITE_API_KEY ?? ''
        },
        body: JSON.stringify({
          page: page,
          user_agent: navigator.userAgent,
          ip: '0.0.0.0', // Será preenchido pelo servidor
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Acesso registrado via API para:', page);
        await loadAccessLogs(); // Recarregar logs da API
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.warn('⚠️ Falha ao registrar acesso via API, usando fallback local:', error);
      setError('Erro ao conectar com servidor - usando dados locais');
      
      // Fallback para localStorage
      const localLog = generateLocalAccessLog(page);
      const userLogs = JSON.parse(localStorage.getItem(`access_logs_${user.id}`) || '[]');
      const updatedLogs = [localLog, ...userLogs].slice(0, 15);
      
      setAccessLogs(updatedLogs);
      localStorage.setItem(`access_logs_${user.id}`, JSON.stringify(updatedLogs));
    }
  };

  const loadAccessLogs = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (!sessionToken) {
        // Carregar do localStorage
        const localLogs = JSON.parse(localStorage.getItem(`access_logs_${user.id}`) || '[]');
        setAccessLogs(localLogs);
        return;
      }

      const response = await fetch('https://api.apipainel.com.br/access-logs', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'X-API-Key': import.meta.env.VITE_API_KEY ?? ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAccessLogs(data.data);
          console.log('✅ Logs carregados da API:', data.data.length);
          setError(null);
        } else {
          throw new Error('Dados inválidos da API');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar logs de acesso via API:', error);
      setError('Erro ao conectar com servidor - exibindo dados locais');
      
      // Fallback para localStorage
      const localLogs = JSON.parse(localStorage.getItem(`access_logs_${user.id}`) || '[]');
      setAccessLogs(localLogs);
      
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLogs = async () => {
    await loadAccessLogs();
  };

  useEffect(() => {
    if (user) {
      loadAccessLogs();
    }
  }, [user]);

  return {
    accessLogs,
    isLoading,
    error,
    logPageAccess,
    loadAccessLogs,
    refreshLogs
  };
};
