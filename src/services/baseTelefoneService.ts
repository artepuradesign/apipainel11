import { cookieUtils } from '@/utils/cookieUtils';

const API_BASE_URL = 'https://api.apipainel.com.br';

export interface BaseTelefone {
  id: number;
  cpf_id: number;
  ddd: string;
  telefone: string;
  telefone_completo?: string;
  tipo_codigo: string;
  tipo_texto: 'Residencial' | 'Comercial' | 'Celular' | 'WhatsApp' | 'Outro';
  data_inclusao?: string | null;
  data_informacao?: string | null;
  sigilo: number;
  nsu?: string | null;
  classificacao?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateBaseTelefone = Omit<BaseTelefone, 'id' | 'created_at' | 'updated_at'>;
export type UpdateBaseTelefone = Partial<Omit<BaseTelefone, 'id' | 'cpf_id' | 'created_at' | 'updated_at'>>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseTelefoneService {
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
        console.warn('⚠️ [BASE_TELEFONE_SERVICE] API Error:', {
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
      console.error(`❌ [BASE_TELEFONE_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async create(data: CreateBaseTelefone): Promise<ApiResponse<BaseTelefone>> {
    return this.request('POST', '/base-telefone', data);
  }

  async getByCpfId(cpfId: number): Promise<ApiResponse<BaseTelefone[]>> {
    return this.request('GET', `/base-telefone/cpf/${cpfId}`);
  }

  async update(id: number, data: UpdateBaseTelefone): Promise<ApiResponse<BaseTelefone>> {
    return this.request('PUT', `/base-telefone/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-telefone/${id}`);
  }

  async deleteByCpfId(cpfId: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-telefone/cpf/${cpfId}`);
  }
}

export const baseTelefoneService = new BaseTelefoneService();