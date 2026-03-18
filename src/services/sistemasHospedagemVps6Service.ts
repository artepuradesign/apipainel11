import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest as centralApiRequest, fetchApiConfig } from '@/config/api';

export interface SistemaHospedagemVps6Registro {
  id: number;
  module_id: number;
  user_id: number;
  nome_solicitante: string;
  nome_instancia: string;
  ip_vps: string;
  configuracao_linux: string;
  duracao_meses: number;
  plan_start_at: string | null;
  plan_end_at: string | null;
  status: 'registrado' | 'em_configuracao' | 'finalizado' | 'vencido' | 'cancelado';
  valor_cobrado: number;
  desconto_aplicado: number;
  saldo_usado: 'plano' | 'carteira' | 'misto';
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
        Authorization: `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    return data as ApiResponse<T>;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export const sistemasHospedagemVps6Service = {
  async register(payload: { nome_solicitante: string; nome_instancia: string; module_id?: number }) {
    return apiRequest<{
      id: number;
      nome_solicitante: string;
      nome_instancia: string;
      ip_vps: string;
      configuracao_linux: string;
      duracao_meses: number;
      valor_cobrado: number;
      desconto_aplicado: number;
      saldo_usado: 'plano' | 'carteira' | 'misto';
      saldo_restante: { saldo: number; saldo_plano: number; total: number };
    }>('/sistemas-hospedagem-vps-6/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async listMine(params: { limit?: number; offset?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));

    const endpoint = `/sistemas-hospedagem-vps-6/minhas${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiRequest<{ data: SistemaHospedagemVps6Registro[]; pagination: { total: number; limit: number; offset: number } }>(endpoint);
  },

  async listAdmin(params: { limit?: number; offset?: number; status?: 'registrado' | 'em_configuracao' | 'finalizado' | 'vencido' | 'cancelado'; search?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));
    if (params.status) qs.set('status', params.status);
    if (params.search) qs.set('search', params.search);

    const endpoint = `/sistemas-hospedagem-vps-6/admin${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiRequest<{ data: SistemaHospedagemVps6Registro[]; pagination: { total: number; limit: number; offset: number } }>(endpoint);
  },

  async cancelByAdmin(id: number) {
    return apiRequest<{ id: number; status: 'cancelado' }>(`/sistemas-hospedagem-vps-6/${id}/cancel`, {
      method: 'POST',
    });
  },

  async deleteByAdmin(id: number) {
    return apiRequest<{ id: number; refunded_amount?: number }>(`/sistemas-hospedagem-vps-6/${id}`, {
      method: 'DELETE',
    });
  },

  async updateStatusByAdmin(id: number, payload: { status: 'registrado' | 'em_configuracao' | 'finalizado'; ip_vps?: string }) {
    return apiRequest<SistemaHospedagemVps6Registro>(`/sistemas-hospedagem-vps-6/${id}/admin-status`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getById(id: number) {
    return apiRequest<SistemaHospedagemVps6Registro>(`/sistemas-hospedagem-vps-6/${id}`);
  },
};
