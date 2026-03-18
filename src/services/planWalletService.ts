// Serviço para compra de planos via API (similar ao walletApiService)
import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';
import { API_BASE_URL } from '@/config/apiConfig';

export interface PlanPurchaseTransaction {
  id: number;
  user_id: number;
  plan_id: number;
  type: 'plan_purchase';
  amount: number;
  payment_method: string;
  description: string;
  new_saldo: number;
  new_saldo_plano: number;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function planApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Debug completo dos cookies
    console.log('🔍 [PLAN_PURCHASE_DEBUG] Verificando tokens...');
    
    // Obter token de sessão
    const sessionToken = cookieUtils.get('session_token');
    const apiSessionToken = cookieUtils.get('api_session_token');
    
    console.log('🔍 [PLAN_PURCHASE_DEBUG] Tokens encontrados:');
    console.log('  - session_token:', sessionToken ? sessionToken.substring(0, 20) + '...' : 'AUSENTE');
    console.log('  - api_session_token:', apiSessionToken ? apiSessionToken.substring(0, 20) + '...' : 'AUSENTE');
    
    const finalToken = sessionToken || apiSessionToken;
    
    if (!finalToken) {
      console.error('❌ Token de sessão não encontrado');
      return {
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.'
      };
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 [PLAN_PURCHASE] Fazendo requisição para:', url);

    // Usar fetch nativo similar ao walletApiService
    const response = await window.fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${finalToken}`,
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    console.log('📊 [PLAN_PURCHASE] Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [PLAN_PURCHASE] Response Error:', errorText);
      
      // Se for erro 401, detalhar o problema
      if (response.status === 401) {
        console.error('🚫 Erro de autenticação - Token pode estar inválido ou expirado');
      }
      
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [PLAN_PURCHASE] Response Data:', data);

    return data;
  } catch (error) {
    console.error('❌ [PLAN_PURCHASE] Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export const planWalletService = {
  // Comprar plano (adiciona valor ao saldo_plano e ativa plano por 30 dias)
  async purchasePlan(
    planId: number, 
    paymentMethod: string, 
    amount: number, 
    description: string = 'Compra de plano'
  ): Promise<ApiResponse<PlanPurchaseTransaction>> {
    console.log('💎 [PLAN_PURCHASE] Comprando plano via API:', { 
      planId, 
      paymentMethod, 
      amount, 
      description 
    });
    
    return planApiRequest<PlanPurchaseTransaction>('/plan/purchase', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        payment_method: paymentMethod,
        amount: amount,
        description: description
      }),
    });
  },

  // Verificar plano ativo do usuário
  async getUserActivePlan(): Promise<ApiResponse<any>> {
    console.log('🔍 [PLAN_PURCHASE] Buscando plano ativo do usuário');
    return planApiRequest<any>('/user/active-plan', {
      method: 'GET'
    });
  },

  // Obter estatísticas de uso do plano
  async getPlanUsageStats(): Promise<ApiResponse<any>> {
    console.log('📊 [PLAN_PURCHASE] Buscando estatísticas de uso do plano');
    return planApiRequest<any>('/user/plan-usage', {
      method: 'GET'
    });
  }
};