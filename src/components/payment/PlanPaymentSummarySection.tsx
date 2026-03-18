
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Ticket } from 'lucide-react';

interface PlanPaymentSummarySectionProps {
  planPrice: number;
  finalAmountWithDiscount: number;
  currentBalance: number;
  isProcessing: boolean;
  canProceed: boolean;
  onPayment: () => void;
}

const PlanPaymentSummarySection: React.FC<PlanPaymentSummarySectionProps> = ({
  planPrice,
  finalAmountWithDiscount,
  currentBalance,
  isProcessing,
  canProceed,
  onPayment
}) => {
  const canPayWithWallet = currentBalance >= finalAmountWithDiscount;

  return (
    <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Wallet className="w-5 h-5 mr-2 text-brand-purple" />
          Resumo do Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-6 bg-gradient-to-br from-brand-purple/10 to-brand-purple/5 rounded-lg border border-brand-purple/20">
          <div className="text-sm text-gray-600 mb-2">Valor do plano</div>
          <div className="text-3xl font-bold text-brand-purple mb-4">
            R$ {finalAmountWithDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo da carteira:</span>
              <span className="font-medium">R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {canPayWithWallet && (
              <div className="flex justify-between text-green-600 font-semibold pt-2 border-t border-brand-purple/20">
                <span>✅ Pagamento com saldo disponível</span>
              </div>
            )}
            {!canPayWithWallet && (
              <div className="flex justify-between text-orange-600 font-semibold pt-2 border-t border-brand-purple/20">
                <span>⚠️ Saldo insuficiente na carteira</span>
              </div>
            )}
          </div>
        </div>
        
        <Button 
          onClick={onPayment}
          disabled={isProcessing || !canProceed}
          className="w-full h-12 text-lg font-semibold"
          size="lg"
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processando...
            </div>
          ) : (
            'Finalizar Pagamento'
          )}
        </Button>

      </CardContent>
    </Card>
  );
};

export default PlanPaymentSummarySection;
