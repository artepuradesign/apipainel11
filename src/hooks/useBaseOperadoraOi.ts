import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { baseOperadoraOiService, BaseOperadoraOi, CreateBaseOperadoraOi } from '@/services/baseOperadoraOiService';

export const useBaseOperadoraOi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registros, setRegistros] = useState<BaseOperadoraOi[]>([]);

  const getOperadoraOiByCpfId = useCallback(async (cpfId: number): Promise<BaseOperadoraOi[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [BASE_OPERADORA_OI] Buscando dados para CPF ID:', cpfId);
      const response = await baseOperadoraOiService.getByCpfId(cpfId);

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
  const createOperadoraOi = useCallback(async (data: CreateBaseOperadoraOi): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await baseOperadoraOiService.create(data);
      if (response.success) {
        toast.success('Operadora OI cadastrada com sucesso');
        return true;
      }
      const err = response.error || 'Erro ao cadastrar Operadora OI';
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
    getOperadoraOiByCpfId,
    createOperadoraOi,
    clearData,
  };
};
