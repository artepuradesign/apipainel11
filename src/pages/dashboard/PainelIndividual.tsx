import React from 'react';
import { useParams } from 'react-router-dom';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useApiPanelData } from '@/hooks/useApiPanelData';
import { useApiModules } from '@/hooks/useApiModules';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import StatsCard from '@/components/dashboard/StatsCard';
import ModuleCardTemplates from '@/components/configuracoes/personalization/ModuleCardTemplates';
import ModuleGridWrapper from '@/components/configuracoes/personalization/ModuleGridWrapper';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Icons from 'lucide-react';
import { Package, Lock } from 'lucide-react';
import EmptyState from '@/components/ui/empty-state';
import { useIsMobile } from '@/hooks/use-mobile';

const PainelIndividual = () => {
  const { painelId } = useParams<{ painelId: string }>();
  const { totalAvailableBalance, calculateTotalAvailableBalance, isLoading: isBalanceLoading, hasLoadedOnce, loadTotalAvailableBalance } = useUserBalance();
  const { panel, isLoading: panelLoading } = useApiPanelData(painelId);
  const { modules } = useApiModules();
  const { 
    calculateDiscountedPrice, 
    subscription, 
    planInfo, 
    discountPercentage, 
    hasActiveSubscription 
  } = useUserSubscription();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Get user data from localStorage with user-specific keys
  const currentPlan = subscription?.plan_name || planInfo?.name || user ? localStorage.getItem(`user_plan_${user.id}`) || 'Pré-Pago' : 'Pré-Pago';
  const consultationHistory = user ? JSON.parse(localStorage.getItem(`consultation_history_${user.id}`) || "[]") : [];

  console.log('🔍 [PAINEL_INDIVIDUAL] Dados do plano da API:', {
    hasActiveSubscription,
    subscriptionPlan: subscription?.plan_name,
    planInfoName: planInfo?.name,
    discountPercentageFromAPI: discountPercentage,
    currentPlan
  });

  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent || Package;
  };

  const formatPrice = (price: number | string) => {
    if (!price && price !== 0) return '0,00';
    
    if (typeof price === 'string') {
      return price;
    }
    
    const numericValue = typeof price === 'number' ? price : 0;
    return numericValue.toFixed(2).replace('.', ',');
  };

  const getModulePageRoute = (module: any): string => {
    // Agora o campo `api_endpoint` representa a rota interna da página do módulo (ex.: /dashboard/consultar-cpf-simples)
    const raw = (module?.api_endpoint || module?.path || '').toString().trim();
    if (!raw) return `/module/${module.slug}`;
    if (raw.startsWith('/')) return raw;
    // Normaliza rotas internas digitadas sem a barra inicial
    if (raw.startsWith('dashboard/')) return `/${raw}`;
    // Se vier apenas o "slug" (ex.: consultar-cpf-simples), assume rota interna em /dashboard/
    if (!raw.includes('/')) return `/dashboard/${raw}`;
    // Fallback legado
    return `/module/${module.slug}`;
  };

  const getPanelModules = () => {
    if (!panel) return [];
    
    return modules.filter(module => 
      module.panel_id === panel.id && 
      module.is_active === true && 
      module.operational_status === 'on'
    );
  };

  const handleModuleClick = (module: any) => {
    if (isBalanceLoading || !hasLoadedOnce) {
      toast.info('Verificando saldo...', {
        description: 'Aguarde um instante e tente novamente.'
      });
      loadTotalAvailableBalance();
      return;
    }

    if (module.operational_status === 'maintenance') {
      toast.info(`Módulo ${module.title} em manutenção`, {
        description: "Voltará em breve"
      });
      return;
    }

    // Calcular preço - apenas com desconto se houver plano ativo da API
    const originalPrice = parseFloat(module.price?.toString().replace(',', '.') || '0');
    const finalPrice = hasActiveSubscription && discountPercentage > 0 
      ? calculateDiscountedPrice(originalPrice).discountedPrice 
      : originalPrice;
    
    const totalBalance = calculateTotalAvailableBalance();
    
    if (totalBalance < finalPrice) {
      toast.error(
        `Saldo insuficiente para ${module.title}! Valor necessário: R$ ${finalPrice.toFixed(2)}`,
        {
          action: {
            label: "Adicionar Saldo",
            onClick: () => navigate('/dashboard/adicionar-saldo')
          }
        }
      );
      return;
    }

    navigate(getModulePageRoute(module));
  };

  if (panelLoading) {
    return (
      <div className="space-y-6 relative z-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando painel...</span>
        </div>
      </div>
    );
  }

  if (!panel) {
    return (
      <div className="space-y-6 relative z-10">
        <div className="bg-white/75 dark:bg-gray-800/75 rounded-lg border border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm p-8">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Painel não encontrado</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">O painel solicitado não existe ou não está ativo. Verifique se o ID está correto.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const panelModules = getPanelModules();
  const PanelIcon = getIconComponent(panel.icon);
  const template = (panel.template && ['corporate', 'creative', 'minimal', 'modern', 'elegant', 'forest', 'rose', 'cosmic', 'neon', 'sunset', 'arctic', 'volcano', 'matrix'].includes(panel.template)) 
    ? panel.template as 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix'
    : 'modern' as const;

  console.log(`🎨 [TEMPLATE PAINEL INDIVIDUAL] Painel ${panel.id} usando template: ${template} (original: ${panel.template})`);

  return (
    <div className="space-y-6 relative z-10">
      {/* Panel Modules with Header */}
      {panelModules.length > 0 ? (
        <div className="bg-white/75 dark:bg-gray-800/75 rounded-lg border border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <PanelIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className={isMobile ? 'text-base' : ''}>{panel.name}</CardTitle>
                  <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                    {panelModules.length}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <ModuleGridWrapper className={isMobile ? 'py-1 px-2 pb-3' : 'p-6 pt-0 pb-4'}>
            {panelModules.map((module) => {
              // Calcular preços - apenas com desconto se houver plano ativo da API
              const originalPrice = parseFloat(module.price?.toString().replace(',', '.') || '0');
              const shouldShowDiscount = hasActiveSubscription && discountPercentage > 0;
              const finalPrice = shouldShowDiscount 
                ? calculateDiscountedPrice(originalPrice).discountedPrice 
                : originalPrice;
              const hasSufficientBalance = !hasLoadedOnce || isBalanceLoading ? true : totalAvailableBalance >= finalPrice;
              
              console.log('🔍 Debug PainelIndividual - Dados do módulo:', {
                moduleName: module.title,
                originalPrice,
                finalPrice,
                hasActiveSubscription,
                shouldShowDiscount,
                discountPercentageFromAPI: discountPercentage,
                hasSufficientBalance
              });
              
              return (
                <div key={module.id} className={`relative cursor-pointer group ${isMobile ? 'mb-0' : ''}`} onClick={() => handleModuleClick(module)}>
                  <ModuleCardTemplates
                    module={{
                      title: module.title,
                      description: module.description,
                      price: formatPrice(finalPrice),
                      originalPrice: shouldShowDiscount ? formatPrice(originalPrice) : undefined,
                      discountPercentage: shouldShowDiscount ? discountPercentage : undefined,
                      status: module.is_active ? 'ativo' : 'inativo',
                      operationalStatus: module.operational_status === 'maintenance' ? 'manutencao' : module.operational_status,
                      iconSize: 'medium',
                      showDescription: true,
                      icon: module.icon,
                      color: module.color
                    }}
                    template={template}
                  />
                  
                  {/* Overlay para saldo insuficiente - aparece sobre o card */}
                  {!hasSufficientBalance && (
                    <div className="absolute inset-0 bg-black/60 dark:bg-black/70 rounded-lg z-50 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-center text-white bg-black/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20 shadow-2xl w-[85%] max-w-[170px]">
                        <Lock className="h-6 w-6 mx-auto mb-2 text-white" />
                        <p className="text-sm font-medium">Saldo Insuficiente</p>
                        <p className="text-xs text-white/80">R$ {finalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </ModuleGridWrapper>
        </div>
      ) : (
        <div className="bg-white/75 dark:bg-gray-800/75 rounded-lg border border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm p-8">
          <EmptyState 
            icon={Package}
            title="Nenhum módulo ativo"
            description="Este painel não possui módulos ativos configurados."
            className="justify-center"
          />
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6">
        <StatsCard 
          consultationHistory={consultationHistory}
          currentPlan={currentPlan}
          planBalance={0}
          userBalance={totalAvailableBalance}
        />
      </div>
    </div>
  );
};

export default PainelIndividual;