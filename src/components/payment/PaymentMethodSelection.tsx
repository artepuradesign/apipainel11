
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, Building, DollarSign, Bitcoin, Wallet } from 'lucide-react';

interface PaymentMethodSelectionProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  showWalletOption?: boolean;
  limitedMethods?: string[];
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  showWalletOption = false,
  limitedMethods
}) => {
  const allPaymentMethods = [
    ...(showWalletOption ? [{ id: 'wallet', name: 'Saldo da Carteira', icon: Wallet }] : []),
    { id: 'pix', name: 'PIX', icon: Smartphone },
    { id: 'credit', name: 'Cartão de Crédito', icon: CreditCard },
    { id: 'transfer', name: 'Transferência Bancária', icon: Building },
    { id: 'paypal', name: 'PayPal', icon: DollarSign },
    { id: 'crypto', name: 'Criptomoedas', icon: Bitcoin }
  ];

  // Filter methods if limitedMethods is provided
  const paymentMethods = limitedMethods 
    ? allPaymentMethods.filter(method => limitedMethods.includes(method.id))
    : allPaymentMethods;

  return (
    <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <CreditCard className="w-5 h-5 mr-2 text-brand-purple" />
          Forma de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {paymentMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <Button
              key={method.id}
              variant={paymentMethod === method.id ? "default" : "outline"}
              className="w-full justify-start h-12"
              onClick={() => onPaymentMethodChange(method.id)}
            >
              <IconComponent className="w-5 h-5 mr-3" />
              {method.name}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelection;
