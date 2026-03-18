// Hook para consumir dados de indicação da API externa
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  externalReferralApiService, 
  ExternalReferralStats, 
  ExternalReferralData, 
  ExternalWalletInfo,
  ExternalReferralConfig 
} from '@/services/externalReferralApiService';
import { toast } from 'sonner';

export const useExternalReferralData = () => {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState<ExternalReferralData[]>([]);
  const [referralStats, setReferralStats] = useState<ExternalReferralStats>({
    total_indicados: 0,
    indicados_ativos: 0,
    total_bonus: 0,
    bonus_este_mes: 0,
    comissao_total: 0,
    comissao_este_mes: 0
  });
  const [walletInfo, setWalletInfo] = useState<ExternalWalletInfo>({
    saldo: 0,
    saldo_plano: 0,
    total: 0
  });
  const [config, setConfig] = useState<ExternalReferralConfig>({
    referral_system_enabled: true,
    referral_bonus_enabled: true,
    referral_commission_enabled: false,
    referral_bonus_amount: 0, // Será carregado da API
    referral_commission_percentage: 5.0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReferralData = useCallback(async () => {
    if (!user?.id) {
      console.log('🔍 [EXTERNAL_REFERRAL_HOOK] Usuário não logado');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 [EXTERNAL_REFERRAL_HOOK] Carregando dados de indicação...');
      setIsLoading(true);
      setError(null);

      // Carregar dados de indicação
      const data = await externalReferralApiService.getUserReferralData();
      
      console.log('✅ [EXTERNAL_REFERRAL_HOOK] Dados carregados:', data);
      
      setReferralStats(data.stats);
      setReferralData(data.referrals);
      setWalletInfo(data.wallet);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados de indicação';
      console.error('❌ [EXTERNAL_REFERRAL_HOOK] Erro:', errorMessage);
      setError(errorMessage);
      
      // Não mostrar toast de erro se for problema de autenticação
      if (!errorMessage.includes('401') && !errorMessage.includes('Unauthorized')) {
        toast.error('Erro ao carregar dados de indicação');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadConfig = useCallback(async () => {
    try {
      console.log('🔄 [EXTERNAL_REFERRAL_HOOK] Carregando da API externa...');
      const configData = await externalReferralApiService.getReferralConfig();
      console.log('✅ [EXTERNAL_REFERRAL_HOOK] Config da API externa:', configData);
      setConfig(configData);
    } catch (err) {
      console.error('❌ [EXTERNAL_REFERRAL_HOOK] API externa falhou:', err);
      setError(err instanceof Error ? err.message : 'API externa indisponível');
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 [EXTERNAL_REFERRAL_HOOK] Atualizando carteira...');
      const data = await externalReferralApiService.getUserReferralData();
      setWalletInfo(data.wallet);
      console.log('✅ [EXTERNAL_REFERRAL_HOOK] Carteira atualizada');
    } catch (err) {
      console.error('❌ [EXTERNAL_REFERRAL_HOOK] Erro ao atualizar carteira:', err);
    }
  }, [user?.id]);

  const refetch = useCallback(async () => {
    await Promise.all([loadReferralData(), loadConfig()]);
  }, [loadReferralData, loadConfig]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 [EXTERNAL_REFERRAL_HOOK] Iniciando carregamento para usuário:', user.id);
      loadReferralData();
      loadConfig();
    }
  }, [user?.id, loadReferralData, loadConfig]);

  // Transformar dados para compatibilidade com componentes existentes
  const transformedStats = {
    total_indicados: referralStats.total_indicados,
    indicados_ativos: referralStats.indicados_ativos,
    total_bonus: referralStats.total_bonus,
    bonus_este_mes: referralStats.bonus_este_mes
  };

  const transformedWallet = {
    wallet_balance: walletInfo.saldo,
    plan_balance: walletInfo.saldo_plano
  };

  return {
    referralData,
    referralStats: transformedStats,
    walletInfo: transformedWallet,
    config,
    isLoading,
    error,
    refetch,
    refreshWallet,
    // Funções adicionais
    loadReferralData,
    loadConfig
  };
};