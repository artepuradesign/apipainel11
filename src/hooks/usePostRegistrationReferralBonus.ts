import { useState, useCallback } from 'react';
import { referralTransactionService } from '@/services/referralTransactionService';
import { toast } from 'sonner';

interface ReferralBonusState {
  isProcessing: boolean;
  processed: boolean;
  error: string | null;
}

export const usePostRegistrationReferralBonus = () => {
  const [state, setState] = useState<ReferralBonusState>({
    isProcessing: false,
    processed: false,
    error: null
  });

  const processReferralBonus = useCallback(async (userId: number, referralData?: any) => {
    try {
      console.log('🎁 [POST_REGISTRATION] Iniciando processamento de bônus para usuário:', userId);
      
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Processar bônus de indicação
      const result = await referralTransactionService.processRegistrationBonus(userId);

      if (result.success) {
        console.log('✅ [POST_REGISTRATION] Bônus processado com sucesso:', result.data);
        
        setState(prev => ({ 
          ...prev, 
          isProcessing: false, 
          processed: true 
        }));

        // Mostrar notificação de sucesso
        if (result.data?.bonus_amount && result.data.bonus_amount > 0) {
          toast.success(
            `🎉 Bônus de indicação creditado! Você recebeu R$ ${result.data.bonus_amount.toFixed(2)} no seu saldo do plano!`,
            { duration: 6000 }
          );
        }

        if (result.data?.referrer_bonus && result.data.referrer_bonus > 0) {
          toast.info(
            `💝 Seu indicador também recebeu R$ ${result.data.referrer_bonus.toFixed(2)} por ter indicado você!`,
            { duration: 6000 }
          );
        }

        return result;
      } else {
        console.warn('⚠️ [POST_REGISTRATION] Bônus não processado:', result.message);
        
        setState(prev => ({ 
          ...prev, 
          isProcessing: false, 
          error: result.message 
        }));

        // Não mostrar erro para o usuário se for apenas "nenhuma indicação encontrada"
        if (!result.message.toLowerCase().includes('nenhuma indicação')) {
          toast.error(`Erro ao processar bônus: ${result.message}`);
        }

        return result;
      }
    } catch (error) {
      console.error('❌ [POST_REGISTRATION] Erro no processamento:', error);
      
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: 'Erro de comunicação com o servidor' 
      }));

      toast.error('Erro ao processar bônus de indicação');
      
      return {
        success: false,
        message: 'Erro de comunicação com o servidor'
      };
    }
  }, []);

  const resetState = useCallback(() => {
    setState({
      isProcessing: false,
      processed: false,
      error: null
    });
  }, []);

  return {
    ...state,
    processReferralBonus,
    resetState
  };
};