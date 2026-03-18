import { useState, useCallback } from 'react';
import { baseTimService, BaseTim, CreateBaseTim } from '@/services/baseTimService';
import { toast } from 'sonner';

export const useBaseTim = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tims, setTims] = useState<BaseTim[]>([]);

  const getTimsByCpfId = useCallback(async (cpfId: number): Promise<BaseTim[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_TIM] Buscando dados para CPF ID:', cpfId);
      
      const response = await baseTimService.getByCpfId(cpfId);
      
      if (response.success && response.data) {
        console.log('✅ [BASE_TIM] Dados encontrados:', response.data);
        setTims(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_TIM] Dados não encontrados:', response.error);
        setTims([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_TIM] Erro na API:', error);
      setError(errorMessage);
      setTims([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTim = useCallback(async (data: CreateBaseTim): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_TIM] Criando dados:', data);
      
      const response = await baseTimService.create(data);

      if (response.success) {
        console.log('✅ [BASE_TIM] Dados criados com sucesso');
        toast.success('Registro Tim cadastrado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar registro Tim';
        console.warn('⚠️ [BASE_TIM] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_TIM] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTim = useCallback(async (id: number, data: Partial<CreateBaseTim>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_TIM] Atualizando dados:', { id, data });
      
      const response = await baseTimService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_TIM] Dados atualizados com sucesso');
        toast.success('Registro Tim atualizado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar registro Tim';
        console.warn('⚠️ [BASE_TIM] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_TIM] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTim = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_TIM] Excluindo dados:', id);
      
      const response = await baseTimService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_TIM] Dados excluídos com sucesso');
        toast.success('Registro Tim excluído com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir registro Tim';
        console.warn('⚠️ [BASE_TIM] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_TIM] Erro na API:', error);
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
    setTims([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    tims,
    
    // Ações
    getTimsByCpfId,
    createTim,
    updateTim,
    deleteTim,
    clearError,
    clearData
  };
};
