
import { toast } from 'sonner';
import { calculateDiscountedPrice } from './planUtils';

export const checkBalanceForModule = (
  userBalance: number,
  modulePrice: string,
  moduleName: string,
  currentPlan: string,
  navigateToAddBalance: () => void
): boolean => {
  const price = parseFloat(modulePrice);
  const { finalPrice } = calculateDiscountedPrice(price, currentPlan);

  if (userBalance < finalPrice) {
    toast.error(
      `Saldo insuficiente para ${moduleName}! Valor necessário: R$ ${finalPrice.toFixed(2)}`,
      {
        action: {
          label: "Adicionar Saldo",
          onClick: navigateToAddBalance
        }
      }
    );
    return false;
  }

  return true;
};

export const getRequiredBalance = (modulePrice: string, currentPlan: string): number => {
  const price = parseFloat(modulePrice);
  const { finalPrice } = calculateDiscountedPrice(price, currentPlan);
  return finalPrice;
};
