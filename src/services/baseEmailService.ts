import { cookieUtils } from '@/utils/cookieUtils';
import { getApiUrl, fetchApiConfig } from '@/config/api';

export interface BaseEmail {
  id: number;
  cpf_id: number;
  email: string;
  prioridade?: number | null;
  score_email?: 'OTIMO' | 'BOM' | 'REGULAR' | 'RUIM' | 'PESSIMO' | null;
  email_pessoal?: 'S' | 'N' | null;
  email_duplicado?: 'S' | 'N' | null;
  blacklist?: 'S' | 'N' | null;
  estrutura?: string | null;
  status_vt?: string | null;
  dominio?: string | null;
  mapas?: number | null;
  peso?: number | null;
  data_inclusao?: string | null; // YYYY-MM-DD (pode vir '0000-00-00')
  created_at: string;
  updated_at: string;
}

export type CreateBaseEmail = Omit<BaseEmail, 'id' | 'created_at' | 'updated_at'>;
export type UpdateBaseEmail = Partial<Omit<BaseEmail, 'id' | 'cpf_id' | 'created_at' | 'updated_at'>>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseEmailService {
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

      // Usar api.php com pool de conexões
      await fetchApiConfig();
      const url = getApiUrl(endpoint);
      const response = await fetch(url, config);
      const result = await response.json();

      if (!response.ok) {
        console.warn('⚠️ [BASE_EMAIL_SERVICE] API Error:', {
          status: response.status,
          error: result.error,
          url
        });
        return {
          success: false,
          error: result.error || `HTTP ${response.status}`
        };
      }

      return result;
    } catch (error) {
      console.error(`❌ [BASE_EMAIL_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async create(data: CreateBaseEmail): Promise<ApiResponse<BaseEmail>> {
    return this.request('POST', '/base-email', data);
  }

  async getByCpfId(cpfId: number): Promise<ApiResponse<BaseEmail[]>> {
    return this.request('GET', `/base-email/cpf/${cpfId}`);
  }

  async update(id: number, data: UpdateBaseEmail): Promise<ApiResponse<BaseEmail>> {
    return this.request('PUT', `/base-email/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-email/${id}`);
  }

  async deleteByCpfId(cpfId: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-email/cpf/${cpfId}`);
  }
}

export const baseEmailService = new BaseEmailService();