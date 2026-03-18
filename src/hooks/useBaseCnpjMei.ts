import { useState, useCallback } from 'react';
import { baseCnpjMeiService, BaseCnpjMei, CreateBaseCnpjMei } from '@/services/baseCnpjMeiService';
import { toast } from 'sonner';

export const useBaseCnpjMei = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cnpjMeis, setCnpjMeis] = useState<BaseCnpjMei[]>([]);

  const getCnpjMeisByCpfId = useCallback(async (cpfId: number): Promise<BaseCnpjMei[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CNPJ_MEI] Buscando dados para CPF ID:', cpfId);
      
      const response = await baseCnpjMeiService.getByCpfId(cpfId);
      
      if (response.success && response.data) {
        console.log('✅ [BASE_CNPJ_MEI] Dados encontrados:', response.data);
        setCnpjMeis(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_CNPJ_MEI] Dados não encontrados:', response.error);
        setCnpjMeis([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CNPJ_MEI] Erro na API:', error);
      setError(errorMessage);
      setCnpjMeis([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCnpjMei = useCallback(async (data: CreateBaseCnpjMei): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CNPJ_MEI] Criando dados:', data);
      
      const response = await baseCnpjMeiService.create(data);

      if (response.success) {
        console.log('✅ [BASE_CNPJ_MEI] Dados criados com sucesso');
        toast.success('Dados CNPJ MEI cadastrados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar dados CNPJ MEI';
        console.warn('⚠️ [BASE_CNPJ_MEI] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CNPJ_MEI] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCnpjMei = useCallback(async (id: number, data: Partial<CreateBaseCnpjMei>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CNPJ_MEI] Atualizando dados:', { id, data });
      
      const response = await baseCnpjMeiService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_CNPJ_MEI] Dados atualizados com sucesso');
        toast.success('Dados CNPJ MEI atualizados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar dados CNPJ MEI';
        console.warn('⚠️ [BASE_CNPJ_MEI] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CNPJ_MEI] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCnpjMei = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_CNPJ_MEI] Excluindo dados:', id);
      
      const response = await baseCnpjMeiService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_CNPJ_MEI] Dados excluídos com sucesso');
        toast.success('Dados CNPJ MEI excluídos com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir dados CNPJ MEI';
        console.warn('⚠️ [BASE_CNPJ_MEI] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_CNPJ_MEI] Erro na API:', error);
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
    setCnpjMeis([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    cnpjMeis,
    
    // Ações
    getCnpjMeisByCpfId,
    createCnpjMei,
    updateCnpjMei,
    deleteCnpjMei,
    clearError,
    clearData
  };
};