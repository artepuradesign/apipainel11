import { useState, useEffect, useCallback } from 'react';
import { cookieUtils } from '@/utils/cookieUtils';
import { setNotificationRefreshCallback } from '@/utils/notificationRefresh';
import { apiRequest, fetchApiConfig } from '@/config/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
}

interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
}


export const useNotifications = (autoRefresh = true, refreshInterval = 30000) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [isCircuitOpen, setIsCircuitOpen] = useState(false);

  const getAuthHeaders = () => {
    // Tentar múltiplas formas de obter o token
    let token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    
    // Se não encontrar nos cookies, tentar no localStorage
    if (!token) {
      token = localStorage.getItem('session_token') || localStorage.getItem('api_session_token');
    }
    
    // Tentar obter do cookie de forma manual também
    if (!token) {
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(c => c.trim().startsWith('session_token='));
      const apiSessionCookie = cookies.find(c => c.trim().startsWith('api_session_token='));
      
      if (sessionCookie) {
        token = sessionCookie.split('=')[1];
      } else if (apiSessionCookie) {
        token = apiSessionCookie.split('=')[1];
      }
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔔 Token encontrado para notificações:', token.substring(0, 10) + '...');
    } else {
      console.warn('🔔 ⚠️ Nenhum token encontrado para notificações');
    }
    
    return headers;
  };

  const fetchNotifications = useCallback(async () => {
    // Circuit breaker: se há muitos erros consecutivos, pausar requests
    if (isCircuitOpen) {
      console.log('🔔 Circuit breaker ativo, pulando request...');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      console.log('🔔 Fetching notifications...');

      // Garantir config carregada (usa api.php com pool)
      await fetchApiConfig();
      
      const data = await apiRequest<any>('/notifications?limit=20', {
        headers,
      });

      console.log('🔔 Raw API response:', data);
      
      if (data.success) {
        // Verificar se data.data é um objeto com notifications ou se é direto a lista
        if (data.data && Array.isArray(data.data.notifications)) {
          // Formato: { data: { notifications: [...], unread_count: N } }
          const result: NotificationResponse = data.data;
          console.log('🔔 Notifications encontradas:', result.notifications.length);
          console.log('🔔 Unread count:', result.unread_count);
          console.log('🔔 Notifications details:', result.notifications);
          setNotifications(result.notifications || []);
          setUnreadCount(result.unread_count || 0);
        } else if (data.data && Array.isArray(data.data)) {
          // Formato: { data: [...] } - lista direto
          console.log('🔔 Direct notifications array:', data.data.length);
          console.log('🔔 Direct notifications details:', data.data);
          const unreadCount = data.data.filter((n: Notification) => !n.is_read).length;
          console.log('🔔 Calculated unread count:', unreadCount);
          setNotifications(data.data);
          setUnreadCount(unreadCount);
        } else {
          console.warn('🔔 Formato de resposta inesperado:', data);
          setNotifications([]);
          setUnreadCount(0);
        }
      } else {
        throw new Error(data.message || 'Erro ao buscar notificações');
      }
      
      // Reset error counter on success
      setConsecutiveErrors(0);
      setIsCircuitOpen(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('🔔 Error fetching notifications:', err);
      
      // Increment error counter
      setConsecutiveErrors(prev => {
        const newCount = prev + 1;
        // Ativar circuit breaker após 3 erros consecutivos
        if (newCount >= 3) {
          setIsCircuitOpen(true);
          console.warn('🔔 Circuit breaker ativado após 3 erros consecutivos');
          // Tentar reabrir após 2 minutos
          setTimeout(() => {
            console.log('🔔 Tentando reabrir circuit breaker...');
            setIsCircuitOpen(false);
            setConsecutiveErrors(0);
          }, 120000);
        }
        return newCount;
      });
    } finally {
      setIsLoading(false);
    }
  }, [isCircuitOpen]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      console.log('🔔 Marcando notificação como lida:', notificationId);
      
      // Garantir config carregada
      await fetchApiConfig();
      const data = await apiRequest<any>(`/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      console.log('🔔 Response data para markAsRead:', data);
      console.log('🔔 Response data para markAsRead:', data);
      
      if (data.success) {
        // Atualizar localmente
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, is_read: true }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log('🔔 Notificação marcada como lida com sucesso:', notificationId);
      } else {
        throw new Error(data.message || 'Erro ao marcar como lida');
      }
    } catch (err) {
      console.error('🔔 Error marking notification as read:', err);
      throw err;
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      console.log('🗑️ Deletando notificação:', notificationId);
      
      // Remover localmente de imediato (otimistic update)
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      const wasUnread = notificationToDelete && !notificationToDelete.is_read;
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Disparar evento global para sincronizar outros componentes imediatamente
      window.dispatchEvent(new CustomEvent('notificationDeleted', { detail: { id: notificationId } }));
      
      // Garantir config carregada
      await fetchApiConfig();
      const data = await apiRequest<any>(`/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      console.log('🗑️ Delete response:', data);
      
      if (!data.success) {
        // Reverter se falhou
        if (notificationToDelete) {
          setNotifications(prev => [...prev, notificationToDelete].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
          if (wasUnread) setUnreadCount(prev => prev + 1);
        }
        throw new Error(data.message || 'Erro ao deletar notificação');
      }
        
      console.log('🗑️ Notificação deletada com sucesso');
    } catch (err) {
      console.error('🗑️ Error deleting notification:', err);
      throw err;
    }
  }, [notifications]);

  const getRecentNotifications = useCallback((limit = 5) => {
    return notifications
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .filter(n => !n.is_read)
      .slice(0, limit);
  }, [notifications]);

  // Escutar evento global de deleção para sincronizar todas as instâncias
  useEffect(() => {
    const handleNotificationDeleted = (e: Event) => {
      const { id } = (e as CustomEvent).detail;
      setNotifications(prev => {
        const notif = prev.find(n => n.id === id);
        if (notif && !notif.is_read) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return prev.filter(n => n.id !== id);
      });
    };
    window.addEventListener('notificationDeleted', handleNotificationDeleted);
    return () => window.removeEventListener('notificationDeleted', handleNotificationDeleted);
  }, []);

  // Auto refresh e registro do callback
  useEffect(() => {
    // Registrar callback para refresh manual
    setNotificationRefreshCallback(fetchNotifications);
    
    if (autoRefresh) {
      fetchNotifications();
      
      const interval = setInterval(fetchNotifications, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    getRecentNotifications,
    refresh: fetchNotifications, // Alias para refresh manual
  };
};