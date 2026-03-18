import { useState, useCallback } from 'react';
import { registrationVerificationService } from '@/services/registrationVerificationService';
import type { RegistrationVerificationResponse } from '@/services/registrationVerificationService';
import { toast } from 'sonner';

interface VerificationState {
  isVerifying: boolean;
  verification: RegistrationVerificationResponse | null;
  error: string | null;
  statusReport: string | null;
}

export const useRegistrationVerification = () => {
  const [state, setState] = useState<VerificationState>({
    isVerifying: false,
    verification: null,
    error: null,
    statusReport: null
  });

  /**
   * Executa verificação completa do cadastro
   */
  const verifyRegistration = useCallback(async (userId: number) => {
    setState(prev => ({ 
      ...prev, 
      isVerifying: true, 
      error: null,
      verification: null,
      statusReport: null
    }));

    try {
      console.log('🔍 [VERIFICATION_HOOK] Iniciando verificação...', userId);
      
      const verification = await registrationVerificationService.verifyRegistration(userId);
      const statusReport = registrationVerificationService.generateStatusReport(verification);
      
      setState(prev => ({
        ...prev,
        verification,
        statusReport,
        isVerifying: false
      }));

      // Log do resultado
      console.log('📊 [VERIFICATION_HOOK] Resultado:', {
        registration_complete: verification.analysis.registration_complete,
        referral_system_working: verification.analysis.referral_system_working,
        has_referral: verification.analysis.has_referral
      });

      // Log detalhado para debug
      console.log('📊 [REFERRAL_VERIFICATION] Análise detalhada:', {
        registration_complete: verification.analysis.registration_complete,
        has_referral: verification.analysis.has_referral,
        referral_system_working: verification.analysis.referral_system_working,
        user_created: verification.analysis.user_created,
        user_wallets_created: verification.analysis.user_wallets_created,
        wallet_transactions_created: verification.analysis.wallet_transactions_created
      });

      // Não mostrar mensagens de erro aqui, apenas informar sucesso se tudo estiver ok
      if (verification.analysis.registration_complete && verification.analysis.has_referral && verification.analysis.wallet_transactions_created) {
        console.log('✅ [REFERRAL_VERIFICATION] Sistema de indicação funcionando perfeitamente!');
        return verification;
      } else if (verification.analysis.registration_complete) {
        console.log('✅ [REFERRAL_VERIFICATION] Cadastro completo!');
        return verification;
      } else {
        console.log('⚠️ [REFERRAL_VERIFICATION] Verificando completude do cadastro...');
        return verification;
      }

      return verification;

    } catch (error: any) {
      console.error('❌ [VERIFICATION_HOOK] Erro na verificação:', error);
      
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro na verificação',
        isVerifying: false
      }));

      toast.error('Erro ao verificar status do cadastro');
      
      return null;
    }
  }, []);

  /**
   * Verifica especificamente o sistema de indicação
   */
  const verifyReferralSystem = useCallback(async (userId: number, referralCode?: string) => {
    try {
      console.log('🎁 [VERIFICATION_HOOK] Verificando sistema de indicação...');
      
      const isWorking = await registrationVerificationService.verifyReferralSystem(userId, referralCode);
      
      if (isWorking) {
        console.log('✅ [VERIFICATION_HOOK] Sistema de indicação funcionando');
        if (referralCode) {
          toast.success('🎁 Sistema de indicação processado com sucesso!');
        }
      } else if (referralCode) {
        console.warn('⚠️ [VERIFICATION_HOOK] Sistema de indicação com problemas');
        toast.warning('⚠️ Problema no processamento da indicação');
      }
      
      return isWorking;
      
    } catch (error: any) {
      console.error('❌ [VERIFICATION_HOOK] Erro na verificação de indicação:', error);
      return false;
    }
  }, []);

  /**
   * Busca transações do usuário
   */
  const getUserTransactions = useCallback(async (userId: number) => {
    try {
      console.log('💰 [VERIFICATION_HOOK] Buscando transações...');
      
      const transactions = await registrationVerificationService.getUserTransactions(userId);
      
      console.log('✅ [VERIFICATION_HOOK] Transações encontradas:', transactions.length);
      
      return transactions;
      
    } catch (error: any) {
      console.error('❌ [VERIFICATION_HOOK] Erro ao buscar transações:', error);
      return [];
    }
  }, []);

  /**
   * Busca saldo das carteiras
   */
  const getWalletBalance = useCallback(async (userId: number) => {
    try {
      console.log('💳 [VERIFICATION_HOOK] Buscando saldos...');
      
      const balance = await registrationVerificationService.getUserWalletBalance(userId);
      
      console.log('✅ [VERIFICATION_HOOK] Saldos encontrados:', balance);
      
      return balance;
      
    } catch (error: any) {
      console.error('❌ [VERIFICATION_HOOK] Erro ao buscar saldos:', error);
      return null;
    }
  }, []);

  /**
   * Reset do estado
   */
  const reset = useCallback(() => {
    setState({
      isVerifying: false,
      verification: null,
      error: null,
      statusReport: null
    });
  }, []);

  /**
   * Executa verificação completa e retorna resumo
   */
  const getVerificationSummary = useCallback(async (userId: number, referralCode?: string) => {
    const verification = await verifyRegistration(userId);
    
    if (!verification || typeof verification === 'boolean') return null;

    const summary = {
      userId,
      registrationComplete: verification.analysis.registration_complete,
      hasReferral: verification.analysis.has_referral,
      referralWorking: verification.analysis.referral_system_working,
      tablesStatus: {
        users: verification.analysis.user_created,
        user_profiles: verification.analysis.user_profiles_created,
        user_settings: verification.analysis.user_settings_created,
        user_wallets: verification.analysis.user_wallets_created,
        wallet_transactions: verification.analysis.wallet_transactions_created,
        indicacoes: verification.analysis.indicacao_record_created,
        system_logs: verification.analysis.system_logs_created,
        user_audit: verification.analysis.user_audit_created
      }
    };

    console.log('📋 [VERIFICATION_SUMMARY]', summary);
    
    return summary;
  }, [verifyRegistration]);

  return {
    ...state,
    verifyRegistration,
    verifyReferralSystem,
    getUserTransactions,
    getWalletBalance,
    getVerificationSummary,
    reset
  };
};