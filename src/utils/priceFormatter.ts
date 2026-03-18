
export const formatPrice = (value: string): string => {
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');
  
  if (!numericValue) return '';
  
  // Converte para número e formata com duas casas decimais
  const number = parseInt(numericValue) / 100;
  
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const parsePrice = (formattedValue: string): string => {
  // Remove formatação e retorna apenas números
  return formattedValue.replace(/\D/g, '');
};

export const formatPriceInput = (value: string): string => {
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');
  
  if (!numericValue) return '';
  
  // Adiciona zeros à esquerda se necessário
  const paddedValue = numericValue.padStart(3, '0');
  
  // Insere a vírgula antes dos dois últimos dígitos
  const integerPart = paddedValue.slice(0, -2);
  const decimalPart = paddedValue.slice(-2);
  
  return `${parseInt(integerPart)},${decimalPart}`;
};
