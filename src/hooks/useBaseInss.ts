import { useState, useCallback } from 'react';
import { baseInssService, BaseInss, CreateBaseInss } from '@/services/baseInssService';
import { toast } from 'sonner';

export const useBaseInss = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inssList, setInssList] = useState<BaseInss[]>([]);

  const getInssByCpfId = useCallback(async (cpfId: number): Promise<BaseInss[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_INSS] Buscando dados para CPF ID:', cpfId);
      
      const response = await baseInssService.getByCpfId(cpfId);
      
      if (response.success && response.data) {
        console.log('✅ [BASE_INSS] Dados encontrados:', response.data);
        setInssList(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_INSS] Dados não encontrados:', response.error);
        setInssList([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_INSS] Erro na API:', error);
      setError(errorMessage);
      setInssList([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getInssByCpf = useCallback(async (cpf: string): Promise<BaseInss[]> => {
    if (!cpf) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_INSS] Buscando dados para CPF:', cpf);
      
      const response = await baseInssService.getByCpf(cpf);
      
      if (response.success && response.data) {
        console.log('✅ [BASE_INSS] Dados encontrados:', response.data);
        setInssList(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_INSS] Dados não encontrados:', response.error);
        setInssList([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_INSS] Erro na API:', error);
      setError(errorMessage);
      setInssList([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createInss = useCallback(async (data: CreateBaseInss): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_INSS] Criando dados:', data);
      
      const response = await baseInssService.create(data);

      if (response.success) {
        console.log('✅ [BASE_INSS] Dados criados com sucesso');
        toast.success('Dados INSS cadastrados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar dados INSS';
        console.warn('⚠️ [BASE_INSS] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_INSS] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateInss = useCallback(async (id: number, data: Partial<CreateBaseInss>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_INSS] Atualizando dados:', { id, data });
      
      const response = await baseInssService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_INSS] Dados atualizados com sucesso');
        toast.success('Dados INSS atualizados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar dados INSS';
        console.warn('⚠️ [BASE_INSS] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_INSS] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteInss = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_INSS] Excluindo dados:', id);
      
      const response = await baseInssService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_INSS] Dados excluídos com sucesso');
        toast.success('Dados INSS excluídos com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir dados INSS';
        console.warn('⚠️ [BASE_INSS] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_INSS] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setInssList([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    inssList,
    
    // Ações
    getInssByCpfId,
    getInssByCpf,
    createInss,
    updateInss,
    deleteInss,
    clearError,
    clearData
  };
};