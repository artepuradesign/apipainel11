import { useState, useEffect, useCallback } from 'react';
import { systemConfigService, ReferralConfig } from '@/services/systemConfigService';
import { bonusConfigService } from '@/services/bonusConfigService';

interface UseReferralConfigReturn {
  config: ReferralConfig;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useReferralConfig = (): UseReferralConfigReturn => {
  const [config, setConfig] = useState<ReferralConfig>({
    referral_system_enabled: true,
    referral_bonus_enabled: true,
    referral_commission_enabled: false,
    referral_bonus_amount: 5, // Valor fixo do bonus.php
    referral_commission_percentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      console.log('🔧 [REFERRAL_CONFIG_HOOK] Carregando valor dinâmico do bonus.php...');
      setIsLoading(true);
      setError(null);
      
      // Obter valor dinâmico do arquivo bonus.php
      const bonusAmount = await bonusConfigService.getBonusAmount();
      const configData = {
        referral_system_enabled: true,
        referral_bonus_enabled: true,
        referral_commission_enabled: false,
        referral_bonus_amount: bonusAmount,
        referral_commission_percentage: 0
      };
      
      console.log('✅ [REFERRAL_CONFIG_HOOK] Configurações com valor dinâmico:', configData);
      
      setConfig(configData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar configurações';
      console.error('❌ [REFERRAL_CONFIG_HOOK] Erro:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    isLoading,
    error,
    refetch: loadConfig
  };
};