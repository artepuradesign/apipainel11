/**
 * Utilitários para limpar dados localStorage
 */

export const clearUserStorage = (userId: string): void => {
  if (!userId) return;
  
  // Limpar saldos mock
  localStorage.removeItem(`wallet_balance_${userId}`);
  localStorage.removeItem(`plan_balance_${userId}`);
  localStorage.removeItem(`user_balance_${userId}`);
  localStorage.removeItem(`user_plan_balance_${userId}`);
  
  // Limpar transações mock
  localStorage.removeItem(`balance_transactions_${userId}`);
  localStorage.removeItem(`payment_history_${userId}`);
  localStorage.removeItem(`user_transactions_${userId}`);
  
  // Limpar histórico de recarga
  localStorage.removeItem(`recharge_history_${userId}`);
  
  // Limpar dados de indicações mock
  localStorage.removeItem('user_referral_code');
  localStorage.removeItem('referral_records');
  
  console.log(`✅ Storage limpo para usuário ${userId}`);
};

export const clearAllUserData = (): void => {
  // Obter todas as chaves do localStorage
  const keys = Object.keys(localStorage);
  
  // Filtrar chaves relacionadas a usuários e dados financeiros
  const userKeys = keys.filter(key => 
    key.includes('wallet_balance_') ||
    key.includes('plan_balance_') ||
    key.includes('user_balance_') ||
    key.includes('balance_transactions_') ||
    key.includes('payment_history_') ||
    key.includes('recharge_history_') ||
    key.includes('user_transactions_') ||
    key === 'user_referral_code' ||
    key === 'referral_records'
  );
  
  // Remover todas as chaves encontradas
  userKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log(`✅ Todos os dados de usuários foram limpos. ${userKeys.length} chaves removidas.`);
};

export const initializeCleanUser = (userId: string): void => {
  if (!userId) return;
  
  // Limpar dados antigos
  clearUserStorage(userId);
  
  // Inicializar com valores zerados
  localStorage.setItem(`wallet_balance_${userId}`, "0.00");
  localStorage.setItem(`plan_balance_${userId}`, "0.00");
  localStorage.setItem(`balance_transactions_${userId}`, "[]");
  localStorage.setItem(`payment_history_${userId}`, "[]");
  
  console.log(`✅ Usuário ${userId} inicializado com dados limpos`);
};