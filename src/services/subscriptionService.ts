import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';
import { API_BASE_URL } from '@/config/apiConfig';

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: 'active' | 'cancelled' | 'expired' | 'suspended';
  starts_at?: string;
  ends_at?: string;
  start_date?: string;
  end_date?: string;
  auto_renew?: boolean;
  payment_method?: string;
  external_subscription_id?: string;
  created_at: string;
  updated_at?: string;
  plan_name?: string;
  discount_percentage?: number;
  description?: string;
  price?: number;
}

export interface PlanInfo {
  id: number;
  name: string;
  price: number;
  discount_percentage: number;
  features: string;
  is_active: boolean;
}

export interface SubscriptionResponse {
  success: boolean;
  data?: UserSubscription;
  error?: string;
  message?: string;
}

export interface PlanResponse {
  success: boolean;
  data?: PlanInfo;
  error?: string;
  message?: string;
}

async function subscriptionApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const sessionToken = cookieUtils.get('session_token');
    const apiSessionToken = cookieUtils.get('api_session_token');
    const finalToken = sessionToken || apiSessionToken;
    
    if (!finalToken) {
      return {
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.'
      };
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 [SUBSCRIPTION] Fazendo requisição para:', url);

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

    console.log('📊 [SUBSCRIPTION] Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [SUBSCRIPTION] Response Error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [SUBSCRIPTION] Response Data:', data);

    return data;
  } catch (error) {
    console.error('❌ [SUBSCRIPTION] Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export const subscriptionService = {
  // Verificar se usuário tem assinatura ativa
  async getUserActiveSubscription(): Promise<SubscriptionResponse> {
    console.log('🔍 [SUBSCRIPTION] Verificando assinatura ativa do usuário');
    return subscriptionApiRequest<UserSubscription>('/user/active-plan', {
      method: 'GET'
    });
  },

  // Obter informações do plano baseado no tipoplano do usuário
  async getPlanInfo(planName: string): Promise<PlanResponse> {
    console.log('🔍 [SUBSCRIPTION] Buscando informações do plano:', planName);

    // Observação: alguns endpoints retornam `data` como ARRAY de planos, mesmo quando filtrado por nome.
    // Normalizamos aqui para sempre retornar um único PlanInfo (o plano correspondente ao `planName`).
    const response = await subscriptionApiRequest<any>(
      `/plans/by-name/${encodeURIComponent(planName)}`,
      { method: 'GET' }
    );

    if (!response.success) {
      return response as PlanResponse;
    }

    const rawData = (response as any).data;
    let plan: any | undefined;

    if (Array.isArray(rawData)) {
      const target = planName.trim().toLowerCase();
      plan = rawData.find((p: any) => {
        const name = (p?.name || '').toString().trim().toLowerCase();
        const slug = (p?.slug || '').toString().trim().toLowerCase();
        return name === target || slug === target;
      });
    } else {
      plan = rawData;
    }

    if (!plan) {
      return {
        success: false,
        error: 'Plano não encontrado'
      };
    }

    return {
      success: true,
      data: plan as PlanInfo
    };
  },

  // Criar nova assinatura (atualiza tanto user_subscriptions quanto users)
  async createSubscription(
    planId: number, 
    paymentMethod: string, 
    amount: number
  ): Promise<SubscriptionResponse> {
    console.log('💎 [SUBSCRIPTION] Criando nova assinatura:', { 
      planId, 
      paymentMethod, 
      amount 
    });
    
    return subscriptionApiRequest<UserSubscription>('/user/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        payment_method: paymentMethod,
        amount: amount
      }),
    });
  },

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: number, reason?: string): Promise<SubscriptionResponse> {
    console.log('❌ [SUBSCRIPTION] Cancelando assinatura:', subscriptionId);
    
    return subscriptionApiRequest<UserSubscription>('/user/cancel-subscription', {
      method: 'POST',
      body: JSON.stringify({
        subscription_id: subscriptionId,
        cancellation_reason: reason
      }),
    });
  },

  // Calcular valor com desconto baseado no plano do usuário
  calculateDiscountedPrice(originalPrice: number, discountPercentage: number): {
    discountedPrice: number;
    discountAmount: number;
    hasDiscount: boolean;
  } {
    const hasDiscount = discountPercentage > 0;
    const discountAmount = hasDiscount ? (originalPrice * discountPercentage) / 100 : 0;
    const discountedPrice = hasDiscount ? originalPrice - discountAmount : originalPrice;
    
    return {
      discountedPrice: Math.max(discountedPrice, 0.01), // Preço mínimo
      discountAmount,
      hasDiscount
    };
  }
};