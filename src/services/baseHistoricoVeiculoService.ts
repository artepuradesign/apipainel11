import { cookieUtils } from '@/utils/cookieUtils';

const API_BASE_URL = 'https://api.apipainel.com.br';

export interface BaseHistoricoVeiculo {
  id?: number;
  cpf_id: number;
  placa?: string;
  chassi?: string;
  motor?: string;
  marca?: string;
  uf_placa?: string;
  ano_fabricacao?: number;
  combustivel?: string;
  potencia?: number;
  capacidade?: number;
  nacionalidade?: string;
  caixa_cambio?: string;
  eixo_traseiro_dif?: string;
  terceiro_eixo?: string;
  capacidade_max_tracao?: number;
  peso_bruto_total?: number;
  cilindradas?: number;
  ano_modelo?: number;
  tipo_carroceria?: string;
  cor_veiculo?: string;
  quantidade_passageiro?: number;
  eixos?: number;
  doc_faturado?: string;
  nome_faturado?: string;
  uf_faturado?: string;
  doc_proprietario?: string;
  nome_proprietario?: string;
  situacao_veiculo?: string;
  restricao_1?: string;
  restricao_2?: string;
  restricao_3?: string;
  restricao_4?: string;
  endereco?: string;
  numero_casa?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateBaseHistoricoVeiculo = Omit<BaseHistoricoVeiculo, 'id' | 'created_at' | 'updated_at'>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class BaseHistoricoVeiculoService {
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

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        console.warn('⚠️ [BASE_HISTORICO_VEICULO_SERVICE] API Error:', {
          status: response.status,
          error: result.error,
          url: `${API_BASE_URL}${endpoint}`
        });
        return {
          success: false,
          error: result.error || `HTTP ${response.status}`
        };
      }

      return result;
    } catch (error) {
      console.error(`❌ [BASE_HISTORICO_VEICULO_SERVICE] Error in ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async create(data: CreateBaseHistoricoVeiculo): Promise<ApiResponse<BaseHistoricoVeiculo>> {
    return this.request('POST', '/base-historico-veiculo', data);
  }

  async getByCpfId(cpfId: number): Promise<ApiResponse<BaseHistoricoVeiculo[]>> {
    console.log('🚗 [SERVICE] Tentando buscar veículos para cpfId:', cpfId);
    
    // Tenta primeiro pela rota com pool (preferencial)
    console.log('🚗 [SERVICE] Tentativa 1: /base-historico-veiculo/cpf/' + cpfId);
    const response1 = await this.request<BaseHistoricoVeiculo[]>('GET', `/base-historico-veiculo/cpf/${cpfId}`);
    
    if (response1.success) {
      console.log('✅ [SERVICE] Sucesso na rota com pool');
      return response1;
    }
    
    // Fallback para query string
    console.log('⚠️ [SERVICE] Fallback: /base-historico-veiculo?cpf_id=' + cpfId);
    return this.request<BaseHistoricoVeiculo[]>('GET', `/base-historico-veiculo?cpf_id=${cpfId}`);
  }

  async update(id: number, data: Partial<CreateBaseHistoricoVeiculo>): Promise<ApiResponse<BaseHistoricoVeiculo>> {
    return this.request('PUT', `/base-historico-veiculo/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-historico-veiculo/${id}`);
  }

  async deleteByCpfId(cpfId: number): Promise<ApiResponse<void>> {
    return this.request('DELETE', `/base-historico-veiculo/cpf/${cpfId}`);
  }
}

export const baseHistoricoVeiculoService = new BaseHistoricoVeiculoService();
