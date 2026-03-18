
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus } from 'lucide-react';

interface AmountSelectorProps {
  selectedPlan: string;
  customAmount: string;
  isCustom: boolean;
  onAmountSelection: (value: string) => void;
  onCustomClick: () => void;
  onCustomAmountChange: (value: string) => void;
}

const AmountSelector: React.FC<AmountSelectorProps> = ({
  selectedPlan,
  customAmount,
  isCustom,
  onAmountSelection,
  onCustomClick,
  onCustomAmountChange
}) => {
  const rechargeOptions = [
    { id: '50', value: 50, label: 'R$ 50,00', popular: false },
    { id: '100', value: 100, label: 'R$ 100,00', popular: true },
    { id: '500', value: 500, label: 'R$ 500,00', popular: false }
  ];

  return (
    <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Plus className="h-5 w-5 text-brand-purple" />
          <span>Escolha o valor</span>
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Selecione uma das opções ou digite um valor personalizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={isCustom ? '' : selectedPlan} onValueChange={onAmountSelection}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {rechargeOptions.map((option) => (
              <div key={option.id} className="relative">
                <label 
                  htmlFor={option.id}
                  className={`
                    flex flex-col items-center justify-center border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] min-h-[80px] relative
                    ${selectedPlan === option.id && !isCustom
                      ? 'border-brand-purple bg-brand-purple/10 dark:bg-brand-purple/20 shadow-lg' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-brand-purple/50'
                    }
                  `}
                >
                  <RadioGroupItem 
                    value={option.id} 
                    id={option.id}
                    className="sr-only"
                  />
                  {option.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-brand-purple text-white text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    </div>
                  )}
                  <div className="font-bold text-lg text-brand-purple text-center">{option.label}</div>
                </label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {/* Valor Personalizado */}
        <div 
          className={`
            border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02]
            ${isCustom
              ? 'border-brand-purple bg-brand-purple/10 dark:bg-brand-purple/20 shadow-lg' 
              : 'border-gray-200 dark:border-gray-700 hover:border-brand-purple/50'
            }
          `}
          onClick={onCustomClick}
        >
          <div className="flex items-center mb-3">
            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
              isCustom ? 'border-brand-purple' : 'border-gray-300'
            }`}>
              {isCustom && <div className="w-2 h-2 rounded-full bg-brand-purple"></div>}
            </div>
            <Label htmlFor="custom" className="font-semibold cursor-pointer">
              Valor personalizado
            </Label>
          </div>
          
          {isCustom && (
            <div className="space-y-3">
              <Input
                type="number"
                min="50"
                max="5000"
                step="0.01"
                placeholder="Digite o valor (R$ 50,00 - R$ 5.000,00)"
                value={customAmount}
                onChange={(e) => onCustomAmountChange(e.target.value)}
                className="text-lg font-medium"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AmountSelector;
