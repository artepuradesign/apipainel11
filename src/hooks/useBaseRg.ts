import { useState, useCallback } from 'react';
import { baseRgService, BaseRg, CreateBaseRg } from '@/services/baseRgService';
import { toast } from 'sonner';

export const useBaseRg = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rgs, setRgs] = useState<BaseRg[]>([]);

  const getRgsByCpfId = useCallback(async (cpfId: number): Promise<BaseRg[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_RG] Buscando RGs para CPF ID:', cpfId);
      
      const response = await baseRgService.getByCpfId(cpfId);

      if (response.success && response.data) {
        console.log('✅ [BASE_RG] RGs encontrados:', response.data);
        setRgs(response.data);
        return response.data;
      } else {
        const errorMsg = response.error || 'Erro ao buscar RGs';
        console.warn('⚠️ [BASE_RG] Erro ao buscar RGs:', errorMsg);
        setError(errorMsg);
        setRgs([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_RG] Erro na API:', error);
      setError(errorMessage);
      setRgs([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRg = useCallback(async (data: CreateBaseRg): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_RG] Criando RG:', data);
      
      const response = await baseRgService.create(data);

      if (response.success) {
        console.log('✅ [BASE_RG] RG criado:', response.data);
        toast.success('RG cadastrado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao criar RG';
        console.warn('⚠️ [BASE_RG] Erro ao criar RG:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_RG] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRg = useCallback(async (id: number, data: Partial<BaseRg>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_RG] Atualizando RG:', { id, data });
      
      const response = await baseRgService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_RG] RG atualizado:', response.data);
        toast.success('RG atualizado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar RG';
        console.warn('⚠️ [BASE_RG] Erro ao atualizar RG:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_RG] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteRg = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_RG] Deletando RG:', id);
      
      const response = await baseRgService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_RG] RG deletado');
        toast.success('RG deletado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao deletar RG';
        console.warn('⚠️ [BASE_RG] Erro ao deletar RG:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_RG] Erro na API:', error);
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
    rgs,
    
    // Ações
    getRgsByCpfId,
    createRg,
    updateRg,
    deleteRg,
    clearError
  };
};