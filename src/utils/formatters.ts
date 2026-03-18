
export const formatCpf = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4').replace(/-$/, '');
};

export const formatCnpj = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
  }
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5').replace(/-$/, '');
};

export const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
};

export const formatDateOfBirth = (value: string): string => {
  // Remove tudo que não é número
  const cleaned = value.replace(/\D/g, '');
  
  // Aplica a formatação DD/MM/AAAA
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 4) {
    return cleaned.replace(/(\d{2})(\d{0,2})/, '$1/$2');
  } else {
    return cleaned.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
  }
};

export const formatCep = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');
};

// Função para formatar datas sem problemas de timezone
export const formatDateOnly = (dateString: string): string => {
  if (!dateString) return 'Não informado';
  
  // Se a data está no formato YYYY-MM-DD, criamos a data local
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  }
  
  // Para outros formatos, usa o comportamento padrão
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const formatMoneyBR = (value: number): string => {
  const numericValue = Number(value) || 0;
  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
