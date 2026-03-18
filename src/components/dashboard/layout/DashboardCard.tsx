
import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'form' | 'stats';
}

const DashboardCard = ({ 
  children, 
  className = '', 
  title, 
  description, 
  headerAction,
  variant = 'default'
}: DashboardCardProps) => {
  const cardClasses = {
    default: 'dashboard-card',
    form: 'dashboard-form',
    stats: 'dashboard-card bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900'
  };

  return (
    <div className={cn(cardClasses[variant], "rounded-lg shadow-sm", className)}>
      {(title || description || headerAction) && (
        <div className="dashboard-border border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="dashboard-text-primary text-lg font-semibold mb-1">
                  {title}
                </h3>
              )}
              {description && (
                <p className="dashboard-text-muted text-sm">
                  {description}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="flex-shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
