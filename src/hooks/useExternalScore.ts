import { useState, useCallback } from 'react';
import { baseCpfService } from '@/services/baseCpfService';
import { toast } from 'sonner';

interface ScoreData {
  score: number;
  updated_at: string;
}

interface ScoreHistoryItem {
  score: number;
  date: string;
  reason?: string;
}

interface CalculatedScore {
  score: number;
  factors: string[];
  message: string;
}

export const useExternalScore = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar score atual de um CPF
  const getScore = useCallback(async (cpf: string): Promise<ScoreData | null> => {
    if (!cpf) return null;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [EXTERNAL_SCORE] Buscando score para CPF:', cpf);
      
      const response = await baseCpfService.getScoreByCpf(cpf);

      if (response.success && response.data) {
        console.log('✅ [EXTERNAL_SCORE] Score encontrado:', response.data);
        return response.data;
      } else {
        const errorMsg = response.error || 'Erro ao buscar score';
        console.warn('⚠️ [EXTERNAL_SCORE] Erro ao buscar score:', errorMsg);
        setError(errorMsg);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [EXTERNAL_SCORE] Erro na API:', error);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar score de um CPF
  const updateScore = useCallback(async (cpf: string, score: number): Promise<boolean> => {
    if (!cpf || score < 0 || score > 1000) {
      toast.error('CPF inválido ou score fora do intervalo (0-1000)');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [EXTERNAL_SCORE] Atualizando score:', { cpf, score });
      
      const response = await baseCpfService.updateScore(cpf, score);

      if (response.success) {
        console.log('✅ [EXTERNAL_SCORE] Score atualizado:', response.data);
        toast.success(`Score atualizado para ${score} pontos`);
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar score';
        console.warn('⚠️ [EXTERNAL_SCORE] Erro ao atualizar score:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [EXTERNAL_SCORE] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calcular score automaticamente baseado nos dados
  const calculateScore = useCallback(async (cpf: string): Promise<CalculatedScore | null> => {
    if (!cpf) return null;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [EXTERNAL_SCORE] Calculando score automaticamente para CPF:', cpf);
      
      const response = await baseCpfService.calculateScore(cpf);

      if (response.success && response.data) {
        console.log('✅ [EXTERNAL_SCORE] Score calculado:', response.data);
        toast.success(`Score calculado: ${response.data.score} pontos`);
        return response.data;
      } else {
        const errorMsg = response.error || 'Erro ao calcular score';
        console.warn('⚠️ [EXTERNAL_SCORE] Erro ao calcular score:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [EXTERNAL_SCORE] Erro na API:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar histórico de scores
  const getScoreHistory = useCallback(async (cpf: string): Promise<ScoreHistoryItem[]> => {
    if (!cpf) return [];

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [EXTERNAL_SCORE] Buscando histórico de scores para CPF:', cpf);
      
      const response = await baseCpfService.getScoreHistory(cpf);

      if (response.success && response.data?.history) {
        console.log('✅ [EXTERNAL_SCORE] Histórico encontrado:', response.data.history);
        return response.data.history;
      } else {
        const errorMsg = response.error || 'Erro ao buscar histórico';
        console.warn('⚠️ [EXTERNAL_SCORE] Erro ao buscar histórico:', errorMsg);
        setError(errorMsg);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [EXTERNAL_SCORE] Erro na API:', error);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    
    // Ações
    getScore,
    updateScore,
    calculateScore,
    getScoreHistory,
    clearError,
    
    // Utilidades
    isValidScore: (score: number) => score >= 0 && score <= 1000,
    getScoreLabel: (score: number) => {
      if (score >= 800) return 'Excelente';
      if (score >= 600) return 'Bom';
      if (score >= 400) return 'Regular';
      return 'Baixo';
    },
    getScoreColor: (score: number) => {
      if (score >= 800) return 'emerald';
      if (score >= 600) return 'green';
      if (score >= 400) return 'yellow';
      return 'red';
    }
  };
};