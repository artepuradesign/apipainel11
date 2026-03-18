import { serviceModules } from '@/components/dashboard/modules/moduleData';

/**
 * Utility para gerenciar preços dos módulos
 */

export const getModulePrice = (modulePath: string): number => {
  const module = serviceModules.find(m => m.path === modulePath);
  if (!module) {
    console.warn(`Módulo não encontrado para o path: ${modulePath}`);
    return 0;
  }
  
  // Converter string "2,00" para number 2.00
  const priceString = module.price.replace(',', '.');
  const price = parseFloat(priceString);
  
  if (isNaN(price)) {
    console.warn(`Preço inválido para o módulo ${modulePath}: ${module.price}`);
    return 0;
  }
  
  return price;
};

export const getModuleInfo = (modulePath: string) => {
  const module = serviceModules.find(m => m.path === modulePath);
  if (!module) {
    return null;
  }
  
  const price = getModulePrice(modulePath);
  
  return {
    ...module,
    priceValue: price,
    priceFormatted: `R$ ${price.toFixed(2).replace('.', ',')}`
  };
};