import React from 'react';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  originalPrice: number;
  discountedPrice?: number;
  discountPercentage?: number;
  hasDiscount?: boolean;
  className?: string;
  showCurrency?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  originalPrice,
  discountedPrice,
  discountPercentage,
  hasDiscount = false,
  className = '',
  showCurrency = false,
  size = 'md'
}) => {
  const formatPrice = (price: number) => {
    const formatted = price.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return showCurrency ? `R$ ${formatted}` : formatted;
  };

  const sizeClasses = {
    sm: {
      main: 'text-base',
      original: 'text-xs',
      discount: 'text-xs'
    },
    md: {
      main: 'text-lg font-semibold',
      original: 'text-sm',
      discount: 'text-sm'
    },
    lg: {
      main: 'text-xl font-bold',
      original: 'text-base',
      discount: 'text-sm'
    }
  };

  const classes = sizeClasses[size];

  if (!hasDiscount || !discountedPrice) {
    return (
      <div className={cn("flex flex-col", className)}>
        <span className={cn("text-foreground", classes.main)}>
          {formatPrice(originalPrice)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      {/* Valor com desconto (SEM R$) - igual ao template dos módulos */}
      <span className={cn("text-green-600 dark:text-green-400 font-bold", classes.main)}>
        {discountedPrice.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </span>
      
      {/* Valor original tachado - igual ao template dos módulos */}
      <span className={cn(
        "text-gray-500 dark:text-gray-400 line-through",
        classes.original
      )}>
        {formatPrice(originalPrice)}
      </span>
      
      {/* Porcentagem do desconto - igual ao template dos módulos */}
      {discountPercentage && discountPercentage > 0 && (
        <span className={cn(
          "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-center",
          classes.discount
        )}>
          -{discountPercentage}%
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;