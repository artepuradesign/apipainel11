/**
 * Utilitário para transformar mensagens de erro técnicas em mensagens amigáveis
 */

export const getErrorMessage = (error: any): string => {
  // Se é uma string simples de erro
  if (typeof error === 'string') {
    if (error.includes('max_connections_per_hour') || error.includes('exceeded') || error.includes('1226')) {
      return '⏱️ Sistema temporariamente ocupado. Por favor, aguarde 2 minutos e tente novamente.';
    }
    if (error.includes('max_user_connections') || error.includes('Too many connections')) {
      return '⏱️ Muitas requisições simultâneas. Aguarde alguns segundos e tente novamente.';
    }
    if (error.includes('Erro de conexão com banco de dados')) {
      return '🔌 Problema temporário de conexão. Por favor, tente novamente em alguns instantes.';
    }
    if (error.includes('HTTP 404')) {
      return 'Registro não encontrado. Verifique se ainda existe.';
    }
    if (error.includes('HTTP 403')) {
      return 'Você não tem permissão para realizar esta ação.';
    }
    if (error.includes('HTTP 401')) {
      return 'Sua sessão expirou. Faça login novamente.';
    }
    if (error.includes('HTTP 500')) {
      return 'Erro temporário no servidor. Tente novamente em alguns minutos.';
    }
    if (error.includes('Failed to fetch')) {
      return 'Problemas de conexão. Verifique sua internet e tente novamente.';
    }
    if (error.includes('Token de autorização')) {
      return 'Sessão expirada. Faça login novamente.';
    }
  }

  // Se é um objeto de erro
  if (error && typeof error === 'object') {
    if (error.message) {
      return getErrorMessage(error.message);
    }
    if (error.error) {
      return getErrorMessage(error.error);
    }
  }

  // Mensagem padrão
  return 'Ocorreu um erro inesperado. Tente novamente.';
};

export const getSuccessMessage = (action: string, entity: string): string => {
  const actions: Record<string, string> = {
    'create': 'criado',
    'update': 'atualizado', 
    'delete': 'excluído',
    'load': 'carregado'
  };

  const entities: Record<string, string> = {
    'cpf': 'CPF',
    'consulta': 'Consulta',
    'dados': 'Dados'
  };

  const actionText = actions[action] || action;
  const entityText = entities[entity] || entity;

  return `${entityText} ${actionText} com sucesso!`;
};

export const getLoadingMessage = (action: string, entity: string): string => {
  const actions: Record<string, string> = {
    'create': 'Criando',
    'update': 'Atualizando',
    'delete': 'Excluindo',
    'load': 'Carregando'
  };

  const entities: Record<string, string> = {
    'cpf': 'CPF',
    'consulta': 'consulta',
    'dados': 'dados'
  };

  const actionText = actions[action] || action;
  const entityText = entities[entity] || entity;

  return `${actionText} ${entityText}...`;
};