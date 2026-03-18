import { useState, useCallback } from 'react';
import { baseDividasAtivasService, BaseDividasAtivas, CreateBaseDividasAtivas } from '@/services/baseDividasAtivasService';
import { toast } from 'sonner';

export const useBaseDividasAtivas = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dividasAtivas, setDividasAtivas] = useState<BaseDividasAtivas[]>([]);

  const getDividasAtivasByCpf = useCallback(async (cpf: string): Promise<BaseDividasAtivas[]> => {
    if (!cpf) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_DIVIDAS_ATIVAS] Buscando dados para CPF:', cpf);
      
      const response = await baseDividasAtivasService.getByCpf(cpf);
      
      if (response.success && response.data) {
        console.log('✅ [BASE_DIVIDAS_ATIVAS] Dados encontrados:', response.data);
        setDividasAtivas(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_DIVIDAS_ATIVAS] Dados não encontrados:', response.error);
        setDividasAtivas([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_DIVIDAS_ATIVAS] Erro na API:', error);
      setError(errorMessage);
      setDividasAtivas([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDividasAtivas = useCallback(async (data: CreateBaseDividasAtivas): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_DIVIDAS_ATIVAS] Criando dados:', data);
      
      const response = await baseDividasAtivasService.create(data);

      if (response.success) {
        console.log('✅ [BASE_DIVIDAS_ATIVAS] Dados criados com sucesso');
        toast.success('Dados de dívidas ativas cadastrados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar dados de dívidas ativas';
        console.warn('⚠️ [BASE_DIVIDAS_ATIVAS] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_DIVIDAS_ATIVAS] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDividasAtivas = useCallback(async (id: number, data: Partial<CreateBaseDividasAtivas>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_DIVIDAS_ATIVAS] Atualizando dados:', { id, data });
      
      const response = await baseDividasAtivasService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_DIVIDAS_ATIVAS] Dados atualizados com sucesso');
        toast.success('Dados de dívidas ativas atualizados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar dados de dívidas ativas';
        console.warn('⚠️ [BASE_DIVIDAS_ATIVAS] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_DIVIDAS_ATIVAS] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDividasAtivas = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_DIVIDAS_ATIVAS] Excluindo dados:', id);
      
      const response = await baseDividasAtivasService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_DIVIDAS_ATIVAS] Dados excluídos com sucesso');
        toast.success('Dados de dívidas ativas excluídos com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir dados de dívidas ativas';
        console.warn('⚠️ [BASE_DIVIDAS_ATIVAS] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_DIVIDAS_ATIVAS] Erro na API:', error);
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
    setDividasAtivas([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    dividasAtivas,
    
    // Ações
    getDividasAtivasByCpf,
    createDividasAtivas,
    updateDividasAtivas,
    deleteDividasAtivas,
    clearError,
    clearData
  };
};