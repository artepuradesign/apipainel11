import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';

export interface ConsultaCnpj {
  id: number;
  user_id: number;
  cnpj: string;
  cost: number;
  status: 'completed' | 'pending' | 'failed';
  result_data?: any;
  metadata?: any;
  created_at: string;
}

export interface CreateConsultaCnpj {
  user_id: number;
  module_type: string;
  document: string;
  cost: number;
  status: string;
  result_data?: any;
  ip_address?: string;
  user_agent?: string;
  saldo_usado?: 'plano' | 'carteira' | 'misto';
  metadata?: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ConsultasCnpjService {
  private getHeaders() {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  private async request<T>(method: string, endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const url = getFullApiUrl(endpoint);
      console.log(`🌐 [CONSULTAS_CNPJ] ${method} ${url}`);
      
      const options: RequestInit = {
        method,
        headers: this.getHeaders(),
        credentials: 'include'
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro na requisição');
      }

      return result;
    } catch (error) {
      console.error(`❌ [CONSULTAS_CNPJ] Erro:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async create(data: CreateConsultaCnpj): Promise<ApiResponse<ConsultaCnpj>> {
    return this.request<ConsultaCnpj>('POST', '/consultas-cnpj/create', data);
  }

  async getByUserId(userId: number, page: number = 1, limit: number = 10): Promise<ApiResponse<ConsultaCnpj[]>> {
    const params = new URLSearchParams({
      user_id: userId.toString(),
      page: page.toString(),
      limit: limit.toString()
    });
    return this.request<ConsultaCnpj[]>('GET', `/consultas-cnpj/by-user?${params}`);
  }

  async getById(id: number): Promise<ApiResponse<ConsultaCnpj>> {
    return this.request<ConsultaCnpj>('GET', `/consultas-cnpj/${id}`);
  }

  async getAll(page: number = 1, limit: number = 50): Promise<ApiResponse<ConsultaCnpj[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return this.request<ConsultaCnpj[]>('GET', `/consultas-cnpj/all?${params}`);
  }
}

export const consultasCnpjService = new ConsultasCnpjService();
