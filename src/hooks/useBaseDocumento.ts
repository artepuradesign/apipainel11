 import { useCallback, useState } from 'react';
 import { toast } from 'sonner';
 import { baseDocumentoService, BaseDocumento } from '@/services/baseDocumentoService';
 
 export const useBaseDocumento = () => {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [documento, setDocumento] = useState<BaseDocumento | null>(null);
 
   const getDocumentoByCpfId = useCallback(async (cpfId: number): Promise<BaseDocumento | null> => {
     if (!cpfId) return null;
 
     setIsLoading(true);
     setError(null);
 
     try {
       const response = await baseDocumentoService.getByCpfId(cpfId);
 
       if (response.success) {
         const data = response.data ?? null;
         setDocumento(data);
         return data;
       }
 
       const errorMsg = response.error || 'Erro ao buscar documento';
       setError(errorMsg);
       setDocumento(null);
       return null;
     } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
       console.error('❌ [BASE_DOCUMENTO] Erro na API:', err);
       setError(errorMessage);
       setDocumento(null);
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
     documento,
     getDocumentoByCpfId,
     clearError,
   };
 };