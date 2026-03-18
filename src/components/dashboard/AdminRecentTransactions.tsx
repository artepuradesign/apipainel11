import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { type DashboardTransaction } from '@/hooks/useApiDashboardAdmin';

interface AdminRecentTransactionsProps {
  recentTransactions: DashboardTransaction[];
}

const AdminRecentTransactions: React.FC<AdminRecentTransactionsProps> = ({ recentTransactions }) => {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Remove duplicatas baseadas no usuário, valor e horário para evitar exibir transações similares
  const deduplicateTransactions = (transactions: DashboardTransaction[]) => {
    const seen = new Set();
    const seenBonusUsers = new Set();
    
    return transactions.filter(transaction => {
      // Para transações de bônus/comissão, verificar por usuário e valor
      if (transaction.description.toLowerCase().includes('bônus') || 
          transaction.description.toLowerCase().includes('comissão') ||
          transaction.description.toLowerCase().includes('indicação')) {
        
        const userMatch = transaction.description.match(/(?:usuário|por|indicado por|Rodrigo)\s+(\w+)/i);
        const userName = userMatch ? userMatch[1] : transaction.user_name;
        const bonusKey = `${userName}-${transaction.amount}-bonus`;
        
        if (seenBonusUsers.has(bonusKey)) {
          return false;
        }
        seenBonusUsers.add(bonusKey);
        return true;
      }
      
      // Para consultas, agrupar por usuário + valor + minuto (evita duplicatas de consulta + saldo)
      const dateKey = new Date(transaction.created_at).toISOString().slice(0, 16);
      if (transaction.type === 'consulta') {
        const consultaKey = `consulta-${transaction.user_name}-${Math.abs(transaction.amount)}-${dateKey}`;
        if (seen.has(consultaKey)) {
          return false;
        }
        seen.add(consultaKey);
        return true;
      }
      
      // Para outras transações, usar descrição + valor + data
      const key = `${transaction.description}-${Math.abs(transaction.amount)}-${dateKey}`;
      
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  const uniqueTransactions = deduplicateTransactions(recentTransactions);

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
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Transações do Caixa Central
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="space-y-1.5 sm:space-y-2 max-h-72 sm:max-h-96 overflow-y-auto">
          {uniqueTransactions.length > 0 ? (
            uniqueTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className={`p-2.5 sm:p-3 bg-muted/50 rounded-lg border-l-4 ${getTypeColor(transaction.type)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Usuário + Descrição */}
                    <div className="flex items-center gap-1.5">
                      {transaction.user_name && (
                        <span className="text-xs sm:text-sm font-semibold text-primary">
                          👤 {transaction.user_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/80">
                      {transaction.type === 'consulta' && (transaction as any).module_name
                        ? `${(transaction as any).module_name} - ${transaction.description.replace(/^Consulta[:\s]*/i, '')}`
                        : transaction.description}
                    </p>
                    
                    {/* Info secundária */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      {/* Data/hora */}
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })} {new Date(transaction.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {/* Método de pagamento */}
                      {transaction.payment_method && (
                        <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-3.5 sm:h-4 font-normal uppercase">
                          {transaction.payment_method}
                        </Badge>
                      )}
                      
                      {/* Tipo / Módulo */}
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-3.5 sm:h-4 font-normal">
                        {(transaction as any).module_name || getTypeLabel(transaction.type)}
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
            ))
          ) : (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 opacity-50" />
              <p className="text-xs sm:text-sm">Nenhuma transação no caixa ainda</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRecentTransactions;
