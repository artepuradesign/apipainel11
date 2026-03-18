import { cookieUtils } from '@/utils/cookieUtils';

const API_BASE_URL = 'https://api.apipainel.com.br';

export interface BaseCredilink {
  id: number;
  cpf_id: number;
  nome?: string;
  nome_mae?: string;
  email?: string;
  data_obito?: string;
  status_receita_federal?: string;
  percentual_participacao?: string;
  cbo?: string;
  renda_presumida?: number;
  telefones?: string;
  uf?: string;
  estado?: string;
  cidade?: string;
  tipo_endereco?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  numero?: string;
  cep?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateBaseCredilink = Omit<BaseCredilink, 'id' | 'created_at' | 'updated_at'>;
export type UpdateBaseCredilink = Partial<Omit<BaseCredilink, 'id' | 'cpf_id' | 'created_at' | 'updated_at'>>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseCreditinkService {
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
        console.warn('⚠️ [BASE_CREDILINK_SERVICE] API Error:', {
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
      console.error(`❌ [BASE_CREDILINK_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async create(data: CreateBaseCredilink): Promise<ApiResponse<BaseCredilink>> {
    return this.request('POST', '/base-credilink', data);
  }

  async getByCpfId(cpfId: number): Promise<ApiResponse<BaseCredilink[]>> {
    return this.request('GET', `/base-credilink/cpf/${cpfId}`);
  }

  async update(id: number, data: UpdateBaseCredilink): Promise<ApiResponse<BaseCredilink>> {
    return this.request('PUT', `/base-credilink/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-credilink/${id}`);
  }

  async deleteByCpfId(cpfId: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-credilink/cpf/${cpfId}`);
  }
}

export const baseCreditinkService = new BaseCreditinkService();