
// Plan definitions with discounts
export const PLANS = {
  'Pré-Pago': { discount: 0, type: 'prepago' }, // Usuário pré-pago não tem desconto
  'Rainha de Ouros': { discount: 5, type: 'rainha' },
  'Rainha de Paus': { discount: 10, type: 'rainha' },
  'Rainha de Copas': { discount: 15, type: 'rainha' },
  'Rainha de Espadas': { discount: 20, type: 'rainha' },
  'Rei de Ouros': { discount: 20, type: 'rei' },
  'Rei de Paus': { discount: 30, type: 'rei' },
  'Rei de Copas': { discount: 40, type: 'rei' },
  'Rei de Espadas': { discount: 50, type: 'rei' }
};

export const getDiscount = (planName: string, panelId?: number): number => {
  // Painel 38 não tem desconto
  if (panelId === 38) {
    return 0;
  }
  return PLANS[planName as keyof typeof PLANS]?.discount || 0;
};

export const calculateDiscountedPrice = (originalPrice: number, planName: string, panelId?: number): { finalPrice: number, discount: number, discountAmount: number } => {
  // Painel 38 não tem desconto
  if (panelId === 38) {
    return {
      finalPrice: originalPrice,
      discount: 0,
      discountAmount: 0
    };
  }
  
  const discount = getDiscount(planName);
  const discountAmount = (originalPrice * discount) / 100;
  const finalPrice = originalPrice - discountAmount;
  
  return {
    finalPrice: Math.max(finalPrice, 0.01), // Minimum price
    discount,
    discountAmount
  };
};

export const getPlanType = (planName: string): string => {
  return PLANS[planName as keyof typeof PLANS]?.type || 'basic';
};
