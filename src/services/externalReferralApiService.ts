// Serviço para consumir dados de indicação da API externa
import { API_BASE_URL } from '@/config/apiConfig';

export interface ExternalReferralStats {
  total_indicados: number;
  indicados_ativos: number;
  total_bonus: number;
  bonus_este_mes: number;
  comissao_total: number;
  comissao_este_mes: number;
}

export interface ExternalReferralData {
  id: number;
  indicado_id: number;
  codigo_usado: string;
  status: 'ativo' | 'inativo' | 'cancelado';
  bonus_indicador: number;
  bonus_indicado: number;
  bonus_paid: boolean;
  bonus_paid_at: string | null;
  first_login_bonus_processed: boolean;
  first_login_at: string | null;
  created_at: string;
  updated_at: string;
  indicado_nome?: string;
  indicado_email?: string;
  indicado_telefone?: string;
  indicado_cadastro?: string;
}

export interface ExternalReferralConfig {
  referral_system_enabled: boolean;
  referral_bonus_enabled: boolean;
  referral_commission_enabled: boolean;
  referral_bonus_amount: number;
  referral_commission_percentage: number;
}

export interface ExternalWalletInfo {
  saldo: number;
  saldo_plano: number;
  total: number;
}

class ExternalReferralApiService {
  private baseUrl = API_BASE_URL;

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-API-Key': import.meta.env.VITE_API_KEY ?? ''
    };
  }

  // Buscar dados de indicação do usuário
  async getUserReferralData(): Promise<{
    stats: ExternalReferralStats;
    referrals: ExternalReferralData[];
    wallet: ExternalWalletInfo;
  }> {
    try {
      console.log('🔄 [EXTERNAL_REFERRAL] Buscando dados de indicação...');

      // Buscar estatísticas de indicação
      const statsResponse = await fetch(`${this.baseUrl}/referral-system/user-data`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      console.log('📡 [EXTERNAL_REFERRAL] Resposta stats:', {
        status: statsResponse.status,
        ok: statsResponse.ok
      });

      if (!statsResponse.ok) {
        throw new Error(`Erro ao buscar dados de indicação: ${statsResponse.status}`);
      }

      const statsData = await statsResponse.json();
      
      if (!statsData.success) {
        throw new Error(statsData.message || 'Erro ao carregar dados de indicação');
      }

      console.log('✅ [EXTERNAL_REFERRAL] Dados de indicação carregados:', statsData.data);

      // Buscar saldo da carteira
      const walletResponse = await fetch(`${this.baseUrl}/wallet/balance`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      let walletData = { saldo: 0, saldo_plano: 0, total: 0 };
      
      if (walletResponse.ok) {
        const walletResult = await walletResponse.json();
        if (walletResult.success && walletResult.data?.user_balance) {
          walletData = walletResult.data.user_balance;
        }
      }

      // Processar dados de indicação
      const referrals = Array.isArray(statsData.data.referrals) ? statsData.data.referrals : [];
      const stats = statsData.data.stats || {
        total_indicados: 0,
        indicados_ativos: 0,
        total_bonus: 0,
        bonus_este_mes: 0,
        comissao_total: 0,
        comissao_este_mes: 0
      };

      return {
        stats,
        referrals,
        wallet: walletData
      };

    } catch (error) {
      console.error('❌ [EXTERNAL_REFERRAL] Erro ao buscar dados:', error);
      throw error;
    }
  }

  // Buscar configurações do sistema de indicação APENAS da API externa
  async getReferralConfig(): Promise<ExternalReferralConfig> {
    try {
      console.log('🔄 [EXTERNAL_REFERRAL] Buscando configurações da API externa...');

      const response = await fetch(`${this.baseUrl}/system/referral-config`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [EXTERNAL_REFERRAL] API externa falhou: ${response.status} - ${errorText}`);
        throw new Error(`API externa indisponível (${response.status})`);
      }

      const configData = await response.json();
      
      if (!configData.success || !configData.data) {
        console.error('❌ [EXTERNAL_REFERRAL] Resposta inválida:', configData);
        throw new Error(configData.message || 'Resposta inválida da API externa');
      }

      const bonusAmount = configData.data.referral_bonus_amount;
      
      if (!bonusAmount || bonusAmount <= 0) {
        console.error('❌ [EXTERNAL_REFERRAL] Valor de bônus inválido:', bonusAmount);
        throw new Error(`Configuração de bônus inválida na API externa: ${bonusAmount}`);
      }
      
      console.log('✅ [EXTERNAL_REFERRAL] Config obtida da API externa:', {
        bonus_amount: bonusAmount,
        full_data: configData.data
      });
      
      return {
        referral_system_enabled: configData.data.referral_system_enabled,
        referral_bonus_enabled: configData.data.referral_bonus_enabled,
        referral_commission_enabled: configData.data.referral_commission_enabled,
        referral_bonus_amount: bonusAmount,
        referral_commission_percentage: configData.data.referral_commission_percentage
      };

    } catch (error) {
      console.error('❌ [EXTERNAL_REFERRAL] ERRO CRÍTICO - API externa falhou:', error);
      throw error; // Nunca usar fallback - sempre da API externa
    }
  }

  // Buscar transações da carteira
  async getWalletTransactions(): Promise<any[]> {
    try {
      console.log('🔄 [EXTERNAL_REFERRAL] Buscando transações da carteira...');

      const response = await fetch(`${this.baseUrl}/referral-system/transactions`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        console.warn('⚠️ [EXTERNAL_REFERRAL] Falha ao carregar transações');
        return [];
      }

      const transactionsData = await response.json();
      
      if (transactionsData.success && Array.isArray(transactionsData.data)) {
        console.log('✅ [EXTERNAL_REFERRAL] Transações carregadas:', transactionsData.data.length);
        return transactionsData.data;
      }

      return [];

    } catch (error) {
      console.error('❌ [EXTERNAL_REFERRAL] Erro ao buscar transações:', error);
      return [];
    }
  }

  // Validar código de indicação
  async validateReferralCode(code: string): Promise<{
    valid: boolean;
    referrer_id?: number;
    referrer_name?: string;
    message?: string;
  }> {
    try {
      console.log('🔄 [EXTERNAL_REFERRAL] Validando código:', code);

      const response = await fetch(`${this.baseUrl}/referral-system/validate-code`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        return {
          valid: false,
          message: 'Erro ao validar código'
        };
      }

      const validationData = await response.json();
      
      if (validationData.success) {
        console.log('✅ [EXTERNAL_REFERRAL] Código válido:', validationData.data);
        return {
          valid: true,
          referrer_id: validationData.data.referrer_id,
          referrer_name: validationData.data.referrer_name
        };
      }

      return {
        valid: false,
        message: validationData.message || 'Código inválido'
      };

    } catch (error) {
      console.error('❌ [EXTERNAL_REFERRAL] Erro ao validar código:', error);
      return {
        valid: false,
        message: 'Erro na validação'
      };
    }
  }
}

export const externalReferralApiService = new ExternalReferralApiService();