import { useWalletBalance } from './useWalletBalance';

export const useUserBalance = () => {
  const {
    balance,
    isLoading,
    hasLoadedOnce,
    loadBalance,
  } = useWalletBalance();

  return {
    totalAvailableBalance: balance.total,
    isLoading,
    hasLoadedOnce,
    calculateTotalAvailableBalance: () => balance.total,
    loadTotalAvailableBalance: loadBalance,
  };
};
