
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  className = "" 
}) => {
  return (
    <div className={`flex justify-start ${className}`}>
      <Card className="bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-900/95 border border-purple-200/50 dark:border-purple-700/30 shadow-lg backdrop-blur-sm max-w-md">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="w-14 h-14 mx-auto bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/30 rounded-full flex items-center justify-center mb-3">
              <Icon className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyState;
