import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest as centralApiRequest, fetchApiConfig } from '@/config/api';

export interface EditavelRgArquivo {
  id: number;
  module_id: number;
  titulo: string;
  descricao: string | null;
  categoria: string | null;
  tipo: string;
  versao: string | null;
  formato: string | null;
  tamanho_arquivo: string | null;
  arquivo_url: string;
  preview_url: string | null;
  preco: number;
  ativo: number;
  downloads_total: number;
  comprado: boolean;
  compra_id: number | null;
  downloads_count: number;
  created_at: string;
  updated_at: string;
}

export interface EditavelRgCompra {
  id: number;
  module_id: number;
  user_id: number;
  arquivo_id: number;
  preco_pago: number;
  desconto_aplicado: number;
  metodo_pagamento: string;
  downloads_count: number;
  ultimo_download_at: string | null;
  titulo: string;
  descricao: string | null;
  formato: string | null;
  tamanho_arquivo: string | null;
  arquivo_url: string;
  preview_url: string | null;
  categoria: string | null;
  tipo: string;
  versao: string | null;
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

export const editaveisRgService = {
  async listArquivos(params: { limit?: number; offset?: number; search?: string; categoria?: string; tipo?: string; versao?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));
    if (params.search) qs.set('search', params.search);
    if (params.categoria) qs.set('categoria', params.categoria);
    if (params.tipo) qs.set('tipo', params.tipo);
    if (params.versao) qs.set('versao', params.versao);

    const endpoint = `/editaveis-rg/arquivos${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiRequest<{ data: EditavelRgArquivo[]; pagination: { total: number; limit: number; offset: number } }>(endpoint);
  },

  async comprar(arquivoId: number, walletType: 'main' | 'plan' = 'main') {
    return apiRequest<{
      compra_id: number;
      transaction_id: number;
      arquivo_url: string;
      titulo: string;
      preco_pago: number;
      novo_saldo: number;
      wallet_type: string;
      ja_comprado?: boolean;
    }>('/editaveis-rg/comprar', {
      method: 'POST',
      body: JSON.stringify({ arquivo_id: arquivoId, wallet_type: walletType }),
    });
  },

  async download(arquivoId: number) {
    return apiRequest<{
      arquivo_url: string;
      titulo: string;
      formato: string;
    }>('/editaveis-rg/download', {
      method: 'POST',
      body: JSON.stringify({ arquivo_id: arquivoId }),
    });
  },

  async minhasCompras(params: { limit?: number; offset?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));

    const endpoint = `/editaveis-rg/minhas-compras${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiRequest<{ data: EditavelRgCompra[]; pagination: { total: number; limit: number; offset: number } }>(endpoint);
  },

  async criar(data: {
    titulo: string;
    descricao?: string;
    categoria?: string;
    tipo?: string;
    versao?: string;
    formato?: string;
    tamanho_arquivo?: string;
    arquivo_url: string;
    preview_url?: string;
    preco?: number;
  }) {
    return apiRequest<{ id: number }>('/editaveis-rg/criar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async atualizar(data: { id: number; [key: string]: any }) {
    return apiRequest<{ id: number }>('/editaveis-rg/atualizar', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async excluir(id: number) {
    return apiRequest<{ id: number }>('/editaveis-rg/excluir', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  },
};
