import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, RefreshCw } from 'lucide-react';
import { useApiDashboardAdmin } from '@/hooks/useApiDashboardAdmin';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';

const AdminCaixa = () => {
  const { transactions, loadTransactions, isLoading, stats } = useApiDashboardAdmin();
  const [displayLimit, setDisplayLimit] = useState(50);

  useEffect(() => {
    loadTransactions(200, 'all');
  }, []);

  // Filtrar apenas entradas do caixa (mesmo filtro do DashboardAdmin)
  // Mesmo filtro do DashboardAdmin (sem filtrar por amount > 0)
  const caixaTransactions = transactions.filter(t => 
    ['recarga', 'plano', 'compra_modulo', 'entrada', 'consulta', 'compra_login'].includes(t.type)
  );

  const totalCaixa = caixaTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recarga': return 'border-l-blue-500';
      case 'plano': return 'border-l-emerald-500';
      case 'comissao': return 'border-l-yellow-500';
      case 'indicacao': return 'border-l-orange-500';
      case 'saque': return 'border-l-red-500';
      case 'compra_modulo': return 'border-l-violet-500';
      case 'entrada': return 'border-l-teal-500';
      case 'consulta': return 'border-l-cyan-500';
      case 'compra_login': return 'border-l-pink-500';
      default: return 'border-l-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recarga': return 'RECARGA';
      case 'plano': return 'COMPRA DE PLANO';
      case 'comissao': return 'COMISSÃO';
      case 'indicacao': return 'INDICAÇÃO';
      case 'saque': return 'SAQUE';
      case 'compra_modulo': return 'COMPRA DE MÓDULO';
      case 'entrada': return 'ENTRADA';
      case 'consulta': return 'CONSULTA';
      case 'compra_login': return 'COMPRA LOGIN';
      default: return type.toUpperCase();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardTitleCard
        title="Saldo em Caixa"
        subtitle="Consultas realizadas e compras na plataforma"
        icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/admin"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {formatCurrency(stats?.cash_balance || totalCaixa)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total de Transações</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {caixaTransactions.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Média por Transação</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(caixaTransactions.length ? totalCaixa / caixaTransactions.length : 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Histórico de Transações
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {caixaTransactions.length} registros
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando transações...</p>
            </div>
          ) : caixaTransactions.length > 0 ? (
            <div className="space-y-1.5 sm:space-y-2">
              {caixaTransactions.slice(0, displayLimit).map((transaction, index) => {
                const tx = transaction as any;
                return (
                  <div 
                    key={transaction.id || index}
                    className={`p-2.5 sm:p-3 bg-muted/50 rounded-lg border-l-4 ${getTypeColor(transaction.type)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Nome do usuário */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-semibold text-primary">
                            👤 {transaction.user_name || 'Usuário não identificado'}
                          </span>
                        </div>

                        {/* Descrição */}
                        <p className="text-xs sm:text-sm text-foreground/80">
                          {transaction.type === 'consulta' && tx.module_name
                            ? `${tx.module_name} - ${transaction.description.replace(/^Consulta[:\s]*/i, '')}`
                            : transaction.description}
                        </p>
                        
                        {/* Data + Badges */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })} {new Date(transaction.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {transaction.payment_method && (
                            <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-3.5 sm:h-4 font-normal uppercase">
                              {transaction.payment_method}
                            </Badge>
                          )}
                          
                          <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-3.5 sm:h-4 font-normal">
                            {tx.module_name || getTypeLabel(transaction.type)}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Valor */}
                      <div className="flex-shrink-0 text-right">
                        <Badge 
                          variant="secondary"
                          className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 ${
                            ['recarga', 'plano', 'compra_modulo', 'entrada', 'consulta', 'compra_login'].includes(transaction.type) 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                          }`}
                        >
                          {['recarga', 'plano', 'compra_modulo', 'entrada', 'consulta', 'compra_login'].includes(transaction.type) ? '+' : '-'}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}

              {caixaTransactions.length > displayLimit && (
                <div className="text-center pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setDisplayLimit(prev => prev + 50)}
                    className="w-full sm:w-auto"
                  >
                    Carregar mais ({caixaTransactions.length - displayLimit} restantes)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma transação registrada
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCaixa;
