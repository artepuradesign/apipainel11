import { apiRequest, getApiUrl, fetchApiConfig } from '@/config/api';
import { cookieUtils } from '@/utils/cookieUtils';

export interface ConsultaCpf {
  id?: number;
  user_id: number;
  module_type: string;
  document: string; // Campo compatível com backend PHP
  cost: number;
  result_data?: any;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  saldo_usado?: 'plano' | 'carteira' | 'misto';
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  user_login?: string;
  user_email?: string;
}

export interface ConsultaCpfListResponse {
  data: ConsultaCpf[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ConsultaCpfStats {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  today: number;
  this_month: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Função auxiliar para obter headers com autenticação
function getHeaders(): HeadersInit {
  const sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${sessionToken}`,
  };
}

export const consultasCpfService = {
  // Listar todas as consultas
  async getAll(page: number = 1, limit: number = 50, search: string = '') {
    console.log('📋 [CONSULTAS_CPF_API] Buscando lista de consultas');
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    return apiRequest<ApiResponse<ConsultaCpfListResponse>>(`/consultas-cpf/all?${params}`, {
      headers: getHeaders()
    });
  },

  // Buscar consulta por ID
  async getById(id: number) {
    console.log('🔍 [CONSULTAS_CPF_API] Buscando consulta por ID:', id);
    
    return apiRequest<ApiResponse<ConsultaCpf>>(`/consultas-cpf/${id}?id=${id}`, {
      headers: getHeaders()
    });
  },

  // Buscar consultas por usuário - usa endpoint correto /consultas/history
  async getByUserId(userId: number, page: number = 1, limit: number = 50) {
    console.log('🔍 [CONSULTAS_CPF_API] Buscando consultas por usuário:', userId);
    
    const offset = (page - 1) * limit;
    
    // Usar o endpoint correto que funciona
    const response = await apiRequest<ApiResponse<ConsultaCpf[]>>(`/consultas/history?limit=${limit}&offset=${offset}`, {
      headers: getHeaders()
    });
    
    // Filtrar apenas consultas relacionadas a CPF.
    // Agora `module_type` pode ser o título do módulo (ex.: "CPF SIMPLES"), então não pode ser apenas === 'cpf'.
    if (response.success && Array.isArray(response.data)) {
      const cpfConsultations = response.data.filter((c: any) => {
        const mt = (c?.module_type ?? '').toString().toLowerCase();
        return mt === 'cpf' || mt.includes('cpf');
      });
      return { ...response, data: cpfConsultations };
    }
    
    return response;
  },

  // Criar nova consulta
  async create(data: Omit<ConsultaCpf, 'id' | 'created_at' | 'updated_at' | 'user_login' | 'user_email'>) {
    console.log('➕ [CONSULTAS_CPF_API] Criando nova consulta:', data.document);
    console.log('📋 [CONSULTAS_CPF_API] Dados completos sendo enviados:', JSON.stringify(data, null, 2));
    console.log('🔗 [CONSULTAS_CPF_API] Usando pool de conexões via apiRequest');
    
    try {
      // Aguarda a configuração da API estar carregada (usa pool de conexões)
      await fetchApiConfig();
      
      const result = await apiRequest<ApiResponse<{ id: number; message: string }>>('/consultas-cpf/create', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      
      console.log('✅ [CONSULTAS_CPF_API] Resultado da criação:', result);
      return result;
    } catch (error) {
      console.error('❌ [CONSULTAS_CPF_API] Erro na criação:', error);
      console.error('❌ [CONSULTAS_CPF_API] Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        data: data
      });
      throw error;
    }
  },

  // Atualizar consulta existente
  async update(id: number, data: Partial<ConsultaCpf>) {
    console.log('✏️ [CONSULTAS_CPF_API] Atualizando consulta:', id);
    
    return apiRequest<ApiResponse<{ id: number; message: string }>>(`/consultas-cpf/${id}?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  // Deletar consulta
  async delete(id: number) {
    console.log('🗑️ [CONSULTAS_CPF_API] Deletando consulta:', id);
    
    return apiRequest<ApiResponse<{ id: number; message: string }>>(`/consultas-cpf/${id}?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  // Obter estatísticas - calcula localmente das consultas
  async getStats() {
    console.log('📊 [CONSULTAS_CPF_API] Buscando estatísticas');
    
    try {
      // Buscar todas as consultas CPF do histórico
      const response = await this.getByUserId(0, 1, 1000); // userId 0 para pegar todas ou ajustar conforme necessário
      
      if (!response.success || !Array.isArray(response.data)) {
        return {
          success: false,
          error: 'Erro ao buscar consultas para estatísticas'
        };
      }
      
      const consultas = response.data;
      const today = new Date().toDateString();
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      
      const stats: ConsultaCpfStats = {
        total: consultas.length,
        completed: consultas.filter(c => c.status === 'completed').length,
        failed: consultas.filter(c => c.status === 'failed').length,
        processing: consultas.filter(c => c.status === 'processing').length,
        today: consultas.filter(c => new Date(c.created_at || '').toDateString() === today).length,
        this_month: consultas.filter(c => {
          const date = new Date(c.created_at || '');
          return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        }).length
      };
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ [CONSULTAS_CPF_API] Erro ao calcular estatísticas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao calcular estatísticas'
      };
    }
  }
};