import { useState, useCallback } from 'react';
import { baseReceitaService, BaseReceita } from '@/services/baseReceitaService';
import { toast } from 'sonner';

export const useBaseReceita = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receitaData, setReceitaData] = useState<BaseReceita | null>(null);

  // Buscar dados da Receita Federal por CPF
  const getReceitaByCpf = useCallback(async (cpf: string): Promise<BaseReceita | null> => {
    if (!cpf) {
      console.warn('⚠️ [RECEITA_FEDERAL] CPF vazio fornecido');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cleanCpf = cpf.replace(/\D/g, ''); // Remove formatação
      console.log('🔄 [RECEITA_FEDERAL] Buscando dados da Receita para CPF:', cleanCpf);
      
      const response = await baseReceitaService.getByCpf(cleanCpf);
      console.log('📊 [RECEITA_FEDERAL] Resposta do serviço:', {
        success: response.success,
        hasData: !!response.data,
        error: response.error,
        message: response.message
      });

      if (response.success && response.data) {
        console.log('✅ [RECEITA_FEDERAL] Dados encontrados:', {
          situacao_cadastral: response.data.situacao_cadastral,
          data_inscricao: response.data.data_inscricao,
          digito_verificador: response.data.digito_verificador,
          data_emissao: response.data.data_emissao,
          codigo_controle: response.data.codigo_controle
        });
        setReceitaData(response.data);
        return response.data;
      } else {
        const errorMsg = response.error || 'CPF não encontrado na Receita Federal';
        console.warn('⚠️ [RECEITA_FEDERAL] CPF não encontrado:', errorMsg);
        setError(errorMsg);
        setReceitaData(null);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [RECEITA_FEDERAL] Erro na API:', error);
      setError(errorMessage);
      setReceitaData(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar dados da Receita Federal
  const createReceita = useCallback(async (data: Omit<BaseReceita, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [RECEITA_FEDERAL] Criando dados da Receita:', data);
      
      // Garantir que data_inscricao seja uma string válida ou null
      const sanitizedData = {
        ...data,
        data_inscricao: data.data_inscricao || null,
        data_emissao: data.data_emissao || null,
        situacao_cadastral: data.situacao_cadastral || null,
        digito_verificador: data.digito_verificador || null,
        codigo_controle: data.codigo_controle || null,
        qr_link: data.qr_link || null
      };
      
      const response = await baseReceitaService.create(sanitizedData);

      if (response.success) {
        console.log('✅ [RECEITA_FEDERAL] Dados criados com sucesso');
        toast.success('Dados da Receita Federal cadastrados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar dados da Receita Federal';
        console.warn('⚠️ [RECEITA_FEDERAL] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [RECEITA_FEDERAL] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar dados da Receita Federal
  const updateReceita = useCallback(async (id: number, data: Partial<Omit<BaseReceita, 'id' | 'cpf' | 'created_at' | 'updated_at'>>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [RECEITA_FEDERAL] Atualizando dados:', { id, data });
      
      const response = await baseReceitaService.update(id, data);

      if (response.success) {
        console.log('✅ [RECEITA_FEDERAL] Dados atualizados com sucesso');
        toast.success('Dados da Receita Federal atualizados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar dados da Receita Federal';
        console.warn('⚠️ [RECEITA_FEDERAL] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [RECEITA_FEDERAL] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Excluir dados da Receita Federal
  const deleteReceita = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [RECEITA_FEDERAL] Excluindo dados:', id);
      
      const response = await baseReceitaService.delete(id);

      if (response.success) {
        console.log('✅ [RECEITA_FEDERAL] Dados excluídos com sucesso');
        toast.success('Dados da Receita Federal excluídos com sucesso');
        setReceitaData(null);
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir dados da Receita Federal';
        console.warn('⚠️ [RECEITA_FEDERAL] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [RECEITA_FEDERAL] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Limpar dados
  const clearData = useCallback(() => {
    setReceitaData(null);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    receitaData,
    
    // Ações
    getReceitaByCpf,
    createReceita,
    updateReceita,
    deleteReceita,
    clearError,
    clearData,
    
    // Utilidades
    formatDataInscricao: (date: string) => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('pt-BR');
    },
    formatDataEmissao: (date: string) => {
      if (!date) return '-';
      return new Date(date).toLocaleString('pt-BR');
    },
    getSituacaoColor: (situacao: string) => {
      switch (situacao?.toLowerCase()) {
        case 'regular':
          return 'text-green-600 dark:text-green-400';
        case 'irregular':
          return 'text-red-600 dark:text-red-400';
        case 'pendente':
          return 'text-yellow-600 dark:text-yellow-400';
        default:
          return 'text-gray-600 dark:text-gray-400';
      }
    }
  };
};