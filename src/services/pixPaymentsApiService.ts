import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';

export interface PixPayment {
  id: number;
  user_id: number;
  payment_id: string;
  amount: number;
  amount_formatted?: string;
  description?: string | null;
  external_reference?: string | null;
  qr_code?: string | null;
  qr_code_base64?: string | null;
  transaction_id?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired' | string;
  status_detail?: string | null;
  status_label?: string;
  payer_email?: string | null;
  payer_identification_type?: string | null;
  payer_identification_number?: string | null;
  created_at: string;
  updated_at: string;
  approved_at?: string | null;
  expires_at?: string | null;
  last_webhook_at?: string | null;
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
  try {
    const sessionToken = cookieUtils.get('session_token');
    const apiSessionToken = cookieUtils.get('api_session_token');
    const finalToken = sessionToken || apiSessionToken;

    console.log('🔵 [PIX_API] ========================================');
    console.log('🔵 [PIX_API] Endpoint:', endpoint);
    console.log('🔵 [PIX_API] Method:', options.method || 'GET');
    console.log('🔵 [PIX_API] Token presente:', !!finalToken);
    console.log('🔵 [PIX_API] ========================================');

    if (!finalToken) {
      console.error('❌ [PIX_API] Token de sessão não encontrado');
      return {
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.'
      };
    }

    const url = getFullApiUrl(endpoint);
    console.log('🔵 [PIX_API] URL completa (via api.php):', url);

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

    console.log('📊 [PIX_API] Response Status:', response.status);
    console.log('📊 [PIX_API] Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [PIX_API] Response Error (Status ' + response.status + '):', errorText);
      
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorText;
      } catch (e) {
        errorMessage += `: ${errorText}`;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }

    const data = await response.json();
    console.log('✅ [PIX_API] Response Data:', data);

    return data;
  } catch (error) {
    console.error('❌ [PIX_API] Request Error:', error);
    console.error('❌ [PIX_API] Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido na requisição'
    };
  }
}

export const pixPaymentsApiService = {
  // Listar pagamentos PIX do usuário
  async listPixPayments(userId: number, page: number = 1, limit: number = 100): Promise<ApiResponse<{ payments: PixPayment[]; pagination: any }>> {
    console.log('📋 [PIX_API] Listando pagamentos PIX:', { userId, page, limit });
    return apiRequest<{ payments: PixPayment[]; pagination: any }>(`/mercadopago/list-payments?user_id=${userId}&page=${page}&limit=${limit}`);
  },

  // Deletar pagamento PIX
  async deletePixPayment(paymentId: number): Promise<ApiResponse<any>> {
    console.log('🗑️ [PIX_API] Deletando pagamento PIX:', paymentId);
    return apiRequest<any>(`/mercadopago/delete-payment/${paymentId}`, {
      method: 'DELETE'
    });
  }
};
