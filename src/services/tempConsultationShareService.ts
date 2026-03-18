import { apiRequest, fetchApiConfig } from '@/config/api';
import { cookieUtils } from '@/utils/cookieUtils';

interface CreateSharePayload {
  payload: Record<string, unknown>;
  cpf?: string;
}

interface CreateShareResponse {
  success: boolean;
  data?: {
    key: string;
    expires_at: string;
    expires_in_minutes: number;
  };
  error?: string;
  message?: string;
}

interface PublicShareResponse {
  success: boolean;
  data?: {
    key: string;
    cpf?: string;
    payload: {
      title?: string;
      cpf?: string;
      nome?: string;
      generated_at?: string;
      report_text?: string;
      result_data?: Record<string, unknown>;
    };
    expires_at: string;
    created_at: string;
  };
  error?: string;
  message?: string;
}

export const tempConsultationShareService = {
  async createTemporaryShare(data: CreateSharePayload) {
    await fetchApiConfig();
    const token = cookieUtils.get('auth_token') || cookieUtils.get('session_token');

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await apiRequest<CreateShareResponse>('/shared-consultas-temp', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.success || !response.data?.key) {
      throw new Error(response.error || response.message || 'Erro ao criar link temporário');
    }

    return response.data;
  },

  async getPublicShareByKey(key: string) {
    await fetchApiConfig();

    const response = await apiRequest<PublicShareResponse>(`/shared-consultas-temp/public/${encodeURIComponent(key)}`, {
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || response.message || 'Link inválido ou expirado');
    }

    return response.data;
  },
};
