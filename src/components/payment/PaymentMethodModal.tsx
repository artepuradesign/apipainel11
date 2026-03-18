import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, QrCode, Gift, Wallet, Building2 } from 'lucide-react';
import { toast } from "sonner";
import { buyPlanWithWalletBalance, buyPlanDirect, getWalletBalance, addBalanceTransaction } from '@/utils/balanceUtils';
import { useAuth } from '@/contexts/AuthContext';
import { showPlanActivationToast, showPlanErrorToast } from '@/utils/planToasts';
import PixQRCodeModal from './PixQRCodeModal';
import CreditCardModal from './CreditCardModal';
import BankTransferModal from './BankTransferModal';
import PayPalModal from './PayPalModal';
import CryptoModal from './CryptoModal';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  userBalance: number;
  onPaymentSuccess: (paymentMethod: string) => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  planName,
  planPrice,
  userBalance,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);
  const { user } = useAuth();

  const finalPrice = planPrice;

  // Obter saldo da carteira para exibição correta
  const walletBalance = user ? getWalletBalance(user.id) : 0;

  const createPendingTransaction = async (method: string): Promise<string> => {
    if (!user) throw new Error("Usuário não encontrado");
    
    const transactionId = `PLAN-${Date.now()}-${method.toUpperCase()}`;
    
    // Criar transação pendente
    await addBalanceTransaction(
      user.id,
      finalPrice,
      'debit',
      `Compra do plano ${planName} via ${method} - Aguardando pagamento`,
      transactionId,
      'plan'
    );

    // Salvar no histórico de pagamentos como pendente
    const paymentHistory = JSON.parse(localStorage.getItem(`payment_history_${user.id}`) || "[]");
    paymentHistory.unshift({
      id: transactionId,
      type: 'Plano',
      method: method,
      amount: finalPrice,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      description: `Compra do plano ${planName} via ${method}`,
      planName: planName
    });
    localStorage.setItem(`payment_history_${user.id}`, JSON.stringify(paymentHistory));

    return transactionId;
  };

  const confirmPendingTransaction = async (transactionId: string, method: string) => {
    if (!user) return;

    console.log('=== CONFIRMANDO TRANSAÇÃO PENDENTE ===', {
      transactionId,
      method,
      planName,
      finalPrice
    });

    // Simular processamento de 3 segundos
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // Atualizar status da transação para confirmado
      const userTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${user.id}`) || "[]");
      const transactionIndex = userTransactions.findIndex((t: any) => t.referencia_id === transactionId);
      
      if (transactionIndex !== -1) {
        userTransactions[transactionIndex].status = 'confirmado';
        userTransactions[transactionIndex].descricao = `Compra do plano ${planName} via ${method} - Confirmado`;
        localStorage.setItem(`balance_transactions_${user.id}`, JSON.stringify(userTransactions));
      }

      // Atualizar histórico de pagamentos
      const paymentHistory = JSON.parse(localStorage.getItem(`payment_history_${user.id}`) || "[]");
      const paymentIndex = paymentHistory.findIndex((p: any) => p.id === transactionId);
      
      if (paymentIndex !== -1) {
        paymentHistory[paymentIndex].status = 'success';
        paymentHistory[paymentIndex].description = `Compra do plano ${planName} via ${method} - Confirmado`;
        localStorage.setItem(`payment_history_${user.id}`, JSON.stringify(paymentHistory));
      }

      // Ativar o plano
      if (selectedMethod === 'balance') {
        await buyPlanWithWalletBalance(user.id, planName, finalPrice);
      } else {
        await buyPlanDirect(user.id, planName, finalPrice);
      }

      const methodName = method === 'pix' ? 'PIX' : 
                        method === 'credit' ? 'Cartão de Crédito' : 
                        method === 'transfer' ? 'Transferência Bancária' : method;

      onPaymentSuccess(methodName);
      showPlanActivationToast({
        planName,
        value: finalPrice,
        paymentMethod: methodName
      });
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      showPlanErrorToast("Erro ao confirmar pagamento");
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error("Usuário não encontrado!");
      return;
    }

    if (selectedMethod === 'balance' && walletBalance < finalPrice) {
      toast.error("Saldo da carteira insuficiente! Escolha outro método de pagamento.");
      return;
    }

    if (selectedMethod === 'balance') {
      // USAR SALDO DA CARTEIRA: Processar imediatamente
      setIsProcessing(true);
      try {
        const success = await buyPlanWithWalletBalance(user.id, planName, finalPrice);
        if (success) {
          onPaymentSuccess('Saldo da Carteira');
          showPlanActivationToast({
            planName,
            value: finalPrice,
            paymentMethod: 'Saldo da Carteira'
          });
        } else {
          showPlanErrorToast("Erro ao processar pagamento");
        }
      } catch (error) {
        console.error('Payment error:', error);
        showPlanErrorToast("Erro ao processar pagamento");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Para outros métodos: criar transação pendente e abrir modal
    try {
      const transactionId = await createPendingTransaction(
        selectedMethod === 'pix' ? 'PIX' : 
        selectedMethod === 'credit' ? 'Cartão de Crédito' : 
        selectedMethod === 'transfer' ? 'Transferência Bancária' :
        selectedMethod === 'paypal' ? 'PayPal' :
        selectedMethod === 'crypto' ? 'Criptomoedas' : selectedMethod
      );
      
      setPendingTransactionId(transactionId);
      
      if (selectedMethod === 'pix') {
        setShowPixModal(true);
      } else if (selectedMethod === 'credit') {
        setShowCreditModal(true);
      } else if (selectedMethod === 'transfer') {
        setShowBankTransferModal(true);
      } else if (selectedMethod === 'paypal') {
        setShowPayPalModal(true);
      } else if (selectedMethod === 'crypto') {
        setShowCryptoModal(true);
      }
      
      toast.info("Transação criada! Complete o pagamento para ativar o plano.");
    } catch (error) {
      console.error('Erro ao criar transação pendente:', error);
      toast.error("Erro ao processar solicitação!");
    }
  };

  const handleModalPaymentConfirm = async () => {
    if (!pendingTransactionId) return;
    
    setIsProcessing(true);
    
    // Fechar todos os modais
    setShowPixModal(false);
    setShowCreditModal(false);
    setShowBankTransferModal(false);
    setShowPayPalModal(false);
    setShowCryptoModal(false);
    
    const method = selectedMethod === 'pix' ? 'PIX' : 
                  selectedMethod === 'credit' ? 'Cartão de Crédito' : 
                  selectedMethod === 'transfer' ? 'Transferência Bancária' :
                  selectedMethod === 'paypal' ? 'PayPal' :
                  selectedMethod === 'crypto' ? 'Criptomoedas' : selectedMethod;
    
    toast.info(`Processando pagamento via ${method}...`);
    
    await confirmPendingTransaction(pendingTransactionId, method);
    
    setIsProcessing(false);
    setPendingTransactionId(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento do Plano {planName}</DialogTitle>
            <DialogDescription>
              Valor: R$ {planPrice.toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="payment" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="payment">Pagamento</TabsTrigger>
            </TabsList>

            <TabsContent value="payment" className="space-y-4">
              <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="pix" id="pix" />
                  <QrCode className="h-5 w-5" />
                  <Label htmlFor="pix" className="flex-1 cursor-pointer">PIX (Instantâneo)</Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="credit" id="credit" />
                  <CreditCard className="h-5 w-5" />
                  <Label htmlFor="credit" className="flex-1 cursor-pointer">Cartão de Crédito</Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="transfer" id="transfer" />
                  <Building2 className="h-5 w-5" />
                  <Label htmlFor="transfer" className="flex-1 cursor-pointer">Transferência Bancária</Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.435-.983 4.814-4.494 6.823-8.677 6.823H9.73a.641.641 0 0 0-.633.74l-.744 4.717a.641.641 0 0 1-.633.74h-.644z"/>
                  </svg>
                  <Label htmlFor="paypal" className="flex-1 cursor-pointer">PayPal</Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="crypto" id="crypto" />
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 2.048-.896 2.048-.896 0-1.616.896-1.616 1.792 0 .896.72 1.616 1.616 1.616.896 0 1.616-.72 1.616-1.616-.169-1.858-.896-2.048-.896-2.048.896 0 1.616-.896 1.616-1.792 0-.896-.72-1.616-1.616-1.616-.896 0-1.616.72-1.616 1.616z"/>
                  </svg>
                  <Label htmlFor="crypto" className="flex-1 cursor-pointer">Criptomoedas</Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="balance" id="balance" />
                  <Wallet className="h-5 w-5" />
                  <Label htmlFor="balance" className="flex-1 cursor-pointer">
                    Saldo da Carteira (R$ {walletBalance.toFixed(2)})
                  </Label>
                  {walletBalance < finalPrice && (
                    <span className="text-xs text-red-500">Insuficiente</span>
                  )}
                </div>
              </RadioGroup>
              
              <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p><strong>Como funciona:</strong></p>
                <p>• <strong>PIX/Cartão/Transferência:</strong> Aguarda confirmação do pagamento</p>
                <p>• <strong>Saldo da Carteira:</strong> Ativação imediata</p>
              </div>
            </TabsContent>

          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={isProcessing || (selectedMethod === 'balance' && walletBalance < finalPrice)}
              className="bg-brand-purple hover:bg-brand-darkPurple"
            >
              {isProcessing ? 'Processando...' : `Pagar R$ ${finalPrice.toFixed(2)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modais de Pagamento */}
      <PixQRCodeModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        amount={finalPrice}
        onPaymentConfirm={handleModalPaymentConfirm}
        isProcessing={isProcessing}
      />

      <CreditCardModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        amount={finalPrice}
        onPaymentConfirm={handleModalPaymentConfirm}
        isProcessing={isProcessing}
      />

      <BankTransferModal
        isOpen={showBankTransferModal}
        onClose={() => setShowBankTransferModal(false)}
        amount={finalPrice}
        onPaymentConfirm={handleModalPaymentConfirm}
        isProcessing={isProcessing}
      />

      <PayPalModal
        isOpen={showPayPalModal}
        onClose={() => setShowPayPalModal(false)}
        amount={finalPrice}
        onPaymentConfirm={handleModalPaymentConfirm}
        isProcessing={isProcessing}
      />

      <CryptoModal
        isOpen={showCryptoModal}
        onClose={() => setShowCryptoModal(false)}
        amount={finalPrice}
        onPaymentConfirm={handleModalPaymentConfirm}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default PaymentMethodModal;
