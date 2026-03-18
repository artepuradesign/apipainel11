import { cookieUtils } from '@/utils/cookieUtils';

const API_BASE_URL = 'https://api.apipainel.com.br';

export interface CreateBaseCnpjMei {
  cpf_id: number;
  cnpj: string;
  razao_social?: string;
  natureza_juridica?: string;
  qualificacao?: string;
  capital_social?: number;
  porte_empresa?: string;
  ente_federativo?: string;
}

export interface BaseCnpjMei extends CreateBaseCnpjMei {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseCnpjMeiService {
  private getHeaders() {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');

    // Importante:
    // - Não enviar X-API-Key aqui evita preflight/CORS em alguns ambientes.
    // - Só enviar Authorization quando houver token válido evita "Bearer null".
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

      console.log(`🔄 [BASE_CNPJ_MEI_SERVICE] ${method} ${API_BASE_URL}${endpoint}`, data);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        console.warn('⚠️ [BASE_CNPJ_MEI_SERVICE] HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          url: `${API_BASE_URL}${endpoint}`
        });
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const result = await response.json();
      console.log('✅ [BASE_CNPJ_MEI_SERVICE] Response:', result);
      
      return result;
    } catch (error) {
      console.error(`❌ [BASE_CNPJ_MEI_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async create(data: CreateBaseCnpjMei): Promise<ApiResponse<BaseCnpjMei>> {
    return this.request('POST', '/base-cnpj-mei', data);
  }

  async getById(id: number): Promise<ApiResponse<BaseCnpjMei>> {
    return this.request('GET', `/base-cnpj-mei/${id}`);
  }

  async getByCpfId(cpfId: number): Promise<ApiResponse<BaseCnpjMei[]>> {
    // Padroniza com outros módulos (ex.: /cpf/{id} ou /cpf-id/{id}).
    // Alguns endpoints podem não retornar CORS corretamente quando usados via querystring.
    const candidates = [
      `/base-cnpj-mei/cpf/${cpfId}`,
      `/base-cnpj-mei/cpf-id/${cpfId}`,
      `/base-cnpj-mei?cpf_id=${cpfId}`,
    ];

    let lastError: ApiResponse<BaseCnpjMei[]> | null = null;

    for (const endpoint of candidates) {
      const res = await this.request<BaseCnpjMei[]>('GET', endpoint);
      if (res.success) return res;
      lastError = res;
    }

    return (
      lastError || {
        success: false,
        error: 'Não foi possível carregar CNPJ MEI'
      }
    );
  }

  async update(id: number, data: Partial<CreateBaseCnpjMei>): Promise<ApiResponse<BaseCnpjMei>> {
    return this.request('PUT', `/base-cnpj-mei/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-cnpj-mei/${id}`);
  }
}

export const baseCnpjMeiService = new BaseCnpjMeiService();