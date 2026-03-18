import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, RefreshCw } from 'lucide-react';
import { useApiDashboardAdmin } from '@/hooks/useApiDashboardAdmin';
import { formatDate } from '@/utils/historicoUtils';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';

const AdminCompraPlanos = () => {
  const { transactions, loadTransactions, isLoading, stats } = useApiDashboardAdmin();
  const [displayLimit, setDisplayLimit] = useState(50);

  useEffect(() => {
    loadTransactions(200, 'planos');
  }, []);

  // Só somar PIX, Cartão e PayPal - excluir cupom
  const paidTransactions = transactions.filter(t => {
    const method = (t.payment_method || '').toLowerCase();
    return ['pix', 'credit', 'paypal', 'cartao', 'card'].some(m => method.includes(m));
  });
  const totalPlanos = paidTransactions.reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardTitleCard
        title="Compra de Planos"
        subtitle="Histórico completo de vendas de planos"
        icon={<CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/admin"
        right={
          <Button onClick={() => loadTransactions(200, 'planos')} disabled={isLoading} variant="outline" size="sm" className="h-8 sm:h-9">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-2">Atualizar</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total em Vendas</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {formatCurrency(stats?.plan_sales || totalPlanos)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total de Vendas</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Ticket Médio</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(transactions.length ? totalPlanos / transactions.length : 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Histórico de Compra de Planos</CardTitle>
            <Badge variant="secondary" className="text-xs">{transactions.length} vendas</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando vendas...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, displayLimit).map((transaction, index) => (
                <div key={transaction.id || index} className="border rounded-lg p-3 sm:p-4 space-y-3 bg-card border-l-4 border-l-purple-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-mono">#{transaction.id || index}</Badge>
                      <span className="text-xs sm:text-sm text-muted-foreground">{formatDate(transaction.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">{transaction.payment_method?.toUpperCase() || 'N/A'}</Badge>
                      <Badge variant="outline" className="text-xs">{transaction.type || 'plano'}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base">{transaction.user_name || 'Usuário não identificado'}</p>
                      {(transaction as any).user_email && (
                        <p className="text-xs text-muted-foreground">📧 {(transaction as any).user_email}</p>
                      )}
                      {(transaction as any).user_login && (
                        <p className="text-xs text-muted-foreground">👤 @{(transaction as any).user_login}</p>
                      )}
                    </div>
                    <div className="text-right ml-3">
                      <p className="font-bold text-lg sm:text-xl text-purple-600">{formatCurrency(transaction.amount)}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/50 space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">{transaction.description}</p>
                    {(transaction as any).external_id && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">ID Externo: {(transaction as any).external_id}</p>
                    )}
                  </div>
                </div>
              ))}
              {transactions.length > displayLimit && (
                <div className="text-center pt-2">
                  <Button variant="outline" onClick={() => setDisplayLimit(prev => prev + 50)} className="w-full sm:w-auto">
                    Carregar mais ({transactions.length - displayLimit} restantes)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma venda de plano registrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCompraPlanos;
