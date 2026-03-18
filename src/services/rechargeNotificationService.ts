// Serviço para criar notificações de recarga
import { cookieUtils } from '@/utils/cookieUtils';
import { refreshNotifications } from '@/utils/notificationRefresh';
import { getFullApiUrl } from '@/utils/apiHelper';

interface RechargeNotificationData {
  userId: number;
  userName: string;
  amount: number;
  method: string;
  transactionId?: string;
}

export const rechargeNotificationService = {
  /**
   * Cria uma notificação de recarga para todos os usuários suporte
   */
  async createRechargeNotification(data: RechargeNotificationData): Promise<boolean> {
    try {
      console.log('💰 Criando notificação de recarga para suportes:', data);

      const response = await fetch(getFullApiUrl('/notifications/recharge-alert'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: data.userId,
          user_name: data.userName,
          amount: data.amount,
          method: data.method,
          transaction_id: data.transactionId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Notificação de recarga criada com sucesso:', result);
        
// Disparar apenas um evento para evitar duplicações
try {
  window.dispatchEvent(new CustomEvent('rechargeCompleted', {
    detail: {
      amount: data.amount,
      method: data.method,
      userId: data.userId,
      userName: data.userName,
      transactionId: data.transactionId
    }
  }));
} catch (e) {
  console.warn('Não foi possível disparar evento de recarga:', e);
}
        
        return true;
      } else {
        console.error('❌ Erro ao criar notificação de recarga:', result.message);
        return false;
      }
      
    } catch (error) {
      console.error('💥 Erro ao criar notificação de recarga:', error);
      return false;
    }
  },

  /**
   * Monitora recargas e cria notificações automaticamente
   */
  async monitorRecharge(userId: number, amount: number, method: string, transactionId?: string) {
    try {
      // Buscar dados do usuário
      const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
      
      if (!token) {
        console.warn('⚠️ Token não encontrado para buscar dados do usuário');
        return false;
      }

      const userResponse = await fetch(getFullApiUrl('/auth/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userName = userData.data?.user?.full_name || userData.data?.user?.email || 'Usuário';

        // Criar notificação para suportes e para o próprio usuário
        return await this.createRechargeNotification({
          userId,
          userName,
          amount,
          method,
          transactionId: transactionId || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      } else {
        console.warn('⚠️ Não foi possível buscar dados do usuário para notificação');
        return false;
      }
      
    } catch (error) {
      console.error('💥 Erro no monitoramento de recarga:', error);
      return false;
    }
  }
};