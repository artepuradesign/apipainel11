import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';

interface ReferralOverviewCardsProps {
  stats: {
    total_indicados: number;
    indicados_ativos: number;
    total_bonus: number;
    bonus_este_mes: number;
  };
  walletInfo: {
    wallet_balance: number;
    plan_balance: number;
  };
  formatCurrency: (value: number) => string;
  isLoading?: boolean;
}

const ReferralOverviewCards: React.FC<ReferralOverviewCardsProps> = ({
  stats,
  walletInfo,
  formatCurrency,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-300 rounded"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Indicados',
      value: stats.total_indicados.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Total em Bônus',
      value: formatCurrency(stats.total_bonus),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReferralOverviewCards;