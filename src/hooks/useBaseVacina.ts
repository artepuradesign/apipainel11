import { useState, useCallback } from 'react';
import { baseVacinaService, BaseVacina, CreateBaseVacina, UpdateBaseVacina } from '@/services/baseVacinaService';
import { toast } from 'sonner';

// Re-export types for convenience
export type { BaseVacina, CreateBaseVacina, UpdateBaseVacina } from '@/services/baseVacinaService';

export const useBaseVacina = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vacinas, setVacinas] = useState<BaseVacina[]>([]);

  const getVacinasByCpfId = useCallback(async (cpfId: number): Promise<BaseVacina[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_VACINA] Buscando dados para CPF ID:', cpfId);
      
      const response = await baseVacinaService.getByCpfId(cpfId);

      if (response.success && response.data) {
        console.log('✅ [BASE_VACINA] Dados encontrados:', response.data);
        setVacinas(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_VACINA] Dados não encontrados:', response.error);
        setVacinas([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_VACINA] Erro na API:', error);
      setError(errorMessage);
      setVacinas([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createVacina = useCallback(async (data: CreateBaseVacina): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_VACINA] Criando dados:', data);
      
      // Validar se há dados mínimos antes de enviar
      const hasValidData = Object.values(data).some(value => {
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        return value !== null && value !== undefined;
      });

      if (!hasValidData) {
        console.warn('⚠️ [BASE_VACINA] Nenhum dado válido para criar');
        return false;
      }
      
      const response = await baseVacinaService.create(data);

      if (response.success) {
        console.log('✅ [BASE_VACINA] Dados criados com sucesso');
        toast.success('Dados de vacina cadastrados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar dados de vacina';
        console.warn('⚠️ [BASE_VACINA] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_VACINA] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateVacina = useCallback(async (id: number, data: UpdateBaseVacina): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_VACINA] Atualizando dados:', { id, data });
      
      const response = await baseVacinaService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_VACINA] Dados atualizados com sucesso');
        toast.success('Dados de vacina atualizados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar dados de vacina';
        console.warn('⚠️ [BASE_VACINA] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_VACINA] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteVacina = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_VACINA] Excluindo dados:', id);
      
      const response = await baseVacinaService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_VACINA] Dados excluídos com sucesso');
        toast.success('Dados de vacina excluídos com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir dados de vacina';
        console.warn('⚠️ [BASE_VACINA] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_VACINA] Erro na API:', error);
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
    setVacinas([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    vacinas,
    
    // Ações
    getVacinasByCpfId,
    createVacina,
    updateVacina,
    deleteVacina,
    clearError,
    clearData
  };
};