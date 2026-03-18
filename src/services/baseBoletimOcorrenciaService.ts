import { cookieUtils } from '@/utils/cookieUtils';

const API_BASE_URL = 'https://api.apipainel.com.br';

export interface BaseBoletimOcorrencia {
  id: number;
  cpf_id: number;
  numero_bo?: string;
  delegacia?: string;
  data_ocorrencia?: string;
  tipo_ocorrencia?: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBaseBoletimOcorrencia {
  cpf_id: number;
  numero_bo?: string;
  delegacia?: string;
  data_ocorrencia?: string;
  tipo_ocorrencia?: string;
  descricao?: string;
}

export interface UpdateBaseBoletimOcorrencia {
  numero_bo?: string;
  delegacia?: string;
  data_ocorrencia?: string;
  tipo_ocorrencia?: string;
  descricao?: string;
}

class BaseBoletimOcorrenciaService {
  private getHeaders() {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getByCpfId(cpfId: number): Promise<BaseBoletimOcorrencia[]> {
    const response = await fetch(`${API_BASE_URL}/base-boletim-ocorrencia/cpf/${cpfId}`, {
      headers: this.getHeaders()
    });
    const data = await response.json();
    return data.success ? (data.data || []) : [];
  }

  async create(data: CreateBaseBoletimOcorrencia): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/base-boletim-ocorrencia`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async update(id: number, data: UpdateBaseBoletimOcorrencia): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/base-boletim-ocorrencia/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async delete(id: number): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/base-boletim-ocorrencia/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }
}

export const baseBoletimOcorrenciaService = new BaseBoletimOcorrenciaService();
