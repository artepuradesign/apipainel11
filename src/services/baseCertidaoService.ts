import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest as centralApiRequest, fetchApiConfig } from '@/config/api';

export interface BaseCertidao {
  id?: number;
  cpf_id: number;
  tipo_certidao?: string;
  numero_certidao?: string;
  acervo?: string;
  servico_registro_civil?: string;
  ano?: string;
  tipo_livro?: string;
  livro?: string;
  folha?: string;
  termo?: string;
  digito_verificador?: string;
  data_emissao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBaseCertidao {
  cpf_id: number;
  tipo_certidao?: string;
  numero_certidao?: string;
  acervo?: string;
  servico_registro_civil?: string;
  ano?: string;
  tipo_livro?: string;
  livro?: string;
  folha?: string;
  termo?: string;
  digito_verificador?: string;
  data_emissao?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    await fetchApiConfig();

    let sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    if (!sessionToken) {
      sessionToken = localStorage.getItem('session_token') || localStorage.getItem('api_session_token');
    }

    if (!sessionToken) {
      console.error('❌ [BASE_CERTIDAO_API] Token de sessão não encontrado');
      return {
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.'
      };
    }

    const data = await centralApiRequest<any>(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        ...options.headers,
      },
    });

    return data as ApiResponse<T>;
  } catch (error) {
    console.error('❌ [BASE_CERTIDAO_API] Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export const baseCertidaoService = {
  async getByCpfId(cpfId: number) {
    return apiRequest<BaseCertidao | null>(`/base-certidao/cpf/${cpfId}`);
  },

  async create(data: CreateBaseCertidao) {
    return apiRequest<{ id: number }>('/base-certidao', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
