import { useState, useCallback } from 'react';
import { baseClaroService, BaseClaro, CreateBaseClaro } from '@/services/baseClaroService';
import { toast } from 'sonner';

export const useBaseClaro = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claros, setClaros] = useState<BaseClaro[]>([]);

  const getClarosByCpfId = useCallback(async (cpfId: number): Promise<BaseClaro[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CLARO] Buscando dados para CPF ID:', cpfId);
      
      const response = await baseClaroService.getByCpfId(cpfId);
      
      if (response.success && response.data) {
        console.log('✅ [BASE_CLARO] Dados encontrados:', response.data);
        setClaros(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_CLARO] Dados não encontrados:', response.error);
        setClaros([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CLARO] Erro na API:', error);
      setError(errorMessage);
      setClaros([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createClaro = useCallback(async (data: CreateBaseClaro): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CLARO] Criando dados:', data);
      
      const response = await baseClaroService.create(data);

      if (response.success) {
        console.log('✅ [BASE_CLARO] Dados criados com sucesso');
        toast.success('Registro Claro cadastrado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar registro Claro';
        console.warn('⚠️ [BASE_CLARO] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CLARO] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateClaro = useCallback(async (id: number, data: Partial<CreateBaseClaro>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CLARO] Atualizando dados:', { id, data });
      
      const response = await baseClaroService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_CLARO] Dados atualizados com sucesso');
        toast.success('Registro Claro atualizado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar registro Claro';
        console.warn('⚠️ [BASE_CLARO] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CLARO] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteClaro = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CLARO] Excluindo dados:', id);
      
      const response = await baseClaroService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_CLARO] Dados excluídos com sucesso');
        toast.success('Registro Claro excluído com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir registro Claro';
        console.warn('⚠️ [BASE_CLARO] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CLARO] Erro na API:', error);
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
    setClaros([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    claros,
    
    // Ações
    getClarosByCpfId,
    createClaro,
    updateClaro,
    deleteClaro,
    clearError,
    clearData
  };
};
