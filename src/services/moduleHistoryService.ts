
// Service para histórico e estatísticas por módulo (page_route)
import { API_CONFIG } from '@/config/api';
import { cookieUtils } from '@/utils/cookieUtils';

interface ModuleHistoryItem {
  id: number;
  user_id: number;
  module_type: string;
  document: string;
  cost: number;
  status: string;
  result_data: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface ModuleHistoryResponse {
  success: boolean;
  message: string;
  data: {
    data: ModuleHistoryItem[];
    total: number;
    limit: number;
    offset: number;
  };
}

interface ModuleStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    completed: number;
    failed: number;
    processing: number;
    total_cost: number;
    today: number;
    this_month: number;
  };
}

const getAuthHeaders = (): HeadersInit => {
  const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const moduleHistoryService = {
  /**
   * Buscar histórico de consultas por page_route
   */
  async getHistory(pageRoute: string, limit: number = 5, offset: number = 0): Promise<ModuleHistoryResponse> {
    try {
      const url = `${API_CONFIG.BASE_URL}/module-history?page_route=${encodeURIComponent(pageRoute)}&limit=${limit}&offset=${offset}`;
      
      console.log('📡 [MODULE_HISTORY] Buscando histórico:', { pageRoute, limit, offset });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [MODULE_HISTORY] Erro HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ [MODULE_HISTORY] Histórico carregado:', result);
      
      return result;
    } catch (error) {
      console.error('❌ [MODULE_HISTORY] Erro:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        data: { data: [], total: 0, limit, offset }
      };
    }
  },
  
  /**
   * Buscar estatísticas de consultas por page_route
   */
  async getStats(pageRoute: string): Promise<ModuleStatsResponse> {
    try {
      const url = `${API_CONFIG.BASE_URL}/module-history/stats?page_route=${encodeURIComponent(pageRoute)}`;
      
      console.log('📡 [MODULE_HISTORY_STATS] Buscando estatísticas:', { pageRoute });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [MODULE_HISTORY_STATS] Erro HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ [MODULE_HISTORY_STATS] Estatísticas carregadas:', result);
      
      return result;
    } catch (error) {
      console.error('❌ [MODULE_HISTORY_STATS] Erro:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        data: { total: 0, completed: 0, failed: 0, processing: 0, total_cost: 0, today: 0, this_month: 0 }
      };
    }
  }
};
