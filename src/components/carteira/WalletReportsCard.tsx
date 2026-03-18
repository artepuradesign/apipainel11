
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PieChart, Users, Gift, TrendingUp, ArrowDownUp } from 'lucide-react';

interface WalletReportsCardProps {
  formatBrazilianCurrency: (value: number) => string;
}

const WalletReportsCard: React.FC<WalletReportsCardProps> = ({
  formatBrazilianCurrency
}) => {
  // Dados simulados para os relatórios
  const monthlyData = [
    { month: 'Janeiro', income: 150.00, expenses: 45.00, referrals: 25.00 },
    { month: 'Fevereiro', income: 200.00, expenses: 60.00, referrals: 30.00 },
    { month: 'Março', income: 180.00, expenses: 55.00, referrals: 20.00 },
  ];

  const referralStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 125.00,
    monthlyEarnings: 45.00
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-purple" />
          Relatórios e Análises
        </CardTitle>
        <CardDescription>
          Acompanhe seus ganhos e movimentações detalhadamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="referrals">Indicações</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Entradas</p>
                </div>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">{formatBrazilianCurrency(530.00)}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Últimos 3 meses</p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownUp className="w-4 h-4 text-red-600" />
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Saídas</p>
                </div>
                <p className="text-xl font-bold text-red-700 dark:text-red-300">{formatBrazilianCurrency(160.00)}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Últimos 3 meses</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Indicações</p>
                </div>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{formatBrazilianCurrency(75.00)}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Comissões recebidas</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total de Indicados</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{referralStats.totalReferrals}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">Ativos</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{referralStats.activeReferrals}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-purple-600" />
                <p className="font-medium text-purple-700 dark:text-purple-300">Ganhos com Indicações</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Acumulado</p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatBrazilianCurrency(referralStats.totalEarnings)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Este Mês</p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatBrazilianCurrency(referralStats.monthlyEarnings)}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="space-y-3">
              {monthlyData.map((data, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{data.month}</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">2024</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Entradas</p>
                      <p className="font-semibold text-green-600">{formatBrazilianCurrency(data.income)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Saídas</p>
                      <p className="font-semibold text-red-600">{formatBrazilianCurrency(data.expenses)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Indicações</p>
                      <p className="font-semibold text-purple-600">{formatBrazilianCurrency(data.referrals)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WalletReportsCard;
