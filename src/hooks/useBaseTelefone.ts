import { useState, useCallback } from 'react';
import { baseTelefoneService, BaseTelefone, CreateBaseTelefone, UpdateBaseTelefone } from '@/services/baseTelefoneService';
import { toast } from 'sonner';

export const useBaseTelefone = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telefones, setTelefones] = useState<BaseTelefone[]>([]);

  const getTelefonesByCpfId = useCallback(async (cpfId: number): Promise<BaseTelefone[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_TELEFONE] Buscando telefones para CPF ID:', cpfId);
      
      const response = await baseTelefoneService.getByCpfId(cpfId);

      if (response.success && response.data) {
        console.log('✅ [BASE_TELEFONE] Telefones encontrados:', response.data);
        setTelefones(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_TELEFONE] Telefones não encontrados:', response.error);
        setTelefones([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_TELEFONE] Erro na API:', error);
      setError(errorMessage);
      setTelefones([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTelefone = useCallback(async (data: CreateBaseTelefone): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_TELEFONE] Criando telefone:', data);
      
      const response = await baseTelefoneService.create(data);

      if (response.success) {
        console.log('✅ [BASE_TELEFONE] Telefone criado com sucesso');
        toast.success('Telefone cadastrado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar telefone';
        console.warn('⚠️ [BASE_TELEFONE] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_TELEFONE] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTelefone = useCallback(async (id: number, data: UpdateBaseTelefone): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_TELEFONE] Atualizando telefone:', { id, data });
      
      const response = await baseTelefoneService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_TELEFONE] Telefone atualizado com sucesso');
        toast.success('Telefone atualizado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar telefone';
        console.warn('⚠️ [BASE_TELEFONE] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_TELEFONE] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTelefone = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_TELEFONE] Excluindo telefone:', id);
      
      const response = await baseTelefoneService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_TELEFONE] Telefone excluído com sucesso');
        toast.success('Telefone excluído com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir telefone';
        console.warn('⚠️ [BASE_TELEFONE] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_TELEFONE] Erro na API:', error);
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
    setTelefones([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    telefones,
    
    // Ações
    getTelefonesByCpfId,
    createTelefone,
    updateTelefone,
    deleteTelefone,
    clearError,
    clearData,
    
    // Utilidades
    getTipoColor: (tipo: string) => {
      switch (tipo) {
        case 'WhatsApp':
          return 'text-green-600 dark:text-green-400';
        case 'Celular':
          return 'text-blue-600 dark:text-blue-400';
        case 'Comercial':
          return 'text-purple-600 dark:text-purple-400';
        case 'Residencial':
          return 'text-orange-600 dark:text-orange-400';
        default:
          return 'text-gray-600 dark:text-gray-400';
      }
    }
  };
};