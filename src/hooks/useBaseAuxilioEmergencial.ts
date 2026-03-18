import { useState, useCallback } from 'react';
import { baseAuxilioEmergencialService, BaseAuxilioEmergencial, CreateBaseAuxilioEmergencial } from '@/services/baseAuxilioEmergencialService';
import { toast } from 'sonner';

export const useBaseAuxilioEmergencial = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auxiliosEmergenciais, setAuxiliosEmergenciais] = useState<BaseAuxilioEmergencial[]>([]);

  const getAuxiliosEmergenciaisByCpfId = useCallback(async (cpfId: number): Promise<BaseAuxilioEmergencial[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_AUXILIO_EMERGENCIAL] Buscando dados para CPF ID:', cpfId);
      
      const response = await baseAuxilioEmergencialService.getByCpfId(cpfId);
      
      if (response.success && response.data) {
        console.log('✅ [BASE_AUXILIO_EMERGENCIAL] Dados encontrados:', response.data);
        setAuxiliosEmergenciais(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_AUXILIO_EMERGENCIAL] Dados não encontrados:', response.error);
        setAuxiliosEmergenciais([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_AUXILIO_EMERGENCIAL] Erro na API:', error);
      setError(errorMessage);
      setAuxiliosEmergenciais([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAuxilioEmergencial = useCallback(async (data: CreateBaseAuxilioEmergencial): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_AUXILIO_EMERGENCIAL] Criando dados:', data);
      
      const response = await baseAuxilioEmergencialService.create(data);

      if (response.success) {
        console.log('✅ [BASE_AUXILIO_EMERGENCIAL] Dados criados com sucesso');
        toast.success('Dados de auxílio emergencial cadastrados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar dados de auxílio emergencial';
        console.warn('⚠️ [BASE_AUXILIO_EMERGENCIAL] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_AUXILIO_EMERGENCIAL] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAuxilioEmergencial = useCallback(async (id: number, data: Partial<CreateBaseAuxilioEmergencial>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_AUXILIO_EMERGENCIAL] Atualizando dados:', { id, data });
      
      const response = await baseAuxilioEmergencialService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_AUXILIO_EMERGENCIAL] Dados atualizados com sucesso');
        toast.success('Dados de auxílio emergencial atualizados com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar dados de auxílio emergencial';
        console.warn('⚠️ [BASE_AUXILIO_EMERGENCIAL] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_AUXILIO_EMERGENCIAL] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAuxilioEmergencial = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_AUXILIO_EMERGENCIAL] Excluindo dados:', id);
      
      const response = await baseAuxilioEmergencialService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_AUXILIO_EMERGENCIAL] Dados excluídos com sucesso');
        toast.success('Dados de auxílio emergencial excluídos com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir dados de auxílio emergencial';
        console.warn('⚠️ [BASE_AUXILIO_EMERGENCIAL] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_AUXILIO_EMERGENCIAL] Erro na API:', error);
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
    setAuxiliosEmergenciais([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    auxiliosEmergenciais,
    
    // Ações
    getAuxiliosEmergenciaisByCpfId,
    createAuxilioEmergencial,
    updateAuxilioEmergencial,
    deleteAuxilioEmergencial,
    clearError,
    clearData
  };
};