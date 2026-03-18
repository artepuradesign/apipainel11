
import { useState } from 'react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { getWalletBalance, updateWalletBalance } from '@/utils/balanceUtils';
import { addCentralCashTransaction } from '@/utils/centralCashService';
import { useAuth } from '@/contexts/AuthContext';
import { cookieUtils } from '@/utils/cookieUtils';

export const usePaymentLogic = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const currentBalance = user ? getWalletBalance(user.id) : 0;

  const paymentMethods = [
    { id: 'pix', name: 'PIX' },
    { id: 'credit', name: 'Cartão de Crédito' },
    { id: 'transfer', name: 'Transferência Bancária' },
    { id: 'paypal', name: 'PayPal' },
    { id: 'crypto', name: 'Criptomoedas' }
  ];

  const getFinalAmount = () => {
    if (customAmount) {
      return parseFloat(customAmount) || 0;
    }
    return selectedAmount || 0;
  };

  const finalAmount = getFinalAmount();
  const discountAmount = (finalAmount * appliedDiscount) / 100;
  const finalAmountWithDiscount = finalAmount - discountAmount;

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

  // Função para adicionar saldo via API
  const addBalanceViaAPI = async (amount: number, method: string): Promise<boolean> => {
    try {
      const sessionToken = cookieUtils.get('session_token');
      if (!sessionToken) {
        console.warn('Token de sessão não encontrado, usando sistema local');
        return false;
      }

      const response = await fetch('https://api.apipainel.com.br/wallet/add-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
          'X-API-Key': import.meta.env.VITE_API_KEY ?? ''
        },
        body: JSON.stringify({
          amount: amount,
          payment_method: method,
          description: `Recarga de saldo via ${method}`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Saldo adicionado via API:', data.data);
        
        // Atualizar saldo local também para sincronização
        if (user) {
          const currentLocalBalance = getWalletBalance(user.id);
          const newLocalBalance = currentLocalBalance + amount;
          updateWalletBalance(user.id, newLocalBalance);
        }
        
        return true;
      } else {
        throw new Error(data.message || 'Erro na API');
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar saldo via API:', error);
      return false;
    }
  };

  // Função para comprar plano via API
  const purchasePlanViaAPI = async (planId: number, planName: string, method: string): Promise<boolean> => {
    try {
      const sessionToken = cookieUtils.get('session_token');
      if (!sessionToken) {
        console.warn('Token de sessão não encontrado, usando sistema local');
        return false;
      }

      const response = await fetch('https://api.apipainel.com.br/plans/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
          'X-API-Key': import.meta.env.VITE_API_KEY ?? ''
        },
        body: JSON.stringify({
          plan_id: planId,
          payment_method: method
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Plano adquirido via API:', data.data);
        return true;
      } else {
        throw new Error(data.message || 'Erro na API');
      }
    } catch (error) {
      console.error('❌ Erro ao adquirir plano via API:', error);
      return false;
    }
  };

  const createPendingTransaction = async (method: string): Promise<string> => {
    const transactionId = `${Date.now()}`;
    
    console.log('=== CRIANDO TRANSAÇÃO PENDENTE ===', {
      transactionId,
      method,
      finalAmountWithDiscount,
      hasUser: !!user
    });

    // Para usuários logados, salvar transações no localStorage
    if (user) {
      const userTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${user.id}`) || "[]");
      const pendingTransaction = {
        id: transactionId,
        amount: finalAmountWithDiscount,
        type: 'credit',
        description: `Recarga de saldo via ${method} - Aguardando pagamento`,
        date: new Date().toISOString(),
        balance_type: 'wallet',
        status: 'pending',
        previous_balance: getWalletBalance(user.id),
        new_balance: getWalletBalance(user.id)
      };
      
      userTransactions.unshift(pendingTransaction);
      localStorage.setItem(`balance_transactions_${user.id}`, JSON.stringify(userTransactions));

      const paymentHistory = JSON.parse(localStorage.getItem(`payment_history_${user.id}`) || "[]");
      paymentHistory.unshift({
        id: transactionId,
        type: 'Recarga',
        method: method,
        amount: finalAmountWithDiscount,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        description: `Recarga de saldo via ${method} - Aguardando pagamento`
      });
      localStorage.setItem(`payment_history_${user.id}`, JSON.stringify(paymentHistory));
    }

    // Para usuários não logados (convidados), apenas criar transação temporária
    console.log(user ? '✅ Transação salva para usuário logado' : '✅ Transação temporária criada para convidado');

    return transactionId;
  };

  const confirmPendingTransaction = async (transactionId: string, method: string) => {
    console.log('=== CONFIRMANDO TRANSAÇÃO PENDENTE ===', {
      transactionId,
      method,
      finalAmountWithDiscount,
      hasUser: !!user
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // Para usuários logados, processar normalmente
      if (user) {
        // Tentar via API primeiro
        const apiSuccess = await addBalanceViaAPI(finalAmountWithDiscount, method);
        
        if (!apiSuccess) {
          console.log('🔄 API falhou, usando sistema local');
          // Fallback para sistema local
          const currentBalance = getWalletBalance(user.id);
          const newBalance = currentBalance + finalAmountWithDiscount;
          updateWalletBalance(user.id, newBalance);

          // Registrar no caixa central local
          addCentralCashTransaction({
            type: 'recarga',
            user_id: user.id,
            amount: finalAmountWithDiscount,
            description: `Recarga de ${user.email || 'usuário'} via ${method}`,
            metadata: {
              payment_method: method,
              transaction_id: transactionId,
              original_amount: finalAmount
            }
          });
        }

        // Atualizar transações locais
        const userTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${user.id}`) || "[]");
        const transactionIndex = userTransactions.findIndex((t: any) => t.id === transactionId);
        
        if (transactionIndex !== -1) {
          userTransactions[transactionIndex].status = 'confirmed';
          userTransactions[transactionIndex].description = `Recarga de saldo via ${method} - Aprovado`;
          userTransactions[transactionIndex].new_balance = getWalletBalance(user.id);
          localStorage.setItem(`balance_transactions_${user.id}`, JSON.stringify(userTransactions));
        }

        const paymentHistory = JSON.parse(localStorage.getItem(`payment_history_${user.id}`) || "[]");
        const paymentIndex = paymentHistory.findIndex((p: any) => p.id === transactionId);
        
        if (paymentIndex !== -1) {
          paymentHistory[paymentIndex].status = 'success';
          paymentHistory[paymentIndex].description = `Recarga de saldo via ${method} - Aprovado`;
          localStorage.setItem(`payment_history_${user.id}`, JSON.stringify(paymentHistory));
        }
      }

      // Toast de sucesso
      if (user) {
        toast.success(`Pagamento aprovado! Recarga de R$ ${finalAmountWithDiscount.toFixed(2)} via ${method} processada com sucesso!`);
        
        console.log('=== SALDO ATUALIZADO ===', {
          addedAmount: finalAmountWithDiscount
        });

        // Notificações de recarga são criadas apenas no usePaymentLogicWithApi (adicionar saldo)
        // Este hook é usado para pagamento de planos, não recargas

        // Disparar evento de atualização específico para pagamentos de planos
        window.dispatchEvent(new CustomEvent('planPurchaseUpdated', {
          detail: { 
            shouldAnimate: true, 
            animateFromZero: false,
            amount: finalAmountWithDiscount
          }
        }));
        
        setTimeout(() => {
          navigate('/dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
      } else {
        // Para usuários convidados (sem login)
        toast.success(`Pagamento confirmado! Transação de R$ ${finalAmountWithDiscount.toFixed(2)} via ${method} processada com sucesso!`);
        
        setTimeout(() => {
          navigate('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
      }
      
    } catch (error) {
      console.error('Erro ao confirmar transação:', error);
      toast.error("Erro ao confirmar transação!");
    }
  };

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
    
    appliedDiscount,
    pendingTransactionId,
    currentBalance,
    paymentMethods,
    finalAmount,
    finalAmountWithDiscount,
    discountAmount,
    handleAmountSelect,
    handleCustomChange,
    canProceed,
    createPendingTransaction,
    confirmPendingTransaction,
    setSelectedAmount,
    setCustomAmount,
    setPaymentMethod,
    setIsProcessing,
    setShowPixModal,
    setShowCreditModal,
    setShowBankTransferModal,
    setShowPayPalModal,
    setShowCryptoModal,
    
    setAppliedDiscount,
    setPendingTransactionId
  };
};
