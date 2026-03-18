import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, TrendingUp, Users, Calendar, Search, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiDashboardAdmin } from '@/hooks/useApiDashboardAdmin';
import { formatBrazilianCurrency, formatDate } from '@/utils/historicoUtils';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';

const AdminPagamentosPaypal = () => {
  const { isSupport } = useAuth();
  const { stats, transactions, isLoading, loadTransactions } = useApiDashboardAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadTransactions(200, 'paypal');
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = searchTerm === '' || 
        transaction.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id?.toString().includes(searchTerm);
      const matchesDate = dateFilter === '' || transaction.created_at?.includes(dateFilter);
      return matchesSearch && matchesDate;
    });
  }, [transactions, searchTerm, dateFilter]);

  const paypalStats = useMemo(() => {
    const totalValue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const todayTransactions = transactions.filter(t => 
      t.created_at && new Date(t.created_at).toDateString() === new Date().toDateString()
    );
    const uniqueUsers = new Set(transactions.map(t => t.user_name)).size;
    return { total: transactions.length, totalValue, todayCount: todayTransactions.length, todayValue: todayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0), uniqueUsers };
  }, [transactions]);

  if (!isSupport) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Acesso Negado</h2>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardTitleCard
        title="Pagamentos PayPal"
        subtitle="Análise detalhada de todas as transações PayPal"
        icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/admin"
        right={
          <Button onClick={() => loadTransactions(200, 'paypal')} disabled={isLoading} variant="outline" size="sm" className="h-8 sm:h-9">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-2">Atualizar</span>
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total PayPal</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatBrazilianCurrency(stats?.payment_paypal || paypalStats.totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Transações</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{paypalStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatBrazilianCurrency(paypalStats.todayValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{paypalStats.uniqueUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-9" />
            </div>
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-9 sm:w-40" />
            <Button variant="outline" onClick={() => { setSearchTerm(''); setDateFilter(''); }} size="sm" className="h-9">Limpar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Transações PayPal ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando transações...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma transação PayPal encontrada</div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-3 sm:p-4 space-y-2 bg-card border-l-4 border-l-purple-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">#{transaction.id}</span>
                      <Badge variant="secondary" className="text-xs">PayPal</Badge>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">{formatDate(transaction.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{transaction.user_name || 'N/A'}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{transaction.description}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="font-bold text-sm sm:text-base text-green-600">{formatBrazilianCurrency(transaction.amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPagamentosPaypal;
