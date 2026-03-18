import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';

export interface BaseCnpj {
  id: number;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  natureza_juridica?: string;
  capital_social?: number;
  data_inicio?: string;
  porte?: string;
  tipo?: string;
  telefone_1?: string;
  telefone_2?: string;
  email?: string;
  situacao?: string;
  situacao_data?: string;
  situacao_motivo?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  uf?: string;
  municipio?: string;
  mei?: string;
  socios?: Array<{
    nome: string;
    cpf_cnpj: string;
    data_entrada: string;
    qualificacao: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBaseCnpj {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  natureza_juridica?: string;
  capital_social?: number;
  data_inicio?: string;
  porte?: string;
  tipo?: string;
  telefone_1?: string;
  telefone_2?: string;
  email?: string;
  situacao?: string;
  situacao_data?: string;
  situacao_motivo?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  uf?: string;
  municipio?: string;
  mei?: string;
  socios?: Array<{
    nome: string;
    cpf_cnpj: string;
    data_entrada: string;
    qualificacao: string;
  }>;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseCnpjService {
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
      console.log(`🌐 [CNPJ_SERVICE] ${method} ${url}`);
      
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
      console.error(`❌ [CNPJ_SERVICE] Erro:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async getByCnpj(cnpj: string): Promise<ApiResponse<BaseCnpj>> {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    return this.request<BaseCnpj>('GET', `/base-cnpj/by-cnpj/${cnpjLimpo}`);
  }

  async getById(id: number): Promise<ApiResponse<BaseCnpj>> {
    return this.request<BaseCnpj>('GET', `/base-cnpj/${id}`);
  }

  async getAll(page: number = 1, limit: number = 50, search: string = ''): Promise<ApiResponse<BaseCnpj[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search
    });
    return this.request<BaseCnpj[]>('GET', `/base-cnpj/all?${params}`);
  }

  async create(data: CreateBaseCnpj): Promise<ApiResponse<BaseCnpj>> {
    return this.request<BaseCnpj>('POST', '/base-cnpj/create', data);
  }

  async update(id: number, data: Partial<CreateBaseCnpj>): Promise<ApiResponse<BaseCnpj>> {
    return this.request<BaseCnpj>('PUT', `/base-cnpj/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse> {
    return this.request('DELETE', `/base-cnpj/${id}`);
  }
}

export const baseCnpjService = new BaseCnpjService();
