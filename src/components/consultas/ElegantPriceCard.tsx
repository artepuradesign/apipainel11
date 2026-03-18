import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ElegantPriceCardProps {
  originalPrice: number;
  finalPrice: number;
  hasDiscount: boolean;
  discountPercentage?: number;
  planType?: string;
  loading?: boolean;
  className?: string;
}

const ElegantPriceCard: React.FC<ElegantPriceCardProps> = ({
  originalPrice,
  finalPrice,
  hasDiscount,
  discountPercentage,
  planType,
  loading = false,
  className
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const savings = hasDiscount ? originalPrice - finalPrice : 0;

  if (loading) {
    return (
      <div className={cn("animate-pulse space-y-2", className)}>
        <div className="h-8 w-24 bg-muted rounded"></div>
        <div className="h-4 w-16 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative rounded-lg border-2 border-gradient-to-r from-blue-500/20 to-purple-500/20 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 overflow-hidden",
      className
    )}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full translate-y-8 -translate-x-8"></div>
      
      <div className="relative">
        {/* Plan badge */}
        {planType && (
          <div className="flex items-center gap-1 mb-2">
            <Zap className="w-3 h-3 text-amber-500" />
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {planType}
            </Badge>
          </div>
        )}

        {/* Main price */}
        <div className="space-y-1">
          {hasDiscount ? (
            <>
              {/* Discounted price */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  R$ {formatPrice(finalPrice)}
                </span>
                {discountPercentage && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                    -{discountPercentage}%
                  </Badge>
                )}
              </div>
              
              {/* Original price */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground line-through">
                  De R$ {formatPrice(originalPrice)}
                </span>
              </div>
              
              {/* Savings highlight */}
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <TrendingDown className="w-3 h-3" />
                <span className="font-medium">
                  Você economiza R$ {formatPrice(savings)}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Regular price */}
              <div className="text-2xl font-bold text-foreground">
                R$ {formatPrice(finalPrice)}
              </div>
              <div className="text-xs text-muted-foreground">
                Preço da consulta
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElegantPriceCard;