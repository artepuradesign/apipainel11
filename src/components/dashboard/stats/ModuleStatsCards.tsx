
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, TrendingUp, Calendar } from 'lucide-react';

interface ModuleStatsCardsProps {
  todayQueries: number;
  totalQueries: number;
  monthlyTotal: string;
  discount: string;
}

const ModuleStatsCards = ({ 
  todayQueries, 
  totalQueries, 
  monthlyTotal, 
  discount 
}: ModuleStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hoje</p>
              <p className="text-2xl font-bold dark:text-white">{todayQueries}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Consultas</p>
              <p className="text-2xl font-bold dark:text-white">{totalQueries}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Mensal</p>
              <p className="text-2xl font-bold dark:text-white">{monthlyTotal}</p>
              <p className="text-xs text-green-600 dark:text-green-400">Desconto: {discount}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleStatsCards;
