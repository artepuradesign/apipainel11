
import { toast } from "sonner";

interface PaymentHandlerProps {
  canProceed: () => boolean;
  user: any;
  isProcessing: boolean;
  paymentMethod: string;
  paymentMethods: Array<{ id: string; name: string }>;
  createPendingTransaction: (method: string) => Promise<string>;
  setPendingTransactionId: (id: string) => void;
  setShowPixModal: (show: boolean) => void;
  setShowCreditModal: (show: boolean) => void;
  setShowBankTransferModal: (show: boolean) => void;
  setShowPayPalModal: (show: boolean) => void;
  setShowCryptoModal: (show: boolean) => void;
}

export const usePaymentHandler = ({
  canProceed,
  user,
  isProcessing,
  paymentMethod,
  paymentMethods,
  createPendingTransaction,
  setPendingTransactionId,
  setShowPixModal,
  setShowCreditModal,
  setShowBankTransferModal,
  setShowPayPalModal,
  setShowCryptoModal
}: PaymentHandlerProps) => {
  const handlePayment = async () => {
    if (!canProceed() || !user) {
      toast.error("Selecione um valor válido e forma de pagamento");
      return;
    }

    if (isProcessing) {
      return;
    }

    if (['pix', 'credit', 'transfer', 'paypal', 'crypto'].includes(paymentMethod)) {
      try {
        const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);
        const transactionId = await createPendingTransaction(selectedPaymentMethod?.name || paymentMethod);
        
        setPendingTransactionId(transactionId);
        
        if (paymentMethod === 'pix') {
          setShowPixModal(true);
        } else if (paymentMethod === 'credit') {
          setShowCreditModal(true);
        } else if (paymentMethod === 'transfer') {
          setShowBankTransferModal(true);
        } else if (paymentMethod === 'paypal') {
          setShowPayPalModal(true);
        } else if (paymentMethod === 'crypto') {
          setShowCryptoModal(true);
        }
        
        toast.info("Transação criada! Complete o pagamento para adicionar o saldo.");
      } catch (error) {
        console.error('Erro ao criar transação pendente:', error);
        toast.error("Erro ao processar solicitação!");
      }
      return;
    }
  };

  return { handlePayment };
};
