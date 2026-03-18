import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ArrowUp, ArrowDown, Wallet, CreditCard, Gift, Plus, Users, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { getReferredUserInfo } from '@/utils/historicoUtils';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit' | 'bonus' | 'referral_bonus' | 'plan_purchase' | 'recharge' | 'plan_credit' | 'recarga';
  description: string;
  created_at: string;
  balance_type?: 'wallet' | 'plan';
  status?: string;
  payment_method?: string;
  category?: string;
  is_referral?: boolean;
}

interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  amount: number;
  created_at: string;
  status: 'pending' | 'paid';
}

interface TransactionItemProps {
  item: Transaction | (ReferralEarning & { type: 'referral_bonus'; description: string; balance_type: 'wallet' });
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  isReferral?: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  item,
  formatBrazilianCurrency,
  formatDate,
  isReferral = false
}) => {
  const getTransactionIcon = (type: string, description?: string) => {
    // Verificar se é uma recarga com cupom aplicado
    if (type === 'recharge' && description && description.includes('cupom')) {
      return <Ticket className="w-4 h-4 text-green-500" />;
    }
    
    switch (type) {
      case 'recharge':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'debit':
        return <ArrowUp className="w-4 h-4 text-red-500" />;
      case 'plan_credit':
        return <Wallet className="w-4 h-4 text-purple-500" />;
      case 'bonus':
      case 'referral_bonus':
        return isReferral ? <Users className="w-4 h-4 text-blue-500" /> : <Gift className="w-4 h-4 text-blue-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'recharge':
      case 'bonus':
      case 'referral_bonus':
      case 'plan_credit':
      case 'credit':
        return 'text-green-500';
      case 'debit':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTransactionSign = (type: string) => {
    switch (type) {
      case 'recharge':
      case 'bonus':
      case 'referral_bonus':
      case 'plan_credit':
      case 'credit':
        return '+';
      case 'debit':
        return '-';
      default:
        return '';
    }
  };

  const copyTransactionId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copiado para a área de transferência");
  };

  const getStatusBadge = () => {
    if (isReferral) {
      const referralItem = item as ReferralEarning & { type: 'referral_bonus'; description: string; balance_type: 'wallet' };
      const userInfo = getReferredUserInfo(referralItem.referred_user_id);
      
      return (
        <div className="flex items-center gap-2">
          <Badge 
            variant={referralItem.status === 'paid' ? 'default' : 'secondary'}
            className="text-xs bg-green-100 text-green-700 border-green-200"
          >
            {referralItem.status === 'paid' ? '✅ Bônus Pago' : '⏳ Pendente'}
          </Badge>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            👤 {userInfo.firstName} (ID: {userInfo.id})
          </Badge>
        </div>
      );
    }
    
    // Para transações de bônus de indicação normais
    if (item.type === 'bonus' || item.type === 'referral_bonus' || 
       (item.description && (item.description.includes('Bônus') || item.description.includes('indicação')))) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
            🎁 Bônus de Boas-vindas
          </Badge>
        </div>
      );
    }
    
    if (item.type === 'recharge') {
      // Verificar se foi uma recarga com cupom
      if (item.description && item.description.includes('cupom')) {
        const cupomMatch = item.description.match(/cupom ([A-Z0-9]+)/i);
        const cupomCode = cupomMatch ? cupomMatch[1] : 'aplicado';
        return (
          <div className="flex items-center gap-1">
            <Badge variant="default" className="text-xs bg-green-500">💰 Recarga</Badge>
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              🎫 Cupom {cupomCode}
            </Badge>
          </div>
        );
      }
      return <Badge variant="default" className="text-xs bg-green-500">💰 Recarga</Badge>;
    }
    
    return <Badge variant="secondary" className="text-xs">ID: {item.id}</Badge>;
  };

  const getDescription = () => {
    if (isReferral) {
      return `🎁 Bônus de boas-vindas`;
    }
    
    // Verificar se é um bônus de indicação nas transações normais e resumir
    if (item.description && (
      item.description.includes('Bônus') || 
      item.description.includes('indicação') ||
      item.description.includes('boas-vindas')
    )) {
      // Resumir descrições longas de bônus
      if (item.description.includes('boas-vindas') || item.description.includes('welcome')) {
        return '🎁 Bônus de boas-vindas';
      }
      if (item.description.includes('indicação')) {
        return '🎁 Bônus de indicação';
      }
      return `🎁 ${item.description}`;
    }
    
    return item.description;
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${isReferral ? 'bg-blue-100 dark:bg-blue-900/30' : item.type === 'recharge' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
          {getTransactionIcon(item.type, item.description)}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {getDescription()}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{formatDate(item.created_at)}</span>
            {getStatusBadge()}
            {!isReferral && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyTransactionId(item.id)}
                className="h-4 w-4 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${getTransactionColor(item.type)}`}>
          {getTransactionSign(item.type)}{formatBrazilianCurrency(item.amount)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {item.balance_type === 'wallet' ? 'Carteira' : 'Plano'}
        </p>
      </div>
    </div>
  );
};

export default TransactionItem;
