import { useState } from 'react';
import { toast } from 'sonner';
import { baseReceitaService, BaseReceita } from '@/services/baseReceitaService';
import { getErrorMessage, getSuccessMessage } from '@/utils/errorMessages';

export const useBaseReceita = () => {
  const [loading, setLoading] = useState(false);

  const createReceita = async (data: Omit<BaseReceita, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const response = await baseReceitaService.create(data);
      
      if (response.success) {
        toast.success(response.message || 'Dados da Receita Federal cadastrados com sucesso');
        return true;
      } else {
        toast.error(response.error || 'Erro ao cadastrar dados da Receita Federal');
        return false;
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateReceita = async (id: number, data: Partial<BaseReceita>) => {
    setLoading(true);
    try {
      const response = await baseReceitaService.update(id, data);
      
      if (response.success) {
        toast.success(response.message || 'Dados da Receita Federal atualizados com sucesso');
        return true;
      } else {
        toast.error(response.error || 'Erro ao atualizar dados da Receita Federal');
        return false;
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteReceita = async (id: number) => {
    setLoading(true);
    try {
      const response = await baseReceitaService.delete(id);
      
      if (response.success) {
        toast.success(response.message || 'Dados da Receita Federal excluídos com sucesso');
        return true;
      } else {
        toast.error(response.error || 'Erro ao excluir dados da Receita Federal');
        return false;
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getReceitaByCpf = async (cpf: string) => {
    setLoading(true);
    try {
      const response = await baseReceitaService.getByCpf(cpf);
      
      if (response.success) {
        return response.data;
      } else {
        console.warn('Dados da Receita Federal não encontrados:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar dados da Receita Federal:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createReceita,
    updateReceita,
    deleteReceita,
    getReceitaByCpf
  };
};