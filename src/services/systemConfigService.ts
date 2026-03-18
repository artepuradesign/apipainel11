
import { API_BASE_URL, makeDirectRequest } from '@/config/apiConfig';
import { bonusConfigService } from './bonusConfigService';

export interface ReferralConfig {
  referral_system_enabled: boolean;
  referral_bonus_enabled: boolean;
  referral_commission_enabled: boolean;
  referral_bonus_amount: number;
  referral_commission_percentage: number;
}

export const systemConfigService = {
  async getReferralConfig(): Promise<ReferralConfig> {
    try {
      console.log('🔧 [CONFIG] Buscando valor dinâmico do bônus do arquivo bonus.php...');
      
      // Usar serviço centralizado para obter valor dinâmico
      const bonusAmount = await bonusConfigService.getBonusAmount();
      console.log('✅ [CONFIG] Valor dinâmico do bônus obtido do bonus.php:', bonusAmount);
      
      return {
        referral_bonus_amount: bonusAmount,
        referral_system_enabled: true,
        referral_bonus_enabled: true,
        referral_commission_enabled: false,
        referral_commission_percentage: 5.0
      };
    } catch (error) {
      console.error('❌ [CONFIG] Erro geral:', error);
      throw error;
    }
  },

  async getConfigValue(key: string): Promise<any> {
    throw new Error('Use apenas a API externa para configurações');
  },

  async getConfigById(id: number): Promise<any> {
    throw new Error('Use apenas a API externa para configurações');
  },

  async getReferralBonusAmountById(): Promise<number> {
    throw new Error('Use apenas externalReferralApiService.getReferralConfig()');
  },

  async getReferralBonusAmount(): Promise<number> {
    throw new Error('Use apenas externalReferralApiService.getReferralConfig()');
  }
};
