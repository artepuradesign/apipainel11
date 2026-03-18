
// Serviço completo para o sistema de indicação com API externa

import { API_BASE_URL } from '@/config/apiConfig';
import { cookieUtils } from '@/utils/cookieUtils';

export interface ReferralValidationResponse {
  valid: boolean;
  referrer_id: number;
  referrer_name: string;
  referrer_email: string;
  code: string;
}

export interface ReferralBonusResponse {
  bonus_processed: boolean;
  bonus_amount: number;
  referrer_bonus: number;
  referred_bonus: number;
  indicacao_id: number;
  referrer_id: number;
  referred_id: number;
  transactions: {
    referrer: any;
    referred: any;
  };
}

export interface ReferralStats {
  total_indicados: number;
  indicados_ativos: number;
  total_bonus: number;
  bonus_este_mes: number;
}

export interface WalletInfo {
  wallet_balance: number;
  plan_balance: number;
}

export interface ReferralData {
  stats: ReferralStats;
  referrals: any[];
  wallet: WalletInfo;
}

export interface WalletTransaction {
  id: number;
  wallet_type: string;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_id: string;
  reference_type: string;
  status: string;
  created_at: string;
}

class NewReferralApiService {
  private getAuthHeaders() {
    const token = cookieUtils.get('session_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    console.log(`📡 [NEW_REFERRAL_API] Resposta status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [NEW_REFERRAL_API] Erro ${response.status}:`, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      } catch (parseError) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    console.log('✅ [NEW_REFERRAL_API] Resposta recebida:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Operação falhou');
    }
    
    return data.data;
  }

  /**
   * Validar código de indicação
   */
  async validateReferralCode(code: string): Promise<ReferralValidationResponse> {
    console.log(`🔍 [NEW_REFERRAL_API] Validando código: ${code}`);
    
    const response = await fetch(`${API_BASE_URL}/referral-system/validate-code`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ code })
    });
    
    const result = await this.handleResponse<ReferralValidationResponse>(response);
    console.log('✅ [NEW_REFERRAL_API] Código validado:', result);
    return result;
  }

  /**
   * Processar bônus de indicação no cadastro automaticamente
   */
  async processRegistrationBonus(userId: number, referralCode: string): Promise<ReferralBonusResponse> {
    console.log(`🎁 [NEW_REFERRAL_API] Processando bônus automático para usuário ${userId} com código ${referralCode}`);
    
    const response = await fetch(`${API_BASE_URL}/referral-system/process-registration-bonus`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        user_id: userId, 
        referral_code: referralCode 
      })
    });
    
    const result = await this.handleResponse<any>(response);
    console.log('✅ [NEW_REFERRAL_API] Bônus processado automaticamente:', result);
    
    // Mapear a resposta para o formato esperado
    const bonusProcessed = result.registration_processed || result.bonus_processed || false;
    const referredBonus = parseFloat(result.referred_bonus) || parseFloat(result.bonus_amount) || 0;
    const referrerBonus = parseFloat(result.referrer_bonus) || parseFloat(result.bonus_amount) || 0;
    
    console.log('📋 [NEW_REFERRAL_API] Mapeando resposta:', {
      original: result,
      mapped: {
        bonus_processed: bonusProcessed,
        referred_bonus: referredBonus,
        referrer_bonus: referrerBonus
      }
    });
    
    return {
      bonus_processed: bonusProcessed,
      bonus_amount: referredBonus,
      referrer_bonus: referrerBonus,
      referred_bonus: referredBonus,
      indicacao_id: result.indicacao_id || 0,
      referrer_id: result.referrer_id || 0,
      referred_id: result.referred_id || userId,
      transactions: result.transactions || { referrer: null, referred: null }
    };
  }

  /**
   * Processar comissão de 10% na ativação do plano
   */
  async processPlanActivationCommission(userId: number, planId: number, planValue: number): Promise<any> {
    console.log(`💰 [NEW_REFERRAL_API] Processando comissão de ativação de plano para usuário ${userId}`);
    console.log(`📊 Plano ID: ${planId}, Valor: R$ ${planValue.toFixed(2)}`);
    
    const response = await fetch(`${API_BASE_URL}/revendas/commission/plan-activation`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        user_id: userId,
        plan_id: planId,
        plan_value: planValue
      })
    });
    
    const result = await this.handleResponse<any>(response);
    console.log('✅ [NEW_REFERRAL_API] Comissão de ativação processada:', result);
    return result;
  }

  /**
   * Processar comissão de recarga (deprecated - usar processPlanActivationCommission)
   */
  async processRechargeCommission(userId: number, rechargeAmount: number): Promise<any> {
    console.log(`💰 [NEW_REFERRAL_API] Processando comissão de recarga para usuário ${userId}, valor: ${rechargeAmount}`);
    
    const response = await fetch(`${API_BASE_URL}/referral-system/process-recharge-commission`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        user_id: userId, 
        amount: rechargeAmount 
      })
    });
    
    const result = await this.handleResponse<any>(response);
    console.log('✅ [NEW_REFERRAL_API] Comissão processada:', result);
    return result;
  }

  /**
   * Buscar dados de indicação do usuário
   */
  async getUserReferralData(): Promise<ReferralData> {
    console.log('📊 [NEW_REFERRAL_API] Buscando dados de indicação...');
    
    const response = await fetch(`${API_BASE_URL}/referral-system/user-data`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    const result = await this.handleResponse<ReferralData>(response);
    console.log('✅ [NEW_REFERRAL_API] Dados carregados:', result);
    return result;
  }

  /**
   * Buscar transações da carteira
   */
  async getWalletTransactions(limit: number = 50, offset: number = 0): Promise<WalletTransaction[]> {
    console.log('💰 [NEW_REFERRAL_API] Buscando transações...');
    
    const response = await fetch(`${API_BASE_URL}/referral-system/transactions?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    const result = await this.handleResponse<WalletTransaction[]>(response);
    console.log('✅ [NEW_REFERRAL_API] Transações carregadas:', result.length);
    return result;
  }

  /**
   * Buscar saldo da carteira
   */
  async getWalletBalance(): Promise<WalletInfo> {
    console.log('💳 [NEW_REFERRAL_API] Buscando saldo da carteira...');
    
    const response = await fetch(`${API_BASE_URL}/referral-system/balance`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    const result = await this.handleResponse<WalletInfo>(response);
    console.log('✅ [NEW_REFERRAL_API] Saldo carregado:', result);
    return result;
  }

  /**
   * Atualizar saldo do usuário
   */
  async updateUserBalance(userId: number, amount: number, type: 'credit' | 'debit', description: string, walletType: string = 'plan'): Promise<any> {
    console.log(`💸 [NEW_REFERRAL_API] Atualizando saldo - User: ${userId}, Amount: ${amount}, Type: ${type}`);
    
    const response = await fetch(`${API_BASE_URL}/referral-system/update-balance`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        user_id: userId,
        amount,
        type,
        description,
        wallet_type: walletType
      })
    });
    
    const result = await this.handleResponse<any>(response);
    console.log('✅ [NEW_REFERRAL_API] Saldo atualizado:', result);
    return result;
  }

  /**
   * Buscar valor específico de configuração
   */
  async getConfigValue(key: string): Promise<any> {
    console.log(`🔧 [NEW_REFERRAL_API] Buscando configuração: ${key}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/system-config-get?key=${key}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ [NEW_REFERRAL_API] Configuração ${key} obtida:`, result.data.config_value);
        return result.data.config_value;
      } else {
        throw new Error(result.message || 'Erro ao buscar configuração');
      }
    } catch (error) {
      console.warn(`⚠️ [NEW_REFERRAL_API] Erro ao buscar configuração ${key}:`, error);
      throw error;
    }
  }

  /**
   * Buscar valor do bônus de indicação dinamicamente
   */
  async getReferralBonusAmount(): Promise<number> {
    try {
      const value = await this.getConfigValue('referral_bonus_amount');
      const bonusAmount = Number(value) || 5.00;
      console.log('💰 [NEW_REFERRAL_API] Valor do bônus obtido da API:', bonusAmount);
      return bonusAmount;
    } catch (error) {
      console.warn('⚠️ [NEW_REFERRAL_API] Usando valor padrão para referral_bonus_amount:', error);
      return 5.00;
    }
  }

  /**
   * Buscar configurações do sistema de indicação
   */
  async getReferralConfig(): Promise<any> {
    console.log('⚙️ [NEW_REFERRAL_API] Buscando configurações...');
    
    try {
      // Buscar valor dinâmico do bônus
      const bonusAmount = await this.getReferralBonusAmount();
      
      return {
        referral_system_enabled: true,
        referral_bonus_enabled: true, // ✅ Bônus de cadastro mantido
        referral_commission_enabled: true,
        referral_bonus_amount: bonusAmount, // Valor dinâmico da API
        referral_commission_percentage: 10.0 // 10% adicional na ativação
      };
    } catch (error) {
      console.warn('⚠️ [NEW_REFERRAL_API] Erro ao buscar config, usando padrão:', error);
      
      // Configuração padrão em caso de erro
      return {
        referral_system_enabled: true,
        referral_bonus_enabled: true, // ✅ Bônus de cadastro mantido
        referral_commission_enabled: true,
        referral_bonus_amount: 5.00, // Valor padrão caso API falhe
        referral_commission_percentage: 10.0 // 10% adicional na ativação
      };
    }
  }
}

export const newReferralApiService = new NewReferralApiService();
