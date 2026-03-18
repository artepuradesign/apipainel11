
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { newReferralApiService } from '@/services/newReferralApiService';
import { toast } from 'sonner';

export interface ReferralApiStats {
  total_indicados: number;
  indicados_ativos: number;
  total_bonus: number;
  bonus_este_mes: number;
}

export interface ReferralApiData {
  id: number;
  indicado_id: number;
  codigo: string;
  status: string;
  bonus_indicador: number;
  bonus_indicado: number;
  first_login_bonus_processed: boolean;
  first_login_at: string | null;
  created_at: string;
  indicado_nome: string;
  indicado_email: string;
  indicado_cadastro: string;
}

export interface WalletInfo {
  wallet_balance: number;
  plan_balance: number;
}

export const useReferralApiData = () => {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState<ReferralApiData[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralApiStats>({
    total_indicados: 0,
    indicados_ativos: 0,
    total_bonus: 0,
    bonus_este_mes: 0
  });
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    wallet_balance: 0,
    plan_balance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReferralData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 [REFERRAL_API_DATA] Carregando dados da nova API...');
      
      // Carregar dados de indicação
      const apiData = await newReferralApiService.getUserReferralData();
      
      console.log('✅ [REFERRAL_API_DATA] Dados recebidos:', apiData);
      
      if (apiData.stats) {
        setReferralStats(apiData.stats);
      }
      
      if (apiData.referrals) {
        setReferralData(apiData.referrals);
      }
      
      if (apiData.wallet) {
        setWalletInfo(apiData.wallet);
      }
      
    } catch (error) {
      console.error('❌ [REFERRAL_API_DATA] Erro ao carregar dados:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar dados');
      toast.error('Erro ao carregar dados de indicação');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadWalletBalance = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('💰 [REFERRAL_API_DATA] Carregando saldo da carteira...');
      const walletData = await newReferralApiService.getWalletBalance();
      setWalletInfo(walletData);
    } catch (error) {
      console.error('❌ [REFERRAL_API_DATA] Erro ao carregar saldo:', error);
    }
  }, [user?.id]);

  const processRegistrationBonus = useCallback(async (userId: number, referralCode: string) => {
    try {
      console.log('🎁 [REFERRAL_API_DATA] Processando bônus de cadastro...');
      const result = await newReferralApiService.processRegistrationBonus(userId, referralCode);
      
      if (result.bonus_processed) {
        toast.success(`🎉 Bônus de R$ ${result.bonus_amount.toFixed(2)} creditado com sucesso!`);
        // Recarregar dados após processar bônus
        await loadReferralData();
        await loadWalletBalance();
      }
      
      return result;
    } catch (error) {
      console.error('❌ [REFERRAL_API_DATA] Erro ao processar bônus:', error);
      toast.error('Erro ao processar bônus de indicação');
      throw error;
    }
  }, [loadReferralData, loadWalletBalance]);

  useEffect(() => {
    if (user) {
      loadReferralData();
      loadWalletBalance();
    }
  }, [user, loadReferralData, loadWalletBalance]);

  return {
    referralData,
    referralStats,
    walletInfo,
    isLoading,
    error,
    refetch: loadReferralData,
    refreshWallet: loadWalletBalance,
    processRegistrationBonus
  };
};
