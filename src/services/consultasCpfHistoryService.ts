import { apiRequest, getApiUrl, fetchApiConfig } from '@/config/api';
import { cookieUtils } from '@/utils/cookieUtils';

export interface ConsultaCpfHistoryItem {
  id: number;
  source_table: 'consultas_cpf' | 'consultations';
  document: string;
  cost: number;
  status: string;
  created_at: string;
  updated_at: string;
  result_data?: any;
  desconto_aplicado?: number;
  saldo_usado?: 'plano' | 'carteira' | 'misto';
  metadata?: {
    original_price?: number;
    discount?: number;
    discounted_price?: number;
    final_price?: number;
    [key: string]: any;
  };
}

export interface ConsultaCpfHistoryResponse {
  data: ConsultaCpfHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ConsultaCpfHistoryStats {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  today: number;
  this_month: number;
  total_cost: number;
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

export const consultasCpfHistoryService = {
  // Buscar histórico de consultas CPF (ambas tabelas) - usa endpoint correto
  async getHistory(page: number = 1, limit: number = 50): Promise<ApiResponse<ConsultaCpfHistoryResponse>> {
    console.log('📋 [CPF_HISTORY_API] Buscando histórico de consultas CPF');
    console.log('🔗 [CPF_HISTORY_API] Usando pool de conexões via apiRequest');
    
    // Aguarda a configuração da API estar carregada (usa pool de conexões)
    await fetchApiConfig();
    
    const offset = (page - 1) * limit;
    
    // Usar o endpoint correto /consultas/history
    const response = await apiRequest<ApiResponse<any[]>>(`/consultas/history?limit=${limit}&offset=${offset}`, {
      headers: getHeaders()
    });
    
    // Transformar resposta no formato esperado
    if (response.success && Array.isArray(response.data)) {
      const cpfConsultations = response.data.filter((c: any) => c.module_type === 'cpf');
      const total = cpfConsultations.length;
      
      return {
        success: true,
        data: {
          data: cpfConsultations.map((item: any) => ({
            id: item.id,
            source_table: 'consultations' as const,
            document: item.document,
            cost: item.cost,
            status: item.status,
            created_at: item.created_at,
            updated_at: item.updated_at,
            result_data: item.result_data,
            desconto_aplicado: item.metadata?.discount || 0,
            saldo_usado: item.metadata?.saldo_usado || 'carteira',
            metadata: item.metadata
          })),
          pagination: {
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit),
            has_next: (page * limit) < total,
            has_prev: page > 1
          }
        }
      };
    }
    
    return {
      success: false,
      error: response.message || 'Erro ao buscar histórico',
      data: {
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          total_pages: 0,
          has_next: false,
          has_prev: false
        }
      }
    };
  },

  // Buscar estatísticas do histórico - calcula localmente
  async getStats(): Promise<ApiResponse<ConsultaCpfHistoryStats>> {
    console.log('📊 [CPF_HISTORY_API] Buscando estatísticas do histórico');
    console.log('🔗 [CPF_HISTORY_API] Usando pool de conexões via apiRequest');
    
    // Aguarda a configuração da API estar carregada (usa pool de conexões)
    await fetchApiConfig();
    
    try {
      // Buscar todas as consultas para calcular estatísticas
      const response = await apiRequest<ApiResponse<any[]>>('/consultas/history?limit=1000&offset=0', {
        headers: getHeaders()
      });
      
      if (!response.success || !Array.isArray(response.data)) {
        return {
          success: false,
          error: 'Erro ao buscar consultas para estatísticas'
        };
      }
      
      const consultas = response.data.filter((c: any) => c.module_type === 'cpf');
      const today = new Date().toDateString();
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      
      const stats: ConsultaCpfHistoryStats = {
        total: consultas.length,
        completed: consultas.filter((c: any) => c.status === 'completed').length,
        failed: consultas.filter((c: any) => c.status === 'failed').length,
        processing: consultas.filter((c: any) => c.status === 'processing').length,
        today: consultas.filter((c: any) => new Date(c.created_at || '').toDateString() === today).length,
        this_month: consultas.filter((c: any) => {
          const date = new Date(c.created_at || '');
          return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        }).length,
        total_cost: consultas.reduce((sum: number, c: any) => sum + (parseFloat(c.cost) || 0), 0)
      };
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ [CPF_HISTORY_API] Erro ao calcular estatísticas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao calcular estatísticas'
      };
    }
  }
};