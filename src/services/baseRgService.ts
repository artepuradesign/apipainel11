import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest as centralApiRequest, fetchApiConfig } from '@/config/api';

export interface BaseRg {
  id?: number;
  cpf_id: number;
  mai?: string;
  rg?: string;
  dni?: string;
  dt_expedicao?: string;
  nome?: string;
  filiacao?: string;
  naturalidade?: string;
  dt_nascimento?: string;
  registro_civil?: string;
  titulo_eleitor?: string;
  titulo_zona?: string;
  titulo_secao?: string;
  ctps?: string;
  ctps_serie?: string;
  ctps_uf?: string;
  nis?: string;
  pis?: string;
  pasep?: string;
  rg_profissional?: string;
  cert_militar?: string;
  cnh?: string;
  cns?: string;
  rg_anterior?: string;
  via_p?: string;
  via?: string;
  diretor?: 'Lúcio Flávio' | 'Fábio Viegas' | 'Fábio Sérgio';
  orgao_expedidor?: string;
  uf_emissao?: string;
  fator_rh?: string;
  qrcode?: string;
  numeracao_folha?: string;
  observacao?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateBaseRg = Omit<BaseRg, 'id' | 'created_at' | 'updated_at'>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    await fetchApiConfig();
    
    let sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    
    if (!sessionToken) {
      sessionToken = localStorage.getItem('session_token') || localStorage.getItem('api_session_token');
    }
    
    if (!sessionToken) {
      console.error('❌ [BASE_RG_API] Token de sessão não encontrado');
      return {
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.'
      };
    }

    console.log('🌐 [BASE_RG_API] Fazendo requisição para:', endpoint);

    const data = await centralApiRequest<any>(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        ...options.headers,
      },
    });

    console.log('✅ [BASE_RG_API] Response Data:', data);
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('❌ [BASE_RG_API] Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export const baseRgService = {
  // Buscar RGs por CPF ID
  async getByCpfId(cpfId: number) {
    console.log('🔍 [BASE_RG_API] Buscando RGs por CPF ID:', cpfId);
    
    return apiRequest<BaseRg[]>(`/base-rg/cpf/${cpfId}`);
  },

  // Criar novo RG
  async create(data: CreateBaseRg) {
    console.log('➕ [BASE_RG_API] Criando novo RG para CPF:', data.cpf_id);
    
    return apiRequest<{ id: number; message: string }>('/base-rg', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar RG existente
  async update(id: number, data: Partial<BaseRg>) {
    console.log('✏️ [BASE_RG_API] Atualizando RG:', id);
    
    return apiRequest<{ id: number; message: string }>(`/base-rg/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar RG
  async delete(id: number) {
    console.log('🗑️ [BASE_RG_API] Deletando RG:', id);
    
    return apiRequest<{ id: number; message: string }>(`/base-rg/${id}`, {
      method: 'DELETE',
    });
  },

  // Deletar todos os RGs de um CPF
  async deleteByCpfId(cpfId: number) {
    console.log('🗑️ [BASE_RG_API] Deletando todos os RGs do CPF:', cpfId);
    
    return apiRequest<{ message: string }>(`/base-rg/cpf/${cpfId}`, {
      method: 'DELETE',
    });
  }
};