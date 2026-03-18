 import { useCallback, useState } from 'react';
 import { toast } from 'sonner';
 import { baseGestaoService, BaseGestao } from '@/services/baseGestaoService';
 
 export const useBaseGestao = () => {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [items, setItems] = useState<BaseGestao[]>([]);
 
   const getGestaoByCpfId = useCallback(async (cpfId: number): Promise<BaseGestao[]> => {
     if (!cpfId) return [];
 
     setIsLoading(true);
     setError(null);
 
     try {
       const response = await baseGestaoService.getByCpfId(cpfId);
 
       if (response.success) {
         const data = response.data ?? [];
         setItems(data);
         return data;
       }
 
       const errorMsg = response.error || 'Erro ao buscar Gestão Cadastral';
       setError(errorMsg);
       setItems([]);
       toast.error(errorMsg);
       return [];
     } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
       console.error('❌ [BASE_GESTAO] Erro na API:', err);
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
     getGestaoByCpfId,
     clearError,
   };
 };
