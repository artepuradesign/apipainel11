import React from 'react';
import { cn } from '@/lib/utils';

interface EmailScoreBarProps {
  score: number;
  maxScore?: number;
  className?: string;
  showLabel?: boolean;
}

const EmailScoreBar: React.FC<EmailScoreBarProps> = ({ 
  score, 
  maxScore = 100, 
  className,
  showLabel = true 
}) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    if (score >= 20) return 'Baixo';
    return 'Muito Baixo';
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Email Score</span>
        {showLabel && (
          <span className={cn(
            "font-medium",
            score >= 80 && "text-emerald-600 dark:text-emerald-400",
            score >= 60 && score < 80 && "text-green-600 dark:text-green-400",
            score >= 40 && score < 60 && "text-yellow-600 dark:text-yellow-400",
            score >= 20 && score < 40 && "text-orange-600 dark:text-orange-400",
            score < 20 && "text-red-600 dark:text-red-400"
          )}>
            {score}/{maxScore} - {getScoreLabel(score)}
          </span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-300",
            score > 0 ? getScoreColor(score) : "bg-gray-300 dark:bg-gray-600"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>{maxScore}</span>
      </div>
    </div>
  );
};

export default EmailScoreBar;