
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Panel } from '@/utils/apiService';
import { useApiModules } from '@/hooks/useApiModules';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleTemplate } from '@/contexts/ModuleTemplateContext';
import * as Icons from 'lucide-react';
import { Package, Lock, ShoppingCart } from 'lucide-react';
import EmptyState from '../ui/empty-state';
import ModuleCardTemplates from '@/components/configuracoes/personalization/ModuleCardTemplates';
import ModuleGridWrapper from '@/components/configuracoes/personalization/ModuleGridWrapper';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useIsMobile } from '@/hooks/use-mobile';
import { useModuleRecords } from '@/hooks/useModuleRecords';
import { useLiquidGlass } from '@/contexts/LiquidGlassContext';
import { useTheme } from '@/components/ThemeProvider';
import { usePixPaymentFlow } from '@/hooks/usePixPaymentFlow';
import { useUserDataApi } from '@/hooks/useUserDataApi';
import PixQRCodeModal from '@/components/payment/PixQRCodeModal';
import FloatingPendingPix from '@/components/payment/FloatingPendingPix';
import QRCode from 'react-qr-code';
import { API_BASE_URL } from '@/config/apiConfig';
import { formatMoneyBR } from '@/utils/formatters';
import { getModulePrice } from '@/utils/modulePrice';

interface PanelsGridProps {
  activePanels: Panel[];
}

const PanelsGrid: React.FC<PanelsGridProps> = ({ activePanels }) => {
  const { config: liquidGlassConfig } = useLiquidGlass();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Build inline glass style matching the LiquidGlassAdmin preview model
  const glassStyle = useMemo<React.CSSProperties>(() => {
    if (!liquidGlassConfig.enabled) return {};
    const filter = `blur(${liquidGlassConfig.strength + liquidGlassConfig.extraBlur}px) saturate(${liquidGlassConfig.tintSaturation}%) contrast(${liquidGlassConfig.contrast}%) brightness(${liquidGlassConfig.brightness}%) invert(${liquidGlassConfig.invert}%) hue-rotate(${liquidGlassConfig.tintHue}deg)`;
    
    // Light mode: use dark-tinted glass; Dark mode: use white-tinted glass
    const baseColor = isDark ? '255,255,255' : '0,0,0';
    const bgAlpha = liquidGlassConfig.backgroundAlpha / 100;
    const specHighAlpha = liquidGlassConfig.edgeSpecularity / 200;
    const specLowAlpha = liquidGlassConfig.edgeSpecularity / 300;
    const borderAlpha = liquidGlassConfig.backgroundAlpha / 200;
    
    return {
      borderRadius: `${liquidGlassConfig.cornerRadius}px`,
      backdropFilter: filter,
      WebkitBackdropFilter: filter,
      background: `rgba(255,255,255,${bgAlpha})`,
      boxShadow: `0 0 ${liquidGlassConfig.softness}px rgba(255,255,255,${specHighAlpha}), inset 0 1px 0 rgba(255,255,255,${specLowAlpha})`,
      opacity: liquidGlassConfig.opacity / 100,
      border: `1px solid rgba(255,255,255,${borderAlpha})`,
    };
  }, [liquidGlassConfig, isDark]);
  
  const glassClass = liquidGlassConfig.enabled ? '' : 'bg-card border border-border';
  const { modules } = useApiModules();
  const { 
    calculateDiscountedPrice, 
    subscription, 
    planInfo, 
    discountPercentage, 
    hasActiveSubscription 
  } = useUserSubscription();
  const { totalAvailableBalance, isLoading: isBalanceLoading, hasLoadedOnce, loadTotalAvailableBalance } = useUserBalance();
  const { user } = useAuth();
  const canConfigureModules = (user as any)?.user_role === 'suporte' || (user as any)?.user_role === 'admin';
  const { selectedTemplate } = useModuleTemplate();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { hasRecordsInModule } = useModuleRecords();
  const { userData } = useUserDataApi();
  const { loading: pixLoading, pixResponse, checkingPayment, createPixPayment, checkPaymentStatus, generateNewPayment, cancelPayment } = usePixPaymentFlow();
  
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixModuleAmount, setPixModuleAmount] = useState(0);
  const [purchasingModule, setPurchasingModule] = useState<{ title: string; route: string } | null>(null);
  const [showFloatingPix, setShowFloatingPix] = useState(false);
  const [notificationToastId, setNotificationToastId] = useState<string | number | null>(null);
  
  // Obter plano atual (subscription > planInfo > fallback em localStorage)
  // Importante: parênteses para evitar precedência incorreta entre `||` e ternário.
  const currentPlan =
    subscription?.plan_name ||
    planInfo?.name ||
    (user ? localStorage.getItem(`user_plan_${user.id}`) || 'Pré-Pago' : 'Pré-Pago');

  // Desconto efetivo deve vir do plano configurado (discount_percentage) / assinatura.
  // Sem fallback local, para refletir exatamente a configuração da Personalização.
  // (o painel 38 é tratado como exceção mais abaixo, tanto na exibição quanto no clique)
  const effectiveDiscountPercentage = hasActiveSubscription ? (discountPercentage || 0) : 0;
  
  console.log('🔍 [PANELSGRID] Dados do plano da API:', {
    hasActiveSubscription,
    subscriptionPlan: subscription?.plan_name,
    planInfoName: planInfo?.name,
    discountPercentageFromAPI: discountPercentage,
    currentPlan,
    effectiveDiscountPercentage
  });
  
  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent || Package;
  };

  const getPanelModules = (panelId: number) => {
    return modules.filter(module => 
      module.panel_id === panelId && 
      module.is_active === true && 
      module.operational_status === 'on'
    );
  };

  const getPanelTemplate = (panelId: number): 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix' => {
    const validTemplates = ['corporate', 'creative', 'minimal', 'modern', 'elegant', 'forest', 'rose', 'cosmic', 'neon', 'sunset', 'arctic', 'volcano', 'matrix'];
    const panel = activePanels.find(p => p.id === panelId);
    
    // PRIORIDADE ABSOLUTA: template específico do painel (configurado na personalização)
    if (panel?.template && validTemplates.includes(panel.template)) {
      const template = panel.template as 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix';
      console.log(`🎨 [TEMPLATE DASHBOARD] ✅ Painel ${panelId} (${panel.name}) usando template CONFIGURADO: ${template}`);
      return template;
    }
    
    // Fallback para 'modern' se não há template específico
    console.log(`⚠️ [TEMPLATE DASHBOARD] Painel ${panelId} sem template específico, usando fallback: modern (template do painel: ${panel?.template})`);
    return 'modern';
  };

  const formatPrice = (price: number | string) => {
    if (price === null || price === undefined || price === '') return '0,00';

    const numericValue = typeof price === 'string'
      ? Number(price.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''))
      : Number(price);

    return formatMoneyBR(Number.isFinite(numericValue) ? numericValue : 0);
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

  const parseModulePrice = (value: unknown): number => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = String(value ?? '').replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getDisplayBasePrice = (module: any): number => {
    const route = getModulePageRoute(module);
    const modulePrice = parseModulePrice(module?.price);

    const shouldIncludeQrPrice =
      Number(module?.id) === 165 ||
      route === '/dashboard/pdf-rg' ||
      route === '/dashboard/imprimir-rg';

    if (!shouldIncludeQrPrice) {
      return modulePrice;
    }

    const qrModule = (modules || []).find((m: any) => getModulePageRoute(m) === '/dashboard/qrcode-rg-1m');
    const qrPriceFromApi = parseModulePrice(qrModule?.price);
    const qrPrice = qrPriceFromApi > 0 ? qrPriceFromApi : getModulePrice('/dashboard/qrcode-rg-1m');

    return modulePrice + qrPrice;
  };

  // Comparação financeira em centavos para evitar erro de ponto flutuante
  const toCents = (value: number) => Math.round((Number(value) || 0) * 100);
  const hasEnoughBalance = (balance: number, price: number) => toCents(balance) >= toCents(price);
  const getMissingAmount = (price: number, balance: number) => Math.max((toCents(price) - toCents(balance)) / 100, 0);

  // Handler para compra direta via PIX no overlay do módulo
  const handleDirectPurchase = async (e: React.MouseEvent, amount: number, module: any) => {
    e.stopPropagation();
    const remaining = getMissingAmount(amount, totalAvailableBalance);

    if (remaining <= 0) {
      navigate(getModulePageRoute(module));
      return;
    }

    setPixModuleAmount(remaining);
    
    const moduleRoute = getModulePageRoute(module);
    setPurchasingModule({ title: module.title, route: moduleRoute });
    
    const pixData = await createPixPayment(remaining, userData);
    if (pixData) {
      setShowPixModal(true);
      setShowFloatingPix(false);
      
      // Criar notificação toast com QR code embutido
      const tId = toast.info(
        <div className="flex items-center gap-3">
          {pixData.qr_code && (
            <div className="flex-shrink-0 bg-white p-2 rounded border-2 border-green-500">
              <QRCode value={pixData.qr_code} size={70} />
            </div>
          )}
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-sm">PIX para {module.title}</p>
              <p className="text-xs text-muted-foreground">Não feche sem pagar!</p>
            </div>
            <button
              onClick={() => {
                toast.dismiss(tId);
                handleCancelPurchase();
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
      setNotificationToastId(tId);
    }
  };

  // Handler para cancelar compra
  const handleCancelPurchase = () => {
    if (pixResponse?.payment_id) {
      cancelPayment(pixResponse.payment_id);
    }
    setShowPixModal(false);
    setShowFloatingPix(false);
    setPurchasingModule(null);
    if (notificationToastId) {
      toast.dismiss(notificationToastId);
      setNotificationToastId(null);
    }
    toast.info('Ordem de compra cancelada');
  };

  // Handler para fechar modal (mantém floating)
  const handleClosePixModal = () => {
    setShowPixModal(false);
    if (pixResponse && pixResponse.status !== 'approved') {
      setShowFloatingPix(true);
    }
  };

  // Auto-check payment status while PIX modal is open OR floating widget is visible
  useEffect(() => {
    if ((!showPixModal && !showFloatingPix) || !pixResponse?.payment_id) return;
    let cancelled = false;

    const checkLive = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/mercadopago/check-payment-status-live.php?payment_id=${pixResponse.payment_id}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const newStatus = data?.data?.status;
        if (newStatus === 'approved' && !cancelled) {
          toast.success('🎉 Pagamento Aprovado! Redirecionando...');
          setShowPixModal(false);
          setShowFloatingPix(false);
          if (notificationToastId) {
            toast.dismiss(notificationToastId);
            setNotificationToastId(null);
          }
          // Redirecionar para a página do módulo que estava sendo comprado
          const targetRoute = purchasingModule?.route || '/dashboard';
          setPurchasingModule(null);
          setTimeout(() => {
            window.location.href = targetRoute;
          }, 1500);
        }
      } catch (error) {
        console.error('Erro ao checar status (live):', error);
      }
    };

    const interval = setInterval(checkLive, 3000);
    checkLive();
    return () => { cancelled = true; clearInterval(interval); };
  }, [showPixModal, showFloatingPix, pixResponse?.payment_id]);

  const handlePixPaymentConfirm = async () => {
    if (!pixResponse?.payment_id) return;
    toast.loading('Verificando pagamento...', { id: 'checking-pix' });
    const status = await checkPaymentStatus(pixResponse.payment_id);
    if (status === 'approved') {
      toast.success('🎉 Pagamento aprovado!', { id: 'checking-pix' });
      setShowPixModal(false);
      setShowFloatingPix(false);
      if (notificationToastId) {
        toast.dismiss(notificationToastId);
        setNotificationToastId(null);
      }
      const targetRoute = purchasingModule?.route || '/dashboard';
      setPurchasingModule(null);
      setTimeout(() => {
        window.location.href = targetRoute;
      }, 1500);
    } else {
      toast.info('⏳ Ainda processando, aguarde...', { id: 'checking-pix' });
    }
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

    // Calcular preço (Imprimir RG usa módulo + QR 1M no dashboard)
    const originalPrice = getDisplayBasePrice(module);

    const shouldApplyDiscountOnClick = effectiveDiscountPercentage > 0 && module.panel_id !== 38;

    const finalPrice = shouldApplyDiscountOnClick
      ? (hasActiveSubscription
          ? calculateDiscountedPrice(originalPrice, module.panel_id).discountedPrice
          : Math.max(originalPrice - (originalPrice * effectiveDiscountPercentage) / 100, 0.01))
      : originalPrice;
    
    const moduleRoute = getModulePageRoute(module);
    const userHasRecords = hasRecordsInModule(moduleRoute);

    // Para módulos de pedidos (PDF), permitir acesso mesmo sem saldo se tem registros
    const isPdfModule = moduleRoute.includes('/pdf-personalizado') || moduleRoute.includes('/pdf-rg');
    
    const hasSufficientBalance = hasEnoughBalance(totalAvailableBalance, finalPrice);

    if (!hasSufficientBalance && !userHasRecords && !isPdfModule) {
      const remaining = getMissingAmount(finalPrice, totalAvailableBalance);
      toast.error(
        `Saldo insuficiente para ${module.title}! Valor necessário: R$ ${finalPrice.toFixed(2)}`,
        {
          action: {
            label: "💰 Depositar",
            onClick: () => navigate(`/dashboard/adicionar-saldo?valor=${remaining.toFixed(2)}&fromModule=true`)
          }
        }
      );
      return;
    }

    if (!hasSufficientBalance && (userHasRecords || isPdfModule)) {
      toast.info(
        `Você pode visualizar seu histórico em ${module.title}, mas precisa de saldo para novos pedidos.`,
        { duration: 4000 }
      );
    }

    navigate(getModulePageRoute(module));
  };


  if (activePanels.length === 0) {
    return (
      <div className={`${glassClass} rounded-lg p-8`} style={glassStyle}>
        <EmptyState
          icon={Package}
          title="Nenhum painel ativo"
          description="Configure painéis na seção de Personalização para começar a usar o sistema."
          className="justify-center"
        />
      </div>
    );
  }

  return (
    <>
    <div className="space-y-8">
      {activePanels.map((panel) => {
        const PanelIcon = getIconComponent(panel.icon);
        const panelModules = getPanelModules(panel.id);
        const template = getPanelTemplate(panel.id);
        
        return (
          <div key={panel.id} className={`${glassClass} rounded-lg`} style={glassStyle}>
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
            
            {panelModules.length > 0 ? (
              <ModuleGridWrapper className={isMobile ? 'py-1 px-2 pb-3' : 'p-6 pt-0 pb-4'}>
                 {panelModules.map((module) => {
                   // Calcular preços - apenas com desconto se houver plano ativo da API
                   // Painel 38 não deve mostrar desconto
                  const originalPrice = getDisplayBasePrice(module);
                  const shouldShowDiscount = effectiveDiscountPercentage > 0 && module.panel_id !== 38;

                   const finalDiscountedPrice = shouldShowDiscount
                     ? (hasActiveSubscription
                         ? calculateDiscountedPrice(originalPrice, module.panel_id).discountedPrice
                         : Math.max(originalPrice - (originalPrice * effectiveDiscountPercentage) / 100, 0.01))
                     : originalPrice;
                  
                  console.log('🔍 Debug PanelsGrid - Dados do módulo:', {
                    moduleName: module.title,
                    originalPrice,
                    finalPrice: finalDiscountedPrice,
                    hasActiveSubscription,
                    shouldShowDiscount,
                    discountPercentageFromAPI: discountPercentage,
                     effectiveDiscountPercentage,
                    currentPlan,
                    formatPrice: formatPrice(finalDiscountedPrice),
                    willShowOriginalPrice: shouldShowDiscount ? formatPrice(originalPrice) : undefined,
                     willShowDiscountPercentage: shouldShowDiscount ? effectiveDiscountPercentage : undefined
                  });
                  
                  const moduleRoute = getModulePageRoute(module);
                  const userHasRecordsInThis = hasRecordsInModule(moduleRoute);

                   return (
                    <div key={module.id} className={`relative cursor-pointer group ${isMobile ? 'mb-0' : ''}`} onClick={() => handleModuleClick(module)}>
                      <ModuleCardTemplates
                        module={{
                          title: module.title,
                          description: module.description,
                          price: formatPrice(finalDiscountedPrice),
                          // No template, o valor original aparece com moeda (ex.: "R$ 3,00")
                          originalPrice: shouldShowDiscount ? `R$ ${formatPrice(originalPrice)}` : undefined,
                          discountPercentage: shouldShowDiscount ? effectiveDiscountPercentage : undefined,
                          status: module.is_active ? 'ativo' : 'inativo',
                          operationalStatus: module.operational_status === 'maintenance' ? 'manutencao' : module.operational_status,
                          iconSize: 'medium',
                          showDescription: true,
                          icon: module.icon,
                          color: module.color
                        }}
                        template={template}
                      />
                      
                      
                      {/* Overlay para saldo insuficiente - botão Comprar verde */}
                      {hasLoadedOnce && !isBalanceLoading && !hasEnoughBalance(totalAvailableBalance, finalDiscountedPrice) && !userHasRecordsInThis && (
                        <div className="absolute inset-0 bg-black/60 dark:bg-black/70 rounded-lg z-50 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="text-center text-white bg-black/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20 shadow-2xl w-[85%] max-w-[170px]">
                            <Lock className="h-5 w-5 mx-auto mb-1.5 text-white" />
                            <p className="text-sm font-medium mb-2">Saldo Insuficiente</p>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold w-full"
                              onClick={(e) => handleDirectPurchase(e, finalDiscountedPrice, module)}
                              disabled={pixLoading}
                            >
                              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                              {pixLoading ? 'Gerando...' : 'Comprar'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </ModuleGridWrapper>
            ) : (
              <div className="p-6 pt-0">
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Nenhum módulo ativo
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Este painel não possui módulos ativos configurados.
                  </p>
                  {canConfigureModules ? (
                    <Link 
                      to="/dashboard/personalizacao"
                      className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                    >
                      Configurar módulos →
                    </Link>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* Modal PIX para compra direta */}
    <PixQRCodeModal
      isOpen={showPixModal}
      onClose={handleClosePixModal}
      amount={pixModuleAmount}
      onPaymentConfirm={handlePixPaymentConfirm}
      isProcessing={checkingPayment}
      pixData={pixResponse}
      onGenerateNew={() => generateNewPayment(pixModuleAmount, userData)}
    />

    {/* Widget flutuante de PIX pendente */}
    <FloatingPendingPix
      isVisible={showFloatingPix && !showPixModal}
      pixData={pixResponse}
      amount={pixModuleAmount}
      moduleName={purchasingModule?.title}
      onOpenModal={() => {
        setShowPixModal(true);
        setShowFloatingPix(false);
      }}
      onCancel={handleCancelPurchase}
    />
  </>
  );
};

export default PanelsGrid;
