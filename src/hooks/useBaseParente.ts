import { useState } from 'react';
import { baseParenteService, BaseParente, CreateBaseParente, UpdateBaseParente } from '@/services/baseParenteService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errorMessages';
import { baseCpfService } from '@/services/baseCpfService';

export const useBaseParente = () => {
  const [loading, setLoading] = useState(false);

  const getParentesByCpfId = async (cpfId: number): Promise<BaseParente[]> => {
    setLoading(true);
    console.info('[Parentes][Hook] getParentesByCpfId -> cpfId:', cpfId);
    try {
      const response = await baseParenteService.getByCpfId(cpfId);
      console.info('[Parentes][Hook] API response:', response);

      if (response.success) {
        // Formato esperado: { success: true, data: { data: BaseParente[], total: number } }
        const responseData: any = response.data;
        
        if (responseData && Array.isArray(responseData.data)) {
          console.info('[Parentes][Hook] Formato 1: data.data array -', responseData.data.length, 'registros');
          return responseData.data as BaseParente[];
        }
        
        if (Array.isArray(responseData)) {
          console.info('[Parentes][Hook] Formato 2: data direto como array -', responseData.length, 'registros');
          return responseData as BaseParente[];
        }
        
        console.warn('[Parentes][Hook] Formato inesperado de data:', responseData);
        return [];
      } else {
        console.error('[Parentes][Hook] API error:', response.error || response.message);
        toast.error(`Erro ao buscar parentes: ${response.error || response.message || 'Erro desconhecido'}`);
        return [];
      }
    } catch (error) {
      console.error('[Parentes][Hook] Erro ao buscar parentes:', error);
      toast.error(`Erro ao buscar parentes: ${getErrorMessage(error)}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createParente = async (data: CreateBaseParente): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await baseParenteService.create(data);
      if (response.success) {
        toast.success('Parente adicionado com sucesso');
        return true;
      } else {
        toast.error(response.error || 'Erro ao adicionar parente');
        return false;
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateParente = async (id: number, data: UpdateBaseParente): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await baseParenteService.update(id, data);
      if (response.success) {
        toast.success('Parente atualizado com sucesso');
        return true;
      } else {
        toast.error(response.error || 'Erro ao atualizar parente');
        return false;
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteParente = async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await baseParenteService.delete(id);
      if (response.success) {
        toast.success('Parente deletado com sucesso');
        return true;
      } else {
        toast.error(response.error || 'Erro ao deletar parente');
        return false;
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getParentesByCpfId,
    createParente,
    updateParente,
    deleteParente
  };
};
