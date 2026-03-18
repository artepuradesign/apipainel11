import { cookieUtils } from '@/utils/cookieUtils';

const API_BASE_URL = 'https://api.apipainel.com.br';

export interface BaseEmpresaSocio {
  id: number;
  cpf_id: number;
  // Campos atuais (tabela base_empresa_socio)
  cnpj?: string;
  identificador_socio?: string;
  qualificacao_socio?: string;
  data_entrada_sociedade?: string;
  representante_legal?: string;
  nome_representante?: string;
  qualificacao_representante_legal?: string;
  faixa_etaria?: string;

  // Campos legados (mantidos por compatibilidade caso o backend ainda retorne)
  socio_nome?: string;
  socio_cpf?: string;
  socio_data_entrada?: string;
  socio_qualificacao?: string;
  empresa_cnpj?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBaseEmpresaSocio {
  cpf_id: number;

  // Campos atuais
  cnpj?: string;
  identificador_socio?: string;
  qualificacao_socio?: string;
  data_entrada_sociedade?: string;
  representante_legal?: string;
  nome_representante?: string;
  qualificacao_representante_legal?: string;
  faixa_etaria?: string;

  // Legado
  socio_nome?: string;
  socio_cpf?: string;
  socio_data_entrada?: string;
  socio_qualificacao?: string;
  empresa_cnpj?: string;
}

export interface UpdateBaseEmpresaSocio {
  // Campos atuais
  cnpj?: string;
  identificador_socio?: string;
  qualificacao_socio?: string;
  data_entrada_sociedade?: string;
  representante_legal?: string;
  nome_representante?: string;
  qualificacao_representante_legal?: string;
  faixa_etaria?: string;

  // Legado
  socio_nome?: string;
  socio_cpf?: string;
  socio_data_entrada?: string;
  socio_qualificacao?: string;
  empresa_cnpj?: string;
}

export interface BaseEmpresaSocioResponse {
  success: boolean;
  data?: BaseEmpresaSocio | BaseEmpresaSocio[] | any;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

class BaseEmpresaSocioService {
  private getHeaders() {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAll(page: number = 1, limit: number = 50, search: string = ''): Promise<BaseEmpresaSocioResponse> {
    const response = await fetch(`${API_BASE_URL}/base-empresa-socio?page=${page}&limit=${limit}&search=${search}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getById(id: number): Promise<BaseEmpresaSocioResponse> {
    const response = await fetch(`${API_BASE_URL}/base-empresa-socio/${id}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getByCpfId(cpfId: number): Promise<BaseEmpresaSocioResponse> {
    const url = `${API_BASE_URL}/base-empresa-socio/cpf/${cpfId}`;
    console.info('[EmpresaSocio][Service] Fetching:', url);
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    const json = await response.json();
    console.info('[EmpresaSocio][Service] Response:', json);
    return json;
  }

  async create(data: CreateBaseEmpresaSocio): Promise<BaseEmpresaSocioResponse> {
    const response = await fetch(`${API_BASE_URL}/base-empresa-socio`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async update(id: number, data: UpdateBaseEmpresaSocio): Promise<BaseEmpresaSocioResponse> {
    const response = await fetch(`${API_BASE_URL}/base-empresa-socio/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async delete(id: number): Promise<BaseEmpresaSocioResponse> {
    const response = await fetch(`${API_BASE_URL}/base-empresa-socio/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }
}

export const baseEmpresaSocioService = new BaseEmpresaSocioService();
