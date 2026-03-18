import { useState, useCallback } from 'react';
import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest, fetchApiConfig } from '@/config/api';

export interface UserSession {
  id: number;
  user_id: number;
  device_type: string;
  browser: string;
  ip_address: string;
  page_accessed: string;
  access_time: string;
  session_duration?: number;
  user_agent: string;
  created_at: string;
  updated_at: string;
}

export const useApiUserSessions = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserSessions = useCallback(async (limit = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await fetchApiConfig();
      const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      console.log('🔄 [USER_SESSIONS] Carregando sessões de usuário da API...');
      
      const data = await apiRequest<any>(`/user-sessions?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (data.success) {
        setSessions(data.data || []);
        console.log('✅ [USER_SESSIONS] Sessões carregadas:', data.data?.length || 0);
      } else {
        throw new Error(data.message || 'Erro ao carregar sessões de usuário');
      }
    } catch (error) {
      console.error('❌ [USER_SESSIONS] Erro ao carregar sessões:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSessions = useCallback(() => {
    loadUserSessions();
  }, [loadUserSessions]);

  return {
    sessions,
    isLoading,
    error,
    loadUserSessions,
    refreshSessions,
  };
};