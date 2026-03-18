
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  Gift,
  ArrowUpDown,
  Calendar,
  Filter
} from 'lucide-react';
import { 
  getCentralCashStats, 
  getCentralCashTransactions, 
  getTransactionsByType
} from '@/utils/centralCashService';

interface FinancialReportsProps {
  className?: string;
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ className }) => {
  const [stats, setStats] = useState(getCentralCashStats());
  const [transactions, setTransactions] = useState(getCentralCashTransactions());
  const [revenueData, setRevenueData] = useState<Array<{date: string, revenue: number}>>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const getDynamicRevenueData = (days: number) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Calcular receita do dia
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dayStart && 
               transactionDate <= dayEnd && 
               ['recarga', 'plano'].includes(t.type);
      });
      
      const dayRevenue = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue
      });
    }
    
    return data;
  };

  useEffect(() => {
    const loadData = () => {
      setStats(getCentralCashStats());
      setTransactions(getCentralCashTransactions());
      
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      setRevenueData(getDynamicRevenueData(days));
    };

    loadData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'recarga': return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'plano': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'comissao_indicacao': 
      case 'comissao_recarga': return <Gift className="h-4 w-4 text-purple-500" />;
      case 'saque': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'recarga': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'plano': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'comissao_indicacao': 
      case 'comissao_recarga': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'saque': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const totalRevenue = revenueData.reduce((acc, day) => acc + day.revenue, 0);
  const avgDailyRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

  // Calcular comissões pagas corretamente
  const commissionTransactions = getTransactionsByType('comissao_indicacao')
    .concat(getTransactionsByType('comissao_recarga'));
  
  const totalCommissionsPaid = commissionTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className={className}>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards de Estatísticas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Total do Caixa</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.total_balance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Saldo atual em caixa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.daily_revenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Entrada de hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users_count}</div>
                <p className="text-xs text-muted-foreground">
                  Usuários registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(totalCommissionsPaid)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total pago em comissões
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown de Receitas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Breakdown de Receitas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Recargas</span>
                    <span className="text-sm font-medium">{formatCurrency(stats.total_recharges)}</span>
                  </div>
                  <Progress 
                    value={(stats.total_recharges / (stats.total_recharges + stats.total_plan_sales)) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Vendas de Planos</span>
                    <span className="text-sm font-medium">{formatCurrency(stats.total_plan_sales)}</span>
                  </div>
                  <Progress 
                    value={(stats.total_plan_sales / (stats.total_recharges + stats.total_plan_sales)) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Receita Média Diária</span>
                  <Badge variant="outline">{formatCurrency(avgDailyRevenue)}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total de Saques</span>
                  <Badge variant="outline">{formatCurrency(stats.total_withdrawals)}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Usuários Ativos Hoje</span>
                  <Badge variant="outline">{stats.active_users_today}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                Transações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.slice(0, 20).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getTransactionColor(transaction.type)}>
                        {['recarga', 'plano'].includes(transaction.type) ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </Badge>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {transaction.type.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ArrowUpDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma transação encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Receita por Período
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPeriod('7d')}
                    className={`px-3 py-1 text-xs rounded ${selectedPeriod === '7d' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    7 dias
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('30d')}
                    className={`px-3 py-1 text-xs rounded ${selectedPeriod === '30d' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    30 dias
                  </button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total do Período</p>
                    <p className="text-lg font-bold">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Média Diária</p>
                    <p className="text-lg font-bold">{formatCurrency(avgDailyRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dias com Receita</p>
                    <p className="text-lg font-bold">{revenueData.filter(d => d.revenue > 0).length}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {revenueData.map((day, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm">
                        {new Date(day.date).toLocaleDateString('pt-BR', { 
                          weekday: 'short', 
                          day: '2-digit', 
                          month: '2-digit' 
                        })}
                      </span>
                      <span className="text-sm font-medium">{formatCurrency(day.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Comissões Pagas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Pago em Comissões</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {formatCurrency(totalCommissionsPaid)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {commissionTransactions.length > 0 ? (
                  commissionTransactions.slice(0, 15).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Gift className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-sm font-medium">{commission.description}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(commission.date).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        {formatCurrency(commission.amount)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma comissão paga ainda</p>
                    <p className="text-xs mt-1">As comissões aparecerão aqui quando forem processadas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;
