import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook para prevenir notificações duplicadas de boas-vindas
 * especialmente para usuários admin/suporte
 */
export const useNotificationDuplicationPrevention = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Verificar se já foi marcado como processado para este usuário
    const welcomeProcessedKey = `welcome_notification_processed_${user.id}`;
    const alreadyProcessed = localStorage.getItem(welcomeProcessedKey);

    if (alreadyProcessed) {
      console.log('🔔 [DEDUP] Notificação de boas-vindas já processada para usuário:', user.id);
      return;
    }

    // Para usuários admin/suporte, adicionar delay para evitar duplicação
    if (user.user_role === 'suporte') {
      console.log('🔔 [DEDUP] Usuário admin/suporte detectado - prevenindo duplicação');
      
      // Marcar como processado imediatamente para prevenir duplicações
      localStorage.setItem(welcomeProcessedKey, 'true');
      
      // Listener para detectar múltiplas chamadas de criação de notificação
      let notificationCreationCount = 0;
      const maxNotificationCreations = 1;
      
      const preventDuplicateNotifications = (event: CustomEvent) => {
        if (event.detail?.type === 'welcome' && event.detail?.userId === user.id) {
          notificationCreationCount++;
          
          if (notificationCreationCount > maxNotificationCreations) {
            console.warn('🔔 [DEDUP] Bloqueando criação duplicada de notificação de boas-vindas para usuário:', user.id);
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        }
      };

      window.addEventListener('beforeNotificationCreate', preventDuplicateNotifications as EventListener);
      
      return () => {
        window.removeEventListener('beforeNotificationCreate', preventDuplicateNotifications as EventListener);
      };
    } else {
      // Para usuários normais, apenas marcar como processado após um pequeno delay
      setTimeout(() => {
        localStorage.setItem(welcomeProcessedKey, 'true');
      }, 2000);
    }
  }, [user]);

  return null;
};