import { cookieUtils } from '@/utils/cookieUtils';

const API_BASE_URL = 'https://api.apipainel.com.br';

export interface BaseSenhaCpf {
  id: number;
  cpf_id: number;
  cpf?: string;
  senha?: string;
  observacao?: string;
  created_at: string;
  updated_at: string;
}

export type CreateBaseSenhaCpf = Omit<BaseSenhaCpf, 'id' | 'created_at' | 'updated_at'>;
export type UpdateBaseSenhaCpf = Partial<Omit<BaseSenhaCpf, 'id' | 'cpf_id' | 'created_at' | 'updated_at'>>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseSenhaCpfService {
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
        console.warn('⚠️ [BASE_SENHA_CPF_SERVICE] API Error:', {
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
      console.error(`❌ [BASE_SENHA_CPF_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async create(data: CreateBaseSenhaCpf): Promise<ApiResponse<BaseSenhaCpf>> {
    return this.request('POST', '/base-senha-cpf', data);
  }

  async getByCpfId(cpfId: number): Promise<ApiResponse<BaseSenhaCpf[]>> {
    return this.request('GET', `/base-senha-cpf/cpf-id/${cpfId}`);
  }

  async getByCpf(cpf: string): Promise<ApiResponse<BaseSenhaCpf[]>> {
    return this.request('GET', `/base-senha-cpf/cpf/${cpf}`);
  }

  async update(id: number, data: UpdateBaseSenhaCpf): Promise<ApiResponse<BaseSenhaCpf>> {
    return this.request('PUT', `/base-senha-cpf/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-senha-cpf/${id}`);
  }

  async deleteByCpfId(cpfId: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-senha-cpf/cpf-id/${cpfId}`);
  }
}

export const baseSenhaCpfService = new BaseSenhaCpfService();
