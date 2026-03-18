
import { processRechargeCommission } from './referralSystem';

// Função para inicializar conta nova
export const initializeNewAccount = (userId: string) => {
  const walletKey = `wallet_balance_${userId}`;
  const planKey = `plan_balance_${userId}`;
  const transactionsKey = `balance_transactions_${userId}`;
  
  if (!localStorage.getItem(walletKey)) {
    localStorage.setItem(walletKey, "0.00");
  }
  
  if (!localStorage.getItem(planKey)) {
    localStorage.setItem(planKey, "0.00");
  }
  
  if (!localStorage.getItem(transactionsKey)) {
    localStorage.setItem(transactionsKey, JSON.stringify([]));
  }
  
  console.log('Conta inicializada para usuário:', userId);
};

export const getWalletBalance = (userId: string): number => {
  const balance = localStorage.getItem(`wallet_balance_${userId}`);
  return parseFloat(balance || "0.00");
};

export const getPlanBalance = (userId: string): number => {
  const balance = localStorage.getItem(`plan_balance_${userId}`);
  return parseFloat(balance || "0.00");
};

export const updateWalletBalance = (userId: string, newBalance: number): void => {
  localStorage.setItem(`wallet_balance_${userId}`, newBalance.toFixed(2));
};

export const updatePlanBalance = (userId: string, newBalance: number): void => {
  localStorage.setItem(`plan_balance_${userId}`, newBalance.toFixed(2));
};

// Função principal para adicionar saldo - AGORA COM COMISSÃO DE RECARGA
export const addWalletBalance = async (
  userId: string,
  amount: number,
  description: string = 'Adição de saldo'
): Promise<void> => {
  // Processar comissão de recarga para quem indicou
  const commissionResult = await processRechargeCommission(userId, amount);
  
  if (commissionResult.success) {
    console.log(`Comissão de R$ ${commissionResult.commission.toFixed(2)} creditada para indicador ${commissionResult.referrerId}`);
  }
  
  // Adicionar saldo normal na carteira
  await addBalanceTransaction(userId, amount, 'credit', description, undefined, 'wallet');
};

// Função para deduzir do saldo disponível
export const deductFromAvailableBalance = async (
  userId: string,
  amount: number,
  description: string,
  consultationId?: string
): Promise<boolean> => {
  const walletBalance = getWalletBalance(userId);
  const planBalance = getPlanBalance(userId);
  const totalBalance = walletBalance + planBalance;
  
  if (totalBalance < amount) {
    return false;
  }
  
  // Primeiro deduzir da carteira, depois do plano
  if (walletBalance >= amount) {
    await addBalanceTransaction(userId, amount, 'debit', description, consultationId, 'wallet');
  } else {
    if (walletBalance > 0) {
      await addBalanceTransaction(userId, walletBalance, 'debit', description, consultationId, 'wallet');
      const remaining = amount - walletBalance;
      await addBalanceTransaction(userId, remaining, 'debit', description, consultationId, 'plan');
    } else {
      await addBalanceTransaction(userId, amount, 'debit', description, consultationId, 'plan');
    }
  }
  
  return true;
};

// Função para comprar plano
export const buyPlanDirect = async (
  userId: string,
  planName: string,
  planPrice: number
): Promise<boolean> => {
  return buyPlanWithWalletBalance(userId, planName, planPrice);
};

export const addBalanceTransaction = async (
  userId: string,
  amount: number,
  type: 'credit' | 'debit',
  description: string,
  consultationId?: string,
  balanceType: 'wallet' | 'plan' = 'wallet'
): Promise<void> => {
  const transactionsKey = `balance_transactions_${userId}`;
  const balanceKey = `${balanceType}_balance_${userId}`;
  
  const currentBalance = parseFloat(localStorage.getItem(balanceKey) || "0.00");
  const newBalance = type === 'credit' ? currentBalance + amount : currentBalance - amount;
  
  // Atualizar saldo
  localStorage.setItem(balanceKey, newBalance.toFixed(2));
  
  // Adicionar transação
  const transactions = JSON.parse(localStorage.getItem(transactionsKey) || "[]");
  const newTransaction = {
    id: Date.now().toString(),
    amount: Math.abs(amount),
    type,
    description,
    date: new Date().toISOString(),
    balance_type: balanceType,
    previous_balance: currentBalance,
    new_balance: newBalance,
    consultation_id: consultationId
  };
  
  transactions.push(newTransaction);
  localStorage.setItem(transactionsKey, JSON.stringify(transactions));
  
  console.log(`Transação ${type} de R$ ${amount.toFixed(2)} adicionada para usuário ${userId} (${balanceType})`);
  
  // Disparar evento de atualização específico para recargas
  window.dispatchEvent(new CustomEvent('balanceRechargeUpdated', { 
    detail: { userId, shouldAnimate: type === 'credit', amount: amount, method: 'api' }
  }));
};

// Função para comprar plano com saldo da carteira
export const buyPlanWithWalletBalance = async (
  userId: string,
  planName: string,
  planPrice: number
): Promise<boolean> => {
  const walletBalance = getWalletBalance(userId);
  
  if (walletBalance < planPrice) {
    return false;
  }
  
  // Deduzir da carteira
  await addBalanceTransaction(userId, planPrice, 'debit', `Compra do plano ${planName}`, undefined, 'wallet');
  
  // Adicionar ao saldo do plano
  await addBalanceTransaction(userId, planPrice, 'credit', `Plano ${planName} ativado`, undefined, 'plan');
  
  // Salvar plano atual
  localStorage.setItem(`user_plan_${userId}`, planName);
  
  return true;
};

// Obter histórico de transações
export const getBalanceTransactions = (userId: string) => {
  const transactions = localStorage.getItem(`balance_transactions_${userId}`);
  return transactions ? JSON.parse(transactions) : [];
};

// Obter saldo total disponível
export const getTotalBalance = (userId: string): number => {
  return getWalletBalance(userId) + getPlanBalance(userId);
};
