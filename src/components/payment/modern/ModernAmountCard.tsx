
import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface ModernAmountCardProps {
  amount: number;
  label: string;
  isSelected: boolean;
  isPopular?: boolean;
  onClick: () => void;
}

const ModernAmountCard: React.FC<ModernAmountCardProps> = ({
  amount,
  label,
  isSelected,
  isPopular,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer group transition-all duration-300 transform hover:scale-105
        ${isSelected 
          ? 'ring-2 ring-brand-purple shadow-xl shadow-brand-purple/30' 
          : 'hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
        }
      `}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
            <Sparkles className="w-3 h-3 mr-1" />
            Mais Popular
          </div>
        </div>
      )}
      
      <div className={`
        relative overflow-hidden rounded-2xl p-6 min-h-[120px] flex flex-col justify-center items-center
        ${isSelected 
          ? 'bg-gradient-to-br from-brand-purple/10 to-brand-purple/20 border-2 border-brand-purple' 
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-purple/50'
        }
      `}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10 text-center">
          <div className={`text-2xl font-bold mb-1 ${isSelected ? 'text-brand-purple' : 'text-gray-900 dark:text-white'}`}>
            {label}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {amount === 50 && 'Ideal para começar'}
            {amount === 100 && 'Melhor custo-benefício'}
            {amount === 500 && 'Para uso intensivo'}
          </div>
        </div>
        
        {isSelected && (
          <div className="absolute top-3 right-3">
            <CheckCircle2 className="w-6 h-6 text-brand-purple animate-scale-in" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernAmountCard;
