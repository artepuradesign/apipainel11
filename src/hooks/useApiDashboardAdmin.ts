
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest, fetchApiConfig } from '@/config/api';

const getCookie = (name: string) => cookieUtils.get(name);

export interface DashboardStats {
  cash_balance: number;
  active_plans: number;
  plan_sales: number;
  total_users: number;
  total_referrals: number; // Quantidade de indicações
  total_commissions: number; // Valor total pago em comissões
  total_recharges: number;
  total_withdrawals: number;
  total_consultations: number;
  users_online: number;
  total_modules: number;
  // Novos campos para métodos de pagamento específicos
  payment_pix: number;
  payment_card: number;
  payment_paypal: number;
  total_coupons_used: number;
}

export interface DashboardUser {
  id: number;
  name: string;
  email: string;
  login: string;
  cpf: string;
  telefone: string;
  plan: string;
  balance: number;
  status: string;
  total_consultations: number;
  total_spent: number;
  last_login: string;
  created_at: string;
  is_online: boolean;
}

export interface DashboardActivity {
  id: number;
  type: string;
  description: string;
  user_name: string;
  user_login: string;
  module: string;
  level: string;
  created_at: string;
}

export interface DashboardTransaction {
  id: number | string;
  type: string;
  description: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  user_name: string;
  payment_method: string;
  created_at: string;
  source?: string;
  module_name?: string;
}

export const useApiDashboardAdmin = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [isCircuitOpen, setIsCircuitOpen] = useState(false);

  const getAuthHeaders = () => {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const handleApiError = (error: any) => {
    console.error('Dashboard Admin API Error:', error);
    
    // Increment error counter
    setConsecutiveErrors(prev => {
      const newCount = prev + 1;
      // Ativar circuit breaker após 3 erros consecutivos
      if (newCount >= 3) {
        setIsCircuitOpen(true);
        console.warn('🚨 Dashboard Admin circuit breaker ativado após 3 erros consecutivos');
        // Tentar reabrir após 5 minutos
        setTimeout(() => {
          console.log('🔄 Tentando reabrir Dashboard Admin circuit breaker...');
          setIsCircuitOpen(false);
          setConsecutiveErrors(0);
        }, 300000);
      }
      return newCount;
    });
    
    if (error.message === 'Failed to fetch') {
      toast.error('Erro de conexão com a API. Verifique sua conexão de internet.');
    } else if (error.message?.includes('500')) {
      toast.error('Servidor temporariamente indisponível. Tentaremos novamente em alguns minutos.');
    } else {
      toast.error('Erro na API: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const loadStats = useCallback(async () => {
    if (isCircuitOpen) {
      console.log('🚨 Dashboard Admin circuit breaker ativo, pulando loadStats...');
      return;
    }

    setIsLoading(true);
    try {
      await fetchApiConfig();
      const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const data = await apiRequest<any>('/dashboard-admin/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (data.success) {
        const previousBalance = stats?.cash_balance || 0;
        console.log('📊 Dashboard stats ATUALIZADAS via API:', data.data);
        console.log('💰 Novo valor do caixa:', data.data.cash_balance);
        console.log('📈 Diferença do saldo anterior:', data.data.cash_balance - previousBalance);
        
        setStats(data.data);
        
        // Reset error counter on success
        setConsecutiveErrors(0);
        setIsCircuitOpen(false);
      } else {
        throw new Error(data.message || 'Erro ao carregar estatísticas');
      }
    } catch (error) {
      // Para atualizações em tempo real, não mostrar toast de erro
      console.warn('Dashboard Admin API Warning:', error);
      setConsecutiveErrors(prev => {
        const newCount = prev + 1;
        if (newCount >= 5) { // Aumentar tolerância para 5 erros
          setIsCircuitOpen(true);
          console.warn('🚨 Dashboard Admin circuit breaker ativado após 5 erros consecutivos');
          setTimeout(() => {
            console.log('🔄 Tentando reabrir Dashboard Admin circuit breaker...');
            setIsCircuitOpen(false);
            setConsecutiveErrors(0);
          }, 60000); // Reduzir timeout para 1 minuto
        }
        return newCount;
      });
    } finally {
      setIsLoading(false);
    }
  }, [isCircuitOpen]);

  const loadUsers = useCallback(async (page = 1, limit = 20) => {
    setIsLoading(true);
    try {
      await fetchApiConfig();
      const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const data = await apiRequest<any>(`/dashboard-admin/users?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (data.success) {
        setUsers(data.data.users || []);
        console.log('Dashboard users carregados via API:', data.data.users?.length || 0);
      } else {
        throw new Error(data.message || 'Erro ao carregar usuários');
      }
    } catch (error) {
      handleApiError(error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadActivities = useCallback(async (type = 'all', limit = 20) => {
    setIsLoading(true);
    try {
      await fetchApiConfig();
      const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const data = await apiRequest<any>(`/dashboard-admin/activities?type=${type}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (data.success) {
        setActivities(data.data.activities || []);
        console.log('Dashboard activities carregadas via API:', data.data.activities?.length || 0);
      } else {
        throw new Error(data.message || 'Erro ao carregar atividades');
      }
    } catch (error) {
      handleApiError(error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async (limit = 50, filter = 'all') => {
    setIsLoading(true);
    try {
      await fetchApiConfig();
      const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const data = await apiRequest<any>(`/dashboard-admin/transactions?limit=${limit}&filter=${filter}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (data.success) {
        setTransactions(data.data.transactions || []);
        console.log(`Dashboard transactions carregadas via API (filtro: ${filter}):`, data.data.transactions?.length || 0);
      } else {
        throw new Error(data.message || 'Erro ao carregar transações');
      }
    } catch (error) {
      handleApiError(error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualização otimista do saldo em caixa (anima imediatamente no UI)
  const optimisticIncrementCash = (amount: number) => {
    if (!amount || isNaN(amount)) return;
    setStats(prev => prev ? { ...prev, cash_balance: Math.max(0, prev.cash_balance + amount) } : prev);
  };

  // Atualização otimista do total em recargas
  const optimisticIncrementRecharges = (amount: number) => {
    if (!amount || isNaN(amount)) return;
    setStats(prev => prev ? { ...prev, total_recharges: Math.max(0, prev.total_recharges + amount) } : prev);
  };

  // Atualização otimista das vendas de planos
  const optimisticIncrementPlanSales = (amount: number) => {
    if (!amount || isNaN(amount)) return;
    setStats(prev => prev ? { ...prev, plan_sales: Math.max(0, (prev.plan_sales || 0) + amount) } : prev);
  };

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadStats(),
      loadUsers(),
      loadActivities(),
      loadTransactions()
    ]);
  }, [loadStats, loadUsers, loadActivities, loadTransactions]);

  return {
    stats,
    users,
    activities,
    transactions,
    isLoading,
    loadStats,
    loadUsers,
    loadActivities,
    loadTransactions,
    optimisticIncrementCash,
    optimisticIncrementRecharges,
    optimisticIncrementPlanSales,
    loadAllData,
  };
};
