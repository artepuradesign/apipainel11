import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cookieUtils } from '@/utils/cookieUtils';
import { toast } from 'sonner';
import { API_BASE_URL, API_KEY } from '@/config/apiConfig';

export interface AccessLog {
  id: string;
  action: string;
  category: string;
  description: string;
  device: string;
  ip: string;
  timestamp: string;
  browser: string;
  page?: string;
  user_agent: string;
}

export interface AccessStats {
  total_logs: number;
  last_access: string | null;
  categories: Array<{
    category: string;
    count: number;
    last_activity: string;
  }>;
}

export const useAccessLogs = () => {
  const { user } = useAuth();
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AccessStats | null>(null);

  const makeApiRequest = async (endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) => {
    const sessionToken = cookieUtils.get('session_token');
    
    console.log('🌐 API Request - Access Logs:', method, endpoint);
    
    if (!sessionToken) {
      throw new Error('Token de sessão não encontrado');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
        'X-API-Key': API_KEY
      },
      body: body ? JSON.stringify(body) : undefined
    });

    console.log('📡 API Response - Access Logs:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 API Data - Access Logs:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Erro na API');
    }

    return data.data;
  };

  const fetchAccessLogs = async (limit: number = 10, category?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (category) {
        params.append('category', category);
      }
      
      const endpoint = `/access-logs?${params.toString()}`;
      const data: AccessLog[] = await makeApiRequest(endpoint);
      
      setAccessLogs(data || []);
      console.log('✅ Access logs carregados:', data?.length || 0);
      
    } catch (err: any) {
      console.error('❌ Erro ao buscar logs de acesso:', err);
      setError(`Erro ao carregar logs: ${err.message}`);
      setAccessLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessStats = async () => {
    try {
      const data: AccessStats = await makeApiRequest('/user-audit/stats');
      setStats(data);
      console.log('✅ Estatísticas de acesso carregadas:', data);
      
    } catch (err: any) {
      console.error('❌ Erro ao buscar estatísticas:', err);
      setError(`Erro ao carregar estatísticas: ${err.message}`);
    }
  };

  const createAccessLog = async (logData: {
    action: string;
    category?: string;
    description: string;
    old_values?: any;
    new_values?: any;
    session_id?: string;
  }) => {
    try {
      await makeApiRequest('/access-logs', 'POST', logData);
      console.log('✅ Log de acesso criado:', logData.action);
      
      // Recarregar logs após criação
      await fetchAccessLogs();
      
    } catch (err: any) {
      console.error('❌ Erro ao criar log de acesso:', err);
      throw err;
    }
  };

  // Função para registrar acesso à página automaticamente
  const logPageAccess = async (page: string) => {
    try {
      await createAccessLog({
        action: 'page_access',
        category: 'navigation',
        description: `Acessou a página: ${page}`,
        new_values: { page, timestamp: new Date().toISOString() }
      });
    } catch (err) {
      // Não mostrar erro para o usuário em logs automáticos
      console.warn('Falha ao registrar acesso à página:', err);
    }
  };

  // Carregar dados quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      fetchAccessLogs();
    }
  }, [user]);

  return {
    accessLogs,
    loading,
    error,
    stats,
    fetchAccessLogs,
    fetchAccessStats,
    createAccessLog,
    logPageAccess,
    refreshLogs: () => fetchAccessLogs()
  };
};