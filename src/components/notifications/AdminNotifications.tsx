import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { toastNotificationManager } from '@/utils/toastNotificationManager';

interface AdminNotificationsProps {
  className?: string;
}

const AdminNotifications: React.FC<AdminNotificationsProps> = ({ className = '' }) => {
  const { isSupport, user, loading } = useAuth();
  const { getRecentNotifications, markAsRead, error, isLoading, refresh } = useNotifications(true, 60000); // Aumentar para 1 minuto para reduzir carga

  console.log('🔔 AdminNotifications component rendered');
  console.log('🔔 User:', user);
  console.log('🔔 Is Support:', isSupport);
  console.log('🔔 Loading:', loading);
  console.log('🔔 Notifications Error:', error);

  // Só executar se o usuário estiver logado e for suporte
  if (loading) {
    console.log('🔔 Still loading, skipping...');
    return null;
  }

  if (!user || !isSupport) {
    console.log('🔔 User not logged in or not support, skipping notifications');
    return null;
  }

  const handleMarkAsRead = React.useCallback(async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
      console.log('🔔 Admin notification marked as read:', notificationId);
      toastNotificationManager.removeFromShown(notificationId);
    } catch (error) {
      console.error('🔔 Erro ao marcar notificação como lida:', error);
    }
  }, [markAsRead]);

  const recentNotifications = getRecentNotifications(5);
  console.log('🔔 Recent notifications:', recentNotifications);

  // Mostrar apenas notificações importantes não relacionadas a recargas como toast - uma vez apenas
  React.useEffect(() => {
    // Não mostrar toasts se há erro de conexão ou componente está carregando
    if (error || isLoading || !recentNotifications?.length) {
      return;
    }

    // Outras notificações importantes para suporte (excluindo recargas e planos já tratados)
    recentNotifications
      .filter(n => 
        n.priority === 'high' && 
        !n.is_read && 
        n.type !== 'admin_recharge_alert' && 
        n.type !== 'plan_purchase'
      )
      .slice(0, 3) // Limitar a 3 notificações para evitar spam
      .forEach(notification => {
        toastNotificationManager.showToastOnce(
          notification.id,
          'warning',
          `🚨 ${notification.title}`,
          notification.message,
          () => handleMarkAsRead(notification.id),
          10000
        );
      });
  }, [recentNotifications, error, isLoading, handleMarkAsRead]);

  // Atualização instantânea: ouvir evento de notificações e forçar refresh imediato
  React.useEffect(() => {
    const handleNotificationsUpdated = async () => {
      try {
        await refresh();
      } catch (e) {
        console.warn('🔔 Falha ao forçar refresh de notificações (AdminNotifications):', e);
      }
    };
    window.addEventListener('notificationsUpdated', handleNotificationsUpdated as EventListener);
    return () => window.removeEventListener('notificationsUpdated', handleNotificationsUpdated as EventListener);
  }, [refresh]);

  // Controle para processar recargas apenas uma vez e disparar eventos imediatos
  const [processedRechargeIds, setProcessedRechargeIds] = React.useState<Set<number>>(new Set());

  // Disparar atualização imediata do caixa ao detectar nova recarga nas notificações
  React.useEffect(() => {
    if (!recentNotifications?.length) return;

    // Processar apenas notificações MUITO recentes (últimos 20s) para evitar reprocessar antigas
    const now = Date.now();
    const newRechargeNotifications = recentNotifications.filter(n =>
      (n.type === 'admin_recharge_alert' || n.type?.includes('recharge')) &&
      !n.is_read &&
      !processedRechargeIds.has(n.id) &&
      now - new Date(n.created_at).getTime() < 20000
    );

    // Também processar notificações de compra de planos para admins
    const newPlanPurchaseNotifications = recentNotifications.filter(n =>
      n.type === 'plan_purchase' &&
      !n.is_read &&
      !processedRechargeIds.has(n.id) &&
      now - new Date(n.created_at).getTime() < 20000
    );

    const allNewNotifications = [...newRechargeNotifications, ...newPlanPurchaseNotifications];

    if (allNewNotifications.length === 0) return;

    allNewNotifications.forEach(n => {
      try {
        if (n.type === 'plan_purchase') {
          // Processar notificação de compra de plano
          const message: string = n.message || '';
          const amountMatch = message.match(/valor de R\$\s?([\d\.\,]+)/i) || message.match(/plano.*R\$\s?([\d\.\,]+)/i);
          const planMatch = message.match(/plano\s+(.+?)\s+por/i) || message.match(/Plano:\s*(.+?)(?:\n|$)/i);
          const userMatch = message.match(/Usuário\s+(.+?)\s+adquiriu/i);

          let amount = 0;
          if (amountMatch?.[1]) {
            const raw = amountMatch[1].replace(/\./g, '').replace(',', '.');
            amount = parseFloat(raw);
          }
          const planName = planMatch?.[1]?.trim() || 'Plano';
          const userName = (userMatch?.[1] || 'Usuário').trim();

          // Remover disparo duplicado de evento - já disparado pelo serviço de compra de planos
        } else {
          // Processar notificação de recarga (código original)
          const message: string = n.message || '';
          const amountMatch = message.match(/recarga de R\$\s?([\d\.\,]+)/i);
          const methodMatch = message.match(/via\s+([A-ZÇÃ\s]+)/i);
          const userMatch = message.match(/Usuário\s+(.+?)\s+realizou/i);
          const txMatch = message.match(/ID da transação:\s*([A-Z0-9_\-]+)/i);

          let amount = 0;
          if (amountMatch?.[1]) {
            const raw = amountMatch[1].replace(/\./g, '').replace(',', '.');
            amount = parseFloat(raw);
          }
          const method = (methodMatch?.[1] || 'DESCONHECIDO').trim();
          const userName = (userMatch?.[1] || 'Usuário').trim();
          const transactionId = txMatch?.[1];

          // Remover disparo duplicado de evento - já disparado pelo serviço de recarga
        }
      } catch (e) {
        console.warn('Falha ao processar notificação:', e, n);
      }
    });

    setProcessedRechargeIds(prev => {
      const next = new Set(prev);
      allNewNotifications.forEach(n => next.add(n.id));
      return next;
    });
  }, [recentNotifications, processedRechargeIds]);

  // Componente não renderiza nada visível - trabalha apenas em background
  return null;
};

export default AdminNotifications;