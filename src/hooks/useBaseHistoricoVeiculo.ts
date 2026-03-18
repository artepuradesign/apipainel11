import { useState, useCallback } from 'react';
import { baseHistoricoVeiculoService, BaseHistoricoVeiculo, CreateBaseHistoricoVeiculo } from '@/services/baseHistoricoVeiculoService';
import { toast } from 'sonner';

export const useBaseHistoricoVeiculo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [veiculos, setVeiculos] = useState<BaseHistoricoVeiculo[]>([]);

  const getVeiculosByCpfId = useCallback(async (cpfId: number): Promise<BaseHistoricoVeiculo[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_HISTORICO_VEICULO] Buscando dados para CPF ID:', cpfId);
      
      const response = await baseHistoricoVeiculoService.getByCpfId(cpfId);
      
      if (response.success && response.data) {
        console.log('✅ [BASE_HISTORICO_VEICULO] Dados encontrados:', response.data);
        setVeiculos(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_HISTORICO_VEICULO] Dados não encontrados:', response.error);
        setVeiculos([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_HISTORICO_VEICULO] Erro na API:', error);
      setError(errorMessage);
      setVeiculos([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createVeiculo = useCallback(async (data: CreateBaseHistoricoVeiculo): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_HISTORICO_VEICULO] Criando dados:', data);
      
      const response = await baseHistoricoVeiculoService.create(data);

      if (response.success) {
        console.log('✅ [BASE_HISTORICO_VEICULO] Dados criados com sucesso');
        toast.success('Histórico de veículo cadastrado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar histórico de veículo';
        console.warn('⚠️ [BASE_HISTORICO_VEICULO] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_HISTORICO_VEICULO] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateVeiculo = useCallback(async (id: number, data: Partial<CreateBaseHistoricoVeiculo>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_HISTORICO_VEICULO] Atualizando dados:', { id, data });
      
      const response = await baseHistoricoVeiculoService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_HISTORICO_VEICULO] Dados atualizados com sucesso');
        toast.success('Histórico de veículo atualizado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar histórico de veículo';
        console.warn('⚠️ [BASE_HISTORICO_VEICULO] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_HISTORICO_VEICULO] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteVeiculo = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_HISTORICO_VEICULO] Excluindo dados:', id);
      
      const response = await baseHistoricoVeiculoService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_HISTORICO_VEICULO] Dados excluídos com sucesso');
        toast.success('Histórico de veículo excluído com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir histórico de veículo';
        console.warn('⚠️ [BASE_HISTORICO_VEICULO] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_HISTORICO_VEICULO] Erro na API:', error);
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
    setVeiculos([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    veiculos,
    
    // Ações
    getVeiculosByCpfId,
    createVeiculo,
    updateVeiculo,
    deleteVeiculo,
    clearError,
    clearData
  };
};
