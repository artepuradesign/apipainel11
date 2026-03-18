
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QrCode, CreditCard, Building2 } from 'lucide-react';

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange
}) => {
  const paymentMethods = [
    { 
      id: 'pix', 
      name: 'PIX', 
      description: 'Instantâneo',
      icon: QrCode,
      badge: 'Recomendado'
    },
    { 
      id: 'credit', 
      name: 'Cartão', 
      description: 'Crédito/Débito',
      icon: CreditCard,
    },
    { 
      id: 'boleto', 
      name: 'Boleto', 
      description: 'Bancário',
      icon: Building2,
    }
  ];

  return (
    <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Forma de Pagamento</CardTitle>
        <CardDescription className="dark:text-gray-400">
          Como deseja pagar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange}>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <div key={method.id} className="relative">
                  <label
                    htmlFor={method.id}
                    className={`
                      flex items-center border rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.02] relative w-full
                      ${paymentMethod === method.id
                        ? 'border-brand-purple bg-brand-purple/10 dark:bg-brand-purple/20 shadow-lg' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-brand-purple/50'
                      }
                    `}
                  >
                    <RadioGroupItem 
                      value={method.id} 
                      id={method.id}
                      className="sr-only"
                    />
                    {method.badge && (
                      <div className="absolute -top-2 right-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          {method.badge}
                        </span>
                      </div>
                    )}
                    <IconComponent className="h-6 w-6 text-brand-purple mr-3" />
                    <div>
                      <h3 className="font-semibold text-sm">{method.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {method.description}
                      </p>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
