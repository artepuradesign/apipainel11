import { useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/config/apiConfig';

interface UsePaymentPollingProps {
  onUpdate?: () => void;
  interval?: number; // em milissegundos
  enabled?: boolean;
}

/**
 * Hook para verificar automaticamente o status de pagamentos pendentes
 * Chama o endpoint check-pending-payments periodicamente
 */
export const usePaymentPolling = ({ 
  onUpdate, 
  interval = 15000, // 15 segundos por padrão
  enabled = true 
}: UsePaymentPollingProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkPendingPayments = async () => {
    try {
      console.log('🔄 [POLLING] Verificando pagamentos pendentes...');
      
      const response = await fetch(`${API_BASE_URL}/mercadopago/check-pending-payments`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          console.log('✅ [POLLING] Verificação concluída:', data.data);
          
          // Se houve atualizações, chamar callback
          if (data.data.updated > 0 && onUpdate) {
            console.log(`🔄 [POLLING] ${data.data.updated} pagamento(s) atualizado(s). Recarregando lista...`);
            onUpdate();
          }
        }
      } else {
        console.warn('⚠️ [POLLING] Falha ao verificar pagamentos:', response.status);
      }
    } catch (error) {
      console.error('❌ [POLLING] Erro ao verificar pagamentos:', error);
    }
  };

  useEffect(() => {
    if (!enabled) {
      // Limpar intervalo se desabilitado
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Executar imediatamente
    checkPendingPayments();

    // Configurar intervalo
    intervalRef.current = setInterval(checkPendingPayments, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval]);

  return {
    checkNow: checkPendingPayments
  };
};
