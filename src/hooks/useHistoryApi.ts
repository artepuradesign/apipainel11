
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cookieUtils } from '@/utils/cookieUtils';
import { toast } from 'sonner';
import { apiRequest, fetchApiConfig } from '@/config/api';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit' | 'bonus' | 'referral_bonus' | 'plan_purchase' | 'recharge' | 'plan_credit';
  description: string;
  created_at: string;
  balance_type?: 'wallet' | 'plan';
}

interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  amount: number;
  created_at: string;
  status: 'pending' | 'paid';
}

interface ConsultaHistorico {
  id: string;
  tipo: string;
  documento: string;
  resultado: string;
  data: string;
  custo: number;
}

export const useHistoryApi = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralEarnings, setReferralEarnings] = useState<ReferralEarning[]>([]);
  const [consultations, setConsultations] = useState<ConsultaHistorico[]>([]);
  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeApiRequest = useCallback(async (endpoint: string, method: 'GET' | 'DELETE' = 'GET') => {
    await fetchApiConfig();
    const sessionToken = cookieUtils.get('session_token');
    
    if (!sessionToken) {
      throw new Error('Token de sessão não encontrado');
    }

    const data = await apiRequest<any>(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });
    
    if (!data.success) {
      throw new Error(data.message || 'Erro na API');
    }

    return data.data;
  }, []);

  const loadLocalTransactions = () => {
    if (!user) return [];
    
    try {
      const localTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${user.id}`) || '[]');
      return localTransactions.map((t: any) => ({
        id: t.id,
        user_id: user.id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        created_at: t.date || t.created_at,
        balance_type: t.balance_type || 'wallet'
      }));
    } catch (error) {
      console.error('Erro ao carregar transações locais:', error);
      return [];
    }
  };

  const loadLocalReferrals = () => {
    if (!user) return [];
    
    try {
      const referralRecords = JSON.parse(localStorage.getItem('referral_records') || '[]');
      return referralRecords
        .filter((record: any) => 
          record.referrer_id === user.id && 
          record.status === 'completed'
        )
        .map((record: any) => ({
          id: record.id,
          referrer_id: record.referrer_id,
          referred_user_id: record.referred_user_id,
          amount: record.bonus_amount,
          created_at: record.completed_at || record.created_at,
          status: 'paid' as const
        }));
    } catch (error) {
      console.error('Erro ao carregar indicações locais:', error);
      return [];
    }
  };

  const loadLocalConsultations = () => {
    if (!user) return [];
    
    try {
      const consultations = JSON.parse(localStorage.getItem(`consultation_history_${user.id}`) || '[]');
      return consultations.map((c: any) => ({
        id: c.id || Date.now().toString(),
        tipo: c.tipo || c.type || 'Consulta',
        documento: c.documento || c.document || '',
        resultado: c.resultado || c.result || 'Sucesso',
        data: c.data || c.date || new Date().toISOString(),
        custo: c.custo || c.cost || 5.0
      }));
    } catch (error) {
      console.error('Erro ao carregar consultas locais:', error);
      return [];
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('🔄 Tentando buscar transações via API...');
      const data = await makeApiRequest('/history/transactions');
      setTransactions(data || []);
      console.log('✅ Transações carregadas via API:', data?.length || 0);
      setError(null);
    } catch (err) {
      console.warn('❌ Erro ao buscar transações via API, usando dados locais:', err);
      const localTransactions = loadLocalTransactions();
      setTransactions(localTransactions);
      setError('Falha ao conectar com servidor - usando dados locais');
    }
  };

  const fetchReferralEarnings = async () => {
    try {
      console.log('🔄 Tentando buscar indicações via API...');
      const data = await makeApiRequest('/history/referrals');
      setReferralEarnings(data || []);
      console.log('✅ Indicações carregadas via API:', data?.length || 0);
    } catch (err) {
      console.warn('❌ Erro ao buscar indicações via API, usando dados locais:', err);
      const localReferrals = loadLocalReferrals();
      setReferralEarnings(localReferrals);
    }
  };

  const fetchConsultations = async () => {
    try {
      console.log('🔄 Tentando buscar consultas via API...');
      const data = await makeApiRequest('/history/consultas');
      setConsultations(data || []);
      console.log('✅ Consultas carregadas via API:', data?.length || 0);
    } catch (err) {
      console.warn('❌ Erro ao buscar consultas via API, usando dados locais:', err);
      const localConsultations = loadLocalConsultations();
      setConsultations(localConsultations);
    }
  };

  const fetchAllHistory = async () => {
    try {
      console.log('🔄 Tentando buscar histórico completo via API...');
      const data = await makeApiRequest('/history/all');
      setAllHistory(data || []);
      console.log('✅ Histórico completo carregado via API:', data?.length || 0);
    } catch (err) {
      console.warn('❌ Erro ao buscar histórico completo via API, combinando dados locais:', err);
      
      // Combinar dados locais quando API falha
      const localTransactions = loadLocalTransactions();
      const localReferrals = loadLocalReferrals();
      const localConsultations = loadLocalConsultations();
      
      const combinedHistory = [
        ...localTransactions,
        ...localReferrals.map(r => ({
          ...r,
          type: 'referral_bonus',
          description: 'Bônus de Indicação',
          balance_type: 'wallet'
        })),
        ...localConsultations.map(c => ({
          ...c,
          type: 'debit',
          amount: -c.custo,
          description: `Consulta ${c.tipo} - ${c.documento}`,
          balance_type: 'wallet'
        }))
      ].sort((a, b) => new Date(b.created_at || b.data).getTime() - new Date(a.created_at || a.data).getTime());
      
      setAllHistory(combinedHistory);
    }
  };

  const clearTransactions = async () => {
    try {
      await makeApiRequest('/history/transactions/clear', 'DELETE');
      setTransactions([]);
      toast.success('Histórico de transações limpo!');
    } catch (err) {
      console.warn('❌ Erro ao limpar transações via API, limpando localmente:', err);
      if (user) {
        localStorage.setItem(`balance_transactions_${user.id}`, JSON.stringify([]));
        setTransactions([]);
        toast.success('Histórico de transações limpo localmente!');
      }
    }
  };

  const clearReferrals = async () => {
    try {
      await makeApiRequest('/history/referrals/clear', 'DELETE');
      setReferralEarnings([]);
      toast.success('Histórico de indicações limpo!');
    } catch (err) {
      console.warn('❌ Erro ao limpar indicações via API, limpando localmente:', err);
      if (user) {
        const referralRecords = JSON.parse(localStorage.getItem('referral_records') || '[]');
        const filteredRecords = referralRecords.filter((record: any) => record.referrer_id !== user.id);
        localStorage.setItem('referral_records', JSON.stringify(filteredRecords));
        setReferralEarnings([]);
        toast.success('Histórico de indicações limpo localmente!');
      }
    }
  };

  const clearConsultations = async () => {
    try {
      await makeApiRequest('/history/consultas/clear', 'DELETE');
      setConsultations([]);
      toast.success('Histórico de consultas limpo!');
    } catch (err) {
      console.warn('❌ Erro ao limpar consultas via API, limpando localmente:', err);
      if (user) {
        localStorage.setItem(`consultation_history_${user.id}`, JSON.stringify([]));
        setConsultations([]);
        toast.success('Histórico de consultas limpo localmente!');
      }
    }
  };

  const clearAllHistory = async () => {
    try {
      await makeApiRequest('/history/clear-all', 'DELETE');
      setTransactions([]);
      setReferralEarnings([]);
      setConsultations([]);
      setAllHistory([]);
      toast.success('Todo o histórico foi limpo!');
    } catch (err) {
      console.warn('❌ Erro ao limpar todo histórico via API, limpando localmente:', err);
      if (user) {
        localStorage.setItem(`balance_transactions_${user.id}`, JSON.stringify([]));
        localStorage.setItem(`consultation_history_${user.id}`, JSON.stringify([]));
        const referralRecords = JSON.parse(localStorage.getItem('referral_records') || '[]');
        const filteredRecords = referralRecords.filter((record: any) => record.referrer_id !== user.id);
        localStorage.setItem('referral_records', JSON.stringify(filteredRecords));
        
        setTransactions([]);
        setReferralEarnings([]);
        setConsultations([]);
        setAllHistory([]);
        toast.success('Todo o histórico foi limpo localmente!');
      }
    }
  };

  const loadAllData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Carregando todos os dados do histórico...');
      await Promise.all([
        fetchTransactions(),
        fetchReferralEarnings(),
        fetchConsultations(),
        fetchAllHistory()
      ]);
      console.log('✅ Dados do histórico carregados com sucesso');
    } catch (err) {
      console.error('❌ Erro ao carregar dados do histórico:', err);
      setError('Erro ao carregar dados do histórico');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  return {
    transactions,
    referralEarnings,
    consultations,
    allHistory,
    loading,
    error,
    clearTransactions,
    clearReferrals,
    clearConsultations,
    clearAllHistory,
    refreshData: loadAllData
  };
};
