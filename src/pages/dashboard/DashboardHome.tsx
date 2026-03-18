import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import StatsCard from '@/components/dashboard/StatsCard';
import AccessLogsCard from '@/components/dashboard/AccessLogsCard';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { ModuleTemplateProvider } from '@/contexts/ModuleTemplateContext';
import { getWalletBalance, getPlanBalance, initializeNewAccount } from '@/utils/balanceUtils';
import { useApiPanels } from '@/hooks/useApiPanels';
import { Panel } from '@/utils/apiService';
import { useApiAccessLogs } from '@/hooks/useApiAccessLogs';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import * as Icons from 'lucide-react';
import { useModuleRecords } from '@/hooks/useModuleRecords';

import PanelsGrid from '@/components/dashboard/PanelsGrid';

const DashboardHome = () => {
  // Configurar timeout de sessão de 30 minutos
  useSessionTimeout({ timeoutMinutes: 30 });
  
  const [totalAvailableBalance, setTotalAvailableBalance] = useState(0.00);
  const [consultationHistory, setConsultationHistory] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user, isSupport } = useAuth();
  const { logPageAccess } = useApiAccessLogs();
  const { hasRecordsInModule } = useModuleRecords();
  const { panels, isLoading: panelsLoading } = useApiPanels();
  const { 
    hasActiveSubscription, 
    subscription, 
    planInfo, 
    discountPercentage, 
    calculateDiscountedPrice 
  } = useUserSubscription();

  console.log('🔍 [DASHBOARD_HOME] Dados do plano:', {
    hasActiveSubscription,
    subscriptionPlan: subscription?.plan_name,
    planInfoName: planInfo?.name,
    discountPercentage,
    localStorage: user ? localStorage.getItem(`user_plan_${user.id}`) : null
  });

  // Get user data from localStorage with user-specific keys
  const currentPlan = user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago";

  const calculateTotalAvailableBalance = () => {
    if (!user) return 0;

    // Initialize account if new user
    initializeNewAccount(user.id);

    // Leitura direta do localStorage - exatamente como na carteira
    const walletKey = `wallet_balance_${user.id}`;
    const planKey = `plan_balance_${user.id}`;
    
    const walletValue = localStorage.getItem(walletKey);
    const planValue = localStorage.getItem(planKey);
    
    const walletBalance = parseFloat(walletValue || "0.00");
    const planBalance = parseFloat(planValue || "0.00");
    const totalAvailable = walletBalance + planBalance;
    
    console.log('DashboardHome - Cálculo do saldo total:', { 
      walletBalance, 
      planBalance, 
      totalAvailable,
      userId: user.id 
    });
    
    return totalAvailable;
  };

  const loadTotalAvailableBalance = () => {
    const totalAvailable = calculateTotalAvailableBalance();
    setTotalAvailableBalance(totalAvailable);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent || Icons.Package;
  };

  useEffect(() => {
    if (user) {
      loadUserData();
      
      // Disparar evento de carregamento da página para animar o saldo
      window.dispatchEvent(new CustomEvent('pageLoad'));
    }
  }, [navigate, location.pathname, user]);

  useEffect(() => {
    // Evento específico para recargas
    const handleBalanceRecharge = () => {
      if (user) {
        console.log('💰 DashboardHome - Recarga detectada');
        loadTotalAvailableBalance();
      }
    };

    // Evento específico para compras de planos
    const handlePlanPurchase = () => {
      if (user) {
        console.log('💎 DashboardHome - Compra de plano detectada');
        loadTotalAvailableBalance();
      }
    };

    // Manter compatibilidade com evento genérico
    const handleBalanceUpdate = () => {
      if (user) {
        console.log('DashboardHome - Evento balanceUpdated genérico recebido');
        loadTotalAvailableBalance();
      }
    };

    window.addEventListener('balanceRechargeUpdated', handleBalanceRecharge);
    window.addEventListener('planPurchaseUpdated', handlePlanPurchase);
    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    
    return () => {
      window.removeEventListener('balanceRechargeUpdated', handleBalanceRecharge);
      window.removeEventListener('planPurchaseUpdated', handlePlanPurchase);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, [user]);


  const loadUserData = async () => {
    if (!user) return;

    loadTotalAvailableBalance();
    
    // Usar histórico específico do usuário
    const history = JSON.parse(localStorage.getItem(`consultation_history_${user.id}`) || "[]");
    setConsultationHistory(history);

    // Registrar acesso na API
    const currentPath = window.location.pathname;
    try {
      await logPageAccess(currentPath);
      console.log('✅ Acesso registrado via API para:', currentPath);
    } catch (error) {
      console.warn('⚠️ Falha ao registrar acesso via API:', error);
    }
  };

  const checkBalanceAndNavigate = (path: string, moduleName: string, modulePrice: string) => {
    if (!user) return;

    const originalPrice = parseFloat(modulePrice);
    
    // Aplicar desconto baseado no plano do usuário
    const { discountedPrice, hasDiscount } = calculateDiscountedPrice(originalPrice);
    const finalPrice = hasDiscount ? discountedPrice : originalPrice;
    
    // Usar saldo total disponível (mesmo da carteira digital)
    const totalAvailableBalance = calculateTotalAvailableBalance();
    
    console.log('Verificando saldo para navegação:', {
      moduleName,
      originalPrice,
      discountedPrice,
      finalPrice,
      hasDiscount,
      discountPercentage,
      totalAvailableBalance
    });
    
    // Verificar se o usuário tem registros no módulo
    const userHasRecords = hasRecordsInModule(path);

    if (totalAvailableBalance < finalPrice && !userHasRecords) {
      const remaining = Math.max(finalPrice - totalAvailableBalance, 0.01);
      const priceDisplay = hasDiscount 
        ? `${finalPrice.toFixed(2)} (com ${discountPercentage}% de desconto)`
        : finalPrice.toFixed(2);
        
      toast.error(
        `Saldo insuficiente para ${moduleName}! Valor necessário: ${priceDisplay}`,
        {
          action: {
            label: "💰 Depositar",
            onClick: () => navigate(`/dashboard/adicionar-saldo?valor=${remaining.toFixed(2)}&fromModule=true`)
          }
        }
      );
      return;
    }

    if (totalAvailableBalance < finalPrice && userHasRecords) {
      toast.info(
        `Você pode visualizar seu histórico em ${moduleName}, mas precisa de saldo para novas consultas.`,
        { duration: 4000 }
      );
    }

    navigate(path);
  };

  // Filtrar apenas painéis ativos da API
  // Lógica de acesso premium:
  // - Se o usuário tem premium_enabled ativado, vê todos os painéis
  // - Se o usuário tem um plano ativo (assinatura), a visibilidade depende do plano
  // - Caso contrário (pré-pago sem premium), vê apenas painéis não-premium
  const isPremiumEnabled = user ? !!(user as any).premium_enabled : false;
  const allActivePanels = Array.isArray(panels) ? panels.filter(panel => panel.is_active === true) : [];
  
  const activePanels = allActivePanels.filter(panel => {
    // Painéis não-premium são visíveis para todos
    if (!panel.is_premium) return true;
    // Usuário com premium_enabled vê todos
    if (isPremiumEnabled) return true;
    // Usuário com plano ativo vê premium (pode ser refinado por plano no futuro)
    if (hasActiveSubscription) return true;
    // Pré-pago sem premium: não vê painéis premium
    return false;
  });

  return (
    <ModuleTemplateProvider>
      <div className="space-y-6">
        {/* Panels Grid - All active panels in module style */}
        <PanelsGrid activePanels={activePanels} />

        {/* Statistics Card */}
        <StatsCard 
          consultationHistory={consultationHistory}
          currentPlan={currentPlan}
          planBalance={0} // Not used anymore
          userBalance={totalAvailableBalance}
        />

      </div>
    </ModuleTemplateProvider>
  );
};

export default DashboardHome;
