import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';

export interface BaseDividasAtivas {
  id?: number;
  cpf_id: string;
  /**
   * @deprecated Campo legado (não existe mais no novo schema do banco).
   * Mantido apenas para compatibilidade com telas antigas de cadastro.
   */
  tipo_devedor?: string;
  /**
   * @deprecated Campo legado (não existe mais no novo schema do banco).
   * Mantido apenas para compatibilidade com telas antigas de cadastro.
   */
  nome_devedor?: string;
  uf_devedor?: string;
  numero_inscricao?: string;
  tipo_situacao_inscricao?: string;
  situacao_inscricao?: string;
  receita_principal?: string;
  data_inscricao?: string;
  indicador_ajuizado?: string;
  valor_consolidado?: number;
  created_at?: string;
  /**
   * @deprecated Nem todo schema retorna updated_at.
   */
  updated_at?: string;
}

export type CreateBaseDividasAtivas = Omit<BaseDividasAtivas, 'id' | 'created_at' | 'updated_at'>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseDividasAtivasService {
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

      const url = getFullApiUrl(endpoint);
      console.log(`🔄 [BASE_DIVIDAS_ATIVAS_SERVICE] ${method} ${url}`, data);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        console.warn('⚠️ [BASE_DIVIDAS_ATIVAS_SERVICE] HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          url
        });
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const result = await response.json();
      console.log('✅ [BASE_DIVIDAS_ATIVAS_SERVICE] Response:', result);
      
      return result;
    } catch (error) {
      console.error(`❌ [BASE_DIVIDAS_ATIVAS_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async create(data: CreateBaseDividasAtivas): Promise<ApiResponse<BaseDividasAtivas>> {
    return this.request('POST', '/base-dividas-ativas', data);
  }

  async getByCpf(cpf: string): Promise<ApiResponse<BaseDividasAtivas[]>> {
    return this.request('GET', `/base-dividas-ativas?cpf_id=${cpf}`);
  }

  async update(id: number, data: Partial<CreateBaseDividasAtivas>): Promise<ApiResponse<BaseDividasAtivas>> {
    return this.request('PUT', `/base-dividas-ativas/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-dividas-ativas/${id}`);
  }

  async deleteByCpf(cpf: string): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-dividas-ativas/cpf/${cpf}`);
  }
}

export const baseDividasAtivasService = new BaseDividasAtivasService();