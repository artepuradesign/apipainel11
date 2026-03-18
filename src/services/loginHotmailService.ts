import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest as centralApiRequest, fetchApiConfig } from '@/config/api';

export interface LoginHotmailItem {
  id: number;
  module_id: number;
  email: string;
  senha: string;
  provedor: string;
  cpf: string | null;
  saldo: number;
  pontos: number;
  status: 'vendida' | 'virgem' | 'criada' | 'usada' | 'erro';
  observacao: string | null;
  ativo: number;
  comprado: boolean;
  compra_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface LoginProvedor {
  id: number;
  nome: string;
  slug: string;
}

export interface LoginHotmailCompra {
  id: number;
  module_id: number;
  user_id: number;
  login_id: number;
  preco_pago: number;
  desconto_aplicado: number;
  metodo_pagamento: string;
  email: string;
  senha: string;
  provedor: string;
  observacao: string | null;
  created_at: string;
  updated_at: string;
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
      return { success: false, error: 'Token de autorização não encontrado. Faça login novamente.' };
    }

    const data = await centralApiRequest<any>(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    return data as ApiResponse<T>;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export const loginHotmailService = {
  async listLogins(params: { limit?: number; offset?: number; search?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));
    if (params.search) qs.set('search', params.search);

    const endpoint = `/login-hotmail/logins${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiRequest<{ data: LoginHotmailItem[]; pagination: { total: number; limit: number; offset: number } }>(endpoint);
  },

  async comprar(loginId: number, walletType: 'main' | 'plan' = 'main') {
    return apiRequest<{
      compra_id: number;
      transaction_id: number;
      email: string;
      senha: string;
      preco_pago: number;
      novo_saldo: number;
      wallet_type: string;
      ja_comprado?: boolean;
    }>('/login-hotmail/comprar', {
      method: 'POST',
      body: JSON.stringify({ login_id: loginId, wallet_type: walletType }),
    });
  },

  async minhasCompras(params: { limit?: number; offset?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));

    const endpoint = `/login-hotmail/minhas-compras${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiRequest<{ data: LoginHotmailCompra[]; pagination: { total: number; limit: number; offset: number } }>(endpoint);
  },

  async criar(data: { email: string; senha: string; provedor?: string; cpf?: string; saldo?: number; pontos?: number; status?: string; observacao?: string }) {
    return apiRequest<{ id: number }>('/login-hotmail/criar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async listProvedores() {
    return apiRequest<LoginProvedor[]>('/login-hotmail/provedores');
  },

  async atualizar(data: { id: number; [key: string]: any }) {
    return apiRequest<{ id: number }>('/login-hotmail/atualizar', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async excluir(id: number) {
    return apiRequest<{ id: number }>('/login-hotmail/excluir', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  },
};
