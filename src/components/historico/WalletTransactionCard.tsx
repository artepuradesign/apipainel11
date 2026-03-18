import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Wallet, CreditCard, Gift, Plus } from 'lucide-react';

interface WalletTransaction {
  id: string;
  type: 'recharge' | 'debit' | 'credit' | 'bonus' | 'referral_bonus';
  description: string;
  amount: number;
  created_at: string;
  payment_method?: string;
  balance_type?: 'wallet' | 'plan';
}

interface WalletTransactionCardProps {
  transaction: WalletTransaction;
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
}

const WalletTransactionCard: React.FC<WalletTransactionCardProps> = ({
  transaction,
  formatBrazilianCurrency,
  formatDate
}) => {
  const getIcon = () => {
    switch (transaction.type) {
      case 'recharge':
        return <Plus className="w-5 h-5 text-green-500" />;
      case 'debit':
        return <ArrowUp className="w-5 h-5 text-red-500" />;
      case 'bonus':
      case 'referral_bonus':
        return <Gift className="w-5 h-5 text-blue-500" />;
      case 'credit':
        return <ArrowDown className="w-5 h-5 text-green-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const getColor = () => {
    switch (transaction.type) {
      case 'recharge':
      case 'bonus':
      case 'referral_bonus':
      case 'credit':
        return 'text-green-500';
      case 'debit':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSign = () => {
    return transaction.amount >= 0 ? '+' : '-';
  };

  const getBadgeText = () => {
    switch (transaction.type) {
      case 'recharge':
        return 'Recarga';
      case 'debit':
        return 'Débito';
      case 'credit':
        return 'Crédito';
      case 'bonus':
        return 'Bônus';
      case 'referral_bonus':
        return 'Bônus Indicação';
      default:
        return 'Transação';
    }
  };

  const getBadgeVariant = () => {
    switch (transaction.type) {
      case 'recharge':
      case 'credit':
        return 'default' as const;
      case 'debit':
        return 'destructive' as const;
      case 'bonus':
      case 'referral_bonus':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getBalanceTypeLabel = () => {
    return transaction.balance_type === 'plan' ? 'Saldo do Plano' : 'Carteira Digital';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">
                  {transaction.description}
                </h4>
                <Badge variant={getBadgeVariant()} className="text-xs">
                  {getBadgeText()}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                <span>{formatDate(transaction.created_at)}</span>
                {transaction.payment_method && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="capitalize">{transaction.payment_method}</span>
                  </>
                )}
                <span className="hidden sm:inline">•</span>
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                  {getBalanceTypeLabel()}
                </span>
              </div>
            </div>
          </div>
          <div className={`text-right ${getColor()}`}>
            <p className="font-bold text-sm">
              {getSign()}{formatBrazilianCurrency(Math.abs(transaction.amount))}
            </p>
            <p className="text-xs text-muted-foreground">
              {transaction.amount >= 0 ? 'Crédito' : 'Débito'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletTransactionCard;