import { useState } from 'react';
import { baseEmpresaSocioService, BaseEmpresaSocio, CreateBaseEmpresaSocio, UpdateBaseEmpresaSocio } from '@/services/baseEmpresaSocioService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errorMessages';

export const useBaseEmpresaSocio = () => {
  const [loading, setLoading] = useState(false);

  const getEmpresasSocioByCpfId = async (cpfId: number): Promise<BaseEmpresaSocio[]> => {
    setLoading(true);
    console.info('[EmpresaSocio][Hook] getEmpresasSocioByCpfId -> cpfId:', cpfId);
    try {
      const response = await baseEmpresaSocioService.getByCpfId(cpfId);
      console.info('[EmpresaSocio][Hook] API response:', response);
      
      if (response.success) {
        const responseData = response.data;
        // Formato esperado: { success: true, data: { data: BaseEmpresaSocio[], total: number } }
        // ou { success: true, data: BaseEmpresaSocio[] }
        if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
          console.info('[EmpresaSocio][Hook] Formato 1: data.data array -', responseData.data.length, 'registros');
          return responseData.data as BaseEmpresaSocio[];
        } else if (Array.isArray(responseData)) {
          console.info('[EmpresaSocio][Hook] Formato 2: data direto como array -', responseData.length, 'registros');
          return responseData as BaseEmpresaSocio[];
        }
        console.warn('[EmpresaSocio][Hook] Formato inesperado de data:', responseData);
      } else {
        const errorMsg = response.error || response.message || 'Erro desconhecido';
        console.error('[EmpresaSocio][Hook] API error:', errorMsg);
        toast.error(`Erro ao buscar empresas sócio: ${errorMsg}`);
      }
      return [];
    } catch (error) {
      console.error('[EmpresaSocio][Hook] Erro ao buscar empresas sócio:', error);
      toast.error(`Erro ao buscar empresas sócio: ${getErrorMessage(error)}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createEmpresaSocio = async (data: CreateBaseEmpresaSocio): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await baseEmpresaSocioService.create(data);
      if (response.success) {
        toast.success('Empresa sócio adicionada com sucesso');
        return true;
      } else {
        toast.error(response.error || 'Erro ao adicionar empresa sócio');
        return false;
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateEmpresaSocio = async (id: number, data: UpdateBaseEmpresaSocio): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await baseEmpresaSocioService.update(id, data);
      if (response.success) {
        toast.success('Empresa sócio atualizada com sucesso');
        return true;
      } else {
        toast.error(response.error || 'Erro ao atualizar empresa sócio');
        return false;
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmpresaSocio = async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await baseEmpresaSocioService.delete(id);
      if (response.success) {
        toast.success('Empresa sócio deletada com sucesso');
        return true;
      } else {
        toast.error(response.error || 'Erro ao deletar empresa sócio');
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
    getEmpresasSocioByCpfId,
    createEmpresaSocio,
    updateEmpresaSocio,
    deleteEmpresaSocio
  };
};
