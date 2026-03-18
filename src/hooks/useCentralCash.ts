import { useState, useEffect } from 'react';
import { 
  centralCashApiService,
  type CentralCashStats,
  type CentralCashTransaction
} from '@/services/centralCashApiService';

export const useCentralCash = () => {
  const [stats, setStats] = useState<CentralCashStats>({
    current_balance: 0,
    daily_revenue: 0,
    monthly_revenue: 0,
    total_recharges: 0,
    total_withdrawals: 0,
    total_commissions: 0,
    total_consultations: 0,
    users_count: 0,
    last_updated: new Date().toISOString()
  });
  
  const [transactions, setTransactions] = useState<CentralCashTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [statsResult, transactionsResult] = await Promise.all([
        centralCashApiService.getStats(),
        centralCashApiService.getRecentTransactions(50)
      ]);

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      if (transactionsResult.success && transactionsResult.data) {
        setTransactions(transactionsResult.data);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do caixa:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (
    type: string, 
    amount: number, 
    description: string, 
    userId?: number, 
    metadata?: any
  ) => {
    try {
      const result = await centralCashApiService.addTransaction(type, amount, description, userId, metadata);
      if (result.success) {
        refreshData();
        return result.data;
      }
      throw new Error(result.error || 'Erro ao adicionar transação');
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  };

  const getTransactionsByType = (type: string) => {
    return transactions.filter(t => t.transaction_type === type);
  };

  const getRevenueByPeriod = (days: number = 30) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const dailyRevenue: { [key: string]: number } = {};
    
    // Inicializar todos os dias com 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyRevenue[dateStr] = 0;
    }
    
    // Somar receitas por dia
    transactions
      .filter(t => ['recarga', 'entrada'].includes(t.transaction_type))
      .forEach(t => {
        const dateStr = t.created_at.split('T')[0];
        if (dailyRevenue[dateStr] !== undefined) {
          dailyRevenue[dateStr] += t.amount;
        }
      });
    
    return Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue
    }));
  };

  useEffect(() => {
    // Carregar dados apenas na inicialização
    refreshData();
  }, []);

  return {
    stats,
    transactions,
    loading,
    refreshData,
    addTransaction,
    getTransactionsByType,
    getRevenueByPeriod
  };
};