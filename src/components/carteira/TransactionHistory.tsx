import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDown, ArrowUp, Wallet, CreditCard, Gift, Plus, Copy, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDate, formatBrazilianCurrency } from '@/utils/historicoUtils';
import { useAuth } from '@/contexts/AuthContext';
import { unifiedHistoryService, UnifiedHistoryItem } from '@/services/unifiedHistoryService';
import { walletApiService } from '@/services/walletApiService';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  wallet_type?: string;
  payment_method?: string;
  status?: string;
  balance_type?: 'wallet' | 'plan';
  // Campos específicos para consultas
  document?: string;
  source_table?: string;
  category?: string;
}

interface TransactionHistoryProps {
  formatBrazilianCurrency: (value: number) => string;
  useApiData?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  formatBrazilianCurrency,
  useApiData = false
}) => {
  const { user } = useAuth();
  const [allTransactions, setAllTransactions] = useState<UnifiedHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load transactions from API or localStorage
  const loadTransactions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    if (useApiData && user) {
      console.log('🔄 [TRANSACTION_HISTORY] Carregando histórico unificado da API...');
      
      try {
        // Usar o novo serviço unificado que funciona via walletApiService  
        const response = await walletApiService.getTransactionHistory(parseInt(user.id), 50);
        
        if (response.success && response.data) {
          console.log('✅ [TRANSACTION_HISTORY] Transações carregadas:', response.data.length);
          
          // Processar transações em formato unificado
          const processedTransactions: UnifiedHistoryItem[] = response.data.map((t: any) => ({
            id: t.id?.toString() || Date.now().toString(),
            type: (t.type === 'consultation' || t.description?.toLowerCase().includes('consulta') ? 'consultation' : 'transaction') as 'consultation' | 'transaction',
            amount: parseFloat(t.amount) || 0,
            description: t.description || 'Transação',
            created_at: t.created_at || new Date().toISOString(),
            status: (t.status || 'completed') as 'completed' | 'failed' | 'processing' | 'cancelled',
            category: t.type === 'consultation' || t.description?.toLowerCase().includes('consulta') ? 'consultation' : t.type,
            balance_type: (t.wallet_type === 'plan' ? 'plan' : 'wallet') as 'wallet' | 'plan',
            payment_method: t.payment_method,
            document: t.reference_id || t.document,
            source_table: t.source_table || 'wallet_transactions'
          }));
          
          setAllTransactions(processedTransactions);
          setIsLoading(false);
          return;
        } else {
          console.warn('⚠️ [TRANSACTION_HISTORY] Erro no histórico:', response.error);
          throw new Error(response.error || 'Erro ao carregar histórico');
        }
      } catch (error) {
        console.error('❌ [TRANSACTION_HISTORY] Erro ao carregar histórico unificado:', error);
        // Fallback para método antigo
      }
    }

    // Fallback para dados da API ou localStorage
    if (useApiData && user) {
      try {
        // Importar dynamicamente o walletApiService
        const { walletApiService } = await import('@/services/walletApiService');
        
        // Carregar transações da carteira (incluindo indicações)
        const transactionsResponse = await walletApiService.getTransactionHistory(parseInt(user.id), 50);

        if (transactionsResponse.success && transactionsResponse.data) {
          // Processar transações da carteira
          const processedTransactions: UnifiedHistoryItem[] = transactionsResponse.data.map((t: any) => {
            return {
              id: t.id?.toString() || Date.now().toString(),
              amount: parseFloat(t.amount) || 0,
              type: 'transaction' as 'transaction',
              description: t.description || 'Transação',
              created_at: t.created_at || new Date().toISOString(),
              status: (t.status || 'completed') as 'completed' | 'failed' | 'processing' | 'cancelled',
              category: 'transaction',
              balance_type: (t.balance_type || 'wallet') as 'wallet' | 'plan',
              payment_method: t.payment_method
            };
          });
          
          setAllTransactions(processedTransactions);
          console.log('✅ [TRANSACTION_HISTORY] Transações carregadas (fallback):', processedTransactions.length);
        } else {
          console.error('❌ [TRANSACTION_HISTORY] Erro na resposta da API:', transactionsResponse.error);
          throw new Error('Erro ao carregar transações');
        }
      } catch (error) {
        console.error('❌ [TRANSACTION_HISTORY] Erro fallback:', error);
        // Fallback final para localStorage
        const localTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${user.id}`) || '[]');
        
        const formattedLocalTransactions: UnifiedHistoryItem[] = localTransactions.map((t: any) => ({
          id: t.id?.toString() || Date.now().toString(),
          amount: parseFloat(t.amount) || 0,
          type: 'transaction' as 'transaction',
          description: t.description || 'Transação',
          created_at: t.created_at || new Date().toISOString(),
          status: (t.status || 'completed') as 'completed' | 'failed' | 'processing' | 'cancelled',
          balance_type: (t.balance_type || 'wallet') as 'wallet' | 'plan',
          category: 'transaction'
        }));
        
        setAllTransactions(formattedLocalTransactions);
      }
    } else {
      // Fallback final para localStorage quando não há API
      if (user) {
        const localTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${user.id}`) || '[]');
        
        const formattedLocalTransactions: UnifiedHistoryItem[] = localTransactions.map((t: any) => ({
          id: t.id?.toString() || Date.now().toString(),
          amount: parseFloat(t.amount) || 0,
          type: 'transaction' as 'transaction',
          description: t.description || 'Transação',
          created_at: t.created_at || new Date().toISOString(),
          status: (t.status || 'completed') as 'completed' | 'failed' | 'processing' | 'cancelled',
          balance_type: (t.balance_type || 'wallet') as 'wallet' | 'plan',
          category: 'transaction'
        }));
        
        setAllTransactions(formattedLocalTransactions);
      }
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, [user, useApiData]);

  const getTransactionIcon = (transaction: UnifiedHistoryItem) => {
    // Ícones específicos para consultas (vermelho para gasto)
    if (transaction.type === 'consultation') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    
    // Ícones para transações financeiras
    if (transaction.amount > 0) {
      switch (transaction.category) {
        case 'recarga':
        case 'recharge':
          return <ArrowDown className="w-5 h-5 text-green-500" />;
        case 'indicacao':
        case 'bonus':
          return <Gift className="w-5 h-5 text-purple-500" />;
        case 'cupom':
          return <Gift className="w-5 h-5 text-yellow-500" />;
        case 'entrada':
        case 'admin_adjustment':
          return <Plus className="w-5 h-5 text-green-500" />;
        default:
          return <Wallet className="w-5 h-5 text-purple-500" />;
      }
    } else {
      // Ativação do plano com saldo da carteira (azul)
      if (transaction.category === 'plan_activation' && transaction.balance_type === 'wallet') {
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      }
      
      switch (transaction.category) {
        case 'plan_purchase':
        case 'plan':
          return <CreditCard className="w-5 h-5 text-orange-500" />;
        case 'consultation':
          return <FileText className="w-5 h-5 text-red-500" />;
        case 'saida':
        case 'admin_debit':
          return <ArrowUp className="w-5 h-5 text-red-500" />;
        default:
          return <ArrowUp className="w-5 h-5 text-red-500" />;
      }
    }
  };

  // Função para determinar a cor e direção da transação
  const getTransactionColor = (transaction: UnifiedHistoryItem) => {
    // Consultas sempre vermelho (gasto)
    if (transaction.type === 'consultation') {
      return 'text-red-500';
    }
    
    // Ativação do plano com saldo da carteira - cor azul
    if (transaction.category === 'plan_activation' && transaction.balance_type === 'wallet') {
      return 'text-blue-500';
    }
    
    // Compra de plano sempre vermelho (saída de carteira)
    if (transaction.category === 'plan_purchase' || transaction.category === 'plan' || transaction.category === 'admin_debit') {
      return 'text-red-500';
    }
    
    return transaction.amount > 0 ? 'text-green-500' : 'text-red-500';
  };

  const getBalanceTypeLabel = (balanceType?: string) => {
    switch (balanceType) {
      case 'wallet':
        return 'Carteira Digital';
      case 'plan':
        return 'Saldo do Plano';
      default:
        return 'Carteira Digital';
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'entrada':
      case 'admin_adjustment': return 'Crédito Admin';
      case 'saida':
      case 'admin_debit': return 'Ajuste Admin';
      case 'recarga':
      case 'recharge': return 'Recarga';
      case 'indicacao': return 'Indicação';
      case 'bonus': return 'Bônus';
      case 'plan_purchase':
      case 'plan': return 'Plano';
      case 'plan_activation': return 'Ativação Plano';
      case 'consultation': return 'Consulta';
      case 'cupom': return 'Cupom';
      default: return category || 'Transação';
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:text-white w-full">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Histórico de Transações</CardTitle>
        <CardDescription className="dark:text-gray-400 text-xs sm:text-sm">
          Suas transações recentes
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto px-3 sm:px-6 pb-3 sm:pb-6">
          {allTransactions && allTransactions.length > 0 ? (
            allTransactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id}>
                  <div className="flex items-center justify-between p-2 sm:p-3 hover:bg-accent/50 rounded-lg transition-colors gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getTransactionIcon(transaction)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{transaction.description}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {formatDate(transaction.created_at)}
                          {transaction.document && ` • ${transaction.document}`}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                          {getBalanceTypeLabel(transaction.balance_type)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-semibold text-sm sm:text-base ${getTransactionColor(transaction)}`}>
                        {/* Consultas: valor negativo com sinal - */}
                        {transaction.type === 'consultation' 
                          ? `-${formatBrazilianCurrency(Math.abs(transaction.amount))}`
                          : /* Ativação do plano com saldo da carteira: sem sinal */
                            transaction.category === 'plan_activation' && transaction.balance_type === 'wallet'
                            ? formatBrazilianCurrency(Math.abs(transaction.amount))
                            : /* Demais transações: + para positivo, - para negativo */
                              `${transaction.amount > 0 ? '+' : ''}${formatBrazilianCurrency(Math.abs(transaction.amount))}`
                        }
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">
                        {transaction.type === 'consultation' ? 'Consulta' : getCategoryLabel(transaction.category)}
                      </p>
                    </div>
                  </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 px-3 sm:px-6">
              <Wallet className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">Nenhuma transação</p>
              <p className="text-xs sm:text-sm">Suas transações aparecerão aqui.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;