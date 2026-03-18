import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveCardGridProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveCardGrid: React.FC<ResponsiveCardGridProps> = ({
  children,
  className
}) => {
  return (
    <div
      className={cn(
        // Grid responsivo com auto-fit - ajusta automaticamente conforme o espaço disponível
        'grid w-full',
        // Espaçamento entre cards
        'gap-3',
        className
      )}
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))'
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveCardGrid;