import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';

export interface BaseVivo {
  id?: number;
  cpf_id: number;
  telefone?: string;
  data_primeira_recarga?: string;
  data_ultima_recarga?: string;
  plano?: string;
  numero?: string;
  uf?: string;
  tipo_pessoa?: string;
  data_instalacao?: string;
  telefone_anterior?: string;
  descricao_estado_linha?: string;
  descricao_produto?: string;
  nome_assinante?: string;
  descricao_email?: string;
  tipo_endereco?: string;
  data_vigencia_inclusao?: string;
  endereco?: string;
  numero_endereco?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  maior_atraso?: string;
  menor_atraso?: string;
  flag_divida?: string;
  ano_mes_contrato?: string;
  valor_fatura?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateBaseVivo = Omit<BaseVivo, 'id' | 'created_at' | 'updated_at'>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseVivoService {
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
        console.warn('⚠️ [BASE_VIVO_SERVICE] API Error:', {
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
      console.error(`❌ [BASE_VIVO_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async create(data: CreateBaseVivo): Promise<ApiResponse<BaseVivo>> {
    return this.request('POST', '/base-vivo', data);
  }

  async getByCpfId(cpfId: number): Promise<ApiResponse<BaseVivo[]>> {
    return this.request('GET', `/base-vivo/cpf-id/${cpfId}`);
  }

  async update(id: number, data: Partial<CreateBaseVivo>): Promise<ApiResponse<BaseVivo>> {
    return this.request('PUT', `/base-vivo/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-vivo/${id}`);
  }

  async deleteByCpfId(cpfId: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-vivo/cpf-id/${cpfId}`);
  }
}

export const baseVivoService = new BaseVivoService();
