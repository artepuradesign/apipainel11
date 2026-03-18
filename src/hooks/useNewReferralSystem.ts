
import { useState, useCallback } from 'react';
import { newReferralApiService, ReferralBonusResponse } from '@/services/newReferralApiService';
import { toast } from 'sonner';

interface ReferralSystemState {
  isProcessing: boolean;
  processed: boolean;
  error: string | null;
  bonusData: ReferralBonusResponse | null;
}

export const useNewReferralSystem = () => {
  const [state, setState] = useState<ReferralSystemState>({
    isProcessing: false,
    processed: false,
    error: null,
    bonusData: null
  });

  const validateCode = useCallback(async (code: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const result = await newReferralApiService.validateReferralCode(code);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao validar código';
      setState(prev => ({ ...prev, error: message }));
      return {
        success: false,
        message
      };
    }
  }, []);

  const processRegistrationBonus = useCallback(async (userId: number, referralCode: string) => {
    try {
      console.log('🎁 [REFERRAL_HOOK] Processando bônus automático...');
      
      setState(prev => ({ 
        ...prev, 
        isProcessing: true, 
        error: null,
        processed: false,
        bonusData: null
      }));

      // Buscar valor real APENAS da API externa
      console.log('🔧 [REFERRAL_HOOK] Buscando valor da API externa...');
      const config = await newReferralApiService.getReferralConfig();
      const correctBonusAmount = config.referral_bonus_amount;
      
      if (!correctBonusAmount || correctBonusAmount <= 0) {
        throw new Error(`API externa retornou valor inválido: ${correctBonusAmount}`);
      }
      
      console.log('💰 [REFERRAL_HOOK] Valor da API externa:', correctBonusAmount);

      const result = await newReferralApiService.processRegistrationBonus(userId, referralCode);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        processed: true,
        bonusData: result
      }));

      // Mostrar notificações de sucesso com valor correto
      if (result.referred_bonus > 0) {
        toast.success(
          `🎉 Bônus de boas-vindas! Você recebeu R$ ${result.referred_bonus.toFixed(2)} no seu saldo do plano!`,
          { duration: 8000 }
        );
      }

      if (result.referrer_bonus > 0) {
        setTimeout(() => {
          toast.info(
            `💝 Seu indicador também recebeu R$ ${result.referrer_bonus.toFixed(2)} por ter indicado você!`,
            { duration: 6000 }
          );
        }, 2000);
      }

      console.log('✅ [REFERRAL_HOOK] Bônus processado automaticamente:', {
        result,
        expectedAmount: correctBonusAmount,
        actualAmount: result.referred_bonus
      });
      
      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('❌ [REFERRAL_HOOK] Erro ao processar bônus automático:', error);
      
      const message = error instanceof Error ? error.message : 'Erro ao processar bônus';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: message
      }));

      toast.error(`Erro ao processar bônus: ${message}`);
      
      return {
        success: false,
        message
      };
    }
  }, []);

  const processPlanActivationCommission = useCallback(async (
    userId: number, 
    planId: number, 
    planValue: number
  ) => {
    try {
      console.log('💰 [REFERRAL_HOOK] Processando comissão de 10% na ativação do plano...');
      console.log(`📊 Plano ID: ${planId}, Valor: R$ ${planValue.toFixed(2)}`);
      
      const result = await newReferralApiService.processPlanActivationCommission(
        userId, 
        planId, 
        planValue
      );
      
      if (result.commission_processed) {
        const commissionAmount = planValue * 0.10; // 10% do valor do plano
        toast.success(
          `🎉 Comissão de R$ ${commissionAmount.toFixed(2)} (10%) creditada ao revendedor!`,
          { duration: 6000 }
        );
      }
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      console.warn('⚠️ [REFERRAL_HOOK] Nenhuma comissão processada:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao processar comissão'
      };
    }
  }, []);

  const resetState = useCallback(() => {
    setState({
      isProcessing: false,
      processed: false,
      error: null,
      bonusData: null
    });
  }, []);

  return {
    ...state,
    validateCode,
    processRegistrationBonus,
    processPlanActivationCommission,
    resetState
  };
};
