
import React from 'react';
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight, Shield, Clock, CheckCircle2 } from 'lucide-react';

interface ModernPaymentSummaryProps {
  amount: number;
  currentBalance: number;
  paymentMethod: string;
  isProcessing: boolean;
  canProceed: boolean;
  onPayment: () => void;
}

const ModernPaymentSummary: React.FC<ModernPaymentSummaryProps> = ({
  amount,
  currentBalance,
  paymentMethod,
  isProcessing,
  canProceed,
  onPayment
}) => {
  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'pix': return 'PIX';
      case 'credit': return 'Cartão';
      case 'boleto': return 'Boleto';
      default: return 'PIX';
    }
  };

  const finalBalance = currentBalance + amount;

  if (amount < 50) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <Wallet className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Selecione um valor
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Escolha um valor ou digite um valor personalizado para ver o resumo do pagamento
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-purple to-brand-darkPurple p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Resumo do Pagamento</h3>
          <Shield className="w-6 h-6 opacity-80" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="opacity-90">Valor da recarga:</span>
            <span className="text-2xl font-bold">R$ {amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="opacity-80">Método:</span>
            <span className="font-medium">{getPaymentMethodName()}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Balance Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-green-800 dark:text-green-200">Saldo da conta</span>
            </div>
            <span className="text-sm text-green-600 dark:text-green-400">Atual: R$ {currentBalance.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-green-800 dark:text-green-200">Novo saldo:</span>
            <span className="text-2xl font-bold text-green-600">R$ {finalBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Features */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>100% Seguro</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>
              {paymentMethod === 'pix' ? 'Instantâneo' : 
               paymentMethod === 'credit' ? 'Imediato' : '1-2 dias'}
            </span>
          </div>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={onPayment}
          disabled={isProcessing || !canProceed}
          className={`
            w-full py-4 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105
            ${isProcessing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
            }
          `}
          size="lg"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Finalizar Pagamento</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ModernPaymentSummary;
