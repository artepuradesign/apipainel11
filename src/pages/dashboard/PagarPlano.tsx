
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, ArrowLeft, Check, Star, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { loadCustomPlans, type CustomPlan } from '@/utils/personalizationStorage';
import { getWalletBalance, updateWalletBalance, updatePlanBalance, getPlanBalance } from '@/utils/balanceUtils';
import { showPlanActivationToast, showPlanErrorToast, showInsufficientBalanceToast } from '@/utils/planToasts';
import { setPlanExpiration } from '@/utils/planExpirationUtils';
import PaymentMethodSelection from '@/components/payment/PaymentMethodSelection';
import PlanPaymentSummarySection from '@/components/payment/PlanPaymentSummarySection';
import PaymentModals from '@/components/payment/PaymentModals';
import { usePaymentLogic } from '@/hooks/usePaymentLogic';

import PageHeaderCard from '@/components/dashboard/PageHeaderCard';

const PagarPlano = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<CustomPlan | null>(null);
  const [planPrice, setPlanPrice] = useState<number>(0);

  const planName = searchParams.get('plan');

  const {
    paymentMethod,
    isProcessing,
    showPixModal,
    showCreditModal,
    showBankTransferModal,
    showPayPalModal,
    showCryptoModal,
    pendingTransactionId,
    currentBalance,
    paymentMethods,
    setPaymentMethod,
    setIsProcessing,
    setShowPixModal,
    setShowCreditModal,
    setShowBankTransferModal,
    setShowPayPalModal,
    setShowCryptoModal,
    setPendingTransactionId,
    createPendingTransaction,
    confirmPendingTransaction
  } = usePaymentLogic();

  // Removed coupon functionality

  const finalAmountWithDiscount = planPrice;

  const canProceed = (): boolean => {
    return planPrice > 0 && !!paymentMethod;
  };

  const handleWalletPayment = async () => {
    if (!user || !selectedPlan) {
      toast.error("Dados do usuário ou plano não encontrados!");
      return;
    }

    console.log('=== INICIANDO PAGAMENTO COM SALDO DA CARTEIRA ===');
    setIsProcessing(true);

    try {
      const walletBalance = getWalletBalance(user.id);
      console.log('Saldo da carteira atual:', walletBalance);
      console.log('Valor a ser debitado:', finalAmountWithDiscount);
      
      if (walletBalance < finalAmountWithDiscount) {
        toast.error("Saldo insuficiente na carteira!");
        setIsProcessing(false);
        return;
      }

      // Subtrair do saldo da carteira
      const newWalletBalance = walletBalance - finalAmountWithDiscount;
      updateWalletBalance(user.id, newWalletBalance);
      console.log('Novo saldo da carteira:', newWalletBalance);

      // Adicionar ao saldo do plano
      const currentPlanBalance = getPlanBalance(user.id);
      const newPlanBalance = currentPlanBalance + finalAmountWithDiscount;
      updatePlanBalance(user.id, newPlanBalance);
      console.log('Saldo do plano anterior:', currentPlanBalance);
      console.log('Novo saldo do plano:', newPlanBalance);

      // Atualizar plano do usuário
      localStorage.setItem('user_plan', selectedPlan.name);
      console.log('Plano ativado:', selectedPlan.name);
      
      // Definir expiração do plano (30 dias)
      setPlanExpiration(selectedPlan.name);

      // Registrar transação da carteira (débito)
      const userTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${user.id}`) || "[]");
      const transactionId = `${Date.now()}`;
      
      userTransactions.unshift({
        id: transactionId + '_wallet_debit',
        amount: finalAmountWithDiscount,
        type: 'debit',
        description: `Pagamento do plano ${selectedPlan.name}`,
        date: new Date().toISOString(),
        balance_type: 'wallet',
        status: 'confirmed',
        previous_balance: walletBalance,
        new_balance: newWalletBalance
      });

      // Registrar transação do plano (crédito)
      userTransactions.unshift({
        id: transactionId + '_plan_credit',
        amount: finalAmountWithDiscount,
        type: 'credit',
        description: `Saldo do plano ${selectedPlan.name} ativado`,
        date: new Date().toISOString(),
        balance_type: 'plan',
        status: 'confirmed',
        previous_balance: currentPlanBalance,
        new_balance: newPlanBalance
      });
      
      localStorage.setItem(`balance_transactions_${user.id}`, JSON.stringify(userTransactions));

      // Registrar no histórico de pagamentos
      const paymentHistory = JSON.parse(localStorage.getItem(`payment_history_${user.id}`) || "[]");
      paymentHistory.unshift({
        id: transactionId,
        type: 'Plano',
        method: 'Saldo da Carteira',
        amount: finalAmountWithDiscount,
        status: 'success',
        date: new Date().toISOString().split('T')[0],
        description: `Pagamento do plano ${selectedPlan.name}`
      });
      localStorage.setItem(`payment_history_${user.id}`, JSON.stringify(paymentHistory));

      showPlanActivationToast({
        planName: selectedPlan.name,
        value: finalAmountWithDiscount,
        paymentMethod: 'Carteira Digital'
      });

      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('balanceUpdated', {
        detail: { 
          shouldAnimate: true, 
          animateFromZero: false,
          newBalance: newWalletBalance
        }
      }));

      console.log('=== PAGAMENTO CONCLUÍDO COM SUCESSO ===');

      setTimeout(() => {
        navigate('/planos-publicos');
      }, 2000);

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error("Erro ao processar pagamento!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!canProceed()) {
      toast.error("Por favor, verifique os dados do pagamento");
      return;
    }

    if (!user) {
      toast.error("Usuário não encontrado");
      return;
    }

    console.log('=== INICIANDO PAGAMENTO ===');
    console.log('Método de pagamento selecionado:', paymentMethod);

    // Se for pagamento com saldo da carteira
    if (paymentMethod === 'wallet') {
      await handleWalletPayment();
      return;
    }

    // Para outros métodos de pagamento
    setIsProcessing(true);

    try {
      const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);
      
      if (!selectedPaymentMethod) {
        toast.error("Método de pagamento não encontrado");
        return;
      }

      const transactionId = await createPendingTransaction(selectedPaymentMethod.name);
      setPendingTransactionId(transactionId);

      // Abrir modal correspondente
      switch (paymentMethod) {
        case 'pix':
          setShowPixModal(true);
          break;
        case 'credit':
          setShowCreditModal(true);
          break;
        case 'transfer':
          setShowBankTransferModal(true);
          break;
        case 'paypal':
          setShowPayPalModal(true);
          break;
        case 'crypto':
          setShowCryptoModal(true);
          break;
      }

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error("Erro ao processar pagamento!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModalPaymentConfirm = async () => {
    if (!pendingTransactionId) return;
    
    setIsProcessing(true);
    
    setShowPixModal(false);
    setShowCreditModal(false);
    setShowBankTransferModal(false);
    setShowPayPalModal(false);
    setShowCryptoModal(false);
    
    const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);
    const methodName = selectedPaymentMethod?.name || paymentMethod;
    
    await confirmPendingTransaction(pendingTransactionId, methodName);
    
    setIsProcessing(false);
    setPendingTransactionId(null);
  };

  useEffect(() => {
    if (!planName) {
      toast.error("Nenhum plano selecionado!");
      navigate('/planos-publicos');
      return;
    }

    const plans = loadCustomPlans();
    const plan = plans.find(p => p.name === planName && p.status === 'ativo');
    
    if (!plan) {
      toast.error("Plano não encontrado!");
      navigate('/planos-publicos');
      return;
    }

    setSelectedPlan(plan);
    setPlanPrice(parseFloat(plan.price));
  }, [planName, navigate]);

  if (!selectedPlan) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title={`Pagamento - ${selectedPlan.name}`}
        subtitle="Complete o pagamento para ativar seu plano"
        isControlPanel={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card do Plano Selecionado - Enriquecido */}
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Crown className="w-5 h-5 mr-2 text-brand-purple" />
              Plano Selecionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border relative overflow-hidden" style={{
                background: selectedPlan.colors.background,
                borderColor: selectedPlan.colors.border
              }}>
                {/* Decorações do card */}
                <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className="absolute top-2 left-2 text-sm font-bold opacity-10"
                    style={{ color: selectedPlan.colors.suit }}
                  >
                    {selectedPlan.cardSuit}
                  </div>
                  <div 
                    className="absolute bottom-2 right-2 text-sm font-bold opacity-10 transform rotate-180"
                    style={{ color: selectedPlan.colors.suit }}
                  >
                    {selectedPlan.cardSuit}
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-2" style={{ color: selectedPlan.colors.text }}>
                    {selectedPlan.name}
                  </h3>
                  <p className="text-sm mb-4 opacity-90" style={{ color: selectedPlan.colors.text }}>
                    {selectedPlan.description}
                  </p>
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold" style={{ color: selectedPlan.colors.text }}>
                      R$ {selectedPlan.price}
                    </span>
                    <span className="text-sm opacity-80" style={{ color: selectedPlan.colors.text }}>
                      /{selectedPlan.billing_period}
                    </span>
                  </div>

                  {selectedPlan.discount > 0 && (
                    <div className="mb-4">
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: selectedPlan.colors.highlight,
                          color: selectedPlan.colors.text 
                        }}
                      >
                        <Star className="w-3 h-3 inline mr-1" />
                        {selectedPlan.discount}% OFF
                      </span>
                    </div>
                  )}

                  {/* Características do plano */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm" style={{ color: selectedPlan.colors.text }}>
                      <Calendar className="w-4 h-4" style={{ color: selectedPlan.colors.marker }} />
                      <span>Período: {selectedPlan.billing_period}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm" style={{ color: selectedPlan.colors.text }}>
                      <CreditCard className="w-4 h-4" style={{ color: selectedPlan.colors.marker }} />
                      <span>Renovação: Automática</span>
                    </div>

                    {selectedPlan.selectedModules && selectedPlan.selectedModules.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2 opacity-90" style={{ color: selectedPlan.colors.text }}>
                          Módulos Incluídos ({selectedPlan.selectedModules.length}):
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {selectedPlan.selectedModules.slice(0, 5).map((module: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs opacity-90" style={{ color: selectedPlan.colors.text }}>
                              <Check 
                                className="w-3 h-3 flex-shrink-0" 
                                style={{ color: selectedPlan.colors.marker }}
                              />
                              <span>{module}</span>
                            </div>
                          ))}
                          {selectedPlan.selectedModules.length > 5 && (
                            <div className="text-xs opacity-75 font-medium" style={{ color: selectedPlan.colors.text }}>
                              +{selectedPlan.selectedModules.length - 5} módulos adicionais
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/planos-publicos')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Planos
              </Button>
            </div>
          </CardContent>
        </Card>

        <PaymentMethodSelection
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          showWalletOption={true}
        />

        <PlanPaymentSummarySection
          planPrice={planPrice}
          finalAmountWithDiscount={finalAmountWithDiscount}
          currentBalance={currentBalance}
          isProcessing={isProcessing}
          canProceed={canProceed()}
          onPayment={handlePayment}
        />
      </div>

      <PaymentModals
        showPixModal={showPixModal}
        showCreditModal={showCreditModal}
        showBankTransferModal={showBankTransferModal}
        showPayPalModal={showPayPalModal}
        showCryptoModal={showCryptoModal}
        finalAmountWithDiscount={finalAmountWithDiscount}
        isProcessing={isProcessing}
        onClosePixModal={() => setShowPixModal(false)}
        onCloseCreditModal={() => setShowCreditModal(false)}
        onCloseBankTransferModal={() => setShowBankTransferModal(false)}
        onClosePayPalModal={() => setShowPayPalModal(false)}
        onCloseCryptoModal={() => setShowCryptoModal(false)}
        onPaymentConfirm={handleModalPaymentConfirm}
      />
    </div>
  );
};

export default PagarPlano;
