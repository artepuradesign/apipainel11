import { API_BASE_URL } from '@/config/apiConfig';
import { cookieUtils } from '@/utils/cookieUtils';

interface ReferralTransactionResponse {
  success: boolean;
  message: string;
  data?: any;
}

class ReferralTransactionService {
  private getAuthHeaders() {
    const token = cookieUtils.get('session_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Processa o bônus de indicação após o cadastro
   */
  async processRegistrationBonus(userId: number, referralCode?: string): Promise<ReferralTransactionResponse> {
    if (!referralCode) {
      console.log('ℹ️ [REFERRAL_TRANSACTION] Nenhum código de indicação fornecido');
      return {
        success: false,
        message: 'Nenhum código de indicação fornecido'
      };
    }
    
    try {
      console.log('💰 [REFERRAL_TRANSACTION] Processando bônus de cadastro para usuário:', userId, 'com código:', referralCode);
      
      console.log('🌐 [REFERRAL_TRANSACTION] URL:', `${API_BASE_URL}/referral-system/process-registration-bonus`);
      console.log('🌐 [REFERRAL_TRANSACTION] Headers:', this.getAuthHeaders());
      console.log('🌐 [REFERRAL_TRANSACTION] Body:', JSON.stringify({ user_id: userId, referral_code: referralCode }));
      
      const response = await fetch(`${API_BASE_URL}/referral-system/process-registration-bonus`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ user_id: userId, referral_code: referralCode })
      });

      const result = await response.json();
      console.log('📡 [REFERRAL_TRANSACTION] Resposta da API:', result);

      if (response.ok && result.success) {
        console.log('✅ [REFERRAL_TRANSACTION] Bônus processado com sucesso');
        return {
          success: true,
          message: result.message || 'Bônus de indicação processado com sucesso',
          data: result.data
        };
      } else {
        console.error('❌ [REFERRAL_TRANSACTION] Erro no processamento:', result);
        return {
          success: false,
          message: result.message || 'Erro ao processar bônus de indicação'
        };
      }
    } catch (error) {
      console.error('❌ [REFERRAL_TRANSACTION] Erro na requisição:', error);
      return {
        success: false,
        message: 'Erro de comunicação com o servidor'
      };
    }
  }

  /**
   * Busca dados de indicação do usuário
   */
  async getUserReferrals(userId?: number): Promise<ReferralTransactionResponse> {
    try {
      console.log('🔍 [REFERRAL_TRANSACTION] Buscando dados de indicação...');
      
      const url = userId 
        ? `${API_BASE_URL}/auth/referrals?user_id=${userId}`
        : `${API_BASE_URL}/auth/referrals`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('📡 [REFERRAL_TRANSACTION] Resposta da API:', result);

      if (response.ok && result.success) {
        return {
          success: true,
          message: result.message || 'Dados de indicação carregados',
          data: result.data
        };
      } else {
        console.error('❌ [REFERRAL_TRANSACTION] Erro ao buscar dados:', result);
        return {
          success: false,
          message: result.message || 'Erro ao buscar dados de indicação'
        };
      }
    } catch (error) {
      console.error('❌ [REFERRAL_TRANSACTION] Erro na requisição:', error);
      return {
        success: false,
        message: 'Erro de comunicação com o servidor'
      };
    }
  }

  /**
   * Força o processamento de bônus pendentes
   */
  async processFirstLoginBonus(): Promise<ReferralTransactionResponse> {
    try {
      console.log('💰 [REFERRAL_TRANSACTION] Processando bônus de primeiro login...');
      
      console.log('🌐 [FIRST_LOGIN] URL:', `${API_BASE_URL}/auth/process-first-login-bonus`);
      console.log('🌐 [FIRST_LOGIN] Headers:', this.getAuthHeaders());
      
      const response = await fetch(`${API_BASE_URL}/auth/process-first-login-bonus`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({})
      });

      const result = await response.json();
      console.log('📡 [REFERRAL_TRANSACTION] Resposta da API:', result);

      if (response.ok && result.success) {
        return {
          success: true,
          message: result.message || 'Bônus de primeiro login processado',
          data: result.data
        };
      } else {
        console.error('❌ [REFERRAL_TRANSACTION] Erro no processamento:', result);
        return {
          success: false,
          message: result.message || 'Erro ao processar bônus de primeiro login'
        };
      }
    } catch (error) {
      console.error('❌ [REFERRAL_TRANSACTION] Erro na requisição:', error);
      return {
        success: false,
        message: 'Erro de comunicação com o servidor'
      };
    }
  }
}

export const referralTransactionService = new ReferralTransactionService();