import { API_BASE_URL, makeDirectRequest } from '@/config/apiConfig';

export interface BonusConfig {
  referral_bonus_amount: number;
  welcome_bonus_amount: number;
}

class BonusConfigService {
  private static instance: BonusConfigService;
  private bonusCache: BonusConfig | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): BonusConfigService {
    if (!BonusConfigService.instance) {
      BonusConfigService.instance = new BonusConfigService();
    }
    return BonusConfigService.instance;
  }

  /**
   * Lê o valor do bônus diretamente do arquivo bonus.php
   */
  async getBonusAmount(): Promise<number> {
    try {
      // Verificar cache primeiro
      if (this.bonusCache && (Date.now() - this.lastFetch < this.CACHE_DURATION)) {
        console.log('✅ [BONUS_CONFIG] Usando valor do cache:', this.bonusCache.referral_bonus_amount);
        return this.bonusCache.referral_bonus_amount;
      }

      console.log('🔧 [BONUS_CONFIG] Buscando valor do endpoint get-bonus-amount.php...');
      
      // Usar o endpoint que já funciona e agora usa o bonus.php internamente
      const result = await makeDirectRequest('/get-bonus-amount.php', {}, 'GET');
      
      if (result && result.success && result.data) {
        const bonusAmount = result.data.referral_bonus_amount;
        
        // Atualizar cache
        this.bonusCache = {
          referral_bonus_amount: bonusAmount,
          welcome_bonus_amount: bonusAmount
        };
        this.lastFetch = Date.now();
        
        console.log('✅ [BONUS_CONFIG] Valor do bônus obtido do bonus.php:', bonusAmount);
        return bonusAmount;
      } else {
        console.error('❌ [BONUS_CONFIG] Erro ao buscar valor do bônus do bonus.php');
        throw new Error('Erro ao buscar valor do bônus do arquivo bonus.php');
      }
    } catch (error) {
      console.error('❌ [BONUS_CONFIG] Erro geral:', error);
      
      // Tentar novamente uma vez antes de falhar
      try {
        console.warn('⚠️ [BONUS_CONFIG] Tentando novamente...');
        const retryResult = await makeDirectRequest('/get-bonus-amount.php', {}, 'GET');
        if (retryResult && retryResult.success && retryResult.data) {
          const bonusAmount = retryResult.data.referral_bonus_amount;
          this.bonusCache = {
            referral_bonus_amount: bonusAmount,
            welcome_bonus_amount: bonusAmount
          };
          this.lastFetch = Date.now();
          console.log('✅ [BONUS_CONFIG] Valor obtido no retry:', bonusAmount);
          return bonusAmount;
        }
      } catch (retryError) {
        console.error('❌ [BONUS_CONFIG] Retry também falhou:', retryError);
      }
      
      // Se o cache existir, usar o último valor conhecido
      if (this.bonusCache) {
        console.warn('⚠️ [BONUS_CONFIG] Usando último valor do cache:', this.bonusCache.referral_bonus_amount);
        return this.bonusCache.referral_bonus_amount;
      }
      
      throw new Error('Não foi possível obter o valor do bônus da API');
    }
  }

  /**
   * Parse do resultado do arquivo PHP (agora retorna JSON)
   */
  private parseBonusFromPhp(result: any): number {
    try {
      console.log('🔧 [BONUS_CONFIG] Resultado recebido:', result);
      
      // Se for uma string JSON, fazer parse
      if (typeof result === 'string') {
        try {
          const parsed = JSON.parse(result);
          if (parsed && typeof parsed.bonus !== 'undefined') {
            return parseFloat(parsed.bonus);
          }
        } catch (parseError) {
          console.error('❌ [BONUS_CONFIG] Erro ao fazer parse do JSON:', parseError);
        }
      }
      
      // Se for um número direto
      if (typeof result === 'number') {
        return result;
      }
      
      // Se for um objeto com a propriedade bonus
      if (result && typeof result === 'object' && typeof result.bonus !== 'undefined') {
        return parseFloat(result.bonus);
      }
      
      // Fallback - não usar valor hardcoded
      console.error('⚠️ [BONUS_CONFIG] Não foi possível fazer parse do resultado');
      throw new Error('Formato de resposta inválido do bonus.php');
    } catch (error) {
      console.error('❌ [BONUS_CONFIG] Erro ao fazer parse do resultado PHP:', error);
      throw error;
    }
  }

  /**
   * Força a atualização do cache
   */
  async refreshCache(): Promise<number> {
    this.bonusCache = null;
    this.lastFetch = 0;
    return await this.getBonusAmount();
  }

  /**
   * Obtém a configuração completa de bônus
   */
  async getBonusConfig(): Promise<BonusConfig> {
    const bonusAmount = await this.getBonusAmount();
    return {
      referral_bonus_amount: bonusAmount,
      welcome_bonus_amount: bonusAmount
    };
  }
}

// Exportar instância singleton
export const bonusConfigService = BonusConfigService.getInstance();

// Hook para usar em componentes React
import { useState, useEffect } from 'react';

export const useBonusConfig = () => {
  const [bonusAmount, setBonusAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBonusAmount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const amount = await bonusConfigService.getBonusAmount();
      setBonusAmount(amount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar valor do bônus';
      setError(errorMessage);
      console.error('❌ [USE_BONUS_CONFIG] Erro:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBonusAmount();
  }, []);

  return {
    bonusAmount,
    isLoading,
    error,
    refetch: loadBonusAmount
  };
};