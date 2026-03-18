// Serviço para registrar consultas por nome completo com cobrança

import { apiRequest } from '@/config/api';
import { cookieUtils } from '@/utils/cookieUtils';

export interface ConsultaNomeRequest {
  document: string;
  cost: number;
  result_data: any;
  module_type?: string;
  metadata?: {
    source?: string;
    page_route?: string;
    module_title?: string;
    discount?: number;
    original_price?: number;
    discounted_price?: number;
    final_price?: number;
    subscription_discount?: boolean;
    plan_type?: string;
    module_id?: number;
    timestamp?: string;
    link_resultado?: string;
    total_encontrados?: number;
  };
}

export interface ConsultaNomeResponse {
  consultation_id: number;
  cost: number;
  saldo_usado: 'plano' | 'carteira' | 'misto';
  new_balance: {
    saldo_plano: number;
    saldo: number;
    total: number;
  };
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

export const consultaNomeService = {
  /**
   * Registra uma consulta por nome e debita o saldo do usuário
   * Só deve ser chamado quando a consulta retornou resultados
   */
  async create(data: ConsultaNomeRequest): Promise<ApiResponse<ConsultaNomeResponse>> {
    console.log('➕ [CONSULTA_NOME_API] Registrando consulta por nome:', data.document);
    console.log('💰 [CONSULTA_NOME_API] Custo a ser cobrado:', data.cost);
    console.log('📋 [CONSULTA_NOME_API] Dados enviados:', JSON.stringify(data, null, 2));
    
    try {
      const result = await apiRequest<ApiResponse<ConsultaNomeResponse>>('/consultas-nome/create', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      
      console.log('✅ [CONSULTA_NOME_API] Resultado:', result);
      return result;
    } catch (error) {
      console.error('❌ [CONSULTA_NOME_API] Erro:', error);
      throw error;
    }
  },

  /**
   * Obtém histórico de consultas por nome do usuário
   */
  async getHistory(limit: number = 20, offset: number = 0): Promise<ApiResponse<any[]>> {
    console.log('📋 [CONSULTA_NOME_API] Buscando histórico de consultas por nome');
    
    return apiRequest<ApiResponse<any[]>>(`/consultas-nome/history?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: getHeaders()
    });
  }
};
