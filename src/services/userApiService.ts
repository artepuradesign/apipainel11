import { cookieUtils } from '@/utils/cookieUtils';
import { API_CONFIG } from '@/config/api';

export interface UserBalance {
  saldo: number;
  saldo_plano: number;
  total: number;
}

export interface UserData {
  id: number;
  email: string;
  full_name: string;
  user_role: 'assinante' | 'suporte' | 'admin';
  saldo: number;
  saldo_plano: number;
  status: string;
  tipoplano: string;
  codigo_indicacao?: string;
  cpf?: string;
  cnpj?: string;
  data_nascimento?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  aceite_termos?: boolean;
  email_verificado?: boolean;
  telefone_verificado?: boolean;
  ultimo_login?: string;
  created_at?: string;
  updated_at?: string;
  data_inicio?: string;
  data_fim?: string;
  premium_enabled?: number | boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const API_BASE_URL = API_CONFIG.BASE_URL;

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Obter token de sessão
    const sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    
    if (!sessionToken) {
      console.error('❌ [USER_API] Token de sessão não encontrado');
      return {
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.'
      };
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 [USER_API] Fazendo requisição para:', url);

    const response = await window.fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    console.log('📊 [USER_API] Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [USER_API] Response Error:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [USER_API] Response Data:', data);

    return data;
  } catch (error) {
    console.error('❌ [USER_API] Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export const userApiService = {
  // Obter dados completos do usuário (usa /auth/me para incluir premium_enabled)
  async getUserData(): Promise<ApiResponse<UserData>> {
    console.log('👤 [USER_API] Buscando dados do usuário via /auth/me');
    const response = await apiRequest<any>('/auth/me');
    if (response.success && response.data?.user) {
      return { success: true, data: response.data.user as UserData };
    }
    return response;
  },

  // Obter saldo do usuário (incluindo saldo do plano)
  async getUserBalance(): Promise<ApiResponse<UserBalance>> {
    console.log('💰 [USER_API] Buscando saldo do usuário');
    
    try {
      // Usar endpoint da wallet que já existe
      const response = await apiRequest<any>('/wallet/balance');

      if (response.success) {
        // Compatibilidade com múltiplos formatos de resposta
        const raw = response.data ?? response;
        const rawBalance = raw?.user_balance ?? raw?.data?.user_balance ?? raw?.data ?? raw;

        const saldo = Number(rawBalance?.saldo ?? 0) || 0;
        const saldoPlano = Number(rawBalance?.saldo_plano ?? 0) || 0;
        const totalFromApi = Number(rawBalance?.total);
        const total = Number.isFinite(totalFromApi) && totalFromApi >= 0
          ? totalFromApi
          : saldo + saldoPlano;

        const userBalance: UserBalance = {
          saldo,
          saldo_plano: saldoPlano,
          total
        };

        return {
          success: true,
          data: userBalance
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ [USER_API] Erro ao buscar saldo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar saldo'
      };
    }
  },

  // Atualizar dados do usuário
  async updateUserData(userData: Partial<UserData>): Promise<ApiResponse<UserData>> {
    console.log('📝 [USER_API] Atualizando dados do usuário:', userData);
    
    return apiRequest<UserData>('/users/update', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Atualizar saldo do plano especificamente
  async updatePlanBalance(amount: number, operation: 'add' | 'subtract' = 'add'): Promise<ApiResponse<UserBalance>> {
    console.log(`💳 [USER_API] ${operation === 'add' ? 'Adicionando' : 'Removendo'} saldo do plano:`, amount);
    
    return apiRequest<UserBalance>('/wallet/update-plan-balance', {
      method: 'POST',
      body: JSON.stringify({
        amount: amount,
        operation: operation,
        description: `${operation === 'add' ? 'Adição' : 'Remoção'} de saldo do plano`
      }),
    });
  },

  // Transferir saldo entre carteiras (main <-> plan)
  async transferBalance(amount: number, from: 'main' | 'plan', to: 'main' | 'plan'): Promise<ApiResponse<UserBalance>> {
    console.log(`🔄 [USER_API] Transferindo R$ ${amount} de ${from} para ${to}`);
    
    return apiRequest<UserBalance>('/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({
        amount: amount,
        from_wallet: from,
        to_wallet: to,
        description: `Transferência de saldo: ${from} → ${to}`
      }),
    });
  },

  // Comprar plano (deduz do saldo principal e adiciona ao saldo do plano)
  async purchasePlan(planId: number, planPrice: number, paymentMethod: string = 'saldo'): Promise<ApiResponse<any>> {
    console.log(`🛒 [USER_API] Comprando plano ${planId} por R$ ${planPrice}`);
    
    return apiRequest<any>('/wallet/purchase-plan', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        payment_method: paymentMethod
      }),
    });
  },

  // Validar se o usuário tem saldo suficiente
  async validateSufficientBalance(amount: number, walletType: 'main' | 'plan' = 'main'): Promise<ApiResponse<{ sufficient: boolean; currentBalance: number }>> {
    try {
      const balanceResponse = await this.getUserBalance();
      
      if (!balanceResponse.success || !balanceResponse.data) {
        return {
          success: false,
          error: 'Erro ao verificar saldo'
        };
      }
      
      const currentBalance = walletType === 'main' 
        ? balanceResponse.data.saldo 
        : balanceResponse.data.saldo_plano;
      
      return {
        success: true,
        data: {
          sufficient: currentBalance >= amount,
          currentBalance: currentBalance
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao validar saldo'
      };
    }
  },

  // Testar conectividade com a API de usuários
  async testConnection(): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 [USER_API] Testando conectividade...');
      
      const response = await window.fetch(`${API_BASE_URL}/users/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conectividade'
      };
    }
  }
};