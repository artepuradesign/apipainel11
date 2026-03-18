import { cookieUtils } from '@/utils/cookieUtils';

const API_BASE_URL = 'https://api.apipainel.com.br';

export interface BaseVacina {
  id: number;
  cpf_id: number;
  vaina?: string;
  cor?: string;
  cns?: string;
  mae?: string;
  nome_vacina?: string;
  descricao_vacina?: string;
  lote_vacina?: string;
  grupo_atendimento?: string;
  data_aplicacao?: string;
  status?: string;
  nome_estabelecimento?: string;
  aplicador_vacina?: string;
  uf?: string;
  municipio?: string;
  bairro?: string;
  cep?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateBaseVacina = Omit<BaseVacina, 'id' | 'created_at' | 'updated_at'>;
export type UpdateBaseVacina = Partial<Omit<BaseVacina, 'id' | 'cpf_id' | 'created_at' | 'updated_at'>>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseVacinaService {
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
        console.warn('⚠️ [BASE_VACINA_SERVICE] API Error:', {
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
      console.error(`❌ [BASE_VACINA_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async create(data: CreateBaseVacina): Promise<ApiResponse<BaseVacina>> {
    return this.request('POST', '/base-vacina', data);
  }

  async getByCpfId(cpfId: number): Promise<ApiResponse<BaseVacina[]>> {
    return this.request('GET', `/base-vacina/cpf/${cpfId}`);
  }

  async update(id: number, data: UpdateBaseVacina): Promise<ApiResponse<BaseVacina>> {
    return this.request('PUT', `/base-vacina/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-vacina/${id}`);
  }

  async deleteByCpfId(cpfId: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-vacina/cpf/${cpfId}`);
  }
}

export const baseVacinaService = new BaseVacinaService();