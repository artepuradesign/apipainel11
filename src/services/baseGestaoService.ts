import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest as centralApiRequest, fetchApiConfig } from '@/config/api';

export interface BaseGestao {
  id?: number;
  cpf_id: number;
  grau_qualidade?: string;
  identificador_corporativo?: string;
  original_rfb?: string;
  nomade?: string;
  situacao?: string;
  motivo_alteracao_situacao?: string;
  vip?: string;
  motivo_alteracao_vip?: string;
  protecao_testemunha?: string;
  descricao_protecao_testemunha?: string;
  motivo_nao_higienizado?: string;
  vivo?: string;
  created_at?: string;
  updated_at?: string;
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
      console.error('❌ [BASE_GESTAO_API] Token de sessão não encontrado');
      return {
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.',
      };
    }

    const data = await centralApiRequest<any>(endpoint, {
      ...options,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        ...options.headers,
      },
    });

    // Proteção: quando o backend retorna HTML/erro mas com status 200,
    // o parser pode devolver algo inesperado (string/objeto sem "success").
    if (!data || typeof data !== 'object' || typeof (data as any).success !== 'boolean') {
      console.error('❌ [BASE_GESTAO_API] Resposta inválida (esperado ApiResponse):', data);
      return {
        success: false,
        error: 'Resposta inválida do servidor ao buscar Gestão Cadastral.',
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    console.error('❌ [BASE_GESTAO_API] Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

export const baseGestaoService = {
  async getByCpfId(cpfId: number) {
    return apiRequest<BaseGestao[]>(`/base-gestao/cpf/${cpfId}`);
  },

  async getById(id: number) {
    return apiRequest<BaseGestao>(`/base-gestao/${id}`);
  },

  async create(data: Omit<BaseGestao, 'id' | 'created_at' | 'updated_at'>) {
    return apiRequest<BaseGestao>('/base-gestao', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<BaseGestao>) {
    return apiRequest<BaseGestao>(`/base-gestao/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number) {
    return apiRequest<{ id: number }>(`/base-gestao/${id}`, {
      method: 'DELETE',
    });
  },
};
