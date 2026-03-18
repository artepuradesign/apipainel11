
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp } from 'lucide-react';

interface ModernCustomAmountProps {
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  onFocus: () => void;
}

const ModernCustomAmount: React.FC<ModernCustomAmountProps> = ({
  value,
  onChange,
  isActive,
  onFocus
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div 
      className={`
        relative transition-all duration-300 rounded-2xl overflow-hidden
        ${isActive 
          ? 'ring-2 ring-brand-purple shadow-xl shadow-brand-purple/30' 
          : 'hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
        }
      `}
    >
      <div className={`
        p-6 border-2 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-br from-brand-purple/10 to-brand-purple/20 border-brand-purple' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-brand-purple/50'
        }
      `}>
        <div className="flex items-center mb-4">
          <div className={`
            p-2 rounded-lg mr-3 transition-colors duration-300
            ${isActive ? 'bg-brand-purple/20' : 'bg-gray-100 dark:bg-gray-700'}
          `}>
            <DollarSign className={`w-5 h-5 ${isActive ? 'text-brand-purple' : 'text-gray-600 dark:text-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              Valor Personalizado
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Digite qualquer valor entre R$ 50 e R$ 5.000
            </p>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
            R$
          </div>
          <Input
            type="number"
            min="50"
            max="5000"
            step="0.01"
            placeholder="0,00"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              onFocus();
            }}
            onBlur={() => setIsFocused(false)}
            className={`
              pl-12 pr-4 py-3 text-lg font-semibold transition-all duration-300
              ${isFocused || isActive 
                ? 'border-brand-purple focus:ring-2 focus:ring-brand-purple/20' 
                : 'border-gray-300 dark:border-gray-600'
              }
            `}
          />
          {(isFocused || isActive) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <TrendingUp className="w-5 h-5 text-brand-purple animate-pulse" />
            </div>
          )}
        </div>
        
        {parseFloat(value) > 0 && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 animate-fade-in">
            {parseFloat(value) < 50 && "Valor mínimo: R$ 50,00"}
            {parseFloat(value) > 5000 && "Valor máximo: R$ 5.000,00"}
            {parseFloat(value) >= 50 && parseFloat(value) <= 5000 && 
              `Saldo final: R$ ${(parseFloat(localStorage.getItem("user_balance") || "0") + parseFloat(value)).toFixed(2)}`
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernCustomAmount;
