import React from 'react';
import { ShoppingCart, CheckCircle, Package, CreditCard, Smartphone, DollarSign, Tag } from 'lucide-react';

interface PlanTransaction {
  id: string;
  type: 'plan_purchase' | 'plan_activation';
  description: string;
  amount: number;
  created_at: string;
  plan_name?: string;
  balance_type?: 'wallet' | 'plan';
  payment_method?: string;
  coupon_applied?: string;
  original_amount?: number;
}

interface PlanTransactionCardProps {
  transaction: PlanTransaction;
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
}

const PlanTransactionCard: React.FC<PlanTransactionCardProps> = ({
  transaction,
  formatBrazilianCurrency,
  formatDate
}) => {
  const isPurchase = transaction.type === 'plan_purchase';
  const isActivation = transaction.type === 'plan_activation';

  const getTitle = () => {
    if (isPurchase) return 'Compra do plano';
    if (isActivation) return 'Ativação do plano';
    return 'Plano';
  };

  const getIcon = () => {
    if (isPurchase) return <ShoppingCart className="w-5 h-5" />;
    if (isActivation) return <CheckCircle className="w-5 h-5" />;
    return <Package className="w-5 h-5" />;
  };

  const getIconLabel = () => {
    if (isPurchase) return '🛒';
    if (isActivation) return '✅';
    return '📦';
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'pix':
        return <Smartphone className="w-4 h-4" />;
      case 'cartao':
      case 'cartão':
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'paypal':
        return <DollarSign className="w-4 h-4" />;
      case 'wallet':
      case 'saldo':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'pix':
        return 'PIX';
      case 'cartao':
      case 'cartão':
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'paypal':
        return 'PayPal';
      case 'wallet':
      case 'saldo':
        return 'Saldo da Carteira';
      default:
        return method || 'Não informado';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Cabeçalho da Transação */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${isPurchase ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'} rounded-full flex items-center justify-center text-white`}>
              {getIcon()}
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">
                {getTitle()} {transaction.plan_name || 'Rei de Espadas'}
              </h5>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isPurchase 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {isPurchase ? '💳 Debitado' : '✅ Ativado'}
                </span>
                <span className="text-xs text-gray-500">
                  ID: {transaction.id.toString().slice(-6)}
                </span>
              </div>
            </div>
          </div>

          {/* Detalhes da Transação */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {transaction.description || (isPurchase ? 'Compra de plano realizada' : 'Plano ativado com sucesso')}
            </p>
            
            {/* Informações de Pagamento (apenas para compras) */}
            {isPurchase && transaction.payment_method && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Pago via:</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                  {getPaymentMethodIcon(transaction.payment_method)}
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {getPaymentMethodLabel(transaction.payment_method)}
                  </span>
                </div>
              </div>
            )}

            {/* Informações de Cupom (se aplicável) */}
            {transaction.coupon_applied && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="text-gray-500">Cupom aplicado:</span>
                <span className="text-green-600 font-medium">{transaction.coupon_applied}</span>
                {transaction.original_amount && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatBrazilianCurrency(transaction.original_amount)}
                  </span>
                )}
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
              📅 {formatDate(transaction.created_at)}
            </p>
          </div>
        </div>
        
        {/* Valor e Destino */}
        <div className="text-right ml-4">
          <div className={`text-xl font-bold mb-1 ${
            isPurchase 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-green-600 dark:text-green-400'
          }`}>
            {isPurchase ? '- ' : '+ '}
            {formatBrazilianCurrency(Math.abs(transaction.amount))}
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-gray-500">
              {isPurchase ? 'Debitado da Carteira' : 'Creditado no Plano'}
            </p>
            
            <div className="flex items-center justify-end gap-1">
              <span className={`inline-block w-2 h-2 rounded-full ${
                isPurchase ? 'bg-red-500' : 'bg-green-500'
              }`}></span>
              <span className={`text-xs font-medium ${
                isPurchase 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {isPurchase ? 'Carteira Principal' : 'Saldo do Plano'}
              </span>
            </div>

            {/* Status adicional */}
            <div className="mt-2 px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded text-xs">
              {isPurchase ? (
                <span className="text-gray-600 dark:text-gray-400">
                  💸 Débito processado
                </span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">
                  🎯 Saldo disponível para consultas
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanTransactionCard;