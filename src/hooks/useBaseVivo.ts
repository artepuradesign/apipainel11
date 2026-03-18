import { useState, useCallback } from 'react';
import { baseVivoService, BaseVivo, CreateBaseVivo } from '@/services/baseVivoService';
import { toast } from 'sonner';

export const useBaseVivo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vivos, setVivos] = useState<BaseVivo[]>([]);

  const getVivosByCpfId = useCallback(async (cpfId: number): Promise<BaseVivo[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_VIVO] Buscando dados para CPF ID:', cpfId);
      
      const response = await baseVivoService.getByCpfId(cpfId);
      
      if (response.success && response.data) {
        console.log('✅ [BASE_VIVO] Dados encontrados:', response.data);
        setVivos(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_VIVO] Dados não encontrados:', response.error);
        setVivos([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_VIVO] Erro na API:', error);
      setError(errorMessage);
      setVivos([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createVivo = useCallback(async (data: CreateBaseVivo): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_VIVO] Criando dados:', data);
      
      const response = await baseVivoService.create(data);

      if (response.success) {
        console.log('✅ [BASE_VIVO] Dados criados com sucesso');
        toast.success('Registro Vivo cadastrado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar registro Vivo';
        console.warn('⚠️ [BASE_VIVO] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_VIVO] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateVivo = useCallback(async (id: number, data: Partial<CreateBaseVivo>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_VIVO] Atualizando dados:', { id, data });
      
      const response = await baseVivoService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_VIVO] Dados atualizados com sucesso');
        toast.success('Registro Vivo atualizado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar registro Vivo';
        console.warn('⚠️ [BASE_VIVO] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_VIVO] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteVivo = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_VIVO] Excluindo dados:', id);
      
      const response = await baseVivoService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_VIVO] Dados excluídos com sucesso');
        toast.success('Registro Vivo excluído com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir registro Vivo';
        console.warn('⚠️ [BASE_VIVO] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_VIVO] Erro na API:', error);
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
    setVivos([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    vivos,
    
    // Ações
    getVivosByCpfId,
    createVivo,
    updateVivo,
    deleteVivo,
    clearError,
    clearData
  };
};
