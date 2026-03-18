import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { referralApiService, ReferralApiResponse } from '@/services/referralApiService';

export interface ReferralStats {
  totalIndicados: number;
  ativosEstesMes: number;
  comissaoTotal: number;
  comissaoEstesMes: number;
  bonusTotal: number;
}

export const useReferralData = () => {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState<ReferralApiResponse | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalIndicados: 0,
    ativosEstesMes: 0,
    comissaoTotal: 0,
    comissaoEstesMes: 0,
    bonusTotal: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReferralData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 [REFERRAL_DATA] Carregando dados de indicação...');
      
      const apiData = await referralApiService.getUserReferrals();
      
      console.log('✅ [REFERRAL_DATA] Dados da API carregados:', apiData);
      
      setReferralData(apiData);
      
      // Atualizar estatísticas
      setReferralStats({
        totalIndicados: apiData.stats.total_indicados,
        ativosEstesMes: apiData.stats.indicados_ativos,
        comissaoTotal: apiData.stats.total_bonus,
        comissaoEstesMes: apiData.stats.bonus_este_mes,
        bonusTotal: apiData.stats.total_bonus
      });
      
    } catch (error) {
      console.error('❌ [REFERRAL_DATA] Erro ao carregar dados:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  return {
    referralData,
    referralStats,
    isLoading,
    error,
    refetch: loadReferralData
  };
};