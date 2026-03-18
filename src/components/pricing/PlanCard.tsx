
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Star } from 'lucide-react';
import { type CustomPlan } from '@/utils/personalizationStorage';
import { getWalletBalance } from '@/utils/balanceUtils';
import { useAuth } from '@/contexts/AuthContext';

interface PlanCardProps {
  plan: CustomPlan;
  showDualButtons?: boolean;
  onBuyClick?: (planName: string) => void;
  onUpdateClick?: (planName: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  showDualButtons = true,
  onBuyClick,
  onUpdateClick
}) => {
  const { user } = useAuth();
  
  const formatCurrency = (price: string) => {
    return `R$ ${price}`;
  };

  const handleBuyClick = () => {
    if (onBuyClick) {
      onBuyClick(plan.name);
    }
  };

  const handleUpdateClick = () => {
    if (onUpdateClick) {
      onUpdateClick(plan.name);
    }
  };

  // Verificar se o usuário está logado
  const isUserLoggedIn = !!localStorage.getItem('auth_token') || 
                        !!localStorage.getItem('session_token') ||
                        !!localStorage.getItem('api_session_token');

  // Verificar saldo disponível para o botão "Atualizar"
  const userBalance = user ? getWalletBalance(user.id) : 0;
  const planPrice = parseFloat(plan.price);
  const hasSufficientBalance = userBalance >= planPrice;

  // Display up to 8 modules, with counter for additional ones
  const maxDisplayModules = 8;
  const displayModules = plan.selectedModules?.slice(0, maxDisplayModules) || [];
  const remainingModulesCount = (plan.selectedModules?.length || 0) - maxDisplayModules;

  return (
    <div className="relative w-full max-w-[320px]">
      {plan.hasHighlight && plan.highlightText && (
        <div className="absolute -top-3 left-4 z-20">
          <Badge className="bg-green-500 text-white border-2 border-white shadow-lg">
            <Star className="h-3 w-3 mr-1" />
            {plan.highlightText}
          </Badge>
        </div>
      )}

      <Card 
        className="h-full flex flex-col shadow-lg relative transition-all duration-300 hover:shadow-xl backdrop-blur-sm overflow-hidden"
        style={{
          background: plan.colors.background,
          borderColor: plan.colors.border,
          color: plan.colors.text
        }}
      >
        {/* Decorações do card */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-3 left-3 text-lg font-bold opacity-15"
            style={{ color: plan.colors.suit }}
          >
            {plan.cardSuit}
          </div>
          <div 
            className="absolute bottom-3 right-3 text-lg font-bold opacity-15 transform rotate-180"
            style={{ color: plan.colors.suit }}
          >
            {plan.cardSuit}
          </div>
        </div>
        
        <CardHeader className="pb-4 relative z-10">
          <CardTitle className="text-lg font-bold flex items-center gap-2 mb-2" style={{ color: plan.colors.text }}>
            <Crown className="h-5 w-5" />
            <span>{plan.name}</span>
          </CardTitle>
          <p className="text-sm opacity-90 mb-3" style={{ color: plan.colors.text }}>
            {plan.description}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold" style={{ color: plan.colors.text }}>
              {formatCurrency(plan.price)}
            </span>
            <span className="text-sm opacity-80" style={{ color: plan.colors.text }}>
              /{plan.billing_period}
            </span>
          </div>
          
          {plan.discount > 0 && (
            <Badge 
              className="w-fit mt-2"
              style={{ 
                backgroundColor: plan.colors.highlight,
                color: plan.colors.text 
              }}
            >
              {plan.discount}% OFF
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="flex-grow pt-0 pb-4 relative z-10">
          <div className="space-y-2">
            {displayModules.length > 0 ? (
              <>
                <div className="text-sm font-medium mb-2 opacity-90" style={{ color: plan.colors.text }}>
                  Módulos Incluídos:
                </div>
                {displayModules.map((module: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm opacity-90" style={{ color: plan.colors.text }}>
                    <Check 
                      className="h-4 w-4 flex-shrink-0" 
                      style={{ color: plan.colors.marker }}
                    />
                    <span>{module}</span>
                  </div>
                ))}
                {remainingModulesCount > 0 && (
                  <div className="text-xs opacity-75 mt-2 font-medium" style={{ color: plan.colors.text }}>
                    +{remainingModulesCount} módulos adicionais
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm opacity-80" style={{ color: plan.colors.text }}>
                Plano personalizado configurado pelo administrador
              </div>
            )}
          </div>
        </CardContent>
        
        <div className="p-4 pt-0 relative z-10">
          {showDualButtons ? (
            <div className="flex gap-2">
              {/* Botão Atualizar só aparece se usuário estiver logado E tiver saldo suficiente */}
              {isUserLoggedIn && hasSufficientBalance && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  style={{
                    borderColor: plan.colors.border,
                    color: plan.colors.text,
                    backgroundColor: 'transparent'
                  }}
                  onClick={handleUpdateClick}
                  title={`Saldo disponível: R$ ${userBalance.toFixed(2)}`}
                >
                  Atualizar
                </Button>
              )}
              <Button 
                size="sm"
                className={`${(isUserLoggedIn && hasSufficientBalance) ? 'flex-1' : 'w-full'} text-xs`}
                style={{
                  backgroundColor: plan.colors.highlight,
                  color: plan.colors.text,
                  borderColor: plan.colors.highlight
                }}
                onClick={handleBuyClick}
              >
                Escolher
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full"
              style={{
                backgroundColor: plan.colors.highlight,
                color: plan.colors.text,
                borderColor: plan.colors.highlight
              }}
              onClick={handleBuyClick}
            >
              Escolher Plano
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PlanCard;
