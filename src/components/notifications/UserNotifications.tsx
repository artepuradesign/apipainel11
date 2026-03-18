import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { toastNotificationManager } from '@/utils/toastNotificationManager';

interface UserNotificationsProps {
  className?: string;
}

const UserNotifications: React.FC<UserNotificationsProps> = ({ className = '' }) => {
  const { user, loading } = useAuth();
  const { getRecentNotifications, markAsRead, refresh } = useNotifications(true, 15000); // Refresh a cada 15s

  console.log('🔔 UserNotifications component rendered');
  console.log('🔔 User:', user);
  console.log('🔔 Loading:', loading);

  // Só executar se o usuário estiver logado
  if (loading) {
    console.log('🔔 Still loading, skipping...');
    return null;
  }

  if (!user) {
    console.log('🔔 User not logged in, skipping notifications');
    return null;
  }

  const handleMarkAsRead = React.useCallback(async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
      console.log('🔔 User notification marked as read:', notificationId);
      toastNotificationManager.removeFromShown(notificationId);
    } catch (error) {
      console.error('🔔 Erro ao marcar notificação como lida:', error);
    }
  }, [markAsRead]);

  const recentNotifications = getRecentNotifications(5);
  console.log('🔔 Recent notifications for user:', recentNotifications);

  // Mostrar notificações como toast apenas uma vez usando o gerenciador centralizado
  React.useEffect(() => {
    if (!recentNotifications.length) return;

    // Notificações de recarga do usuário
    recentNotifications
      .filter(n => n.type === 'user_recharge_success' && !n.is_read)
      .forEach(notification => {
        toastNotificationManager.showToastOnce(
          notification.id,
          'success',
          `💰 ${notification.title}`,
          notification.message,
          () => handleMarkAsRead(notification.id)
        );
      });

    // Notificações de alerta de recarga para admins (sobre outros usuários)
    recentNotifications
      .filter(n => n.type === 'admin_recharge_alert' && !n.is_read)
      .forEach(notification => {
        toastNotificationManager.showToastOnce(
          notification.id,
          'info',
          `🔔 ${notification.title}`,
          notification.message,
          () => handleMarkAsRead(notification.id)
        );
      });

    // Notificações de compra de planos
    recentNotifications
      .filter(n => n.type === 'plan_purchase' && !n.is_read)
      .forEach(notification => {
        toastNotificationManager.showToastOnce(
          notification.id,
          'success',
          `📦 ${notification.title}`,
          notification.message,
          () => handleMarkAsRead(notification.id)
        );
      });

    // Outras notificações importantes (alta prioridade)
    recentNotifications
      .filter(n => {
        const isHighPriority = n.priority === 'high' && !n.is_read;
        const isNotHandledType = n.type !== 'user_recharge_success' && 
                                n.type !== 'admin_recharge_alert' && 
                                n.type !== 'plan_purchase';
        return isHighPriority && isNotHandledType;
      })
      .forEach(notification => {
        toastNotificationManager.showToastOnce(
          notification.id,
          'info',
          `📢 ${notification.title}`,
          notification.message,
          () => handleMarkAsRead(notification.id)
        );
      });
  }, [recentNotifications, handleMarkAsRead]);

  // Atualizar quando recargas forem completadas (evita duplicação)
  React.useEffect(() => {
    const handler = async () => {
      try { 
        console.log('🔔 UserNotifications: Recarga detectada, atualizando...');
        await refresh(); 
      } catch (e) { 
        console.warn('🔔 Falha ao atualizar notificações (UserNotifications):', e); 
      }
    };
    window.addEventListener('rechargeCompleted', handler as EventListener);
    return () => window.removeEventListener('rechargeCompleted', handler as EventListener);
  }, [refresh]);

  // Componente não renderiza nada visível - trabalha apenas em background
  return null;
};

export default UserNotifications;