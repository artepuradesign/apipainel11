
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PlanFeatureItem from './PlanFeatureItem';
import CardDecorations from './CardDecorations';
import PlanBadge from './PlanBadge';
import { getCardThemeStyles, getButtonColor } from './CardThemeUtils';
import { getDiscount } from '@/utils/planUtils';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingPlan {
  id: number;
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  subscription_link: string;
  is_featured?: boolean;
  is_professional?: boolean;
  is_editor?: boolean;
  is_editor_pro?: boolean;
  consultations_included: string;
  billing_period?: string;
  color?: string;
  theme?: string;
  cardSuit?: string;
  cardType?: string;
  badge?: string;
}

interface PricingCardProps {
  plan: PricingPlan;
  showDualButtons?: boolean;
  onBuyClick?: (planName: string) => void;
  onUpdateClick?: (planName: string) => void;
  isCurrent?: boolean;
  hasUpdateButton?: boolean;
}

const PricingCard = ({ 
  plan, 
  showDualButtons = false, 
  onBuyClick, 
  onUpdateClick, 
  isCurrent = false,
  hasUpdateButton = true
}: PricingCardProps) => {
  const handlePlanSelection = () => {
    toast.info(`Obrigado pelo interesse no ${plan.name}. Em breve, você poderá assinar nossos planos.`);
  };
  
  const styles = getCardThemeStyles(plan.color);
  const isDarkTheme = plan.color === 'tone2' || plan.color === 'tone4' || plan.color === 'tone3';
  const isTone1 = plan.color === 'tone1';
  const discount = getDiscount(plan.name);

  // Check if user is logged in and has sufficient balance
  const isUserLoggedIn = !!localStorage.getItem('auth_token');
  const userBalance = parseFloat(localStorage.getItem('user_balance') || '0');
  const planPrice = parseFloat(plan.price.replace('R$', '').replace(',', '.'));
  const hasSufficientBalance = userBalance >= planPrice;
  const shouldShowUpdateButton = isUserLoggedIn && hasSufficientBalance;

  return (
    <div className="relative">
      <PlanBadge 
        isFeatured={plan.is_featured} 
        isProfessional={plan.is_professional} 
        isEditor={plan.is_editor}
        isEditorPro={plan.is_editor_pro}
        badgeText={plan.badge}
      />
      
      <motion.div 
        whileHover={{
          y: -8,
          scale: 1.02,
          transition: {
            duration: 0.3,
            ease: "easeOut"
          }
        }} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full w-full"
      >
        <Card className={`group h-full flex flex-col shadow-lg relative transition-all duration-500 hover:shadow-2xl hover-glow min-h-[460px] w-full max-w-[260px] ${styles.textColor} backdrop-blur-sm`} style={{
          background: styles.background,
          border: styles.border,
          position: 'relative' as const,
          overflow: 'hidden' as const
        }}>
          <CardDecorations cardSuit={plan.cardSuit} cardType={plan.cardType} styles={styles} />
          
          <CardHeader className="pb-4 relative z-10 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CardTitle className={`text-lg font-bold flex items-center gap-2 mb-2 whitespace-nowrap ${isTone1 ? 'text-gray-900' : 'text-white'}`}>
                <motion.span 
                  className="text-xl animate-float" 
                  style={{ color: styles.suitColor }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {plan.cardSuit}
                </motion.span>
                <span className="truncate">{plan.name}</span>
              </CardTitle>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardDescription className={`text-sm mb-3 ${isTone1 ? 'text-gray-600' : 'text-gray-200'}`}>
                {plan.description}
              </CardDescription>
            </motion.div>
            
            <motion.div 
              className="flex items-baseline gap-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className={`text-2xl font-bold animate-pulse-grow ${isTone1 ? 'text-gray-900' : 'text-white'}`}>
                {plan.price}
              </span>
              <span className={`text-sm ${isTone1 ? 'text-gray-500' : 'text-gray-200'}`}>
                /{plan.billing_period}
              </span>
            </motion.div>
            
            {/* Discount Badge */}
            {discount > 0 && (
              <motion.div 
                className="mt-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Badge className="bg-green-500 text-white hover:bg-green-600 animate-bounce-in">
                  {discount}% de desconto
                </Badge>
              </motion.div>
            )}
          </CardHeader>
          
          <CardContent className="flex-grow pt-0 pb-4 relative z-10">
            <div className="space-y-2">
              {plan.features.map((feature, featureIndex) => (
                <motion.div
                  key={featureIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + featureIndex * 0.1 }}
                >
                  <PlanFeatureItem 
                    text={feature.text} 
                    included={feature.included} 
                    highlight={feature.highlight} 
                    isDarkTheme={!isTone1} 
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="pt-0 pb-4 relative z-10 flex-shrink-0">
            {showDualButtons && !isCurrent ? (
              <motion.div 
                className="w-full space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Button 
                  className={`w-full text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover-scale whitespace-nowrap ${getButtonColor(plan.color)}`} 
                  onClick={() => onBuyClick?.(plan.name)}
                >
                  Comprar
                </Button>
                {shouldShowUpdateButton && (
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover-scale whitespace-nowrap"
                    onClick={() => onUpdateClick?.(plan.name)}
                  >
                    Atualizar
                  </Button>
                )}
              </motion.div>
            ) : !showDualButtons ? (
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Link to="/registro" className="w-full">
                  <Button className={`w-full text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover-scale whitespace-nowrap ${getButtonColor(plan.color)}`} onClick={handlePlanSelection}>
                    Iniciar Assinatura
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                className="w-full text-center text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                Plano Atual
              </motion.div>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default PricingCard;
