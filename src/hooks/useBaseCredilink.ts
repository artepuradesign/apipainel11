import { useState, useCallback } from 'react';
import { baseCreditinkService, BaseCredilink, CreateBaseCredilink, UpdateBaseCredilink } from '@/services/baseCreditinkService';
import { toast } from 'sonner';

// Re-export types for convenience
export type { BaseCredilink, CreateBaseCredilink, UpdateBaseCredilink } from '@/services/baseCreditinkService';

export const useBaseCredilink = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credilinks, setCredilinks] = useState<BaseCredilink[]>([]);

  const getCreditinksByCpfId = useCallback(async (cpfId: number): Promise<BaseCredilink[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CREDILINK] Buscando dados para CPF ID:', cpfId);
      
      const response = await baseCreditinkService.getByCpfId(cpfId);

      if (response.success && response.data) {
        console.log('✅ [BASE_CREDILINK] Dados encontrados:', response.data);
        setCredilinks(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_CREDILINK] Dados não encontrados:', response.error);
        setCredilinks([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CREDILINK] Erro na API:', error);
      setError(errorMessage);
      setCredilinks([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCredilink = useCallback(async (data: CreateBaseCredilink): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CREDILINK] Criando dados:', data);
      
      // Validar se há dados mínimos antes de enviar
      const hasValidData = Object.values(data).some(value => {
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        if (typeof value === 'number') {
          return value !== 0;
        }
        return value !== null && value !== undefined;
      });

      if (!hasValidData) {
        console.warn('⚠️ [BASE_CREDILINK] Nenhum dado válido para criar');
        return false;
      }
      
      const response = await baseCreditinkService.create(data);

      if (response.success) {
        console.log('✅ [BASE_CREDILINK] Dados criados com sucesso');
        toast.success('Dados Credilink cadastrados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar dados Credilink';
        console.warn('⚠️ [BASE_CREDILINK] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CREDILINK] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCredilink = useCallback(async (id: number, data: UpdateBaseCredilink): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CREDILINK] Atualizando dados:', { id, data });
      
      const response = await baseCreditinkService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_CREDILINK] Dados atualizados com sucesso');
        toast.success('Dados Credilink atualizados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar dados Credilink';
        console.warn('⚠️ [BASE_CREDILINK] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CREDILINK] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCredilink = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CREDILINK] Excluindo dados:', id);
      
      const response = await baseCreditinkService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_CREDILINK] Dados excluídos com sucesso');
        toast.success('Dados Credilink excluídos com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir dados Credilink';
        console.warn('⚠️ [BASE_CREDILINK] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CREDILINK] Erro na API:', error);
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
    setCredilinks([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    credilinks,
    
    // Ações
    getCreditinksByCpfId,
    createCredilink,
    updateCredilink,
    deleteCredilink,
    clearError,
    clearData
  };
};