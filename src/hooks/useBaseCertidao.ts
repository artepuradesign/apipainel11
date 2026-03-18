import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { baseCertidaoService, BaseCertidao } from '@/services/baseCertidaoService';

export const useBaseCertidao = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certidao, setCertidao] = useState<BaseCertidao | null>(null);

  const getCertidaoByCpfId = useCallback(async (cpfId: number): Promise<BaseCertidao | null> => {
    if (!cpfId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await baseCertidaoService.getByCpfId(cpfId);

      if (response.success) {
        const data = response.data ?? null;
        setCertidao(data);
        return data;
      }

      const errorMsg = response.error || 'Erro ao buscar certidão';
      setError(errorMsg);
      setCertidao(null);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ [BASE_CERTIDAO] Erro na API:', err);
      setError(errorMessage);
      setCertidao(null);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    certidao,
    getCertidaoByCpfId,
    clearError,
  };
};
