import { useState, useCallback } from 'react';
import { baseEnderecoService, BaseEndereco, CreateBaseEndereco, UpdateBaseEndereco } from '@/services/baseEnderecoService';
import { toast } from 'sonner';

// Re-export types for convenience
export type { BaseEndereco, CreateBaseEndereco, UpdateBaseEndereco } from '@/services/baseEnderecoService';

export const useBaseEndereco = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enderecos, setEnderecos] = useState<BaseEndereco[]>([]);

  const getEnderecosByCpfId = useCallback(async (cpfId: number): Promise<BaseEndereco[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_ENDERECO] Buscando endereços para CPF ID:', cpfId);
      
      const response = await baseEnderecoService.getByCpfId(cpfId);

      if (response.success && response.data) {
        console.log('✅ [BASE_ENDERECO] Endereços encontrados:', response.data);
        setEnderecos(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_ENDERECO] Endereços não encontrados:', response.error);
        setEnderecos([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_ENDERECO] Erro na API:', error);
      setError(errorMessage);
      setEnderecos([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEndereco = useCallback(async (data: CreateBaseEndereco): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_ENDERECO] Criando endereço:', data);
      
      const response = await baseEnderecoService.create(data);

      if (response.success) {
        console.log('✅ [BASE_ENDERECO] Endereço criado com sucesso');
        toast.success('Endereço cadastrado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar endereço';
        console.warn('⚠️ [BASE_ENDERECO] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_ENDERECO] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEndereco = useCallback(async (id: number, data: UpdateBaseEndereco): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_ENDERECO] Atualizando endereço:', { id, data });
      
      const response = await baseEnderecoService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_ENDERECO] Endereço atualizado com sucesso');
        toast.success('Endereço atualizado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar endereço';
        console.warn('⚠️ [BASE_ENDERECO] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_ENDERECO] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteEndereco = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_ENDERECO] Excluindo endereço:', id);
      
      const response = await baseEnderecoService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_ENDERECO] Endereço excluído com sucesso');
        toast.success('Endereço excluído com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir endereço';
        console.warn('⚠️ [BASE_ENDERECO] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_ENDERECO] Erro na API:', error);
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
    setEnderecos([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    enderecos,
    
    // Ações
    getEnderecosByCpfId,
    createEndereco,
    updateEndereco,
    deleteEndereco,
    clearError,
    clearData
  };
};