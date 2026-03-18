import React from 'react';
import { CreditCard, CheckCircle } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  payment_method?: string;
  status?: string;
}

interface RechargeCardProps {
  transaction: Transaction;
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
}

const RechargeCard: React.FC<RechargeCardProps> = ({
  transaction,
  formatBrazilianCurrency,
  formatDate
}) => {
  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'boleto':
        return 'Boleto';
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'debit_card':
        return 'Cartão de Débito';
      default:
        return 'Recarga';
    }
  };

  const getPaymentIcon = (method?: string) => {
    switch (method) {
      case 'pix':
        return '💳';
      case 'boleto':
        return '📄';
      case 'credit_card':
        return '💳';
      case 'debit_card':
        return '💳';
      default:
        return '💰';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">
                Recarga via {getPaymentMethodLabel(transaction.payment_method)}
              </h5>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  ✅ Processada
                </span>
                <span className="text-xs text-gray-500">
                  {getPaymentIcon(transaction.payment_method)} {getPaymentMethodLabel(transaction.payment_method)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {transaction.description || 'Recarga de saldo realizada'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            📅 {formatDate(transaction.created_at)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">
            + {formatBrazilianCurrency(transaction.amount)}
          </div>
          <p className="text-xs text-gray-500">Valor adicionado</p>
          <div className="mt-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            <span className="text-xs text-green-600 dark:text-green-400">Creditado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RechargeCard;