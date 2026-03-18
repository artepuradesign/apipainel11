import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pixPaymentsApiService, PixPayment } from '@/services/pixPaymentsApiService';

export const usePixPayments = () => {
  const { user } = useAuth();
  const [pixPayments, setPixPayments] = useState<PixPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPixPayments = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [PIX_HOOK] Carregando pagamentos PIX...');
      const response = await pixPaymentsApiService.listPixPayments(parseInt(user.id), 1, 100);
      
      if (response.success && response.data) {
        setPixPayments(response.data.payments || []);
        console.log('✅ [PIX_HOOK] Pagamentos carregados:', response.data.payments?.length || 0);
      } else {
        throw new Error(response.error || response.message || 'Falha ao carregar pagamentos PIX');
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar pagamentos PIX');
      console.error('❌ [PIX_HOOK] Erro ao carregar pagamentos PIX:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPixPayments();
  }, [user?.id]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoney = (value?: number, fallback?: string) => {
    if (fallback) return fallback;
    if (typeof value !== 'number') return '-';
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const deletePayment = async (paymentId: number) => {
    try {
      console.log('🗑️ [PIX_HOOK] Deletando pagamento:', paymentId);
      const response = await pixPaymentsApiService.deletePixPayment(paymentId);
      
      if (response.success) {
        // Recarregar a lista
        await loadPixPayments();
        console.log('✅ [PIX_HOOK] Pagamento deletado com sucesso');
        return true;
      } else {
        throw new Error(response.error || response.message || 'Falha ao deletar pagamento');
      }
    } catch (e: any) {
      console.error('❌ [PIX_HOOK] Erro ao deletar pagamento:', e);
      setError(e.message || 'Erro ao deletar pagamento');
      return false;
    }
  };

  return {
    pixPayments,
    loading,
    error,
    formatDate,
    formatMoney,
    deletePayment,
    refreshPayments: loadPixPayments
  };
};
