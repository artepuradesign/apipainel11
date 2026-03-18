
import React, { useState, useEffect } from 'react';
import { useExternalPlans } from '@/hooks/useExternalPlans';
import { AlertCircle, Loader2, RefreshCw, Crown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { showPlanActivationToast, showPlanErrorToast, showInsufficientBalanceToast } from '@/utils/planToasts';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useAuth } from '@/contexts/AuthContext';
import { useUserBalance } from '@/hooks/useUserBalance';
import { buyPlanWithWalletBalance } from '@/utils/balanceUtils';
import { checkBalanceForModule } from '@/utils/balanceChecker';

const PlansSection = () => {
  const { plans: externalPlans, isLoading, error, refetchPlans } = useExternalPlans();
  const { user } = useAuth();
  const { totalAvailableBalance } = useUserBalance();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoSlideInterval, setAutoSlideInterval] = useState<NodeJS.Timeout | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  
  const handlePlanPurchase = (plan: any) => {
    // Direciona para página de pagamento de planos com os dados do plano
    toast.info(`Redirecionando para pagamento do plano ${plan.name}...`);
    setTimeout(() => {
      navigate(`/public-plan-payment?planId=${plan.id}&planName=${encodeURIComponent(plan.name)}`);
    }, 500);
  };

  const handlePlanUpgrade = async (plan: any) => {
    if (!user) {
      // Para usuários não logados, redirecionar para página de pagamento também
      toast.info(`Redirecionando para pagamento do plano ${plan.name}...`);
      setTimeout(() => {
        navigate(`/public-plan-payment?planId=${plan.id}&planName=${encodeURIComponent(plan.name)}`);
      }, 500);
      return;
    }

    const planPrice = plan.price;
    const planName = plan.name;

    // Verificar saldo usando o balanceChecker
    if (!checkBalanceForModule(totalAvailableBalance, planPrice.toString(), planName, user.tipoplano || 'Pré-Pago', () => navigate('/dashboard/carteira'))) {
      return;
    }

    setProcessingPlan(planName);

    try {
      const success = await buyPlanWithWalletBalance(user.id, planName, planPrice);
      
      if (success) {
        showPlanActivationToast({
          planName,
          value: planPrice,
          paymentMethod: 'Saldo do Plano'
        });
        // Disparar evento para atualizar o plano atual
        window.dispatchEvent(new CustomEvent('planPurchased', { 
          detail: { planName, userId: user.id }
        }));
      } else {
        showPlanErrorToast('Erro ao ativar o plano. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao comprar plano:', error);
      toast.error('Erro interno ao processar pagamento.');
    } finally {
      setProcessingPlan(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Agrupar planos por categoria
  const groupedPlans = externalPlans.reduce((acc, plan) => {
    const category = plan.category || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(plan);
    return acc;
  }, {} as Record<string, typeof externalPlans>);

  // Ordenar planos dentro de cada categoria por sort_order
  Object.keys(groupedPlans).forEach(category => {
    groupedPlans[category].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  });

  const PlanCard = ({ plan, categoryName }: { plan: any, categoryName: string }) => {
    const features = Array.isArray(plan.features) ? plan.features : [];
    
    return (
      <div className="w-full max-w-[260px] mx-auto">
        <Card className={`w-full bg-white dark:bg-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 hover:-translate-y-1 h-full flex flex-col ${plan.is_popular ? 'ring-2 ring-purple-500' : ''} relative min-h-[380px]`}>
          {plan.is_popular && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
              <Badge className="bg-purple-500 text-white">
                {plan.badge || 'Mais Popular'}
              </Badge>
            </div>
          )}
          
          <CardHeader className="pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 rounded-xl border border-purple-200 dark:border-purple-700">
                <Crown className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">Preço</div>
                <div className="font-bold text-purple-600 dark:text-purple-400">
                  {plan.priceFormatted || formatCurrency(plan.price)}
                </div>
                {plan.discount_percentage > 0 && (
                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                    {plan.discount_percentage}% OFF
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 flex flex-col flex-grow">
            <div className="mb-3">
              <h3 className="tracking-tight text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {plan.name}
              </h3>
              <Badge variant="outline" className="text-purple-600 border-purple-600">
                {plan.max_consultations === -1 ? 'Ilimitadas' : `${plan.max_consultations} consultas`}
              </Badge>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
              {plan.description}
            </p>
            
            <div className="space-y-2 mb-6 flex-grow">
              {features.slice(0, 3).map((feature: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{feature}</span>
                </div>
              ))}
              {features.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  +{features.length - 3} recursos adicionais
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-auto">
              {/* Lógica dos botões conforme solicitado */}
              {user && totalAvailableBalance >= plan.price ? (
                // Usuário logado com saldo suficiente: mostrar apenas botão Upgrade
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => handlePlanUpgrade(plan)}
                  disabled={processingPlan === plan.name}
                >
                  {processingPlan === plan.name ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    'Upgrade'
                  )}
                </Button>
              ) : (
                // Usuário não logado ou saldo insuficiente: mostrar apenas botão Assinar
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => handlePlanPurchase(plan)}
                >
                  Assinar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Planos Disponíveis
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Carregando planos da nossa API...
            </p>
          </div>
          
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-purple mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Carregando planos...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Planos Disponíveis
            </h2>
          </div>
          
          <div className="flex justify-center items-center py-12">
            <div className="w-full max-w-lg">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-destructive/20 dark:border-destructive/20 shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-destructive/10 dark:bg-destructive/20 rounded-full">
                      <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Erro de Carregamento
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Não foi possível carregar os planos da API
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        HTTP 500 - Erro interno do servidor
                      </p>
                    </div>
                    
                    <Button
                      onClick={refetchPlans}
                      className="bg-destructive hover:bg-destructive/90 text-white px-6 py-2"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar Novamente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (externalPlans.length === 0) {
    return (
      <section className="py-16 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Planos Disponíveis
            </h2>
          </div>
          
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Ainda não temos planos cadastrados
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Em breve teremos novos planos disponíveis para você.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  console.log('🌐 Exibindo planos da API externa agrupados por categoria:', Object.keys(groupedPlans));

  return (
    <section className="py-16 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        <div className="space-y-16">
          {Object.entries(groupedPlans).map(([categoryName, categoryPlans], categoryIndex) => {
            
            return (
              <motion.div
                key={categoryName}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
                className="w-full"
              >
                <div className="w-full">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                        <Crown className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Planos {categoryName}
                      </h3>
                      <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full text-lg font-bold">
                        {categoryPlans.length}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Planos especialmente desenvolvidos da categoria {categoryName}
                    </p>
                  </div>
                  
                  <div className="w-full">
                    {/* Desktop: Grid responsivo sem carousel */}
                    <div className="hidden lg:block">
                       <div className={`grid gap-6 w-full ${
                         categoryPlans.length === 1 ? 'grid-cols-1 justify-center' :
                         categoryPlans.length === 2 ? 'grid-cols-2' :
                         categoryPlans.length === 3 ? 'grid-cols-3' :
                         categoryPlans.length === 4 ? 'grid-cols-4' :
                         'grid-cols-5'
                       }`}>
                        {categoryPlans.map((plan, index) => (
                          <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                          >
                            <PlanCard plan={plan} categoryName={categoryName} />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                     {/* Mobile/Tablet: Grid responsivo */}
                     <div className="lg:hidden">
                       <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                         {categoryPlans.map((plan, index) => (
                           <motion.div
                             key={plan.id}
                             initial={{ opacity: 0, y: 20 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true }}
                             transition={{ duration: 0.5, delay: 0.1 * index }}
                           >
                             <PlanCard plan={plan} categoryName={categoryName} />
                           </motion.div>
                         ))}
                       </div>
                      </div>
                   </div>
                 </div>
               </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
