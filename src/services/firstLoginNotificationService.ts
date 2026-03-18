import { toast } from "sonner";

class FirstLoginNotificationService {
  private static instance: FirstLoginNotificationService;
  
  public static getInstance(): FirstLoginNotificationService {
    if (!FirstLoginNotificationService.instance) {
      FirstLoginNotificationService.instance = new FirstLoginNotificationService();
    }
    return FirstLoginNotificationService.instance;
  }

  public scheduleFirstLoginNotification(userId: number) {
    // O bônus agora é creditado imediatamente no cadastro, não no primeiro login
    console.log('🔔 [FIRST_LOGIN] Sistema de bônus foi movido para o cadastro - não há mais delay');
    
    // Verificar se há notificações do backend para mostrar
    this.checkForBackendNotifications(userId);
  }

  private checkForBackendNotifications(userId: number) {
    try {
      // Este método pode ser usado futuramente para buscar notificações da API
      console.log('🔔 [NOTIFICATIONS] Checando notificações do backend para usuário:', userId);
      
      // TODO: Implementar busca de notificações da API quando necessário
      // fetch('/api/notifications/unread').then(...)
      
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Erro ao buscar notificações:', error);
    }
  }

  private showFirstLoginBonusNotification(userId: number) {
    try {
      // Verificar se recebeu bônus de indicação
      const referralRecords = JSON.parse(localStorage.getItem('referral_records') || '[]');
      const userReferral = referralRecords.find((record: any) => 
        record.referred_user_id === userId.toString() && record.status === 'completed'
      );

      if (userReferral) {
        // Usuário foi indicado e recebeu bônus
        toast(
          `🎁 Bônus de Boas-Vindas! Você recebeu R$ ${userReferral.bonus_amount.toFixed(2)} no seu saldo do plano por ter sido indicado!`,
          {
            duration: 8000,
            position: "top-center"
          }
        );

        // Buscar dados do indicador para mostrar notificação adicional
        const users = JSON.parse(localStorage.getItem('system_users') || '[]');
        const referrer = users.find((user: any) => user.id.toString() === userReferral.referrer_id);
        
        if (referrer) {
          setTimeout(() => {
            toast(
              `💝 Você também ajudou ${referrer.full_name} a ganhar R$ ${userReferral.bonus_amount.toFixed(2)}!`,
              {
                duration: 6000,
                position: "top-center"
              }
            );
          }, 2000);
        }
      }

      // Marcar que a notificação foi enviada
      localStorage.setItem(`first_login_notification_${userId}`, 'true');
      
    } catch (error) {
      console.error('❌ [FIRST_LOGIN] Erro ao exibir notificação:', error);
    }
  }

  public checkForReferrerBonus(userId: number) {
    try {
      // Verificar se este usuário indicou alguém que acabou de fazer primeiro login
      const referralRecords = JSON.parse(localStorage.getItem('referral_records') || '[]');
      const userAsReferrer = referralRecords.filter((record: any) => 
        record.referrer_id === userId.toString() && record.status === 'completed'
      );

      // Verificar se algum dos indicados fez login recentemente (últimos 30 segundos)
      const now = new Date().getTime();
      const recentReferrals = userAsReferrer.filter((record: any) => {
        const recordTime = new Date(record.created_at).getTime();
        return (now - recordTime) < 30000; // 30 segundos
      });

      if (recentReferrals.length > 0) {
        // Aguardar 12 segundos para dar tempo da notificação do indicado aparecer primeiro
        setTimeout(() => {
          recentReferrals.forEach((record: any) => {
            const users = JSON.parse(localStorage.getItem('system_users') || '[]');
            const referredUser = users.find((user: any) => user.id.toString() === record.referred_user_id);
            
            toast(
              `🎉 ${referredUser?.full_name || 'Seu indicado'} fez o primeiro login! Você ganhou R$ ${record.bonus_amount.toFixed(2)} no seu saldo do plano!`,
              {
                duration: 8000,
                position: "top-center"
              }
            );
          });
        }, 12000);
      }
    } catch (error) {
      console.error('❌ [FIRST_LOGIN] Erro ao verificar bônus do indicador:', error);
    }
  }
}

export const firstLoginNotificationService = FirstLoginNotificationService.getInstance();