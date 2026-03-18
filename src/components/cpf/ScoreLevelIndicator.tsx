import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, XCircle, TrendingUp } from 'lucide-react';

interface ScoreLevelIndicatorProps {
  currentScore: number;
}

const ScoreLevelIndicator = ({ currentScore }: ScoreLevelIndicatorProps) => {
  const levels = [
    {
      name: 'Excelente',
      range: '851-1000',
      min: 851,
      max: 1000,
      color: 'bg-green-500',
      textColor: 'text-green-700 dark:text-green-400',
      borderColor: 'border-green-500',
      icon: CheckCircle2,
      description: 'Score muito alto, excelente histórico'
    },
    {
      name: 'Muito Bom',
      range: '701-850',
      min: 701,
      max: 850,
      color: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-400',
      borderColor: 'border-blue-500',
      icon: TrendingUp,
      description: 'Score alto, bom histórico'
    },
    {
      name: 'Bom',
      range: '551-700',
      min: 551,
      max: 700,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      borderColor: 'border-yellow-500',
      icon: AlertCircle,
      description: 'Score médio, histórico regular'
    },
    {
      name: 'Regular',
      range: '301-550',
      min: 301,
      max: 550,
      color: 'bg-orange-500',
      textColor: 'text-orange-700 dark:text-orange-400',
      borderColor: 'border-orange-500',
      icon: AlertCircle,
      description: 'Score baixo, requer atenção'
    },
    {
      name: 'Ruim',
      range: '0-300',
      min: 0,
      max: 300,
      color: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-400',
      borderColor: 'border-red-500',
      icon: XCircle,
      description: 'Score muito baixo, alto risco'
    }
  ];

  const getCurrentLevel = () => {
    return levels.find(level => currentScore >= level.min && currentScore <= level.max);
  };

  const currentLevel = getCurrentLevel();

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground mb-4">
        Níveis de Score
      </div>
      
      {levels.map((level) => {
        const Icon = level.icon;
        const isActive = currentScore >= level.min && currentScore <= level.max;
        
        return (
          <Card 
            key={level.name}
            className={`transition-all duration-200 ${
              isActive 
                ? `border-2 ${level.borderColor} shadow-md` 
                : 'border border-border hover:border-muted-foreground/30'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${isActive ? level.textColor : 'text-muted-foreground'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`font-semibold text-sm ${isActive ? level.textColor : 'text-foreground'}`}>
                      {level.name}
                    </h4>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      isActive 
                        ? `${level.color} text-white` 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {level.range}
                    </span>
                  </div>
                  
                  <p className={`text-xs ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {level.description}
                  </p>
                  
                  {isActive && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${level.color} animate-pulse`} />
                        <span className="text-xs font-medium text-foreground">
                          Score atual: {currentScore}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ScoreLevelIndicator;
