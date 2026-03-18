
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConsultasCpf } from './useConsultasCpf';

export const usePaymentHistory = () => {
  const { user } = useAuth();
  const { consultas, loading, formatToPaymentHistory } = useConsultasCpf();
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  useEffect(() => {
    const getPaymentHistory = () => {
      console.log('💳 [PAYMENT_HISTORY] Construindo histórico de pagamentos...');
      console.log('💳 [PAYMENT_HISTORY] Consultas disponíveis:', consultas.length);
      
      // Buscar histórico salvo localmente (recargas, planos, etc.)
      const savedHistory = JSON.parse(localStorage.getItem(`payment_history_${user?.id}`) || "[]");
      console.log('💳 [PAYMENT_HISTORY] Histórico local encontrado:', savedHistory.length);
      
      // Dados mockados para outros tipos de transações (manter para demonstração)
      const mockOtherTransactions = [
        {
          id: 'PAY-001',
          type: 'Recarga',
          method: 'PIX',
          amount: 250.00,
          status: 'success',
          date: '2025-01-15',
          description: 'Recarga de saldo via PIX',
          balance_type: 'wallet'
        },
        {
          id: 'PAY-002',
          type: 'Recarga',
          method: 'Cartão de Crédito',
          amount: 500.00,
          status: 'success',
          date: '2025-01-10',
          description: 'Recarga de saldo via Cartão',
          balance_type: 'wallet'
        },
        {
          id: 'PAY-003',
          type: 'Plano',
          method: 'PIX',
          amount: 299.90,
          status: 'success',
          date: '2025-01-05',
          description: 'Assinatura Plano Rei de Espadas',
          balance_type: 'plan'
        }
      ];

      // Combinar dados reais das consultas CPF com outros tipos de transações
      let consultasFormatted: any[] = [];
      
      if (consultas && consultas.length > 0) {
        consultasFormatted = formatToPaymentHistory(consultas);
        console.log('💳 [PAYMENT_HISTORY] Consultas formatadas:', consultasFormatted.length);
      } else {
        console.log('💳 [PAYMENT_HISTORY] Nenhuma consulta encontrada para formatar');
      }
      
      const allTransactions = [...mockOtherTransactions, ...consultasFormatted, ...savedHistory];

      // Ordenar por data (mais recentes primeiro)
      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log('💳 [PAYMENT_HISTORY] Total de transações:', allTransactions.length);
      return allTransactions;
    };

    const history = getPaymentHistory();
    setPaymentHistory(history);
  }, [user?.id, consultas, formatToPaymentHistory]);

  return {
    paymentHistory,
    loading
  };
};
