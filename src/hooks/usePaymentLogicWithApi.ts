
import { useState } from 'react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { rechargeNotificationService } from '@/services/rechargeNotificationService';
import { userApiService } from '@/services/userApiService';
import { walletApiService } from '@/services/walletApiService';
import { centralCashApiService } from '@/services/centralCashApiService';
import { cupomApiService } from '@/services/cupomApiService';
import { adminActivityApiService } from '@/services/adminActivityApiService';
import { cookieUtils } from '@/utils/cookieUtils';

export const usePaymentLogicWithApi = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [pendingTransactionId, setPendingTransactionId] = useState<string>('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const paymentMethods = [
    { id: 'pix', name: 'PIX' },
    { id: 'credit', name: 'Cartão de Crédito' },
    { id: 'paypal', name: 'PayPal' }
  ];

  const getFinalAmount = () => {
    if (customAmount) {
      return parseFloat(customAmount) || 0;
    }
    return selectedAmount || 0;
  };

  const finalAmount = getFinalAmount();

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(0);
  };

  const canProceed = (): boolean => {
    const amount = getFinalAmount();
    return amount >= 100 && amount <= 50000 && !!paymentMethod;
  };

  // Criar transação pendente
  const createPendingTransaction = async (method: string): Promise<string> => {
    try {
      // Simular criação de transação pendente
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log(`🔄 Transação pendente criada: ${transactionId} para método ${method}`);
      return transactionId;
    } catch (error) {
      console.error('❌ Erro ao criar transação pendente:', error);
      throw error;
    }
  };

  // Função principal para processar recarga via API
  const processRecharge = async (cupomData?: { cupom: any; valorDesconto: number; valorPago: number }): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    if (!canProceed()) {
      return { success: false, message: 'Dados de pagamento inválidos' };
    }

    setIsProcessing(true);

    try {
      console.log('🔄 [RECARGA_HOOK] Processando recarga via API externa...', {
        userId: user.id,
        amount: finalAmount,
        method: paymentMethod,
        cupomData
      });

      console.log('🔄 [RECARGA_HOOK] Iniciando processo de recarga...');

      // O cupom será processado junto com a recarga no WalletController
      // Não precisa mais de chamada separada para evitar duplicação

      // CORREÇÃO: Se tem cupom aplicado, usar o endpoint correto da API
      if (cupomData?.cupom) {
        console.log('🎫 [RECARGA_HOOK] Registrando uso do cupom...');
        
        try {
          // Usar o método do cupomApiService que já está correto
          const result = await cupomApiService.useCupom(
            cupomData.cupom.codigo,
            parseInt(user.id),
            finalAmount,
            'main'
          );

          if (!result.success) {
            // Melhor tratamento de erro específico
            const errorMsg = result.error || 'Erro ao aplicar cupom';
            throw new Error(errorMsg);
          }

          console.log('✅ [RECARGA_HOOK] Cupom aplicado:', result.data);
        } catch (error) {
          console.error('❌ [RECARGA_HOOK] Erro ao aplicar cupom:', error);
          throw error;
        }
      }

      // AGORA processar a recarga com valores corretos
      // Valor que vai tanto para o saldo quanto para o caixa = valor efetivamente pago
      const valorEfetivamentePago = cupomData ? cupomData.valorPago : finalAmount;
      const valorParaSaldo = valorEfetivamentePago; 
      const valorParaCaixa = valorEfetivamentePago;
      
      console.log('💰 [RECARGA_HOOK] Valores calculados:', {
        valorOriginal: finalAmount,
        valorDesconto: cupomData?.valorDesconto || 0,
        valorParaSaldo,
        valorParaCaixa,
        temCupom: !!cupomData?.cupom
      });
      
      // Descrição da transação incluindo info do cupom se aplicável
      let descricaoTransacao = `Recarga de saldo via ${paymentMethod}`;
      if (cupomData?.cupom) {
        descricaoTransacao += ` (cupom ${cupomData.cupom.codigo} aplicado)`;
      }

      // Adicionar saldo normal SEM dados de cupom (evita duplicação)
      const result = await walletApiService.addBalance(
        parseInt(user.id),
        valorParaSaldo, // Valor original da recarga vai para o saldo
        descricaoTransacao,
        paymentMethod,
        valorParaCaixa, // Valor efetivamente pago para o caixa central
        'main' // Garantir que credita a Carteira Digital (mapeado para 'digital' no backend)
        // NÃO enviar cupomData aqui para evitar duplicação
      );

      if (!result.success) {
        console.error('❌ [RECARGA_HOOK] Erro na API:', result.error);
        throw new Error(result.error || 'Erro ao processar recarga');
      }

      console.log('✅ [RECARGA_HOOK] Recarga processada via API:', result.data);

      // Nota: Todos os registros no caixa central são feitos pelo WalletController
      // incluindo o registro separado do cupom quando aplicável

      // Disparar eventos de atualização específicos para recargas
      window.dispatchEvent(new CustomEvent('balanceRechargeUpdated', {
        detail: { 
          shouldAnimate: true, 
          amount: valorParaSaldo,
          userId: user.id
        }
      }));

      window.dispatchEvent(new CustomEvent('rechargeCompleted', {
        detail: {
          userId: user.id,
          amount: valorParaSaldo,
          method: paymentMethod,
          userName: user.full_name || user.email,
          cupomApplied: cupomData?.cupom?.codigo || null
        }
      }));

      // Criar notificação para usuários suporte
      try {
        await rechargeNotificationService.monitorRecharge(
          parseInt(user.id),
          valorParaSaldo,
          paymentMethod.toUpperCase(),
          pendingTransactionId
        );
        console.log('✅ [RECARGA_HOOK] Notificação de recarga enviada para suportes');
      } catch (error) {
        console.warn('⚠️ [RECARGA_HOOK] Erro ao enviar notificação para suportes:', error);
        // Não falhar a recarga por causa da notificação
      }

      // Mensagem de sucesso removida para evitar duplicação
      // A notificação detalhada já é exibida pelo sistema de notificações

      return { success: true, message: 'Recarga processada com sucesso!' };

    } catch (error) {
      console.error('❌ Erro ao processar recarga:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro interno ao processar recarga';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para confirmar pagamento (chama a API)
  const confirmPayment = async (cupomData?: { cupom: any; valorDesconto: number; valorPago: number }): Promise<void> => {
    console.log(`🔄 Confirmando pagamento ${paymentMethod}...`, { cupomData });
    
    // Sempre simular sucesso no pagamento
    try {
      // Chamar a API quando o pagamento for confirmado
      const result = await processRecharge(cupomData);
      
      if (result.success) {
        // Toast de sucesso removido para evitar duplicação
        // A notificação detalhada já é exibida pelo sistema de notificações
        
        setTimeout(() => {
          navigate('/dashboard');
          closeAllModals();
        }, 2000);
      } else {
        toast.error(result.message);
        closeAllModals();
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
      closeAllModals();
    }
  };

  // Função para fechar todos os modais
  const closeAllModals = () => {
    setShowPixModal(false);
    setShowCreditModal(false);
    setShowBankTransferModal(false);
    setShowPayPalModal(false);
    setShowCryptoModal(false);
  };

  // Simular pagamento (para desenvolvimento) - TODOS OS MÉTODOS
  const simulatePayment = async (method: string): Promise<void> => {
    try {
      const selectedPaymentMethod = paymentMethods.find(m => m.id === method);
      const transactionId = await createPendingTransaction(selectedPaymentMethod?.name || method);
      
      setPendingTransactionId(transactionId);
      
      // Abrir o modal correto baseado no método
      if (method === 'pix') {
        setShowPixModal(true);
      } else if (method === 'credit') {
        setShowCreditModal(true);
      } else if (method === 'transfer') {
        setShowBankTransferModal(true);
      } else if (method === 'paypal') {
        setShowPayPalModal(true);
      } else if (method === 'crypto') {
        setShowCryptoModal(true);
      }
      
      // Notificação removida conforme solicitado
    } catch (error) {
      console.error('Erro ao criar transação pendente:', error);
      toast.error("Erro ao processar solicitação!");
    }
  };

  // Compatibilidade com a função anterior
  const simulatePixPayment = () => simulatePayment('pix');

  return {
    selectedAmount,
    customAmount,
    paymentMethod,
    isProcessing,
    showPixModal,
    showCreditModal,
    showBankTransferModal,
    showPayPalModal,
    showCryptoModal,
    pendingTransactionId,
    paymentMethods,
    finalAmount,
    handleAmountSelect,
    handleCustomChange,
    canProceed,
    createPendingTransaction,
    processRecharge,
    confirmPayment,
    simulatePayment,
    simulatePixPayment,
    closeAllModals,
    setSelectedAmount,
    setCustomAmount,
    setPaymentMethod,
    setIsProcessing,
    setShowPixModal,
    setShowCreditModal,
    setShowBankTransferModal,
    setShowPayPalModal,
    setShowCryptoModal,
    setPendingTransactionId
  };
};
