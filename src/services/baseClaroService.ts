import { cookieUtils } from '@/utils/cookieUtils';

const API_BASE_URL = 'https://api.apipainel.com.br';

export interface BaseClaro {
  id?: number;
  cpf_id: number;
  cpf?: string;
  nome?: string;
  pessoa?: string;
  ddd?: string;
  fone?: string;
  inst?: string;
}

export type CreateBaseClaro = Omit<BaseClaro, 'id'>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseClaroService {
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

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        console.warn('⚠️ [BASE_CLARO_SERVICE] API Error:', {
          status: response.status,
          error: result.error,
          url: `${API_BASE_URL}${endpoint}`
        });
        return {
          success: false,
          error: result.error || `HTTP ${response.status}`
        };
      }

      return result;
    } catch (error) {
      console.error(`❌ [BASE_CLARO_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async create(data: CreateBaseClaro): Promise<ApiResponse<BaseClaro>> {
    return this.request('POST', '/base-claro', data);
  }

  async getByCpfId(cpfId: number): Promise<ApiResponse<BaseClaro[]>> {
    return this.request('GET', `/base-claro/cpf-id/${cpfId}`);
  }

  async update(id: number, data: Partial<CreateBaseClaro>): Promise<ApiResponse<BaseClaro>> {
    return this.request('PUT', `/base-claro/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-claro/${id}`);
  }

  async deleteByCpfId(cpfId: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-claro/cpf-id/${cpfId}`);
  }
}

export const baseClaroService = new BaseClaroService();
