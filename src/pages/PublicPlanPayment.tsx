import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useExternalPlans } from '@/hooks/useExternalPlans';
import { useAuth } from '@/contexts/AuthContext';
import { useUserDataApi } from '@/hooks/useUserDataApi';
import { usePixPaymentFlow } from '@/hooks/usePixPaymentFlow';
import { referralRegistrationService } from '@/services/referralRegistrationService';
import { planPurchaseService } from '@/services/planPurchaseService';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  ArrowLeft, 
  User, 
  Mail, 
  Crown, 
  Check, 
  Shield, 
  Clock,
  Loader2,
  Star,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  UserPlus,
  Info
} from 'lucide-react';
import PaymentMethodSelection from '@/components/payment/PaymentMethodSelection';
import PixQRCodeModal from '@/components/payment/PixQRCodeModal';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { motion } from "framer-motion";
import MenuSuperior from '@/components/MenuSuperior';
import Footer from '@/components/Footer';
import QRCode from 'react-qr-code';
import confetti from 'canvas-confetti';

const PublicPlanPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { plans, isLoading } = useExternalPlans();
  const { user, loading: authLoading } = useAuth();
  const { userData } = useUserDataApi();
  const { loading: pixLoading, pixResponse, checkingPayment, createPixPayment, checkPaymentStatus, generateNewPayment } = usePixPaymentFlow();
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isValidName, setIsValidName] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  // Estados dos modais de pagamento
  const [showPixModal, setShowPixModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  
  // Estados dos modais de autenticação
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Estado para controlar o toast do QR Code
  const [paymentToastId, setPaymentToastId] = useState<string | number | null>(null);

  const planId = searchParams.get('planId');
  const planName = searchParams.get('planName');

  // Função para celebrar pagamento aprovado
  const celebratePayment = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  // Find selected plan
  useEffect(() => {
    if (plans.length > 0 && (planId || planName)) {
      const plan = plans.find(p => 
        p.id === parseInt(planId || '0') || 
        p.name === decodeURIComponent(planName || '')
      );
      if (plan) {
        setSelectedPlan(plan);
      } else {
        toast.error('Plano não encontrado');
        navigate('/planos-publicos');
      }
    }
  }, [plans, planId, planName, navigate]);

  // Name validation
  useEffect(() => {
    setIsValidName(guestName.trim().length >= 2);
  }, [guestName]);

  // Email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(guestEmail));
  }, [guestEmail]);

  // Password validation
  useEffect(() => {
    setIsValidPassword(guestPassword.length >= 6);
  }, [guestPassword]);

  // Reconhecer pagamento automaticamente quando status mudar para approved
  useEffect(() => {
    if (pixResponse?.status === 'approved') {
      console.log('🎉 Pagamento aprovado detectado automaticamente!');
      
      // Limpar toast do QR Code se existir
      if (paymentToastId) {
        toast.dismiss(paymentToastId);
        setPaymentToastId(null);
      }
      
      // Celebrar pagamento
      celebratePayment();
      
      // Fechar modal PIX
      setShowPixModal(false);
      
      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [pixResponse?.status, paymentToastId, navigate]);

  const handleBackToPlans = () => {
    navigate('/planos-publicos');
  };

  const handleQuickRegistration = async () => {
    if (!isValidName) {
      toast.error('Por favor, insira seu nome completo');
      return;
    }

    if (!isValidEmail) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    if (!isValidPassword) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsRegistering(true);

    try {
      const registrationPayload = {
        email: guestEmail.trim(),
        password: guestPassword,
        full_name: guestName.trim(),
        user_role: 'assinante',
        aceite_termos: true
      };

      console.log('🚀 [QUICK_REGISTRATION] Registrando usuário para pagamento...');
      
      const registrationResult = await referralRegistrationService.registerWithReferral(registrationPayload);

      if (!registrationResult.success) {
        console.error('❌ [QUICK_REGISTRATION] Falha no registro:', registrationResult);
        const errorMessage = registrationResult.message || registrationResult.error || 'Erro no cadastro';
        toast.error(errorMessage);
        return;
      }

      console.log('✅ [QUICK_REGISTRATION] Registro bem-sucedido, abrindo modal de pagamento...');
      toast.success('Conta criada com sucesso!');
      
      // Após registro bem-sucedido, recarregar para atualizar autenticação
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ [QUICK_REGISTRATION] Erro no registro:', error);
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Fechar todos os modais
  const closeAllModals = () => {
    setShowPixModal(false);
    setShowCreditModal(false);
    setShowPayPalModal(false);
  };

  // Criar pagamento PIX real
  const createPlanPixPayment = async (amount: number): Promise<void> => {
    try {
      const pixData = await createPixPayment(amount, userData);
      if (pixData) {
        setShowPixModal(true);
        
        // Criar notificação com QR code embutido e botão cancelar
        const toastId = toast.info(
          <div className="flex items-center gap-3">
            {pixData.qr_code && (
              <div className="flex-shrink-0 bg-white p-2 rounded border-2 border-green-500">
                <QRCode value={pixData.qr_code} size={80} />
              </div>
            )}
            <div className="space-y-1">
              <p className="font-semibold">Pagamento PIX Criado</p>
              <p className="text-sm">Seu QR Code está disponível. Não feche sem pagar!</p>
            </div>
          </div>,
          {
            duration: Infinity,
            action: {
              label: 'Ver QR Code',
              onClick: () => setShowPixModal(true)
            },
            cancel: {
              label: 'Cancelar',
              onClick: () => {
                setShowPixModal(false);
                toast.dismiss(toastId);
                toast.info('Pagamento cancelado');
              }
            }
          }
        );
        
        setPaymentToastId(toastId);
      }
    } catch (error) {
      console.error('Erro ao criar transação pendente:', error);
      toast.error("Erro ao processar solicitação!");
    }
  };

  // Verificar pagamento (chamado pelos modais) - Similar ao AdicionarSaldo
  const confirmPayment = async (): Promise<void> => {
    console.log(`🔄 Verificando pagamento ${paymentMethod}...`);
    
    if (!pixResponse?.payment_id) {
      toast.error('Pagamento não encontrado');
      return;
    }

    toast.loading('Verificando seu pagamento...', { id: 'checking-payment' });

    try {
      // 1. FORÇAR verificação de pagamentos pendentes no backend
      console.log('🔍 [PAGUEI] Forçando verificação de pagamentos pendentes...');
      const checkResponse = await fetch(`https://api.apipainel.com.br/mercadopago/check-pending-payments`, {
        method: 'GET'
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        console.log('✅ [PAGUEI] Resposta da verificação:', checkData);
        
        // Aguardar 2 segundos para o backend processar
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // 2. Verificar o status atualizado do pagamento
      const status = await checkPaymentStatus(pixResponse.payment_id);
      
      if (status === 'approved') {
        // Limpar toast do QR Code
        if (paymentToastId) {
          toast.dismiss(paymentToastId);
          setPaymentToastId(null);
        }
        
        toast.success('🎉 Pagamento aprovado!', { 
          id: 'checking-payment',
          description: 'Processando sua compra...' 
        });
        
        // Celebrar pagamento
        celebratePayment();
        
        // Processar a compra do plano
        if (!selectedPlan || !user) {
          toast.error('Dados incompletos para processar pagamento');
          return;
        }

        const planPrice = parseFloat(selectedPlan.price.toString()) || 0;
        const purchaseData = {
          plan_id: selectedPlan.id,
          payment_method: paymentMethod,
          amount: planPrice,
          description: `Compra do plano ${selectedPlan.name} via ${paymentMethod}`
        };

        const response = await planPurchaseService.purchasePlan(purchaseData);

        if (response.success) {
          window.dispatchEvent(new Event('balanceUpdated'));
          window.dispatchEvent(new CustomEvent('planBalanceUpdated', { 
            detail: { 
              amount: planPrice,
              planName: selectedPlan.name 
            } 
          }));
          
          setShowPixModal(false);
          setTimeout(() => {
            navigate('/dashboard');
          }, 800);
        } else {
          throw new Error(response.error || 'Erro ao processar compra');
        }
      } else {
        toast.info('⏳ Ainda processando', {
          id: 'checking-payment',
          description: 'Aguarde alguns instantes e verifique novamente'
        });
        setShowPixModal(false);
        setTimeout(() => {
          navigate('/dashboard/meu-historico-pix');
        }, 1000);
      }
    } catch (error) {
      console.error('❌ [PAGUEI] Erro ao verificar:', error);
      toast.error('Erro ao verificar pagamento', { id: 'checking-payment' });
      closeAllModals();
    }
  };

  const handleProcessPayment = async () => {
    if (!user) {
      toast.error('Por favor, faça login ou crie uma conta antes de continuar');
      return;
    }

    if (!selectedPlan) {
      toast.error('Nenhum plano selecionado');
      return;
    }

    const planPrice = parseFloat(selectedPlan.price.toString()) || 0;

    // Criar pagamento PIX real
    if (paymentMethod === 'pix') {
      await createPlanPixPayment(planPrice);
    } else {
      toast.info('Método de pagamento em breve');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Carregando dados do plano...</p>
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">Plano não encontrado</p>
          <Button onClick={handleBackToPlans}>
            Voltar aos Planos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_70%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <MenuSuperior />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
          {/* Header */}
          <Card className="mb-8 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 text-white border-none shadow-xl">
            <CardHeader className="relative z-10 pb-6">
              <div className="flex items-center justify-between">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-4"
                >
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{selectedPlan?.name || 'Plano'}</h1>
                    <p className="text-white/90 mt-1">Finalizar Pagamento</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Button
                    variant="ghost"
                    onClick={handleBackToPlans}
                    className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Plan Card */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-5"
            >
              <Card className="bg-white dark:bg-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700 h-fit">
                {selectedPlan.is_popular && (
                  <div className="relative -top-2 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                    <Badge className="bg-purple-500 text-white">
                      {selectedPlan.badge || 'Mais Popular'}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 rounded-xl border border-purple-200 dark:border-purple-700">
                      <Crown className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Preço</div>
                      <div className="font-bold text-purple-600 dark:text-purple-400 text-2xl">
                        {formatCurrency(selectedPlan.price)}
                      </div>
                      {selectedPlan.discount_percentage > 0 && (
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                          {selectedPlan.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {selectedPlan.name}
                    </h3>
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      {selectedPlan.max_consultations === -1 ? 'Ilimitadas' : `${selectedPlan.max_consultations} consultas`}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {selectedPlan.description}
                  </p>
                  
                  {selectedPlan.features && selectedPlan.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Recursos inclusos:
                      </h4>
                      {selectedPlan.features.slice(0, 5).map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Payment Form */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* User Information */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="w-5 h-5 mr-2 text-brand-purple" />
                    Suas Informações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user ? (
                    /* User is logged in */
                    <div className="space-y-3">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <Check className="h-4 w-4" />
                          <span className="font-medium">Logado como:</span>
                        </div>
                        <p className="text-green-600 dark:text-green-300 mt-1">{user.email}</p>
                      </div>
                    </div>
                  ) : (
                    /* Show need to login/register message */
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">Login Necessário</span>
                        </div>
                        <p className="text-orange-600 dark:text-orange-300 text-sm mb-3">
                          Para finalizar a compra do plano, você precisa estar logado em sua conta.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowLoginModal(true)}
                            className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                          >
                            Fazer Login
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setShowRegisterModal(true)}
                            className="bg-brand-purple hover:bg-brand-darkPurple text-white"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Criar Conta
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <PaymentMethodSelection
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                limitedMethods={['pix']}
              />

              {/* Payment Summary */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <CreditCard className="w-5 h-5 mr-2 text-brand-purple" />
                    Resumo do Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Plano selecionado:</span>
                    <span className="font-medium">{selectedPlan.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Valor:</span>
                    <span className="font-bold text-xl text-purple-600 dark:text-purple-400">
                      {formatCurrency(selectedPlan.price)}
                    </span>
                  </div>

                  <Button
                    onClick={handleProcessPayment}
                    disabled={isProcessing || !user || pixLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 text-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {isProcessing || pixLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : !user ? (
                      <>
                        <Shield className="h-5 w-5 mr-2" />
                        Login Necessário
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Finalizar Compra - {formatCurrency(selectedPlan.price)}
                      </>
                    )}
                  </Button>

                  {!user && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Você precisa estar logado para finalizar a compra
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>

      {/* PIX Modal with Real QR Code */}
      <PixQRCodeModal
        isOpen={showPixModal}
        onClose={closeAllModals}
        amount={selectedPlan?.price || 0}
        onPaymentConfirm={confirmPayment}
        isProcessing={checkingPayment}
        pixData={pixResponse}
        onGenerateNew={async () => {
          if (selectedPlan) {
            await generateNewPayment(parseFloat(selectedPlan.price.toString()), userData);
          }
        }}
      />

      {/* Authentication Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
};

export default PublicPlanPayment;