
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, CheckCircle2 } from 'lucide-react';

interface PaymentSummaryProps {
  finalAmount: number;
  currentBalance: number;
  isProcessing: boolean;
  canProceed: boolean;
  onPayment: () => void;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  finalAmount,
  currentBalance,
  isProcessing,
  canProceed,
  onPayment
}) => {
  return (
    <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg">Resumo</CardTitle>
      </CardHeader>
      <CardContent>
        {finalAmount >= 50 ? (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-green-200 dark:border-gray-600">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Valor:</span>
                  <span className="font-bold text-brand-purple text-lg">R$ {finalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Saldo final:</span>
                  <span className="font-bold text-green-600">R$ {(currentBalance + finalAmount).toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                onClick={onPayment}
                disabled={isProcessing || !canProceed}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Finalizar Recarga
                  </span>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Selecione um valor para ver o resumo</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;
