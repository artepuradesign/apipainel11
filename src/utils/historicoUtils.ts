export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit' | 'bonus' | 'referral_bonus' | 'plan_purchase' | 'recharge' | 'plan_credit' | 'recarga';
  description: string;
  created_at: string;
  balance_type?: 'wallet' | 'plan';
  status?: string;
  payment_method?: string;
  category?: string;
  is_referral?: boolean;
}

export interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  amount: number;
  created_at: string;
  status: 'pending' | 'paid';
}

export const loadTransactions = (userId: string): Transaction[] => {
  if (!userId) return [];
  
  // Carregar transações do novo sistema de balance
  const balanceTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${userId}`) || "[]");
  
  // Converter para o formato esperado
  const formattedTransactions = balanceTransactions.map((t: any) => ({
    id: t.id,
    user_id: userId,
    amount: t.amount,
    type: t.type,
    description: t.description,
    created_at: t.date || t.created_at,
    balance_type: t.balance_type || 'wallet'
  }));
  
  return formattedTransactions;
};

export const loadReferralEarnings = (userId: string): ReferralEarning[] => {
  if (!userId) return [];
  
  // Carregar apenas dados reais de indicação do localStorage
  const referralRecords = JSON.parse(localStorage.getItem('referral_records') || '[]');
  
  // Filtrar apenas indicações do usuário atual que foram completadas
  const userReferrals = referralRecords
    .filter((record: any) => 
      record.referrer_id === userId && 
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
  
  return userReferrals;
};

export const clearTransactions = (userId: string): void => {
  if (!userId) return;
  
  localStorage.setItem(`balance_transactions_${userId}`, JSON.stringify([]));
};

export const clearReferrals = (userId: string): void => {
  if (!userId) return;
  
  // Limpar apenas as indicações do usuário atual
  const referralRecords = JSON.parse(localStorage.getItem('referral_records') || '[]');
  const filteredRecords = referralRecords.filter((record: any) => record.referrer_id !== userId);
  
  localStorage.setItem('referral_records', JSON.stringify(filteredRecords));
};

export const clearRecharges = (userId: string): void => {
  if (!userId) return;
  
  // Limpar apenas as recargas do histórico
  const balanceTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${userId}`) || "[]");
  const filteredTransactions = balanceTransactions.filter((t: any) => t.type !== 'recharge' && !t.description.includes('Recarga'));
  
  localStorage.setItem(`balance_transactions_${userId}`, JSON.stringify(filteredTransactions));
  
  // Limpar também do payment history
  localStorage.setItem(`payment_history_${userId}`, JSON.stringify([]));
};

export const formatBrazilianCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const filterTransactions = (transactions: Transaction[], searchTerm: string): Transaction[] => {
  return transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const getRechargeTransactions = (transactions: Transaction[]): Transaction[] => {
  return transactions.filter(t => 
    t.type === 'recharge' || t.description.includes('Recarga')
  );
};

export const getAllHistory = (
  transactions: Transaction[], 
  referralEarnings: ReferralEarning[]
): Array<Transaction | (ReferralEarning & { type: 'referral_bonus'; description: string; balance_type: 'wallet' })> => {
  const mappedReferrals = referralEarnings.map(earning => ({
    ...earning,
    type: 'referral_bonus' as const,
    description: `Bônus de indicação - Usuário ${earning.referred_user_id}`,
    balance_type: 'wallet' as const
  }));

  return [...transactions, ...mappedReferrals].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

// Função para buscar informações básicas do usuário indicado
export const getReferredUserInfo = (userId: string) => {
  const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
  const user = users.find((u: any) => u.id === userId);
  
  if (user) {
    const firstName = user.name?.split(' ')[0] || 'Usuário';
    return {
      firstName,
      id: userId,
      exists: true
    };
  }
  
  return {
    firstName: 'Usuário',
    id: userId,
    exists: false
  };
};

// Função para verificar se um usuário existe
export const checkUserExists = (userId: string) => {
  const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
  const user = users.find((u: any) => u.id === userId);
  
  if (user) {
    const firstName = user.name?.split(' ')[0] || 'Usuário';
    return {
      exists: true,
      firstName,
      email: user.email || 'Email não disponível',
      id: userId,
      joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'
    };
  }
  
  return {
    exists: false,
    firstName: null,
    email: null,
    id: userId,
    joinDate: null
  };
};
