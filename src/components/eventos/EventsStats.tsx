
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Gift } from 'lucide-react';

const EventsStats = () => {
  const stats = [
    {
      title: 'Usuários Participando',
      value: '0',
      icon: Users,
      change: '+0%',
      color: 'text-blue-600'
    },
    {
      title: 'Campanhas Ativas',
      value: '3',
      icon: Gift,
      change: 'Estável',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className={`text-xs ${stat.color}`}>{stat.change} este mês</p>
              </div>
              <div className={`h-12 w-12 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventsStats;
