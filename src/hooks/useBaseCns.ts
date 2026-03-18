import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { baseCnsService, BaseCns } from '@/services/baseCnsService';

export const useBaseCns = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<BaseCns[]>([]);

  const getCnsByCpfId = useCallback(async (cpfId: number): Promise<BaseCns[]> => {
    if (!cpfId) return [];

    setIsLoading(true);
    setError(null);

    try {
      const response = await baseCnsService.getByCpfId(cpfId);

      if (response.success) {
        const data = response.data ?? [];
        setItems(data);
        return data;
      }

      const errorMsg = response.error || 'Erro ao buscar CNS';
      setError(errorMsg);
      setItems([]);
      toast.error(errorMsg);
      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ [BASE_CNS] Erro na API:', err);
      setError(errorMessage);
      setItems([]);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    items,
    getCnsByCpfId,
    clearError,
  };
};
