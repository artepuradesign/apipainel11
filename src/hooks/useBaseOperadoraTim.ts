import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { baseOperadoraTimService, BaseOperadoraTim, CreateBaseOperadoraTim } from '@/services/baseOperadoraTimService';

export const useBaseOperadoraTim = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registros, setRegistros] = useState<BaseOperadoraTim[]>([]);

  const getOperadoraTimByCpfId = useCallback(async (cpfId: number): Promise<BaseOperadoraTim[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('\ud83d\udd04 [BASE_OPERADORA_TIM] Buscando dados para CPF ID:', cpfId);
      const response = await baseOperadoraTimService.getByCpfId(cpfId);

      if (response.success && response.data) {
        setRegistros(response.data);
        return response.data;
      }

      setRegistros([]);
      return [];
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      setError(msg);
      setRegistros([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setRegistros([]);
    setError(null);
  }, []);

  // CRUD mantido por compatibilidade com outras bases
  const createOperadoraTim = useCallback(async (data: CreateBaseOperadoraTim): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await baseOperadoraTimService.create(data);
      if (response.success) {
        toast.success('Operadora TIM cadastrada com sucesso');
        return true;
      }
      const err = response.error || 'Erro ao cadastrar Operadora TIM';
      setError(err);
      toast.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    registros,
    getOperadoraTimByCpfId,
    createOperadoraTim,
    clearData,
  };
};
