
import { addCentralCashTransaction, registerUserActivity } from './centralCashService';
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

// Função principal para adicionar saldo - AGORA COM REGISTRO NO CAIXA CENTRAL
export const addWalletBalance = async (
  userId: string,
  amount: number,
  description: string = 'Adição de saldo',
  paymentMethod: string = 'PIX'
): Promise<void> => {
  // Registrar no caixa central PRIMEIRO
  addCentralCashTransaction({
    type: 'recarga',
    user_id: userId,
    amount: amount,
    description: `Recarga de ${description} - Usuário ${userId}`,
    metadata: {
      payment_method: paymentMethod,
      transaction_id: `recarga_${Date.now()}`
    }
  });

  // Processar comissão de recarga para quem indicou
  const commissionResult = await processRechargeCommission(userId, amount);
  
  if (commissionResult.success) {
    // Registrar comissão no caixa central
    addCentralCashTransaction({
      type: 'comissao_recarga',
      user_id: commissionResult.referrerId,
      amount: commissionResult.commission,
      description: `Comissão de recarga - R$ ${commissionResult.commission.toFixed(2)} do usuário ${userId}`,
      metadata: {
        referrer_id: commissionResult.referrerId,
        original_user_id: userId,
        original_amount: amount
      }
    });
    
    console.log(`Comissão de R$ ${commissionResult.commission.toFixed(2)} creditada para indicador ${commissionResult.referrerId}`);
  }
  
  // Adicionar saldo normal na carteira
  await addBalanceTransaction(userId, amount, 'credit', description, undefined, 'wallet');
  
  // Registrar atividade do usuário
  registerUserActivity(userId, `Recarga de ${amount.toFixed(2)} via ${paymentMethod}`);
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
  
  // Registrar atividade do usuário
  registerUserActivity(userId, `Consulta realizada - ${description}`);
  
  return true;
};

// Função para comprar plano - AGORA COM REGISTRO NO CAIXA CENTRAL
export const buyPlanDirect = async (
  userId: string,
  planName: string,
  planPrice: number
): Promise<boolean> => {
  const success = await buyPlanWithWalletBalance(userId, planName, planPrice);
  
  if (success) {
    // Registrar venda de plano no caixa central
    addCentralCashTransaction({
      type: 'plano',
      user_id: userId,
      amount: planPrice,
      description: `Compra do plano ${planName} - Usuário ${userId}`,
      metadata: {
        plan_name: planName,
        transaction_id: `plano_${Date.now()}`
      }
    });
    
    // Registrar atividade do usuário
    registerUserActivity(userId, `Comprou plano ${planName} - R$ ${planPrice.toFixed(2)}`);
  }
  
  return success;
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
    detail: { userId, shouldAnimate: type === 'credit', amount: amount, method: 'cash' }
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

// Função para registrar saque PIX - COM REGISTRO NO CAIXA CENTRAL
export const processPixWithdrawal = async (
  userId: string,
  amount: number,
  pixKey: string
): Promise<{ success: boolean; message: string }> => {
  const walletBalance = getWalletBalance(userId);
  
  if (walletBalance < amount) {
    return { success: false, message: 'Saldo insuficiente' };
  }
  
  if (amount < 100) {
    return { success: false, message: 'Valor mínimo para saque é R$ 100,00' };
  }
  
  try {
    // Deduzir do saldo do usuário
    await addBalanceTransaction(userId, amount, 'debit', `Saque PIX para ${pixKey}`, undefined, 'wallet');
    
    // Registrar saque no caixa central
    addCentralCashTransaction({
      type: 'saque',
      user_id: userId,
      amount: amount,
      description: `Saque PIX - R$ ${amount.toFixed(2)} para ${pixKey}`,
      metadata: {
        pix_key: pixKey,
        transaction_id: `saque_${Date.now()}`
      }
    });
    
    // Registrar atividade do usuário
    registerUserActivity(userId, `Saque PIX de R$ ${amount.toFixed(2)} para ${pixKey}`);
    
    return { success: true, message: 'Saque processado com sucesso!' };
  } catch (error) {
    console.error('Erro ao processar saque:', error);
    return { success: false, message: 'Erro interno ao processar saque' };
  }
};
