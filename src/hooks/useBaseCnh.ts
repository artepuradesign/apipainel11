import { useState, useCallback } from 'react';
import { baseCnhService, BaseCnh, CreateBaseCnh } from '@/services/baseCnhService';
import { toast } from 'sonner';

export const useBaseCnh = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cnhs, setCnhs] = useState<BaseCnh[]>([]);

  const getCnhsByCpfId = useCallback(async (cpfId: number): Promise<BaseCnh[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CNH] Buscando CNHs para CPF ID:', cpfId);
      
      const response = await baseCnhService.getByCpfId(cpfId);

      if (response.success && response.data) {
        console.log('✅ [BASE_CNH] CNHs encontradas:', response.data);
        setCnhs(response.data);
        return response.data;
      } else {
        const errorMsg = response.error || 'Erro ao buscar CNHs';
        console.warn('⚠️ [BASE_CNH] Erro ao buscar CNHs:', errorMsg);
        setError(errorMsg);
        setCnhs([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CNH] Erro na API:', error);
      setError(errorMessage);
      setCnhs([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCnh = useCallback(async (data: CreateBaseCnh): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CNH] Criando CNH:', data);
      
      const response = await baseCnhService.create(data);

      if (response.success) {
        console.log('✅ [BASE_CNH] CNH criada:', response.data);
        toast.success('CNH cadastrada com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao criar CNH';
        console.warn('⚠️ [BASE_CNH] Erro ao criar CNH:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CNH] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCnh = useCallback(async (id: number, data: Partial<BaseCnh>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CNH] Atualizando CNH:', { id, data });
      
      const response = await baseCnhService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_CNH] CNH atualizada:', response.data);
        toast.success('CNH atualizada com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar CNH';
        console.warn('⚠️ [BASE_CNH] Erro ao atualizar CNH:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CNH] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCnh = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CNH] Deletando CNH:', id);
      
      const response = await baseCnhService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_CNH] CNH deletada');
        toast.success('CNH deletada com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao deletar CNH';
        console.warn('⚠️ [BASE_CNH] Erro ao deletar CNH:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CNH] Erro na API:', error);
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

  return {
    // Estado
    isLoading,
    error,
    cnhs,
    
    // Ações
    getCnhsByCpfId,
    createCnh,
    updateCnh,
    deleteCnh,
    clearError
  };
};