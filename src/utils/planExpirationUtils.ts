
// Utility functions for managing plan expiration

export const setPlanExpiration = (planName: string): void => {
  if (planName === 'Pré-Pago') {
    localStorage.removeItem('plan_expiration_date');
    return;
  }

  // Set expiration date to 30 days from now
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);
  
  localStorage.setItem('plan_expiration_date', expirationDate.toISOString());
};

export const checkAndExpirePlan = (): boolean => {
  const currentPlan = localStorage.getItem('user_plan') || 'Pré-Pago';
  const planExpirationDate = localStorage.getItem('plan_expiration_date');
  
  if (!planExpirationDate || currentPlan === 'Pré-Pago') {
    return false;
  }

  const expirationDate = new Date(planExpirationDate);
  const currentDate = new Date();
  
  if (currentDate > expirationDate) {
    // Plan has expired, convert to Pré-Pago
    const planBalance = parseFloat(localStorage.getItem('plan_balance') || '0');
    const currentUserBalance = parseFloat(localStorage.getItem('user_balance') || '0');
    
    // Transfer remaining plan balance to wallet
    const newUserBalance = currentUserBalance + planBalance;
    
    // Update localStorage
    localStorage.setItem('user_plan', 'Pré-Pago');
    localStorage.setItem('user_balance', newUserBalance.toString());
    localStorage.setItem('plan_balance', '0');
    localStorage.removeItem('plan_expiration_date');
    
    // Redirect to login
    window.location.href = '/login';
    
    return true; // Plan was expired and updated
  }
  
  return false; // Plan is still active
};

export const getRemainingDays = (planExpirationDate: string | null): number => {
  if (!planExpirationDate) return 0;
  
  const expirationDate = new Date(planExpirationDate);
  const currentDate = new Date();
  const timeDiff = expirationDate.getTime() - currentDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return Math.max(0, daysDiff);
};
