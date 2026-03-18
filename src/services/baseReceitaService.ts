import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';

export interface BaseReceita {
  id?: number;
  cpf_id?: number; // Relacionamento com base_cpf(id)
  cpf: string; // CPF como string (vindo do JOIN para exibição)
  situacao_cadastral?: string;
  data_inscricao?: string;
  digito_verificador?: string;
  data_emissao?: string;
  codigo_controle?: string;
  qr_link?: string; // Link do QR Code da Receita Federal
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseReceitaService {
  private getHeaders() {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getByCpf(cpf: string): Promise<ApiResponse<BaseReceita>> {
    try {
      const cleanCpf = cpf.replace(/\D/g, '');
      console.log('🔍 [BASE_RECEITA_SERVICE] Buscando CPF:', cleanCpf);
      
      const url = getFullApiUrl(`/base-receita/by-cpf?cpf=${cleanCpf}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      console.log('📡 [BASE_RECEITA_SERVICE] Response status:', response.status);
      
      const result = await response.json();
      console.log('📊 [BASE_RECEITA_SERVICE] Response data:', result);
      
      if (!response.ok) {
        console.warn('⚠️ [BASE_RECEITA_SERVICE] API Error:', {
          status: response.status,
          error: result.error,
          url
        });
        return {
          success: false,
          error: result.error || 'Erro ao buscar dados da Receita Federal'
        };
      }

      console.log('✅ [BASE_RECEITA_SERVICE] Dados encontrados:', result.data);
      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('❌ [BASE_RECEITA_SERVICE] Erro na requisição:', error);
      return {
        success: false,
        error: 'Erro de conexão ao buscar dados da Receita Federal'
      };
    }
  }

  async create(data: Omit<BaseReceita, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<{ id: number }>> {
    try {
      console.log('🔄 [BASE_RECEITA_SERVICE] Criando dados da Receita Federal:', data);
      const response = await fetch(getFullApiUrl('/base-receita'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Erro ao cadastrar dados da Receita Federal'
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Erro ao cadastrar dados da Receita Federal:', error);
      return {
        success: false,
        error: 'Erro de conexão ao cadastrar dados da Receita Federal'
      };
    }
  }

  async update(id: number, data: Partial<Omit<BaseReceita, 'id' | 'cpf_id' | 'cpf' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(getFullApiUrl(`/base-receita/${id}`), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Erro ao atualizar dados da Receita Federal'
        };
      }

      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      console.error('Erro ao atualizar dados da Receita Federal:', error);
      return {
        success: false,
        error: 'Erro de conexão ao atualizar dados da Receita Federal'
      };
    }
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(getFullApiUrl(`/base-receita/${id}`), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Erro ao excluir dados da Receita Federal'
        };
      }

      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      console.error('Erro ao excluir dados da Receita Federal:', error);
      return {
        success: false,
        error: 'Erro de conexão ao excluir dados da Receita Federal'
      };
    }
  }

  async getAll(limit = 50, offset = 0, search = ''): Promise<ApiResponse<{
    data: BaseReceita[];
    total: number;
    limit: number;
    offset: number;
  }>> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(getFullApiUrl(`/base-receita?${params}`), {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Erro ao buscar dados da Receita Federal'
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Erro ao buscar dados da Receita Federal:', error);
      return {
        success: false,
        error: 'Erro de conexão ao buscar dados da Receita Federal'
      };
    }
  }
}

export const baseReceitaService = new BaseReceitaService();