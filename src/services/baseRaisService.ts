import { API_BASE_URL } from '@/config/apiConfig';

export interface BaseRais {
  id: number;
  cpf_id: number;
  cpf?: string;
  nome?: string;
  cnpj?: string;
  razao_social?: string;
  situacao?: string;
  data_entrega?: string;
  data_admissao?: string;
  data_desligamento?: string;
  data_cadastro?: string;
  faixa_renda?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBaseRaisDto {
  cpf_id: number;
  cpf?: string;
  nome?: string;
  cnpj?: string;
  razao_social?: string;
  situacao?: string;
  data_entrega?: string;
  data_admissao?: string;
  data_desligamento?: string;
  data_cadastro?: string;
  faixa_renda?: string;
}

export interface UpdateBaseRaisDto {
  cpf?: string;
  nome?: string;
  cnpj?: string;
  razao_social?: string;
  situacao?: string;
  data_entrega?: string;
  data_admissao?: string;
  data_desligamento?: string;
  data_cadastro?: string;
  faixa_renda?: string;
}

class BaseRaisService {
  private baseUrl = `${API_BASE_URL}/base-rais`;

  async getAll(): Promise<BaseRais[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Erro ao buscar registros RAIS');
    }
    const data = await response.json();
    return data.data || [];
  }

  async getByCpfId(cpfId: number): Promise<BaseRais[]> {
    console.log('🔍 [RAIS SERVICE] Buscando RAIS para CPF ID:', cpfId);
    const response = await fetch(`${this.baseUrl}/cpf-id/${cpfId}`);
    
    if (!response.ok) {
      console.error('❌ [RAIS SERVICE] Erro na resposta:', response.status);
      throw new Error('Erro ao buscar registros RAIS por CPF');
    }
    
    const data = await response.json();
    console.log('✅ [RAIS SERVICE] RAIS encontrados:', data.data?.length || 0);
    return data.data || [];
  }

  async getById(id: number): Promise<BaseRais> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar registro RAIS');
    }
    const data = await response.json();
    return data.data;
  }

  async create(dto: CreateBaseRaisDto): Promise<{ id: number }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar registro RAIS');
    }

    const data = await response.json();
    return data.data;
  }

  async update(id: number, dto: UpdateBaseRaisDto): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar registro RAIS');
    }
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar registro RAIS');
    }
  }
}

export const baseRaisService = new BaseRaisService();
