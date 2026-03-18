import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AmountSelection from '@/components/payment/AmountSelection';
import PixQRCodeModal from '@/components/payment/PixQRCodeModal';
import CreditCardModal from '@/components/payment/CreditCardModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserDataApi } from '@/hooks/useUserDataApi';
import { usePixPaymentFlow } from '@/hooks/usePixPaymentFlow';
import { pixPaymentsApiService } from '@/services/pixPaymentsApiService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CreditCard, Ticket, Wallet } from 'lucide-react';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import QRCode from 'react-qr-code';
import { formatBrazilianCurrency } from '@/utils/historicoUtils';
import { usePaymentPolling } from '@/hooks/usePaymentPolling';
import { API_BASE_URL } from '@/config/apiConfig';
import { apiRequest, fetchApiConfig } from '@/config/api';

const AdicionarSaldo = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { userData } = useUserDataApi();
  const { loading, pixResponse, checkingPayment, createPixPayment, checkPaymentStatus, generateNewPayment } = usePixPaymentFlow();
  
  const [cupomAplicado, setCupomAplicado] = useState<any>(null);
  const [descontoCupom, setDescontoCupom] = useState(0);
  const [showCupomSection, setShowCupomSection] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [showPixModal, setShowPixModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);

  // Verificação automática de TODOS os pagamentos pendentes (não só o atual)
  usePaymentPolling({
    onUpdate: () => {
      console.log('🔄 [ADICIONAR-SALDO] Pagamentos atualizados globalmente');
    },
    interval: 15000, // 15 segundos
    enabled: true
  });

  // Estado para controlar toasts de pagamento
  const [paymentToastId, setPaymentToastId] = useState<string | number | null>(null);

  // Função de animação de celebração
  const celebratePayment = () => {
    // Criar confetti simples com emojis
    const confettiCount = 50;
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.textContent = ['🎉', '✨', '💰', '🎊'][Math.floor(Math.random() * 4)];
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-50px';
      confetti.style.fontSize = '24px';
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      confetti.style.animation = `fall ${2 + Math.random() * 2}s linear forwards`;
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 4000);
    }
    
    // Adicionar keyframes se não existir
    if (!document.getElementById('confetti-animation')) {
      const style = document.createElement('style');
      style.id = 'confetti-animation';
      style.textContent = `
        @keyframes fall {
          to {
            transform: translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Auto-checagem via webhook enquanto o modal estiver aberto
  useEffect(() => {
    if (!showPixModal || !pixResponse?.payment_id) return;

    let cancelled = false;

    const checkLive = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/mercadopago/check-payment-status-live.php?payment_id=${pixResponse.payment_id}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const newStatus = data?.data?.status;

        if (newStatus === 'approved') {
          if (cancelled) return;
          
          // Disparar animação de celebração
          celebratePayment();
          
          toast.success('🎉 Pagamento Aprovado!', { 
            description: 'Seu saldo foi creditado com sucesso!',
            duration: 3000
          });
          
          setShowPixModal(false);
          
          // Cancelar toast de QR Code se existir
          if (paymentToastId) {
            toast.dismiss(paymentToastId);
          }
          
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else if (newStatus && ['rejected', 'cancelled', 'expired'].includes(newStatus)) {
          if (cancelled) return;
          const msg = newStatus === 'rejected' ? 'Pagamento rejeitado' : newStatus === 'expired' ? 'QR Code expirado' : 'Pagamento cancelado';
          toast.error(msg);
          
          // Cancelar toast de QR Code se existir
          if (paymentToastId) {
            toast.dismiss(paymentToastId);
          }
        }
      } catch (error) {
        console.error('Erro ao checar status (live):', error);
      }
    };

    const interval = setInterval(checkLive, 3000);
    checkLive();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [showPixModal, pixResponse?.payment_id, paymentToastId]);

  const paymentMethods = [
    { id: 'pix', name: 'PIX', description: 'Aprovação instantânea', icon: Wallet, badge: 'Instantâneo' },
    { id: 'card', name: 'Cartão de Crédito', description: 'Confirmação imediata', icon: CreditCard, badge: 'Online' }
  ];

  const finalAmount = selectedAmount > 0 ? selectedAmount : parseFloat(customAmount) || 0;

  // Pré-preencher valor da URL e detectar se veio de um módulo
  const [fromModule, setFromModule] = useState(false);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const valorParam = searchParams.get('valor');
    const fromModuleParam = searchParams.get('fromModule');
    
    if (fromModuleParam === 'true') {
      setFromModule(true);
    }
    
    if (valorParam) {
      const valor = parseFloat(valorParam);
      if (!isNaN(valor) && valor > 0) {
        setCustomAmount(valor.toString());
        setSelectedAmount(0);
        if (fromModuleParam === 'true') {
          toast.info(`Valor de R$ ${valor.toFixed(2)} necessário para completar o saldo`);
        } else {
          toast.success(`Valor R$ ${valor.toFixed(2)} preenchido automaticamente`);
        }
      }
    }
  }, [location.search]);


  // Calcular valor final com desconto do cupom
  const valorComDesconto = finalAmount - descontoCupom;
  const valorFinalPagamento = Math.max(valorComDesconto, 0);

  const handleCupomValidated = (cupom: any, desconto: number) => {
    setCupomAplicado(cupom);
    setDescontoCupom(desconto);
  };

  const handleRemoveCupom = () => {
    setCupomAplicado(null);
    setDescontoCupom(0);
    toast.info('Cupom removido');
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(0);
  };

  const canProceed = () => {
    return finalAmount > 0 && ['pix', 'card'].includes(paymentMethod);
  };

  const handlePayment = async () => {
    if (!canProceed()) {
      toast.error('Selecione um valor válido');
      return;
    }

    const valorFinal = Math.max(valorFinalPagamento, 0);
    if (valorFinal <= 0) {
      toast.error('Valor do pagamento deve ser maior que zero');
      return;
    }

    if (paymentMethod === 'card') {
      setShowCreditModal(true);
      return;
    }

    // Criar pagamento PIX
    const pixData = await createPixPayment(valorFinal, userData);
    if (pixData) {
      setShowPixModal(true);
      
      // Criar notificação com QR code embutido e botão de cancelar
      const toastId = toast.info(
        <div className="flex items-center gap-3">
          {pixData.qr_code && (
            <div className="flex-shrink-0 bg-white p-2 rounded border-2 border-green-500">
              <QRCode value={pixData.qr_code} size={80} />
            </div>
          )}
          <div className="space-y-2">
            <div>
              <p className="font-semibold">Pagamento PIX Criado</p>
              <p className="text-sm">Seu QR Code está disponível. Não feche sem pagar!</p>
            </div>
            <button
              onClick={() => {
                toast.dismiss(toastId);
                setShowPixModal(false);
                toast.info('Pagamento cancelado');
              }}
              className="text-xs px-2 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>,
        {
          duration: Infinity,
          action: {
            label: 'Ver QR Code',
            onClick: () => setShowPixModal(true)
          },
        }
      );
      
      // Salvar ID do toast para poder cancelá-lo depois
      setPaymentToastId(toastId);
    }
  };

  const handleCardPayment = async (cardData?: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardName: string;
  }) => {
    if (!cardData) {
      toast.error('Dados do cartão inválidos');
      return;
    }

    const valorFinal = Math.max(valorFinalPagamento, 0);
    if (valorFinal <= 0) {
      toast.error('Valor inválido para pagamento');
      return;
    }

    if (!userData?.email || !userData?.cpf) {
      toast.error('Complete seu cadastro (email e CPF) para pagar com cartão');
      return;
    }

    setCardLoading(true);

    try {
      await fetchApiConfig();
      const response = await apiRequest<any>('/mercadopago/create-card-payment.php', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id || null,
          transactionAmount: valorFinal.toFixed(2),
          email: userData.email,
          identificationType: 'CPF',
          identificationNumber: String(userData.cpf).replace(/\D/g, ''),
          cardholderName: cardData.cardName,
          cardNumber: cardData.cardNumber.replace(/\s/g, ''),
          expirationMonth: cardData.expiryMonth,
          expirationYear: cardData.expiryYear,
          securityCode: cardData.cvv,
          installments: 1,
          description: 'Recarga de Saldo'
        })
      });

      if (!response?.success) {
        toast.error(response?.message || response?.error || 'Não foi possível processar o cartão');
        return;
      }

      const status = response?.data?.status;
      if (status === 'approved') {
        toast.success('Pagamento aprovado! Saldo adicionado com sucesso.');
        setShowCreditModal(false);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1200);
      } else {
        toast.info(`Pagamento retornou status: ${status || 'em análise'}`);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao processar pagamento com cartão');
    } finally {
      setCardLoading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    if (!pixResponse?.payment_id) {
      toast.error('Pagamento não encontrado');
      return;
    }

    toast.loading('Verificando seu pagamento...', { id: 'checking-payment' });

    try {
      // 1. FORÇAR verificação de pagamentos pendentes no backend
      console.log('🔍 [PAGUEI] Forçando verificação de pagamentos pendentes...');
      const checkResponse = await fetch(`${API_BASE_URL}/mercadopago/check-pending-payments`, {
        method: 'GET'
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        console.log('✅ [PAGUEI] Resposta da verificação:', checkData);
        
        // Aguardar 2 segundos para o backend processar
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // 2. Verificar o status atualizado do pagamento
      const uid = user?.id;
      if (uid) {
        const res = await pixPaymentsApiService.listPixPayments(Number(uid), 1, 100);
        if (res.success && res.data?.payments?.length) {
          const found = res.data.payments.find(p => String(p.payment_id) === String(pixResponse.payment_id));
          
          if (found?.status === 'approved') {
            toast.success('🎉 Pagamento aprovado!', { 
              id: 'checking-payment',
              description: 'Seu saldo foi creditado com sucesso!' 
            });
            setShowPixModal(false);
            setTimeout(() => window.location.href = '/dashboard', 1500);
            return;
          }
        }
      }

      // 3. Se ainda não foi aprovado, fazer polling completo
      const status = await checkPaymentStatus(pixResponse.payment_id);
      
      if (status === 'approved') {
        // Disparar animação de celebração
        celebratePayment();
        
        toast.success('🎉 Pagamento aprovado!', { 
          id: 'checking-payment',
          description: 'Redirecionando...' 
        });
        
        setShowPixModal(false);
        
        // Cancelar toast de QR Code se existir
        if (paymentToastId) {
          toast.dismiss(paymentToastId);
        }
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        toast.info('⏳ Ainda processando', {
          id: 'checking-payment',
          description: 'Aguarde alguns instantes e verifique novamente'
        });
        setShowPixModal(false);
        setTimeout(() => {
          window.location.href = '/dashboard/meu-historico-pix';
        }, 1000);
      }
    } catch (error) {
      console.error('❌ [PAGUEI] Erro ao verificar:', error);
      toast.error('Erro ao verificar pagamento', { id: 'checking-payment' });
    }
  };

  const handleGenerateNew = async () => {
    if (finalAmount <= 0) {
      toast.error('Valor inválido');
      return;
    }

    const valorFinal = Math.max(valorFinalPagamento, 0);
    await generateNewPayment(valorFinal, userData);
  };

  const [cupomCodigo, setCupomCodigo] = useState('');
  const [isValidatingCupom, setIsValidatingCupom] = useState(false);

  const handleValidateCupom = async () => {
    if (!cupomCodigo.trim()) {
      toast.error('Digite um código de cupom');
      return;
    }

    setIsValidatingCupom(true);

    try {
      const { cupomApiService } = await import('@/services/cupomApiService');
      const response = await cupomApiService.validateCupom(cupomCodigo, user ? parseInt(user.id) : undefined);
      
      if (response.success && response.data) {
        const cupom = response.data;
        let desconto = 0;

        if (cupom.tipo === 'fixo') {
          desconto = cupom.valor;
        } else if (cupom.tipo === 'percentual') {
          desconto = (finalAmount * cupom.valor) / 100;
        }

        desconto = Math.min(desconto, finalAmount);
        setCupomAplicado(cupom);
        setDescontoCupom(desconto);
        toast.success(`Cupom aplicado! Desconto de ${formatBrazilianCurrency(desconto)}`);
        setCupomCodigo('');
      } else {
        toast.error(response.error || 'Cupom inválido');
      }
    } catch (error) {
      toast.error('Erro ao validar cupom');
    } finally {
      setIsValidatingCupom(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto px-1 sm:px-0">
      {/* Header usando DashboardTitleCard */}
      <DashboardTitleCard
        title="Adicionar Saldo"
        subtitle="Escolha o método de pagamento e o valor para recarregar"
        icon={<Wallet className="h-4 w-4 sm:h-5 sm:w-5" />}
      />

      {/* Layout Principal: Método de Pagamento + Valor lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Método de Pagamento */}
        <Card className="h-fit">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              Método de Pagamento
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Selecione como deseja adicionar saldo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`flex items-center p-3 sm:p-4 border rounded-lg transition-all duration-200 ${
                      paymentMethod === method.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50 hover:shadow-sm cursor-pointer'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <span className="font-medium text-sm sm:text-base">{method.name}</span>
                        <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                          {method.badge}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 ml-6 sm:ml-8">
                        {method.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Cupom de Desconto */}
            <div className="pt-3 sm:pt-4 border-t">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Ticket className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium">Cupom de Desconto</span>
              </div>
              {!cupomAplicado ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Digite o código"
                    value={cupomCodigo}
                    onChange={(e) => setCupomCodigo(e.target.value.toUpperCase())}
                    disabled={isValidatingCupom}
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleValidateCupom}
                    disabled={!cupomCodigo.trim() || isValidatingCupom}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    {isValidatingCupom ? 'Validando...' : 'Aplicar'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-300" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">
                        {cupomAplicado.codigo}
                      </p>
                      <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400">
                        -{formatBrazilianCurrency(descontoCupom)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRemoveCupom}
                    variant="ghost"
                    size="sm"
                    className="h-7 sm:h-8 text-[10px] sm:text-xs"
                  >
                    Remover
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Escolha o Valor */}
        <AmountSelection
          selectedAmount={selectedAmount}
          customAmount={customAmount}
          onAmountSelect={handleAmountSelect}
          onCustomChange={handleCustomChange}
          finalAmount={finalAmount}
          descontoCupom={descontoCupom}
          valorFinalPagamento={valorFinalPagamento}
          cupomAplicado={cupomAplicado}
          canProceed={canProceed}
          isProcessing={loading || cardLoading}
          onPayment={handlePayment}
          hidePresets={fromModule}
        />
      </div>


      {/* Modal de PIX */}
      <PixQRCodeModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        amount={valorFinalPagamento}
        onPaymentConfirm={handlePaymentConfirm}
        isProcessing={checkingPayment}
        pixData={pixResponse}
        onGenerateNew={handleGenerateNew}
      />

      {/* Modal de Cartão */}
      <CreditCardModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        amount={valorFinalPagamento}
        onPaymentConfirm={handleCardPayment}
        isProcessing={cardLoading}
      />
    </div>
  );
};

export default AdicionarSaldo;