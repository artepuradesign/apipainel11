import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary';
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  className,
  onClick,
  variant = 'default'
}) => {
  const isMobile = useIsMobile();
  
  const variantClasses = {
    default: 'bg-card border-border hover:bg-accent/50',
    primary: 'bg-primary/10 border-primary/20 hover:bg-primary/20',
    secondary: 'bg-secondary/10 border-secondary/20 hover:bg-secondary/20'
  };

  return (
    <div
      className={cn(
        // Tamanho responsivo - 80% menor no mobile
        isMobile ? 'w-full h-16' : 'w-full h-32',
        // Layout e espaçamento responsivo
        isMobile ? 'p-2 rounded-md border' : 'p-4 rounded-lg border',
        // Estados e transições
        'transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:scale-[1.02]',
        // Variantes
        variantClasses[variant],
        className
      )}
      onClick={onClick}
    >
      {/* Valor no canto superior */}
      <div className={cn(
        "flex items-start justify-between",
        isMobile ? "mb-1" : "mb-2"
      )}>
        <div className={cn(
          "font-bold text-foreground",
          isMobile ? "text-sm" : "text-2xl"
        )}>
          {value}
        </div>
        <Icon className={cn(
          "text-muted-foreground flex-shrink-0",
          isMobile ? "h-3 w-3" : "h-4 w-4"
        )} />
      </div>
      
      {/* Título */}
      <h3 className={cn(
        "font-medium text-foreground line-clamp-2",
        isMobile ? "text-xs mb-0.5" : "text-sm mb-1"
      )}>
        {title}
      </h3>
      
      {/* Descrição opcional - oculta no mobile para economizar espaço */}
      {description && !isMobile && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}
    </div>
  );
};

export default ResponsiveCard;