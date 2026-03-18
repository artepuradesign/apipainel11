import { useState, useCallback, useEffect } from 'react';
import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest, fetchApiConfig } from '@/config/api';

export interface OnlineUser {
  id: number;
  name: string;
  email: string;
  login: string;
  cpf?: string;
  telefone?: string;
  plan: string;
  balance: number;
  plan_balance: number;
  status: string;
  user_role: string;
  full_name: string;
  total_consultations: number;
  total_spent: number;
  total_referrals?: number;
  remaining_days?: number;
  last_login: string;
  ip_address?: string;
  user_agent?: string;
  is_online: boolean;
}

export interface OnlineUsersResponse {
  users: OnlineUser[];
  total: number;
  timestamp: string;
}

export const useApiOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [totalOnline, setTotalOnline] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadOnlineUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await fetchApiConfig();
      const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      console.log('🔄 [ONLINE_USERS] Carregando usuários online da API...');
      
      const data = await apiRequest<{ 
        success: boolean; 
        data: OnlineUsersResponse;
        message: string;
      }>('/dashboard-admin/online-users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (data.success && data.data) {
        setOnlineUsers(data.data.users || []);
        setTotalOnline(data.data.total || 0);
        setLastUpdate(data.data.timestamp || new Date().toISOString());
        console.log('✅ [ONLINE_USERS] Usuários online carregados:', data.data.users?.length || 0);
      } else {
        throw new Error(data.message || 'Erro ao carregar usuários online');
      }
    } catch (error) {
      console.error('❌ [ONLINE_USERS] Erro ao carregar usuários online:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setOnlineUsers([]);
      setTotalOnline(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshOnlineUsers = useCallback(() => {
    loadOnlineUsers();
  }, [loadOnlineUsers]);

  // Atualizar automaticamente a cada 30 segundos
  useEffect(() => {
    loadOnlineUsers();
    const interval = setInterval(loadOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, [loadOnlineUsers]);

  return {
    onlineUsers,
    totalOnline,
    isLoading,
    error,
    lastUpdate,
    loadOnlineUsers,
    refreshOnlineUsers,
  };
};
