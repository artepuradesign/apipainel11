import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';

export interface BaseTim {
  id?: number;
  cpf_id: number;
  nome?: string;
  tipoLogradouro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  ddd?: string;
  tel?: string;
  operadora?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateBaseTim = Omit<BaseTim, 'id' | 'created_at' | 'updated_at'>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseTimService {
  private getHeaders() {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
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

      const response = await fetch(getFullApiUrl(endpoint), config);
      const result = await response.json();

      if (!response.ok) {
        console.warn('⚠️ [BASE_TIM_SERVICE] API Error:', {
          status: response.status,
          error: result.error,
          url: getFullApiUrl(endpoint)
        });
        return {
          success: false,
          error: result.error || `HTTP ${response.status}`
        };
      }

      return result;
    } catch (error) {
      console.error(`❌ [BASE_TIM_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async create(data: CreateBaseTim): Promise<ApiResponse<BaseTim>> {
    return this.request('POST', '/base-tim', data);
  }

  async getByCpfId(cpfId: number): Promise<ApiResponse<BaseTim[]>> {
    return this.request('GET', `/base-tim/cpf-id/${cpfId}`);
  }

  async update(id: number, data: Partial<CreateBaseTim>): Promise<ApiResponse<BaseTim>> {
    return this.request('PUT', `/base-tim/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-tim/${id}`);
  }

  async deleteByCpfId(cpfId: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-tim/cpf-id/${cpfId}`);
  }
}

export const baseTimService = new BaseTimService();
