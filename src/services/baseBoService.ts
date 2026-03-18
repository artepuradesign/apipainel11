import { cookieUtils } from '@/utils/cookieUtils';

const API_BASE_URL = 'https://api.apipainel.com.br';

export interface BaseBo {
  id: number;
  cpf_id: number;
  numero_ano?: string;
  unidade?: string;
  data_fato?: string;
  data_registro?: string;
  natureza?: string;
  bo_link?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBaseBo {
  cpf_id: number;
  numero_ano?: string;
  unidade?: string;
  data_fato?: string;
  data_registro?: string;
  natureza?: string;
  bo_link?: string;
}

class BaseBoService {
  private getHeaders() {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private getAuthHeader() {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    return { 'Authorization': `Bearer ${token}` };
  }

  async uploadPdf(file: File, numeroAno: string): Promise<{ success: boolean; data?: { bo_link: string; file_name: string }; error?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('numero_ano', numeroAno);

    const response = await fetch(`${API_BASE_URL}/upload-bo`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: formData
    });
    return response.json();
  }

  async getByCpfId(cpfId: number): Promise<{ success: boolean; data?: BaseBo[]; total?: number }> {
    const response = await fetch(`${API_BASE_URL}/base-bo/cpf/${cpfId}`, {
      headers: this.getHeaders()
    });
    const result = await response.json();
    return result.success ? { success: true, data: result.data?.data || result.data || [], total: result.data?.total || 0 } : { success: false, data: [] };
  }

  async create(data: CreateBaseBo): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/base-bo`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async update(id: number, data: Partial<CreateBaseBo>): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/base-bo/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async delete(id: number): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/base-bo/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }
}

export const baseBoService = new BaseBoService();
