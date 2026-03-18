import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';

export interface BaseCnh {
  id?: number;
  cpf_id: number;
  n_espelho?: string;
  nome?: string;
  foto_cnh?: string;
  doc_identidade?: string;
  orgao_expedidor?: string;
  uf_emissao?: string;
  data_nascimento?: string;
  pai?: string;
  mae?: string;
  permissao?: string;
  acc?: string;
  cat_hab?: string;
  n_registro?: string;
  validade?: string;
  primeira_habilitacao?: string;
  observacoes?: string;
  assinatura?: string;
  local?: string;
  data_emissao?: string;
  diretor?: string;
  n_seg1?: string;
  n_renach?: string;
  qrcode?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateBaseCnh = Omit<BaseCnh, 'id' | 'created_at' | 'updated_at'>;

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
    let sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    
    if (!sessionToken) {
      sessionToken = localStorage.getItem('session_token') || localStorage.getItem('api_session_token');
    }
    
    if (!sessionToken) {
      console.error('❌ [BASE_CNH_API] Token de sessão não encontrado');
      return {
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.'
      };
    }

    const url = getFullApiUrl(endpoint);
    console.log('🌐 [BASE_CNH_API] Fazendo requisição para (via api.php):', url);

    const response = await window.fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    console.log('📊 [BASE_CNH_API] Response Status:', response.status);

    const contentType = response.headers.get('content-type') || '';
    let parsed: any = null;
    try {
      if (contentType.includes('application/json')) {
        parsed = await response.json();
      } else {
        const text = await response.text();
        try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
      }
    } catch (e) {
      console.warn('⚠️ [BASE_CNH_API] Falha ao parsear resposta:', e);
    }

    if (!response.ok) {
      const errorMessage = (parsed && (parsed.error || parsed.message)) || `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ [BASE_CNH_API] Response Error:', { status: response.status, body: parsed });
      return {
        success: false,
        error: errorMessage,
        message: parsed?.message,
        data: parsed?.data,
      } as ApiResponse<T>;
    }

    console.log('✅ [BASE_CNH_API] Response Data:', parsed);
    return parsed as ApiResponse<T>;
  } catch (error) {
    console.error('❌ [BASE_CNH_API] Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export const baseCnhService = {
  // Buscar CNHs por CPF ID
  async getByCpfId(cpfId: number) {
    console.log('🔍 [BASE_CNH_API] Buscando CNHs por CPF ID:', cpfId);
    
    return apiRequest<BaseCnh[]>(`/base-cnh/cpf/${cpfId}`);
  },

  // Criar nova CNH
  async create(data: CreateBaseCnh) {
    console.log('➕ [BASE_CNH_API] Criando nova CNH para CPF:', data.cpf_id);
    
    return apiRequest<{ id: number; message: string }>('/base-cnh', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar CNH existente
  async update(id: number, data: Partial<BaseCnh>) {
    console.log('✏️ [BASE_CNH_API] Atualizando CNH:', id);
    
    return apiRequest<{ id: number; message: string }>(`/base-cnh/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar CNH
  async delete(id: number) {
    console.log('🗑️ [BASE_CNH_API] Deletando CNH:', id);
    
    return apiRequest<{ id: number; message: string }>(`/base-cnh/${id}`, {
      method: 'DELETE',
    });
  },

  // Deletar todas as CNHs de um CPF
  async deleteByCpfId(cpfId: number) {
    console.log('🗑️ [BASE_CNH_API] Deletando todas as CNHs do CPF:', cpfId);
    
    return apiRequest<{ message: string }>(`/base-cnh/cpf/${cpfId}`, {
      method: 'DELETE',
    });
  }
};