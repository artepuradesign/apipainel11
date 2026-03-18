import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest as centralApiRequest, fetchApiConfig } from '@/config/api';

export type PdfRgStatus = 'realizado' | 'pagamento_confirmado' | 'em_confeccao' | 'entregue' | 'cancelado';

export interface PdfRgPedido {
  id: number;
  module_id: number;
  user_id: number | null;
  cpf: string;
  nome: string | null;
  dt_nascimento: string | null;
  naturalidade: string | null;
  filiacao_mae: string | null;
  filiacao_pai: string | null;
  diretor: string | null;
  qr_plan: string | null;
  status: PdfRgStatus;
  preco_pago: number;
  desconto_aplicado: number;
  anexo1_nome: string | null;
  anexo2_nome: string | null;
  anexo3_nome: string | null;
  pdf_entrega_nome: string | null;
  // full data (only from obter)
  assinatura_base64?: string | null;
  foto_base64?: string | null;
  anexo1_base64?: string | null;
  anexo2_base64?: string | null;
  anexo3_base64?: string | null;
  pdf_entrega_base64?: string | null;
  // timestamps per status
  realizado_at: string | null;
  pagamento_confirmado_at: string | null;
  em_confeccao_at: string | null;
  entregue_at: string | null;
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

export const pdfRgService = {
  async criar(payload: Record<string, any>) {
    return apiRequest<{ id: number }>('/pdf-rg', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async listar(params: { limit?: number; offset?: number; user_id?: number; status?: string; search?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));
    if (params.user_id !== undefined) qs.set('user_id', String(params.user_id));
    if (params.status !== undefined) qs.set('status', params.status);
    if (params.search) qs.set('search', params.search);

    const endpoint = `/pdf-rg${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiRequest<{ data: PdfRgPedido[]; pagination: { total: number; limit: number; offset: number } }>(endpoint);
  },

  async obter(id: number) {
    return apiRequest<PdfRgPedido>(`/pdf-rg/${id}`);
  },

  async atualizarStatus(id: number, status: PdfRgStatus, extraData?: { pdf_entrega_base64?: string; pdf_entrega_nome?: string; remove_pdf?: boolean }) {
    return apiRequest<{ id: number; status: PdfRgStatus }>('/pdf-rg/status', {
      method: 'POST',
      body: JSON.stringify({ id, status, ...extraData }),
    });
  },

  async deletarPdf(id: number) {
    return apiRequest<{ id: number }>('/pdf-rg/delete-pdf', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },

  async deletar(id: number) {
    return apiRequest<{ id: number }>(`/pdf-rg/${id}`, {
      method: 'DELETE',
    });
  },
};
