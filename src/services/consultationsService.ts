import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';
import { API_BASE_URL } from '@/config/apiConfig';

export interface Consultation {
  id?: number;
  user_id: number;
  module_type: string;
  document: string;
  cost: number;
  result_data?: any;
  status: 'processing' | 'completed' | 'failed' | 'cancelled' | 'naoencontrado';
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface ConsultationListResponse {
  data: Consultation[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

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
    
    // Fallback para localStorage se os cookies não estiverem disponíveis
    if (!sessionToken) {
      sessionToken = localStorage.getItem('session_token') || localStorage.getItem('api_session_token');
    }
    
    if (!sessionToken) {
      console.error('❌ [CONSULTATIONS_API] Token de sessão não encontrado');
      return {
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.'
      };
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 [CONSULTATIONS_API] Fazendo requisição para:', url);

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

    console.log('📊 [CONSULTATIONS_API] Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [CONSULTATIONS_API] Response Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorText: errorText
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [CONSULTATIONS_API] Response Data:', data);

    return data;
  } catch (error) {
    console.error('❌ [CONSULTATIONS_API] Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export const consultationsService = {
  // Listar consultas do usuário
  async getByUserId(userId: number, page: number = 1, limit: number = 50) {
    console.log('📋 [CONSULTATIONS_API] Buscando consultas do usuário:', userId);
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    // Backend PHP expõe rotas em /consultations/*
    return apiRequest<ConsultationListResponse>(`/consultations/user/${userId}?${params}`);
  },

  // Criar nova consulta
  async create(data: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>) {
    console.log('➕ [CONSULTATIONS_API] Criando nova consulta:', data.module_type, data.document);
    
    return apiRequest<{ id: number; message: string }>('/consultations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar consulta existente
  async update(id: number, data: Partial<Consultation>) {
    console.log('✏️ [CONSULTATIONS_API] Atualizando consulta:', id);
    
    return apiRequest<{ id: number; message: string }>(`/consultations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Buscar consulta por ID
  async getById(id: number) {
    console.log('🔍 [CONSULTATIONS_API] Buscando consulta por ID:', id);
    
    return apiRequest<Consultation>(`/consultations/${id}`);
  },

  // Obter estatísticas das consultas
  async getStats() {
    console.log('📊 [CONSULTATIONS_API] Buscando estatísticas das consultas');
    
    return apiRequest<any>('/consultations/user/stats');
  }
};