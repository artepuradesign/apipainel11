
interface CentralCashTransaction {
  id: string;
  type: 'recarga' | 'plano' | 'comissao_indicacao' | 'comissao_recarga' | 'saque' | 'ajuste' | 'compra_modulo';
  user_id: string;
  amount: number;
  description: string;
  date: string;
  metadata?: {
    plan_name?: string;
    referrer_id?: string;
    original_user_id?: string;
    original_amount?: number;
    transaction_id?: string;
    payment_method?: string;
    pix_key?: string;
  };
}

interface CentralCashStats {
  total_balance: number;
  daily_revenue: number;
  monthly_revenue: number;
  total_recharges: number;
  total_plan_sales: number;
  total_commissions_paid: number;
  total_withdrawals: number;
  users_count: number;
  active_users_today: number;
}

// Usuário caixa central fixo
const CENTRAL_CASH_USER_ID = 'caixa_central';

// Inicializar caixa central
export const initializeCentralCash = () => {
  const existingTransactions = localStorage.getItem('central_cash_transactions');
  if (!existingTransactions) {
    localStorage.setItem('central_cash_transactions', JSON.stringify([]));
  }
  
  const existingStats = localStorage.getItem('central_cash_stats');
  if (!existingStats) {
    const initialStats: CentralCashStats = {
      total_balance: 0,
      daily_revenue: 0,
      monthly_revenue: 0,
      total_recharges: 0,
      total_plan_sales: 0,
      total_commissions_paid: 0,
      total_withdrawals: 0,
      users_count: 2, // anjoip e suporte
      active_users_today: 0
    };
    localStorage.setItem('central_cash_stats', JSON.stringify(initialStats));
  }
};

// Adicionar transação ao caixa central
export const addCentralCashTransaction = (transaction: Omit<CentralCashTransaction, 'id' | 'date'>) => {
  const transactions: CentralCashTransaction[] = JSON.parse(
    localStorage.getItem('central_cash_transactions') || '[]'
  );
  
  const newTransaction: CentralCashTransaction = {
    ...transaction,
    id: `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString()
  };
  
  transactions.unshift(newTransaction);
  localStorage.setItem('central_cash_transactions', JSON.stringify(transactions));
  
  // Atualizar estatísticas
  updateCentralCashStats(newTransaction);
  
  console.log('Transação adicionada ao caixa central:', newTransaction);
  return newTransaction;
};

// Atualizar estatísticas do caixa
const updateCentralCashStats = (transaction: CentralCashTransaction) => {
  const stats: CentralCashStats = JSON.parse(
    localStorage.getItem('central_cash_stats') || '{}'
  );
  
  const today = new Date().toDateString();
  const transactionDate = new Date(transaction.date).toDateString();
  const isToday = today === transactionDate;
  
  // Atualizar saldo total
  if (['recarga', 'plano', 'compra_modulo'].includes(transaction.type)) {
    stats.total_balance += transaction.amount;
    if (isToday) {
      stats.daily_revenue += transaction.amount;
    }
  } else if (['comissao_indicacao', 'comissao_recarga', 'saque'].includes(transaction.type)) {
    stats.total_balance -= transaction.amount;
  }
  
  // Atualizar contadores específicos
  switch (transaction.type) {
    case 'recarga':
      stats.total_recharges += transaction.amount;
      break;
    case 'plano':
      stats.total_plan_sales += transaction.amount;
      break;
    case 'comissao_indicacao':
    case 'comissao_recarga':
      stats.total_commissions_paid += transaction.amount;
      break;
    case 'saque':
      stats.total_withdrawals += transaction.amount;
      break;
    case 'compra_modulo':
      // Compras de módulos entram como receita
      break;
  }
  
  localStorage.setItem('central_cash_stats', JSON.stringify(stats));
};

// Obter todas as transações do caixa
export const getCentralCashTransactions = (): CentralCashTransaction[] => {
  return JSON.parse(localStorage.getItem('central_cash_transactions') || '[]');
};

// Obter estatísticas do caixa
export const getCentralCashStats = (): CentralCashStats => {
  return JSON.parse(localStorage.getItem('central_cash_stats') || '{}');
};

// Obter transações por tipo
export const getTransactionsByType = (type: CentralCashTransaction['type']): CentralCashTransaction[] => {
  const transactions = getCentralCashTransactions();
  return transactions.filter(t => t.type === type);
};

// Obter transações por período
export const getTransactionsByPeriod = (startDate: string, endDate: string): CentralCashTransaction[] => {
  const transactions = getCentralCashTransactions();
  return transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
  });
};

// Obter receita por período
export const getRevenueByPeriod = (days: number = 30): { date: string; revenue: number }[] => {
  const transactions = getCentralCashTransactions();
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
    .filter(t => ['recarga', 'plano', 'compra_modulo'].includes(t.type))
    .forEach(t => {
      const dateStr = t.date.split('T')[0];
      if (dailyRevenue[dateStr] !== undefined) {
        dailyRevenue[dateStr] += t.amount;
      }
    });
  
  return Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue
  }));
};

// Registrar atividade de usuário
export const registerUserActivity = (userId: string, activity: string) => {
  const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
  
  activities.unshift({
    id: Date.now(),
    user_id: userId,
    activity,
    date: new Date().toISOString()
  });
  
  // Manter apenas as últimas 100 atividades
  if (activities.length > 100) {
    activities.splice(100);
  }
  
  localStorage.setItem('user_activities', JSON.stringify(activities));
};

// Inicializar automaticamente
if (typeof window !== 'undefined') {
  initializeCentralCash();
}
