import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cookieUtils } from '@/utils/cookieUtils';
import { getBaseApiUrl } from '@/utils/apiHelper';

const API_URL = getBaseApiUrl();

interface SessionInfo {
  id: number;
  device: string;
  browser: string;
  os: string;
  location: string;
  country: string;
  ip_address: string;
  created_at: string;
  last_activity: string;
}

interface UseSessionMonitorReturn {
  hasMultipleSessions: boolean;
  newSessions: SessionInfo[];
  activeSessions: SessionInfo[];
  loading: boolean;
  acknowledgeNewSession: (sessionId: number) => void;
}

export const useSessionMonitor = (): UseSessionMonitorReturn => {
  const { user } = useAuth();
  const [hasMultipleSessions, setHasMultipleSessions] = useState(false);
  const [newSessions, setNewSessions] = useState<SessionInfo[]>([]);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const acknowledgedSessionsRef = useRef<Set<number>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkSessions = async () => {
    if (!user) return;

    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    if (!token) return;

    try {
      setLoading(true);
      
      // Verificar sessão atual e buscar novas sessões
      const response = await fetch(`${API_URL}/session-monitor/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const sessions = data.data.sessions || [];
          setActiveSessions(sessions);
          
          // Detectar novas sessões (não reconhecidas)
          const unacknowledged = sessions.filter(
            (session: SessionInfo) => !acknowledgedSessionsRef.current.has(session.id)
          );
          
          // Se há mais de uma sessão e há não reconhecidas
          if (sessions.length > 1 && unacknowledged.length > 0) {
            setHasMultipleSessions(true);
            // Filtrar apenas a mais recente não reconhecida
            const newest = unacknowledged.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];
            
            if (newest) {
              setNewSessions([newest]);
            }
          } else {
            setHasMultipleSessions(sessions.length > 1);
            setNewSessions([]);
          }
        }
      } else if (response.status === 401) {
        // Token inválido, redirecionar para logout
        console.log('🚫 [SESSION_MONITOR] Token inválido, redirecionando para logout');
        window.location.href = '/logout';
      }
      
    } catch (error) {
      console.error('❌ [SESSION_MONITOR] Erro ao verificar sessões:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeNewSession = (sessionId: number) => {
    acknowledgedSessionsRef.current.add(sessionId);
    setNewSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (newSessions.length <= 1) {
      setHasMultipleSessions(false);
    }
  };

  useEffect(() => {
    if (!user) {
      // Limpar interval se não há usuário
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Verificar imediatamente
    checkSessions();

    // Verificar a cada 30 segundos
    intervalRef.current = setInterval(checkSessions, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  return {
    hasMultipleSessions,
    newSessions,
    activeSessions,
    loading,
    acknowledgeNewSession
  };
};
