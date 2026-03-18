
import React from 'react';
import { QrCode, CreditCard, Building2, CheckCircle2, Clock, Zap, Bitcoin } from 'lucide-react';

interface PaymentMethodProps {
  id: string;
  name: string;
  description: string;
  badge?: string;
  isSelected: boolean;
  onSelect: () => void;
}

const ModernPaymentMethod: React.FC<PaymentMethodProps> = ({
  id,
  name,
  description,
  badge,
  isSelected,
  onSelect
}) => {
  const getIcon = () => {
    switch (id) {
      case 'pix': return QrCode;
      case 'credit': return CreditCard;
      case 'crypto': return Bitcoin;
      case 'boleto': return Building2;
      default: return QrCode;
    }
  };

  const getFeature = () => {
    switch (id) {
      case 'pix': return { icon: Zap, text: 'Instantâneo', color: 'text-green-500' };
      case 'credit': return { icon: Clock, text: 'Rápido', color: 'text-blue-500' };
      case 'crypto': return { icon: Zap, text: 'Descentralizado', color: 'text-orange-500' };
      case 'boleto': return { icon: Clock, text: '1-2 dias', color: 'text-orange-500' };
      default: return { icon: Zap, text: 'Instantâneo', color: 'text-green-500' };
    }
  };

  const Icon = getIcon();
  const feature = getFeature();
  const FeatureIcon = feature.icon;

  return (
    <div
      onClick={onSelect}
      className={`
        relative cursor-pointer group transition-all duration-300 transform hover:scale-105
        ${isSelected 
          ? 'ring-2 ring-brand-purple shadow-xl shadow-brand-purple/30' 
          : 'hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
        }
      `}
    >
      {badge && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className={`text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse ${
            badge === 'Recomendado' 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
              : 'bg-gradient-to-r from-purple-400 to-purple-500'
          }`}>
            {badge}
          </div>
        </div>
      )}
      
      <div className={`
        relative overflow-hidden rounded-2xl p-6 transition-all duration-300
        ${isSelected 
          ? 'bg-gradient-to-br from-brand-purple/10 to-brand-purple/20 border-2 border-brand-purple' 
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-purple/50'
        }
      `}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`
              p-3 rounded-xl transition-all duration-300
              ${isSelected 
                ? 'bg-brand-purple/20 text-brand-purple' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-brand-purple/10 group-hover:text-brand-purple'
              }
            `}>
              <Icon className="w-6 h-6" />
            </div>
            
            <div>
              <h3 className={`font-semibold text-lg ${isSelected ? 'text-brand-purple' : 'text-gray-900 dark:text-white'}`}>
                {name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-1 ${feature.color}`}>
              <FeatureIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
            
            {isSelected && (
              <CheckCircle2 className="w-6 h-6 text-brand-purple animate-scale-in" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernPaymentMethod;
