
import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardPageWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

const DashboardPageWrapper = ({ 
  children, 
  className = '', 
  title, 
  description 
}: DashboardPageWrapperProps) => {
  return (
    <div className={cn("dashboard-page min-h-screen p-6", className)}>
      <div className="max-w-7xl mx-auto space-y-6">
        {(title || description) && (
          <div className="dashboard-card rounded-lg p-6">
            {title && (
              <h1 className="dashboard-text-primary text-2xl font-bold mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="dashboard-text-muted">
                {description}
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardPageWrapper;
