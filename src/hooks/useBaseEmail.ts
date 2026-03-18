import { useState, useCallback } from 'react';
import { baseEmailService, BaseEmail, CreateBaseEmail, UpdateBaseEmail } from '@/services/baseEmailService';
import { toast } from 'sonner';

export const useBaseEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emails, setEmails] = useState<BaseEmail[]>([]);

  const getEmailsByCpfId = useCallback(async (cpfId: number): Promise<BaseEmail[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_EMAIL] Buscando emails para CPF ID:', cpfId);
      
      const response = await baseEmailService.getByCpfId(cpfId);

      if (response.success && response.data) {
        console.log('✅ [BASE_EMAIL] Emails encontrados:', response.data);
        setEmails(response.data);
        return response.data;
      } else {
        console.warn('⚠️ [BASE_EMAIL] Emails não encontrados:', response.error);
        setEmails([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_EMAIL] Erro na API:', error);
      setError(errorMessage);
      setEmails([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEmail = useCallback(async (data: CreateBaseEmail): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_EMAIL] Criando email:', data);
      
      const response = await baseEmailService.create(data);

      if (response.success) {
        console.log('✅ [BASE_EMAIL] Email criado com sucesso');
        toast.success('Email cadastrado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao cadastrar email';
        console.warn('⚠️ [BASE_EMAIL] Erro ao criar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_EMAIL] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEmail = useCallback(async (id: number, data: UpdateBaseEmail): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_EMAIL] Atualizando email:', { id, data });
      
      const response = await baseEmailService.update(id, data);

      if (response.success) {
        console.log('✅ [BASE_EMAIL] Email atualizado com sucesso');
        toast.success('Email atualizado com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar email';
        console.warn('⚠️ [BASE_EMAIL] Erro ao atualizar:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_EMAIL] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteEmail = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_EMAIL] Excluindo email:', id);
      
      const response = await baseEmailService.delete(id);

      if (response.success) {
        console.log('✅ [BASE_EMAIL] Email excluído com sucesso');
        toast.success('Email excluído com sucesso');
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao excluir email';
        console.warn('⚠️ [BASE_EMAIL] Erro ao excluir:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [BASE_EMAIL] Erro na API:', error);
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
    setEmails([]);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    emails,
    
    // Ações
    getEmailsByCpfId,
    createEmail,
    updateEmail,
    deleteEmail,
    clearError,
    clearData,
    
    // Utilidades
    getTipoColor: (tipo: string) => {
      switch (tipo) {
        case 'Pessoal':
          return 'text-green-600 dark:text-green-400';
        case 'Comercial':
          return 'text-blue-600 dark:text-blue-400';
        case 'Corporativo':
          return 'text-purple-600 dark:text-purple-400';
        default:
          return 'text-gray-600 dark:text-gray-400';
      }
    }
  };
};