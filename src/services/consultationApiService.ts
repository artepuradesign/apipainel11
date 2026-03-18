import { apiRequest, getApiUrl } from '@/config/api';
import { cookieUtils } from '@/utils/cookieUtils';

export interface CPFConsultationRequest {
  document: string;
  module_type: 'cpf';
}

export interface CPFConsultationResult {
  cpf: string;
  nome: string;
  data_nascimento: string;
  situacao_cpf: string;
  situacao_receita: string;
  nome_mae?: string;
  nome_pai?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  email?: string;
  telefone?: string;
  genero?: string;
  idade?: number;
}

export interface ConsultationResponse {
  id: number;
  user_id: number;
  module_type: string;
  document: string;
  cost: number;
  result_data: CPFConsultationResult | null;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
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

export const consultationApiService = {
  // Realizar consulta de CPF via API externa  
  async consultCPF(cpf: string) {
    console.log('🔍 [CONSULTATION_API] Iniciando consulta CPF:', cpf);
    
    return apiRequest<ApiResponse<any>>('/consultas', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        cpf: cpf,
        module_type: 'cpf'
      }),
    });
  },

  // Realizar consulta de CNPJ via API externa
  async consultCNPJ(cnpj: string) {
    console.log('🔍 [CONSULTATION_API] Iniciando consulta CNPJ:', cnpj);
    
    return apiRequest<ApiResponse<any>>('/consultas', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        cnpj: cnpj,
        module_type: 'cnpj'
      }),
    });
  },

  // Realizar consulta de Veículo via API externa
  async consultVehicle(value: string, type: 'placa' | 'chassi' = 'placa') {
    console.log('🔍 [CONSULTATION_API] Iniciando consulta Veículo:', value);
    
    return apiRequest<ApiResponse<any>>('/consultas', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        placa: type === 'placa' ? value : undefined,
        chassi: type === 'chassi' ? value : undefined,
        module_type: 'veiculo'
      }),
    });
  },

  // Verificar saldo suficiente para consulta
  async checkBalance(moduleType: string): Promise<ApiResponse<{ sufficient: boolean; required_amount: number; user_balance: number; plan_balance: number }>> {
    console.log('💰 [CONSULTATION_API] Verificando saldo para:', moduleType);
    
    // Usar endpoint correto da carteira para verificar saldo atual
    const walletResponse = await apiRequest<ApiResponse<{ user_balance: { saldo: number; saldo_plano: number; total: number } }>>('/wallet/balance', {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!walletResponse.success) {
      return walletResponse as any;
    }
    
    // Definir custos por tipo de consulta
    const costs = {
      'cpf': 2.00,
      'cnpj': 3.00,
      'veiculo': 4.00,
      'telefone': 1.50,
      'score': 5.00
    };
    
    const requiredAmount = costs[moduleType as keyof typeof costs] || 2.00;
    const userBalance = walletResponse.data?.user_balance?.saldo || 0;
    const planBalance = walletResponse.data?.user_balance?.saldo_plano || 0;
    const totalBalance = userBalance + planBalance;
    
    console.log('💰 [CONSULTATION_API] Saldo verificado:', {
      userBalance,
      planBalance,
      totalBalance,
      requiredAmount,
      sufficient: totalBalance >= requiredAmount
    });
    
    return {
      success: true,
      data: {
        sufficient: totalBalance >= requiredAmount,
        required_amount: requiredAmount,
        user_balance: userBalance,
        plan_balance: planBalance
      }
    };
  },

  // Obter histórico de consultas
  async getConsultationHistory(limit: number = 20, offset: number = 0): Promise<ApiResponse<ConsultationResponse[]>> {
    console.log('📋 [CONSULTATION_API] Buscando histórico de consultas');
    
    return apiRequest<ApiResponse<ConsultationResponse[]>>(`/consultas/history?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: getHeaders()
    });
  },

  // Obter estatísticas de consultas
  async getConsultationStats(): Promise<ApiResponse<{ total: number; today: number; this_month: number; success_rate: number }>> {
    console.log('📊 [CONSULTATION_API] Buscando estatísticas de consultas');
    
    return apiRequest<ApiResponse<{ total: number; today: number; this_month: number; success_rate: number }>>('/consultas/stats', {
      method: 'GET',
      headers: getHeaders()
    });
  },

  // Obter detalhes de uma consulta específica
  async getConsultationDetails(consultationId: number): Promise<ApiResponse<ConsultationResponse>> {
    console.log('🔍 [CONSULTATION_API] Buscando detalhes da consulta:', consultationId);
    
    return apiRequest<ApiResponse<ConsultationResponse>>(`/consultas/${consultationId}`, {
      method: 'GET',
      headers: getHeaders()
    });
  },

  // Registrar uma consulta/cadastro manual (para módulos externos como QR Code)
  async recordConsultation(data: {
    document: string;
    status: 'processing' | 'completed' | 'failed' | 'cancelled';
    cost: number;
    result_data?: any;
    metadata?: any;
    saldo_usado?: 'plano' | 'carteira' | 'misto';
    module_id?: number;
  }): Promise<ApiResponse<ConsultationResponse>> {
    console.log('📝 [CONSULTATION_API] Registrando consulta manual:', data);
    
    return apiRequest<ApiResponse<ConsultationResponse>>('/consultas/record', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        module_type: 'qrcode',
        document: data.document,
        status: data.status,
        cost: data.cost,
        result_data: data.result_data,
        metadata: data.metadata,
        saldo_usado: data.saldo_usado || 'carteira',
        module_id: data.module_id || 0,
        ip_address: window.location.hostname,
        user_agent: navigator.userAgent
      })
    });
  }
};