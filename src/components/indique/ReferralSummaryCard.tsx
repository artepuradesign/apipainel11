import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Clock } from 'lucide-react';

interface ReferralSummaryCardProps {
  stats: {
    total_indicados: number;
    indicados_ativos: number;
    total_bonus: number;
    bonus_este_mes: number;
  };
  formatCurrency: (value: number) => string;
  isLoading?: boolean;
}

const ReferralSummaryCard: React.FC<ReferralSummaryCardProps> = ({
  stats,
  formatCurrency,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-64"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const conversionRate = stats.total_indicados > 0 
    ? ((stats.indicados_ativos / stats.total_indicados) * 100).toFixed(1)
    : '0';

  const summaryItems = [
    {
      label: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      description: `${stats.indicados_ativos} de ${stats.total_indicados} indicados estão ativos`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Ganhos Este Mês',
      value: formatCurrency(stats.bonus_este_mes),
      description: 'Bônus recebidos no mês atual',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Total Acumulado',
      value: formatCurrency(stats.total_bonus),
      description: 'Todos os bônus recebidos',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Resumo de Performance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Estatísticas detalhadas do seu programa de indicações
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {summaryItems.map((item, index) => (
            <div 
              key={index}
              className={`flex items-center p-4 rounded-lg border ${item.bgColor} border-gray-200 dark:border-gray-700`}
            >
              <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 mr-4`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {item.label}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {item.value}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {stats.total_indicados === 0 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Compartilhe seu código de indicação para ver suas estatísticas aqui!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralSummaryCard;