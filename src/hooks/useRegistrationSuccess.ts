import { useEffect } from 'react';
import { toast } from "sonner";
import { useReferralConfig } from './useReferralConfig';

export const useRegistrationSuccess = () => {
  const { config } = useReferralConfig();
  
  const showRegistrationSuccessNotifications = (user: any, referralData?: any) => {
    console.log('🎉 [REGISTRATION_SUCCESS] Exibindo notificações de sucesso');
    
    // Notificação principal de boas-vindas
    setTimeout(() => {
      toast.success("🎉 Cadastro realizado com sucesso! Bem-vindo(a) à plataforma!");
    }, 500);
    
    // Se houve indicação, mostrar notificação específica
    if (referralData && referralData.referrer_name) {
      const bonusValue = config.referral_bonus_amount;
      
      setTimeout(() => {
        toast.success(
          `💰 Você recebeu R$ ${bonusValue.toFixed(2)} no seu saldo do plano por ter sido indicado(a) por ${referralData.referrer_name}!`
        );
      }, 2000);
      
      // Notificação adicional sobre o indicador
      setTimeout(() => {
        toast.info(
          `🤝 ${referralData.referrer_name} também recebeu R$ ${bonusValue.toFixed(2)} por ter indicado você!`
        );
      }, 4000);
    }
  };

  return {
    showRegistrationSuccessNotifications
  };
};