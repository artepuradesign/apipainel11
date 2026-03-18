import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';
import { API_BASE_URL } from '@/config/apiConfig';

export interface CentralCashTransaction {
  id: number;
  transaction_type: 'entrada' | 'saida' | 'consulta' | 'recarga' | 'saque' | 'comissao' | 'plano' | 'ajuste' | 'estorno' | 'compra_modulo';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_table?: string;
  reference_id?: number;
  user_id?: number;
  created_by?: number;
  payment_method?: string;
  external_id?: string;
  metadata?: any;
  created_at: string;
}

export interface CentralCashStats {
  current_balance: number;
  daily_revenue: number;
  monthly_revenue: number;
  total_recharges: number;
  total_withdrawals: number;
  total_commissions: number;
  total_consultations: number;
  users_count: number;
  last_updated: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const sessionToken = cookieUtils.get('session_token');
  
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 Central Cash API Request:', options.method || 'GET', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': sessionToken ? `Bearer ${sessionToken}` : '',
        'X-API-Key': import.meta.env.VITE_API_KEY ?? '',
        ...options.headers,
      },
      ...options,
    });

    console.log('📊 Central Cash API Response Status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 Central Cash API Response Data:', data);

    return data;
  } catch (error) {
    console.error('❌ Central Cash API Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export const centralCashApiService = {
  // Adicionar transação ao caixa central
  async addTransaction(type: string, amount: number, description: string, userId?: number, metadata?: any): Promise<ApiResponse<CentralCashTransaction>> {
    return apiRequest<CentralCashTransaction>('/central-cash/transaction', {
      method: 'POST',
      body: JSON.stringify({
        type: type,
        amount: amount,
        description: description,
        user_id: userId,
        metadata: metadata,
        status: 'completed'
      }),
    });
  },

  // Obter estatísticas do caixa central
  async getStats(): Promise<ApiResponse<CentralCashStats>> {
    return apiRequest<CentralCashStats>('/central-cash/stats');
  },

  // Obter transações recentes do caixa central
  async getRecentTransactions(limit: number = 50): Promise<ApiResponse<CentralCashTransaction[]>> {
    return apiRequest<CentralCashTransaction[]>(`/central-cash/transactions?limit=${limit}`);
  },

  // Obter transações de um usuário específico
  async getUserTransactions(userId: number, limit: number = 50): Promise<ApiResponse<CentralCashTransaction[]>> {
    return apiRequest<CentralCashTransaction[]>(`/central-cash/transactions/user/${userId}?limit=${limit}`);
  },

  // Obter saldo atual do caixa central
  async getCurrentBalance(): Promise<ApiResponse<{ balance: number; last_updated: string }>> {
    return apiRequest<{ balance: number; last_updated: string }>('/central-cash/balance');
  }
};
