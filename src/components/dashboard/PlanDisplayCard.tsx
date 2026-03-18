import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Crown, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCardThemeStyles } from '@/components/pricing/CardThemeUtils';
import CardDecorations from '@/components/pricing/CardDecorations';
import { toast } from 'sonner';
import { initializeNewAccount } from '@/utils/balanceUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSubscription } from '@/hooks/useUserSubscription';

interface PlanDisplayCardProps {
  currentPlan: string;
}

const PlanDisplayCard: React.FC<PlanDisplayCardProps> = ({ 
  currentPlan = "Pré-Pago" 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { discountPercentage, hasActiveSubscription } = useUserSubscription();

  const handleAddBalance = () => {
    navigate('/dashboard/adicionar-saldo');
  };

  // Get plan theme and discount
  const getPlanColor = (planName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Rainha de Ouros': 'tone1',
      'Rainha de Paus': 'tone2', 
      'Rainha de Copas': 'tone3',
      'Rainha de Espadas': 'tone4',
      'Rei de Ouros': 'tone1',
      'Rei de Paus': 'tone2',
      'Rei de Copas': 'tone3',
      'Rei de Espadas': 'tone4'
    };
    return colorMap[planName] || 'tone1';
  };

  const getPlanSuit = (planName: string): string => {
    const suitMap: { [key: string]: string } = {
      'Rainha de Ouros': '♦',
      'Rainha de Paus': '♣',
      'Rainha de Copas': '♥',
      'Rainha de Espadas': '♠',
      'Rei de Ouros': '♦',
      'Rei de Paus': '♣',
      'Rei de Copas': '♥',
      'Rei de Espadas': '♠'
    };
    return suitMap[planName] || '♠';
  };

  // Mapeamento exato conforme especificado pelo usuário
  const getPlanBadgeText = (planName: string): string => {
    const badgeMap: { [key: string]: string } = {
      'Rainha de Paus': 'Mais popular',
      'Rainha de Espadas': 'Profissional',
      'Rei de Copas': 'Editor',
      'Rei de Espadas': 'Editor PRO'
    };
    return badgeMap[planName] || '';
  };

  // State para o saldo do plano em tempo real
  const [planBalance, setPlanBalance] = React.useState<number>(0);

  // Função para obter valor do saldo do plano
  const getPlanBalance = (): number => {
    if (currentPlan === 'Pré-Pago' || !user) return 0;
    
    // Initialize account if needed
    initializeNewAccount(user.id);
    
    return parseFloat(localStorage.getItem(`plan_balance_${user.id}`) || "0.00");
  };

  // Listener para atualizar o saldo do plano em tempo real
  React.useEffect(() => {
    if (!user) return;
    
    // Inicializar saldo
    setPlanBalance(getPlanBalance());
    
    const handlePlanBalanceUpdate = (event: CustomEvent) => {
      const { amount } = event.detail;
      const currentBalance = parseFloat(localStorage.getItem(`plan_balance_${user.id}`) || "0.00");
      const newBalance = currentBalance + amount;
      localStorage.setItem(`plan_balance_${user.id}`, newBalance.toString());
      setPlanBalance(newBalance);
    };

    const handlePlanBalanceChanged = () => {
      setPlanBalance(getPlanBalance());
    };

    const handlePlanPurchaseCompleted = () => {
      // Atualizar saldo do plano quando uma compra for concluída
      setTimeout(() => setPlanBalance(getPlanBalance()), 100);
    };

    window.addEventListener('planBalanceUpdated', handlePlanBalanceUpdate as EventListener);
    window.addEventListener('planBalanceChanged', handlePlanBalanceChanged as EventListener);
    window.addEventListener('planPurchaseCompleted', handlePlanPurchaseCompleted as EventListener);
    
    return () => {
      window.removeEventListener('planBalanceUpdated', handlePlanBalanceUpdate as EventListener);
      window.removeEventListener('planBalanceChanged', handlePlanBalanceChanged as EventListener);
      window.removeEventListener('planPurchaseCompleted', handlePlanPurchaseCompleted as EventListener);
    };
  }, [user]);

  // Auto-refresh do saldo do plano a cada 30 segundos
  React.useEffect(() => {
    if (!user || currentPlan === 'Pré-Pago') return;

    const interval = setInterval(() => {
      setPlanBalance(getPlanBalance());
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [user, currentPlan]);

  const formatBrazilianCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const planColor = getPlanColor(currentPlan);
  const planSuit = getPlanSuit(currentPlan);
  const discount = hasActiveSubscription ? (discountPercentage || 0) : 0;
  const themeStyles = getCardThemeStyles(planColor);
  const isPrePago = currentPlan === 'Pré-Pago';
  const isTone1 = planColor === 'tone1';
  const badgeText = getPlanBadgeText(currentPlan);

  // Para Pré-Pago, usar o mesmo estilo simples do PageHeaderCard
  const prePagoClasses = 'bg-gradient-to-br from-gray-100/95 via-gray-50/95 to-white/95 dark:from-gray-800/95 dark:via-gray-900/95 dark:to-gray-800/95 border border-gray-300/70 dark:border-gray-600/70 backdrop-blur-md';

  // Gerar datas de exemplo para o período de acesso
  const getAccessPeriod = () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Adiciona 1 mês
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    return {
      start: formatDate(startDate),
      end: formatDate(endDate)
    };
  };

  const accessPeriod = getAccessPeriod();

  const handlePlanClick = () => {
    if (currentPlan === 'Pré-Pago') {
      toast.info('Você está no plano Pré-Pago. Considere fazer upgrade para ter descontos nas consultas!', {
        action: {
          label: "Ver Planos",
          onClick: () => window.location.href = '/planos-publicos'
        }
      });
    } else {
      const message = badgeText 
        ? `Você está no plano ${currentPlan} (${badgeText}) com ${discount}% de desconto em todas as consultas!`
        : `Você está no plano ${currentPlan} com ${discount}% de desconto em todas as consultas!`;
      
      toast.success(message);
    }
  };

  return (
    <div className="relative">
      {/* Badge do plano - posicionado no topo esquerdo, apenas se existir */}
      {badgeText && !isPrePago && (
        <div className="absolute -top-3 left-4 z-20">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border-2 border-white shadow-lg ${
            badgeText === 'Mais popular' ? 'bg-purple-600 text-white' :
            badgeText === 'Profissional' ? 'bg-black text-white' :
            badgeText === 'Editor' ? 'bg-gray-800 text-white' :
            badgeText === 'Editor PRO' ? 'bg-gradient-to-r from-gray-800 to-black text-white' :
            'bg-blue-600 text-white'
          }`}>
            {badgeText}
          </div>
        </div>
      )}

      <div 
        className={`relative overflow-hidden rounded-lg shadow-sm p-4 h-[120px] cursor-pointer transition-all duration-300 hover:shadow-lg ${
          isPrePago ? prePagoClasses : 'backdrop-blur-md'
        }`}
        style={isPrePago ? {} : {
          background: themeStyles.background,
          border: themeStyles.border,
        }}
        onClick={handlePlanClick}
      >
        {/* Card decorations para planos ativos */}
        {!isPrePago && (
          <CardDecorations 
            cardSuit={planSuit} 
            cardType={currentPlan.includes('Rei') ? 'King' : 'Queen'} 
            styles={themeStyles} 
          />
        )}

        {/* Decorative background elements para Pré-Pago */}
        {isPrePago && (
          <>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200/40 dark:bg-gray-700/40 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-200/40 dark:bg-gray-700/40 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>
          </>
        )}
        
        <div className="relative z-10 flex justify-between items-center h-full">
          <div className="flex flex-col justify-center">
            <div>
              <div className="flex items-center mb-1">
                <div className="flex items-center gap-2 mr-2">
                  {isPrePago ? (
                    <Shield className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Crown className={`h-4 w-4 ${
                      isTone1 ? 'text-purple-600' : 'text-white'
                    }`} />
                  )}
                  <span className={`text-sm font-medium ${
                    isPrePago 
                      ? 'text-gray-600 dark:text-gray-400'
                      : isTone1 ? 'text-purple-600' : 'text-white'
                  }`}>
                    Plano Atual
                  </span>
                </div>
              </div>
              
              {/* Exibir nome do plano simples para planos ativos, sem naipe */}
              {isPrePago ? (
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-bold text-base text-gray-900 dark:text-white">
                    {currentPlan}
                  </h2>
                </div>
              ) : (
                <div className="mb-1">
                  <h2 className={`font-bold text-base ${
                    isTone1 ? 'text-purple-700' : 'text-white'
                  }`}>
                    {currentPlan}
                  </h2>
                </div>
              )}
              
              {/* Período de acesso para planos ativos */}
              {!isPrePago && (
                <div className={`text-xs ${
                  isTone1 ? 'text-gray-500' : 'text-gray-200'
                }`}>
                  <p>Início: {accessPeriod.start}</p>
                  <p>Vence em: {accessPeriod.end}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
            {/* Botão de Upgrade */}
            <Link to="/planos-publicos">
              <Button 
                size="sm" 
                className="bg-brand-purple hover:bg-brand-darkPurple text-white text-xs px-3 py-1 h-8 w-32"
              >
                {isPrePago ? 'Atualizar Plano' : 'Atualizar'}
              </Button>
            </Link>
            
            {/* Valor do saldo do plano para planos ativos */}
            {!isPrePago && (
              <div className="text-right">
                <div className={`text-xs ${
                  isTone1 ? 'text-gray-500' : 'text-gray-200'
                }`}>
                  Saldo do Plano
                </div>
                <div className={`font-bold text-sm ${
                  isTone1 ? 'text-purple-600' : 'text-white'
                }`}>
                  {formatBrazilianCurrency(planBalance)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDisplayCard;
