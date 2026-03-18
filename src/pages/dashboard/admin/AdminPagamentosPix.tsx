import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, TrendingUp, Users, Calendar, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiDashboardAdmin } from '@/hooks/useApiDashboardAdmin';
import { formatBrazilianCurrency, formatDate } from '@/utils/historicoUtils';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';

const AdminPagamentosPix = () => {
  const { isSupport } = useAuth();
  const { stats, transactions, isLoading, loadTransactions } = useApiDashboardAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadTransactions(200, 'pix');
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = searchTerm === '' || 
        transaction.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id?.toString().includes(searchTerm);

      const matchesDate = dateFilter === '' || 
        transaction.created_at?.includes(dateFilter);

      return matchesSearch && matchesDate;
    });
  }, [transactions, searchTerm, dateFilter]);

  const pixStats = useMemo(() => {
    const totalValue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const todayTransactions = transactions.filter(t => 
      t.created_at && new Date(t.created_at).toDateString() === new Date().toDateString()
    );
    const uniqueUsers = new Set(transactions.map(t => t.user_name)).size;

    return {
      total: transactions.length,
      totalValue,
      todayCount: todayTransactions.length,
      todayValue: todayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
      uniqueUsers
    };
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
        title="Pagamentos PIX"
        subtitle="Análise detalhada de todas as transações PIX"
        icon={<QrCode className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/admin"
        right={
          <Button
            onClick={() => loadTransactions(200, 'pix')}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="h-8 sm:h-9"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-2">Atualizar</span>
          </Button>
        }
      />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total PIX</CardTitle>
            <QrCode className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatBrazilianCurrency(stats?.payment_pix || pixStats.totalValue)}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Valor total processado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Transações</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{pixStats.total}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Total de transações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatBrazilianCurrency(pixStats.todayValue)}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">{pixStats.todayCount} transações hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{pixStats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Usuários únicos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
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
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>
            <Input
              type="date"
              placeholder="Filtrar por data"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 sm:w-40"
            />
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
              }}
              size="sm"
              className="h-9"
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base sm:text-lg">Transações PIX ({filteredTransactions.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando transações PIX...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transação PIX encontrada
            </div>
          ) : (
             <div className="space-y-3">
              {filteredTransactions.map((transaction) => {
                const tx = transaction as any;
                let parsedMeta: any = null;
                try {
                  if (tx.metadata) {
                    parsedMeta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;
                  }
                } catch (_e) {}

                return (
                <div 
                  key={transaction.id}
                  className="border rounded-lg p-3 sm:p-4 space-y-3 bg-card border-l-4 border-l-green-500"
                >
                  {/* Linha 1: ID, Data, Badges */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-mono">#{transaction.id}</Badge>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="default" className="text-xs">PIX</Badge>
                      <Badge variant="outline" className="text-xs">{transaction.type || 'N/A'}</Badge>
                    </div>
                  </div>
                  
                  {/* Linha 2: Usuário + Valor */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="font-semibold text-sm sm:text-base">
                        {transaction.user_name || 'Usuário não identificado'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                        {tx.user_email && <p className="text-xs text-muted-foreground">📧 {tx.user_email}</p>}
                        {tx.user_login && <p className="text-xs text-muted-foreground">👤 @{tx.user_login}</p>}
                        {tx.user_cpf && <p className="text-xs text-muted-foreground">🪪 CPF: {tx.user_cpf}</p>}
                        {tx.user_telefone && <p className="text-xs text-muted-foreground">📱 Tel: {tx.user_telefone}</p>}
                        {tx.user_id && <p className="text-xs text-muted-foreground">🔑 ID: {tx.user_id}</p>}
                        {tx.user_status && <p className="text-xs text-muted-foreground">📌 Status: <span className="font-medium">{tx.user_status}</span></p>}
                        {tx.user_plano && <p className="text-xs text-muted-foreground">📋 Plano: <span className="font-medium">{tx.user_plano}</span></p>}
                        {tx.user_codigo_indicacao && <p className="text-xs text-muted-foreground">🎫 Cód: <span className="font-mono">{tx.user_codigo_indicacao}</span></p>}
                        {tx.user_saldo !== undefined && tx.user_saldo !== null && <p className="text-xs text-muted-foreground">💰 Saldo: <span className="font-mono font-semibold">{formatBrazilianCurrency(tx.user_saldo)}</span></p>}
                        {tx.user_saldo_plano !== undefined && tx.user_saldo_plano !== null && <p className="text-xs text-muted-foreground">💎 Plano: <span className="font-mono font-semibold">{formatBrazilianCurrency(tx.user_saldo_plano)}</span></p>}
                        {tx.user_created_at && <p className="text-xs text-muted-foreground">📅 Cadastro: {formatDate(tx.user_created_at)}</p>}
                      </div>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="font-bold text-lg sm:text-xl text-green-600">
                        {formatBrazilianCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Linha 3: Detalhes da Transação */}
                  <div className="pt-2 border-t border-border/50 space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">{transaction.description}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                      {tx.user_balance_before !== undefined && tx.user_balance_before !== null && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground">👛 Carteira Antes: <span className="font-mono">{formatBrazilianCurrency(tx.user_balance_before)}</span></p>
                      )}
                      {tx.user_balance_after !== undefined && tx.user_balance_after !== null && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground">👛 Carteira Depois: <span className="font-mono">{formatBrazilianCurrency(tx.user_balance_after)}</span></p>
                      )}
                      {tx.external_id && <p className="text-[10px] sm:text-xs text-muted-foreground">🔗 ID Externo: <span className="font-mono">{tx.external_id}</span></p>}
                      {tx.reference_table && <p className="text-[10px] sm:text-xs text-muted-foreground">📋 Ref: <span className="font-mono">{tx.reference_table}{tx.reference_id ? ` #${tx.reference_id}` : ''}</span></p>}
                      {tx.created_by && <p className="text-[10px] sm:text-xs text-muted-foreground">🛠️ Criado por: <span className="font-mono">{tx.created_by}</span></p>}
                    </div>
                    {parsedMeta && Object.keys(parsedMeta).length > 0 && (
                      <div className="pt-1">
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-0.5">📦 Metadata:</p>
                        <div className="bg-muted/50 rounded p-2 text-[10px] sm:text-xs font-mono text-muted-foreground space-y-0.5">
                          {Object.entries(parsedMeta).map(([key, value]) => (
                            <p key={key}>{key}: {String(value)}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPagamentosPix;
