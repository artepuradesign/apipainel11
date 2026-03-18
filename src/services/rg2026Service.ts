import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest as centralApiRequest, fetchApiConfig } from '@/config/api';

export interface Rg2026Registro {
  id: number;
  module_id: number;
  user_id: number | null;

  nome: string;
  nome_social?: string | null;
  cpf: string;
  sexo?: string | null;
  dt_nascimento: string;
  nacionalidade?: string | null;
  naturalidade?: string | null;
  validade?: string | null;

  numero_folha?: string | null;
  numero_qrcode?: string | null;

  filiacao_mae: string;
  filiacao_pai?: string | null;

  orgao_expedidor?: string | null;
  local_emissao?: string | null;
  dt_emissao?: string | null;

  diretor?: string | null;

  foto_base64?: string | null;
  assinatura_base64?: string | null;

  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    await fetchApiConfig();

    let sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    if (!sessionToken) {
      sessionToken = localStorage.getItem('session_token') || localStorage.getItem('api_session_token');
    }

    if (!sessionToken) {
      return { success: false, error: 'Token de autorização não encontrado. Faça login novamente.' };
    }

    const data = await centralApiRequest<any>(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    return data as ApiResponse<T>;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export const rg2026Service = {
  async create(payload: Record<string, any>) {
    return apiRequest<{ id: number }>('/rg-2026', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async list(params: { limit?: number; offset?: number; user_id?: number; search?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));
    if (params.user_id !== undefined) qs.set('user_id', String(params.user_id));
    if (params.search) qs.set('search', params.search);

    const endpoint = `/rg-2026${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiRequest<{ data: Rg2026Registro[]; pagination: { total: number; limit: number; offset: number } }>(endpoint);
  },

  async delete(id: number) {
    return apiRequest<{ id: number }>(`/rg-2026/${id}`, {
      method: 'DELETE',
    });
  },
};
