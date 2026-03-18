import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';

export interface BaseOperadoraOi {
  id?: number;
  cpf_id: number;
  numero_contrato?: string | null;
  nome?: string | null;
  email?: string | null;
  plano_atual?: string | null;
  debito_automatico?: string | null;
  status?: string | null;
  tipo?: string | null;
  titular?: string | null;
  existe_falha_aberta?: boolean | number | null;
  quantidade_contratos?: number | null;
  numero_contrato_fisico?: string | null;
  pode_habilitar_confianca?: boolean | number | null;
  cpf_cnpj?: string | null;
  bairro_instalacao?: string | null;
  cidade_instalacao?: string | null;
  legado?: string | null;
  modalidade?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateBaseOperadoraOi = Omit<BaseOperadoraOi, 'id' | 'created_at' | 'updated_at'>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseOperadoraOiService {
  private getHeaders() {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token && token !== 'null' && token !== 'undefined') {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(method: string, endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const config: RequestInit = {
        method,
        headers: this.getHeaders(),
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
      }

      const url = getFullApiUrl(endpoint);
      console.log(`🔄 [BASE_OPERADORA_OI_SERVICE] ${method} ${url}`, data);

      const response = await fetch(url, config);
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ [BASE_OPERADORA_OI_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async create(data: CreateBaseOperadoraOi): Promise<ApiResponse<BaseOperadoraOi>> {
    return this.request('POST', '/base-operadora-oi', data);
  }

  async getByCpfId(cpfId: number): Promise<ApiResponse<BaseOperadoraOi[]>> {
    const candidates = [
      `/base-operadora-oi/cpf/${cpfId}`,
      `/base-operadora-oi?cpf_id=${cpfId}`,
    ];

    let lastError: ApiResponse<BaseOperadoraOi[]> | null = null;
    for (const endpoint of candidates) {
      const res = await this.request<BaseOperadoraOi[]>('GET', endpoint);
      if (res.success) return res;
      lastError = res;
    }

    return (
      lastError || {
        success: false,
        error: 'Não foi possível carregar Operadora OI',
      }
    );
  }

  async update(id: number, data: Partial<CreateBaseOperadoraOi>): Promise<ApiResponse<BaseOperadoraOi>> {
    return this.request('PUT', `/base-operadora-oi/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-operadora-oi/${id}`);
  }

  async deleteByCpfId(cpfId: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-operadora-oi/cpf/${cpfId}`);
  }
}

export const baseOperadoraOiService = new BaseOperadoraOiService();
