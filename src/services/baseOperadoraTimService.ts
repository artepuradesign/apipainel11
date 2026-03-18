import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';

export interface BaseOperadoraTim {
  id?: number;
  cpf_id: number;
  tipo_logradouro?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
  ddd?: string | null;
  telefone?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateBaseOperadoraTim = Omit<BaseOperadoraTim, 'id' | 'created_at' | 'updated_at'>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseOperadoraTimService {
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
      console.log(`\ud83d\udd04 [BASE_OPERADORA_TIM_SERVICE] ${method} ${url}`, data);

      const response = await fetch(url, config);
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return await response.json();
    } catch (error) {
      console.error(`\u274c [BASE_OPERADORA_TIM_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async create(data: CreateBaseOperadoraTim): Promise<ApiResponse<BaseOperadoraTim>> {
    return this.request('POST', '/base-operadora-tim', data);
  }

  async getByCpfId(cpfId: number): Promise<ApiResponse<BaseOperadoraTim[]>> {
    const candidates = [`/base-operadora-tim/cpf/${cpfId}`, `/base-operadora-tim?cpf_id=${cpfId}`];

    let lastError: ApiResponse<BaseOperadoraTim[]> | null = null;
    for (const endpoint of candidates) {
      const res = await this.request<BaseOperadoraTim[]>('GET', endpoint);
      if (res.success) return res;
      lastError = res;
    }

    return (
      lastError || {
        success: false,
        error: 'N\u00e3o foi poss\u00edvel carregar Operadora TIM',
      }
    );
  }

  async update(id: number, data: Partial<CreateBaseOperadoraTim>): Promise<ApiResponse<BaseOperadoraTim>> {
    return this.request('PUT', `/base-operadora-tim/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-operadora-tim/${id}`);
  }

  async deleteByCpfId(cpfId: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-operadora-tim/cpf/${cpfId}`);
  }
}

export const baseOperadoraTimService = new BaseOperadoraTimService();
