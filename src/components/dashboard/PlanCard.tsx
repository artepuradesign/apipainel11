
import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getDiscount } from '@/utils/planUtils';
import { getCardThemeStyles } from '@/components/pricing/CardThemeUtils';

interface PlanCardProps {
  currentPlan: string;
  planExpirationDate: string | null;
}

const PlanCard: React.FC<PlanCardProps> = ({ currentPlan, planExpirationDate }) => {
  const navigate = useNavigate();
  const discount = getDiscount(currentPlan);

  // Check for plan expiration on component mount
  useEffect(() => {
    const checkPlanExpiration = () => {
      if (planExpirationDate && currentPlan !== 'Pré-Pago') {
        const expirationDate = new Date(planExpirationDate);
        const currentDate = new Date();
        
        if (currentDate > expirationDate) {
          // Plan has expired, convert to Pré-Pago
          const planBalance = parseFloat(localStorage.getItem('plan_balance') || '0');
          const currentUserBalance = parseFloat(localStorage.getItem('user_balance') || '0');
          
          // Transfer remaining plan balance to wallet
          const newUserBalance = currentUserBalance + planBalance;
          
          // Update localStorage
          localStorage.setItem('user_plan', 'Pré-Pago');
          localStorage.setItem('user_balance', newUserBalance.toString());
          localStorage.setItem('plan_balance', '0');
          localStorage.removeItem('plan_expiration_date');
          
          toast.info(`Seu plano ${currentPlan} expirou e foi alterado para Pré-Pago. O saldo restante (R$ ${planBalance.toFixed(2)}) foi transferido para sua carteira.`);
          
          // Reload the page to reflect changes
          window.location.reload();
        }
      }
    };

    checkPlanExpiration();
  }, [currentPlan, planExpirationDate]);

  const formatExpirationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPlanColor = (planName: string): string => {
    const colorMap: { [key: string]: string } = {
      // Rainhas - ordem corrigida conforme imagem (tone1 → tone2 → tone3 → tone4)
      'Rainha de Ouros': 'tone1',
      'Rainha de Paus': 'tone2',
      'Rainha de Copas': 'tone3',
      'Rainha de Espadas': 'tone4',
      // Reis - mesma ordem de cores
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

  // Mapeamento correto conforme página inicial
  const getPlanBadgeText = (planName: string): string => {
    const badgeMap: { [key: string]: string } = {
      'Rainha de Ouros': 'Básico',
      'Rainha de Paus': 'Mais popular',
      'Rainha de Copas': 'Profissional', 
      'Rainha de Espadas': 'Avançado',
      'Rei de Ouros': 'Premium',
      'Rei de Paus': 'Editor',
      'Rei de Copas': 'Business',
      'Rei de Espadas': 'Editor PRO'
    };
    return badgeMap[planName] || '';
  };

  const handlePlanClick = () => {
    const badgeText = getPlanBadgeText(currentPlan);
    
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

  const handleAddBalance = () => {
    navigate('/dashboard/adicionar-saldo');
  };

  const planColor = getPlanColor(currentPlan);
  const styles = getCardThemeStyles(planColor);
  const planSuit = getPlanSuit(currentPlan);
  const badgeText = getPlanBadgeText(currentPlan);
  const isTone1 = planColor === 'tone1';
  const isPrePago = currentPlan === 'Pré-Pago';

  // For Pré-Pago, use same style as PageHeaderCard
  const prePagoStyles = {
    background: 'bg-gradient-to-r from-brand-purple to-indigo-700',
    textColor: 'text-white',
    borderColor: 'border-white/20'
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg h-auto min-h-[140px] ${
        isPrePago 
          ? `${prePagoStyles.background} ${prePagoStyles.textColor} ${prePagoStyles.borderColor} backdrop-blur-sm bg-opacity-85` 
          : styles.textColor
      }`}
      style={isPrePago ? {} : {
        background: styles.background,
        border: styles.border,
      }}
      onClick={handlePlanClick}
    >
      <CardContent className="pt-4 pb-4 relative overflow-hidden h-full flex flex-col justify-between">
        {/* Badge do plano - posicionado no topo */}
        {badgeText && !isPrePago && (
          <div className="absolute -top-3 right-2 z-20">
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

        {!isPrePago && (
          <div className="absolute top-2 right-2 opacity-10">
            <span className="text-4xl" style={{ color: styles.suitColor }}>
              {planSuit}
            </span>
          </div>
        )}
        
        <div className="space-y-3 relative z-10 flex-1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className={`h-4 w-4 ${
                  isPrePago 
                    ? 'text-white/90' 
                    : isTone1 ? 'text-purple-600' : 'text-white'
                }`} />
                <span className={`text-sm font-medium ${
                  isPrePago 
                    ? 'text-white/90' 
                    : isTone1 ? 'text-purple-600' : 'text-white'
                }`}>
                  Plano Atual
                </span>
              </div>
              {currentPlan === 'Rei de Espadas' ? (
                <span className={`text-xs ${
                  isPrePago ? 'text-green-300' : isTone1 ? 'text-green-600' : 'text-green-300'
                }`}>
                  Nível Máximo
                </span>
              ) : (
                <Link to="/planos-publicos" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    size="sm" 
                    className="bg-brand-purple hover:bg-brand-darkPurple text-white text-xs"
                  >
                    Atualizar
                  </Button>
                </Link>
              )}
            </div>
            
            <div className="mb-2 flex items-center gap-2">
              {!isPrePago && (
                <span className="text-xl" style={{ color: styles.suitColor }}>
                  {planSuit}
                </span>
              )}
              <span className={`font-bold text-lg ${
                isPrePago 
                  ? 'text-white' 
                  : isTone1 ? 'text-purple-700' : 'text-white'
              }`}>
                {currentPlan}
              </span>
            </div>

            {planExpirationDate && currentPlan !== 'Pré-Pago' && (
              <div className={`text-xs mb-2 ${
                isPrePago ? 'text-white/80' : isTone1 ? 'text-gray-500' : 'text-gray-200'
              }`}>
                Vence em: {formatExpirationDate(planExpirationDate)}
              </div>
            )}

            {discount > 0 && currentPlan !== 'Pré-Pago' && (
              <div className={`text-xs ${
                isPrePago ? 'text-green-300' : isTone1 ? 'text-green-600' : 'text-green-300'
              }`}>
                {discount}% de desconto
              </div>
            )}
          </div>
        </div>

        {/* Add Balance Button */}
        <div className="mt-3 relative z-10" onClick={(e) => e.stopPropagation()}>
          <Button 
            onClick={handleAddBalance}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Saldo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
