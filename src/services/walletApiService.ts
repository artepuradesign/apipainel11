import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest, fetchApiConfig, getApiUrl } from '@/config/api';

export interface WalletTransaction {
  id: number;
  user_id: number;
  wallet_type: 'main' | 'plan' | 'bonus' | 'referral';
  type: 'recarga' | 'bonus' | 'indicacao' | 'plano' | 'consulta' | 'saque' | 'entrada' | 'saida' | 'transferencia';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  original_description?: string;
  reference_id?: string;
  reference_type?: string;
  referral_user_name?: string;
  payment_method?: string;
  external_transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: any;
  is_referral_bonus?: boolean;
  transaction_display_type?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserWallet {
  id: number;
  user_id: number;
  wallet_type: 'main' | 'plan';
  current_balance: number;
  available_balance: number;
  frozen_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_spent: number;
  currency: string;
  status: 'active' | 'inactive' | 'frozen';
  last_transaction_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function makeWalletRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    await fetchApiConfig();
    
    const sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    
    if (!sessionToken) {
      console.error('❌ Token de sessão não encontrado');
      return {
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.'
      };
    }

    console.log('🌐 [WALLET_API] Fazendo requisição para:', endpoint);

    const data = await apiRequest<any>(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        ...options.headers,
      },
    });

    console.log('✅ [WALLET_API] Response Data:', data);
    return data;
  } catch (error) {
    console.error('❌ [WALLET_API] Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export const walletApiService = {
  // Testar conectividade com a API
  async testConnection(): Promise<ApiResponse<any>> {
    return makeWalletRequest<any>('/wallet/test', { method: 'GET' });
  },

  // Adicionar saldo na carteira
  async addBalance(
    userId: number,
    amount: number,
    description: string = 'Recarga de saldo',
    paymentMethod: string = 'PIX',
    centralCashAmount?: number,
    walletType: 'main' | 'plan' = 'main',
    cupomData?: { cupom: any; valorDesconto: number; valorPago: number }
  ): Promise<ApiResponse<WalletTransaction>> {
    console.log('💰 Adicionando saldo via API:', { userId, amount, description, paymentMethod, centralCashAmount, walletType, cupomData });
    
    // Tipo de carteira conforme o frontend ('main' | 'plan')
    const serverWalletType = walletType;
    
    const requestBody: any = {
      amount: amount,
      payment_method: paymentMethod,
      description: description,
      wallet_type: serverWalletType // Enviar exatamente como esperado pelo backend
    };
    
    // Se um valor específico for fornecido para o caixa central (caso de cupom), incluir no request
    if (centralCashAmount !== undefined) {
      requestBody.central_cash_amount = centralCashAmount;
    }
    
    // Se há dados de cupom, incluir para processamento separado no backend
    if (cupomData) {
      requestBody.cupom_data = {
        cupom_codigo: cupomData.cupom.codigo,
        valor_desconto: cupomData.valorDesconto,
        valor_pago: cupomData.valorPago,
        wallet_type: serverWalletType // Garantir wallet_type nos dados do cupom também
      };
    }
    
    console.log('📤 [WALLET_API] Request body:', requestBody);
    
    return makeWalletRequest<WalletTransaction>('/wallet/add-balance', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },

  // Obter carteiras do usuário
  async getUserWallets(userId: number): Promise<ApiResponse<UserWallet[]>> {
    return makeWalletRequest<UserWallet[]>(`/wallet/user/${userId}`);
  },

  // Obter saldo total do usuário
  async getTotalBalance(userId: number): Promise<ApiResponse<{ user_id: number; saldo: number; saldo_plano: number; total_balance: number; total: number }>> {
    const response = await makeWalletRequest<any>(`/wallet/balance`);
    
    // Mapear a resposta da API para o formato esperado
    if (response.success && response.data && response.data.user_balance) {
      const userBalance = response.data.user_balance;
      return {
        success: true,
        data: {
          user_id: userId,
          saldo: userBalance.saldo || 0,
          saldo_plano: userBalance.saldo_plano || 0,
          total_balance: userBalance.total || 0,
          total: userBalance.total || 0
        }
      };
    }
    
    return response;
  },

  // Obter histórico de transações
  async getTransactionHistory(userId: number, limit: number = 50, walletType?: string): Promise<ApiResponse<WalletTransaction[]>> {
    let url = `/wallet/transactions?limit=${limit}`;
    if (walletType) {
      url += `&wallet_type=${walletType}`;
    }
    console.log('🔄 [WALLET_API] Buscando histórico de transações:', { userId, limit, walletType, url });
    return makeWalletRequest<WalletTransaction[]>(url);
  },

  // Criar transação na carteira
  async createTransaction(transactionData: Partial<WalletTransaction>): Promise<ApiResponse<WalletTransaction>> {
    return makeWalletRequest<WalletTransaction>('/wallet/transaction', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }
};
