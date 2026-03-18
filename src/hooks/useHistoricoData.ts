import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { walletApiService } from '@/services/walletApiService';
import { cupomApiService } from '@/services/cupomApiService';
import { consultationApiService } from '@/services/consultationApiService';
import { filterTransactions, getRechargeTransactions } from '@/utils/historicoUtils';

interface HistoricoState {
  allHistory: any[];
  transactions: any[];
  referralEarnings: any[];
  consultations: any[];
  cupomHistory: any[];
  loading: boolean;
  error: string | null;
}

export const useHistoricoData = () => {
  const { user } = useAuth();
  const [state, setState] = useState<HistoricoState>({
    allHistory: [],
    transactions: [],
    referralEarnings: [],
    consultations: [],
    cupomHistory: [],
    loading: false,
    error: null,
  });

  const loadLocalData = useCallback(() => {
    if (!user) return;
    try {
      const localTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${user.id}`) || '[]');
      setState((prev) => ({
        ...prev,
        transactions: localTransactions,
        allHistory: localTransactions,
        referralEarnings: [],
        cupomHistory: [],
        consultations: [],
      }));
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error);
    }
  }, [user]);

  const loadHistoryData = useCallback(async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [transactionsResponse, cupomResponse, consultasResponse] = await Promise.allSettled([
        walletApiService.getTransactionHistory(parseInt(user.id), 100),
        cupomApiService.getCupomHistory(parseInt(user.id)),
        consultationApiService.getConsultationHistory(100, 0),
      ]);

      let allHistoryData: any[] = [];
      let apiTransactions: any[] = [];
      let apiReferrals: any[] = [];
      let apiCupons: any[] = [];
      let apiConsultations: any[] = [];

      if (transactionsResponse.status === 'fulfilled' && transactionsResponse.value.success) {
        const transactionData = transactionsResponse.value.data;

        apiTransactions = transactionData.map((t: any) => ({
          id: t.id?.toString() || Date.now().toString(),
          user_id: user.id,
          amount: parseFloat(t.amount) || 0,
          type: t.type || 'credit',
          description: t.description || 'Transação',
          created_at: t.created_at || new Date().toISOString(),
          balance_type: t.wallet_type === 'plan' ? 'plan' : 'wallet',
          payment_method: t.payment_method || '',
          status: t.status || 'completed',
          category:
            t.type === 'indicacao' ||
            t.type === 'bonus' ||
            (t.description &&
              (t.description.includes('Bônus') ||
                t.description.includes('indicação') ||
                t.description.includes('boas-vindas') ||
                t.description.includes('welcome')))
              ? 'bonus'
              : 'normal',
          is_referral:
            t.type === 'indicacao' ||
            (t.description &&
              (t.description.includes('Bônus') ||
                t.description.includes('indicação') ||
                t.description.includes('boas-vindas') ||
                t.description.includes('welcome'))),
        }));

        apiReferrals = transactionData
          .filter((t: any) => t.type === 'indicacao')
          .map((t: any) => {
            const match = t.description.match(/- (.*?) se cadastrou/);
            const referredName = match ? match[1] : `Usuário ${t.reference_id || 'N/A'}`;

            return {
              id: t.id?.toString() || Date.now().toString(),
              referrer_id: user.id,
              referred_user_id: t.reference_id || t.id,
              amount: parseFloat(t.amount) || 0,
              created_at: t.created_at || new Date().toISOString(),
              status: 'paid',
              referred_name: referredName,
            };
          });

        const filteredForAll = apiTransactions.filter(
          (t) => t.type !== 'consulta' && !(t.type === 'bonus' && t.description && t.description.includes('Cupom'))
        );
        allHistoryData = [...filteredForAll];
      }

      if (cupomResponse.status === 'fulfilled' && cupomResponse.value.success) {
        apiCupons = cupomResponse.value.data.map((cupom: any) => ({
          ...cupom,
          category: 'cupom',
        }));
        allHistoryData = [...allHistoryData, ...apiCupons];
      }

      if (consultasResponse.status === 'fulfilled' && consultasResponse.value.success) {
        const userConsultas = consultasResponse.value.data.filter(
          (consulta: any) => consulta.user_id === parseInt(user.id)
        );

        apiConsultations = userConsultas.map((consulta: any) => {
          const valorCobrado = parseFloat(consulta.cost || 0);

          return {
            id: `CPF-${consulta.id}`,
            type: 'consultation',
            module_type: 'cpf',
            document: consulta.document || 'CPF consultado',
            cost: valorCobrado,
            amount: -Math.abs(valorCobrado),
            saldo_usado: 'carteira',
            status: 'success',
            created_at: consulta.created_at,
            updated_at: consulta.created_at,
            category: 'consultation',
            source_table: 'consultas_history',
            balance_type: 'wallet',
            description: `Consulta CPF ${
              consulta.document
                ? consulta.document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                : ''
            }`,
            result_data: consulta.result_data,
          };
        });

        allHistoryData = [...allHistoryData, ...apiConsultations];
      }

      allHistoryData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setState((prev) => ({
        ...prev,
        transactions: apiTransactions,
        referralEarnings: apiReferrals,
        cupomHistory: apiCupons,
        consultations: apiConsultations,
        allHistory: allHistoryData,
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('❌ [HISTORICO] Erro ao carregar dados:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados',
        loading: false,
      }));
      loadLocalData();
    }
  }, [user, loadLocalData]);

  useEffect(() => {
    loadHistoryData();
  }, [loadHistoryData]);

  const filteredTransactions = useMemo(() => filterTransactions(state.transactions, ''), [state.transactions]);
  const rechargeTransactions = useMemo(
    () => getRechargeTransactions(filteredTransactions),
    [filteredTransactions]
  );

  return {
    state,
    refresh: loadHistoryData,
    rechargeTransactions,
  };
};
