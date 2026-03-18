import { getApiUrl } from '@/config/api';
import { cookieUtils } from '@/utils/cookieUtils';

export interface PageVisitSummary {
  page_path: string;
  total_visits: number;
  unique_users: number;
  visitor_count: number;
  user_count: number;
  last_visit: string;
  first_visit: string;
}

export interface PageVisitDetail {
  id: number;
  page_path: string;
  page_title: string | null;
  user_id: number | null;
  visitor_type: 'usuario' | 'visitante';
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
  full_name?: string;
  login?: string;
  email?: string;
}

export interface PageVisitStats {
  total_all_visits: number;
  total_pages: number;
  total_unique_users: number;
  total_visitors: number;
  total_user_visits: number;
}

export interface DailyStats {
  date: string;
  total_visits: number;
  user_visits: number;
  visitor_visits: number;
  unique_users: number;
}

export interface TopUser {
  user_id: number;
  full_name: string;
  login: string;
  email: string;
  total_visits: number;
  pages_visited: number;
  last_visit: string;
}

const getHeaders = () => {
  const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const pageVisitService = {
  // Registrar visita (chamado automaticamente nas páginas)
  async register(pagePath: string, pageTitle?: string, userId?: number) {
    try {
      const url = getApiUrl('/contadores/register');
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_path: pagePath,
          page_title: pageTitle,
          user_id: userId || null,
          referrer: document.referrer || null
        })
      });
    } catch (error) {
      console.warn('Falha ao registrar visita:', error);
    }
  },

  // Admin: buscar resumo
  async getSummary(page = 1, limit = 50, search = '', dateFrom = '', dateTo = '') {
    const params = new URLSearchParams({ 
      page: String(page), 
      limit: String(limit) 
    });
    if (search) params.set('search', search);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);

    const url = getApiUrl(`/contadores/summary?${params}`);
    const response = await fetch(url, { headers: getHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao buscar resumo');
    return result.data as { summary: PageVisitSummary[]; stats: PageVisitStats; pagination: any };
  },

  // Admin: detalhes de uma página
  async getPageDetails(pagePath: string, page = 1, limit = 50) {
    const encoded = encodeURIComponent(pagePath);
    const url = getApiUrl(`/contadores/details/${encoded}?page=${page}&limit=${limit}`);
    const response = await fetch(url, { headers: getHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao buscar detalhes');
    return result.data as { visits: PageVisitDetail[]; pagination: any };
  },

  // Admin: stats diárias
  async getDailyStats(days = 30) {
    const url = getApiUrl(`/contadores/daily?days=${days}`);
    const response = await fetch(url, { headers: getHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao buscar stats');
    return result.data as { daily: DailyStats[] };
  },

  // Admin: top users
  async getTopUsers(limit = 20) {
    const url = getApiUrl(`/contadores/top-users?limit=${limit}`);
    const response = await fetch(url, { headers: getHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao buscar top users');
    return result.data as { users: TopUser[] };
  },

  // Admin: limpar registros antigos
  async cleanup(days = 90) {
    const url = getApiUrl('/contadores/cleanup');
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ days })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao limpar');
    return result.data;
  },

  // Admin: deletar registros de uma página
  async deleteByPage(pagePath: string) {
    const url = getApiUrl('/contadores/delete-page');
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ page_path: pagePath })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao deletar');
    return result.data;
  }
};
