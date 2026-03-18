import { cookieUtils } from '@/utils/cookieUtils';

const API_BASE_URL = 'https://api.apipainel.com.br';

export interface BaseParente {
  id: number;
  cpf_id: number;
  cpf_vinculo?: string;
  nome_vinculo: string;
  vinculo: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBaseParente {
  cpf_id: number;
  cpf_vinculo?: string;
  nome_vinculo: string;
  vinculo: string;
}

export interface UpdateBaseParente {
  cpf_vinculo?: string;
  nome_vinculo?: string;
  vinculo?: string;
}

export interface BaseParenteResponse {
  success: boolean;
  data?: BaseParente | BaseParente[];
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

class BaseParenteService {
  private getHeaders() {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAll(page: number = 1, limit: number = 50, search: string = ''): Promise<BaseParenteResponse> {
    const response = await fetch(`${API_BASE_URL}/base-parente?page=${page}&limit=${limit}&search=${search}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getById(id: number): Promise<BaseParenteResponse> {
    const response = await fetch(`${API_BASE_URL}/base-parente/${id}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getByCpfId(cpfId: number): Promise<BaseParenteResponse> {
    const url = `${API_BASE_URL}/base-parente/cpf/${cpfId}`;
    console.info('[Parentes][Service] Fetching:', url);
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    const json = await response.json();
    console.info('[Parentes][Service] Response:', json);
    return json;
  }

  async create(data: CreateBaseParente): Promise<BaseParenteResponse> {
    const response = await fetch(`${API_BASE_URL}/base-parente`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async update(id: number, data: UpdateBaseParente): Promise<BaseParenteResponse> {
    const response = await fetch(`${API_BASE_URL}/base-parente/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async delete(id: number): Promise<BaseParenteResponse> {
    const response = await fetch(`${API_BASE_URL}/base-parente/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }
}

export const baseParenteService = new BaseParenteService();
