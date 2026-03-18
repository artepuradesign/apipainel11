import React, { useState, useRef } from 'react';
import { useExternalPlans } from '@/hooks/useExternalPlans';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, RefreshCw, Crown, Check, Mail, CreditCard, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { planPurchaseService } from '@/services/planPurchaseService';
import { useLiquidGlass } from '@/contexts/LiquidGlassContext';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import { Locale, useLocale } from '@/contexts/LocaleContext';

const sectionContent: Record<Locale, {
  loadingTitle: string;
  loadingSubtitle: string;
  loadingShort: string;
  loadError: string;
  loadErrorDescription: string;
  retry: string;
  noPlansTitle: string;
  noPlansDescription: string;
  noPlansSoon: string;
  sectionBadge: string;
  sectionTitle: string;
  sectionDescription: string;
  currentPlan: string;
  additionalFeatures: string;
  buyPlan: string;
  missingForUpgrade: string;
  addBalance: string;
}> = {
  'pt-BR': {
    loadingTitle: 'Planos Disponíveis',
    loadingSubtitle: 'Carregando planos...',
    loadingShort: 'Carregando...',
    loadError: 'Erro de Carregamento',
    loadErrorDescription: 'Não foi possível carregar os planos',
    retry: 'Tentar Novamente',
    noPlansTitle: 'Planos Disponíveis',
    noPlansDescription: 'Ainda não temos planos cadastrados',
    noPlansSoon: 'Em breve teremos novos planos.',
    sectionBadge: 'Plataforma de consultas',
    sectionTitle: 'Planos Empresarial',
    sectionDescription: 'Escolha o plano ideal para o seu negócio e comece a consultar agora mesmo.',
    currentPlan: '✦ PLANO ATUAL',
    additionalFeatures: 'recursos adicionais',
    buyPlan: 'Adquirir Plano',
    missingForUpgrade: 'Faltam',
    addBalance: '+ Adicionar Saldo',
  },
  en: {
    loadingTitle: 'Available Plans',
    loadingSubtitle: 'Loading plans...',
    loadingShort: 'Loading...',
    loadError: 'Loading Error',
    loadErrorDescription: 'Could not load plans',
    retry: 'Try Again',
    noPlansTitle: 'Available Plans',
    noPlansDescription: 'No plans have been registered yet',
    noPlansSoon: 'New plans will be available soon.',
    sectionBadge: 'Query platform',
    sectionTitle: 'Business Plans',
    sectionDescription: 'Choose the ideal plan for your business and start querying now.',
    currentPlan: '✦ CURRENT PLAN',
    additionalFeatures: 'additional features',
    buyPlan: 'Buy Plan',
    missingForUpgrade: 'Missing',
    addBalance: '+ Add Balance',
  },
  es: {
    loadingTitle: 'Planes disponibles',
    loadingSubtitle: 'Cargando planes...',
    loadingShort: 'Cargando...',
    loadError: 'Error de carga',
    loadErrorDescription: 'No se pudieron cargar los planes',
    retry: 'Reintentar',
    noPlansTitle: 'Planes disponibles',
    noPlansDescription: 'Aún no tenemos planes registrados',
    noPlansSoon: 'Pronto tendremos nuevos planes.',
    sectionBadge: 'Plataforma de consultas',
    sectionTitle: 'Planes empresariales',
    sectionDescription: 'Elige el plan ideal para tu negocio y empieza a consultar ahora mismo.',
    currentPlan: '✦ PLAN ACTUAL',
    additionalFeatures: 'recursos adicionales',
    buyPlan: 'Adquirir plan',
    missingForUpgrade: 'Faltan',
    addBalance: '+ Agregar saldo',
  },
};

const CarouselWithControls = ({ categoryPlans, categoryName, PlanCard }: any) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [api, setApi] = useState<any>(null);

  // Create autoplay plugin
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  // Handle play/pause - only after API is ready
  React.useEffect(() => {
    if (!api) return;
    
    const autoplay = autoplayPlugin.current;
    if (!autoplay) return;
    
    // Adicionar delay para garantir que o embla está completamente inicializado
    const timer = setTimeout(() => {
      try {
        if (isPlaying && !isHovered) {
          autoplay.play();
        } else {
          autoplay.stop();
        }
      } catch (error) {
        console.error('Error controlling autoplay:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [api, isPlaying, isHovered]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div 
      className="w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Carousel 
        className="w-full"
        plugins={[autoplayPlugin.current as any]}
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 1,
        }}
        setApi={setApi}
      >
        <CarouselContent className="overflow-visible py-4 -ml-4">
          {categoryPlans.map((plan: any, index: number) => (
            <CarouselItem 
              key={plan.id} 
              className="pl-4 basis-[85%] sm:basis-1/3 lg:basis-1/4"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <PlanCard plan={plan} categoryName={categoryName} />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Controladores do carrossel com play/pause */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <CarouselPrevious className="relative translate-y-0 left-0" />
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/90 shadow-lg hover:bg-white hover:shadow-xl border border-gray-200/50 dark:bg-gray-800/90 dark:hover:bg-gray-800 dark:border-gray-700/50 transition-all duration-300"
            onClick={togglePlayPause}
          >
            {isPlaying && !isHovered ? (
              <Pause className="h-5 w-5 text-brand-purple dark:text-brand-purple" />
            ) : (
              <Play className="h-5 w-5 text-brand-purple dark:text-brand-purple" />
            )}
          </Button>
          
          <CarouselNext className="relative translate-y-0 right-0" />
        </div>
      </Carousel>
    </div>
  );
};

const PublicPlansSection = () => {
  const { plans: externalPlans, isLoading, error, refetchPlans } = useExternalPlans();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance } = useWalletBalance();
  const { config: liquidGlassConfig } = useLiquidGlass();
  const { locale } = useLocale();
  const content = sectionContent[locale];

  const handlePlanSelection = (plan: any) => {
    // Redirecionar diretamente para a página de pagamento público
    navigate(`/public-plan-payment?planId=${plan.id}&planName=${encodeURIComponent(plan.name)}`);
  };

  const handleUpgradePlan = async (plan: any) => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const planPrice = parseFloat(plan.price) || 0;
      const userWalletBalance = balance?.saldo || 0;

      if (userWalletBalance < planPrice) {
        toast.error(`Saldo insuficiente. Necessário: R$ ${planPrice.toFixed(2)}, Disponível: R$ ${userWalletBalance.toFixed(2)}`);
        return;
      }

      // Confirmação da compra
      const confirmed = window.confirm(
        `Confirma a compra do plano ${plan.name} por R$ ${planPrice.toFixed(2)}?\n\n` +
        `Seu saldo atual: R$ ${userWalletBalance.toFixed(2)}\n` +
        `Saldo após compra: R$ ${(userWalletBalance - planPrice).toFixed(2)}`
      );

      if (!confirmed) return;

      const loadingToast = toast.loading('Processando compra do plano...');

      const purchaseData = {
        plan_id: plan.id,
        payment_method: 'wallet',
        amount: planPrice,
        description: `Compra do plano ${plan.name} via saldo da carteira`
      };

      const response = await planPurchaseService.purchasePlan(purchaseData);

      // Remover o toast de loading
      toast.dismiss(loadingToast);

      if (response.success) {
        // Toast único consolidado já é exibido pelo showPlanPurchaseToast no planPurchaseService
        
        // Recarregar saldo do usuário e atualizar seção de planos
        window.dispatchEvent(new Event('balanceUpdated'));
        window.dispatchEvent(new CustomEvent('planBalanceUpdated', { 
          detail: { 
            amount: planPrice,
            planName: plan.name 
          } 
        }));
      } else {
        throw new Error(response.error || 'Erro ao processar compra');
      }
    } catch (error) {
      console.error('Erro ao fazer upgrade do plano:', error);
      let errorMessage = 'Erro ao processar upgrade do plano';
      
      if (error instanceof Error) {
        // Tratar erros específicos da API
        if (error.message.includes('SQLSTATE[HY093]')) {
          errorMessage = 'Sistema temporariamente indisponível. Tente novamente em alguns minutos ou entre em contato com o suporte.';
        } else if (error.message.includes('Invalid parameter number')) {
          errorMessage = 'Erro interno do sistema. Nossa equipe técnica foi notificada. Tente novamente mais tarde.';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Garantir que o toast de loading seja removido em caso de erro
      toast.dismiss();
      toast.error(errorMessage, {
        duration: 8000, // Manter o erro visível por mais tempo
        action: {
          label: 'Tentar Novamente',
          onClick: () => handleUpgradePlan(plan)
        }
      });
    }
  };


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const u = user as any;
  const currentPlanId = u?.subscription?.plan_id;
  const currentPlanName = u?.subscription?.plan_name || u?.plan;

  const isCurrentPlan = (plan: any) => {
    if (!user) return false;

    if (currentPlanId != null && String(plan?.id) === String(currentPlanId)) return true;
    if (currentPlanName && String(plan?.name || '').toLowerCase() === String(currentPlanName).toLowerCase()) return true;

    return false;
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

  // Ordenar planos dentro de cada categoria (plano atual primeiro, depois sort_order)
  Object.keys(groupedPlans).forEach(category => {
    groupedPlans[category].sort((a, b) => {
      const aCurrent = isCurrentPlan(a) ? 1 : 0;
      const bCurrent = isCurrentPlan(b) ? 1 : 0;
      return bCurrent - aCurrent || (a.sort_order || 0) - (b.sort_order || 0);
    });
  });

  const PlanCard = ({ plan, categoryName }: { plan: any, categoryName: string }) => {
    const features = Array.isArray(plan.features) ? plan.features : [];
    const planPrice = parseFloat(plan.price) || 0;
    const userWalletBalance = balance?.saldo || 0;
    const hasSufficientBalance = user && userWalletBalance >= planPrice;
    const isCurrent = isCurrentPlan(plan);

    const MAX_VISIBLE_FEATURES = 5;
    const visibleFeatures = features.slice(0, MAX_VISIBLE_FEATURES);
    const remainingFeatures = Math.max(0, features.length - MAX_VISIBLE_FEATURES);

    return (
      <div className="w-full max-w-[260px] mx-auto">
        <motion.div
          whileHover={{ y: -6, scale: 1.03 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full"
        >
          <div
            className={`relative rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-500 plan-card-matrix ${
              isCurrent 
                ? 'ring-2 ring-primary' 
                : ''
            }`}
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.9) 100%)',
            }}
          >
            {/* Borda gradiente superior */}
            <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500" />

            {/* Glass overlay para dark mode */}
            <div className="absolute inset-0 dark:bg-gray-900/90 dark:backdrop-blur-xl pointer-events-none" />

            {/* Decoração de fundo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-tr-full pointer-events-none" />

            <div className="relative z-10 p-5 flex flex-col h-full">
              {/* Badge plano atual */}
              {isCurrent && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="text-[10px] px-2 py-0.5 bg-primary text-primary-foreground font-semibold shadow-sm">
                    {content.currentPlan}
                  </Badge>
                </div>
              )}

              {/* Badge popular */}
              {plan.is_popular && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-[10px] font-bold rounded-b-lg shadow-lg shadow-purple-500/30 tracking-wider uppercase">
                    {plan.badge || '★ Popular'}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className={`${plan.is_popular ? 'mt-4' : 'mt-1'} mb-4`}>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                  {plan.name}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Preço */}
              <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {plan.priceFormatted || formatCurrency(plan.price)}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-medium rounded-full border border-purple-200/50 dark:border-purple-700/30">
                  {plan.duration_days} dias
                </span>
                {plan.discount_percentage > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-200/50 dark:border-emerald-700/30">
                    -{plan.discount_percentage}% OFF
                  </span>
                )}
              </div>

              {/* Separador */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-4" />

              {/* Features */}
              <div className="space-y-2 mb-5 flex-grow">
                {visibleFeatures.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="leading-relaxed">{feature}</span>
                  </div>
                ))}
                {remainingFeatures > 0 && (
                  <div className="text-[11px] text-purple-500 dark:text-purple-400 font-medium pl-6">
                    +{remainingFeatures} {content.additionalFeatures}
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="space-y-2 mt-auto">
                {liquidGlassConfig.enabled ? (
                  <LiquidGlassButton
                    variant="primary"
                    className="w-full text-xs h-9 font-semibold"
                    onClick={() => handlePlanSelection(plan)}
                  >
                    {content.buyPlan}
                  </LiquidGlassButton>
                ) : (
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white text-xs h-9 rounded-xl font-semibold shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                    onClick={() => handlePlanSelection(plan)}
                  >
                    {content.buyPlan}
                  </Button>
                )}

                {user && hasSufficientBalance && (
                  liquidGlassConfig.enabled ? (
                    <LiquidGlassButton
                      variant="outline"
                      className="w-full text-xs h-9 font-semibold"
                      onClick={() => handleUpgradePlan(plan)}
                    >
                      Upgrade
                    </LiquidGlassButton>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs h-9 rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition-all duration-300"
                      onClick={() => handleUpgradePlan(plan)}
                    >
                      Upgrade
                    </Button>
                  )
                )}
              </div>

              {user && !hasSufficientBalance && (
                <div className="mt-3 text-center p-2 rounded-xl bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30">
                  <p className="text-[10px] text-red-500 dark:text-red-400 mb-1 font-medium">
                    {content.missingForUpgrade} R$ {(planPrice - userWalletBalance).toFixed(2)} para Upgrade
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 h-5 px-2 font-semibold"
                    onClick={() =>
                      navigate(
                        `/dashboard/adicionar-saldo?valor=${(planPrice - userWalletBalance).toFixed(2)}`
                      )
                    }
                  >
                    {content.addBalance}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {content.loadingTitle}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {content.loadingSubtitle}
            </p>
          </div>
          
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-purple mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{content.loadingShort}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {content.loadingTitle}
            </h2>
          </div>
          
          <div className="flex justify-center items-center py-6">
            <div className="w-full max-w-md">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-destructive/20 shadow-lg">
                <CardContent className="p-5 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-destructive/10 dark:bg-destructive/20 rounded-full">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {content.loadError}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {content.loadErrorDescription}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={refetchPlans}
                      className="bg-destructive hover:bg-destructive/90 text-white text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {content.retry}
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
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {content.noPlansTitle}
            </h2>
          </div>
          
          <div className="flex justify-center items-center py-6">
            <div className="text-center">
              <AlertCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {content.noPlansDescription}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {content.noPlansSoon}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-14 relative overflow-hidden bg-transparent">

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">
            {content.sectionBadge}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {content.sectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            {content.sectionDescription}
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedPlans).map(([categoryName, categoryPlans], categoryIndex) => {
            return (
              <motion.div
                key={categoryName}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
                className="w-full"
              >
                <div className="w-full">
                  {/* Categoria sem header */}

                  <CarouselWithControls
                    categoryPlans={categoryPlans}
                    categoryName={categoryName}
                    PlanCard={PlanCard}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PublicPlansSection;