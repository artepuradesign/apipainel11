
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Zap, Lock, AlertTriangle } from 'lucide-react';
import { calculateDiscountedPrice, getDiscount } from '@/utils/planUtils';

interface ModuleCardProps {
  module: {
    title: string;
    description: string;
    price?: string;
    icon: any;
    path: string;
  };
  currentPlan: string;
  template: 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix';
  onClick: () => void;
  isBlocked?: boolean;
  operationalStatus?: 'on' | 'off' | 'manutencao';
}

const ModuleCard: React.FC<ModuleCardProps> = ({ 
  module, 
  currentPlan, 
  template, 
  onClick,
  isBlocked = false,
  operationalStatus = 'on'
}) => {
  const discount = getDiscount(currentPlan);
  const originalPrice = parseFloat(module.price || "0");
  const { finalPrice } = calculateDiscountedPrice(originalPrice, currentPlan);
  const hasDiscount = discount > 0;

  const formatBrazilianCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getBadgeColor = (planName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Rainha de Ouros': 'bg-purple-500 text-white',
      'Rainha de Paus': 'bg-indigo-600 text-white',
      'Rainha de Copas': 'bg-purple-700 text-white',
      'Rainha de Espadas': 'bg-gray-800 text-white',
      'Rei de Ouros': 'bg-purple-500 text-white',
      'Rei de Paus': 'bg-indigo-600 text-white',
      'Rei de Copas': 'bg-purple-700 text-white',
      'Rei de Espadas': 'bg-gray-900 text-white'
    };
    return colorMap[planName] || 'bg-green-500 text-white';
  };

  const badgeColorClass = getBadgeColor(currentPlan);

  const getStatusIcon = () => {
    if (isBlocked) return <Lock className="h-4 w-4" />;
    if (operationalStatus === 'off') return <AlertTriangle className="h-4 w-4" />;
    if (operationalStatus === 'manutencao') return <AlertTriangle className="h-4 w-4" />;
    return null;
  };

  const getStatusColor = () => {
    if (isBlocked) return 'bg-gray-500';
    if (operationalStatus === 'off') return 'bg-red-500';
    if (operationalStatus === 'manutencao') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = () => {
    if (isBlocked) return <Badge className="bg-gray-500 text-white text-xs">BLOQUEADO</Badge>;
    if (operationalStatus === 'off') return <Badge className="bg-red-500 text-white text-xs">OFF</Badge>;
    if (operationalStatus === 'manutencao') return <Badge className="bg-yellow-500 text-white text-xs">MANUTENÇÃO</Badge>;
    return <Badge className="bg-green-500 text-white text-xs">ON</Badge>;
  };

  const PriceDisplay = ({ isCreative = false }: { isCreative?: boolean }) => (
    <div className="absolute top-3 right-3 text-right z-20">
      {hasDiscount && !isBlocked ? (
        <div className="flex flex-col space-y-1">
          {/* Valor com desconto - sem R$ */}
          <div className={`text-lg font-bold ${
            isCreative ? 'text-white' : 'text-purple-600 dark:text-purple-400'
          }`}>
            {finalPrice.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          {/* Valor original tachado */}
          <div className={`text-sm line-through ${
            isCreative ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {formatBrazilianCurrency(originalPrice)}
          </div>
          {/* Porcentagem do desconto */}
          <div className={`text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ${
            isCreative ? 'bg-white/20 text-white' : ''
          }`}>
            -{discount}%
          </div>
        </div>
      ) : (
        <div className={`text-lg font-bold ${
          isCreative ? 'text-white' : 'text-purple-600 dark:text-purple-400'
        }`}>
          {formatBrazilianCurrency(hasDiscount ? finalPrice : originalPrice)}
        </div>
      )}
    </div>
  );

  if (template === 'creative') {
    return (
      <div
        onClick={onClick}
        className={`cursor-pointer text-left relative w-full ${
          isBlocked || operationalStatus !== 'on' ? 'opacity-75' : ''
        }`}
      >
        <Card className={`w-[180px] h-[260px] relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white border-0 shadow-xl overflow-hidden ${
          isBlocked || operationalStatus !== 'on' 
            ? 'cursor-not-allowed' 
            : 'hover:shadow-2xl hover:-translate-y-1'
        } transition-all duration-300`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
          <PriceDisplay isCreative={true} />
          <CardContent className="p-4 relative z-10 h-full flex flex-col pt-20">
            <div className="absolute top-3 left-3 z-20">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                {React.createElement(module.icon, { className: "h-16 w-16" })}
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">{module.title}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-white/80 text-sm mb-2 flex-grow line-clamp-3">{module.description}</p>
            <Button 
              className={`w-full border-0 backdrop-blur-sm group mt-auto mb-1 ${
                isBlocked || operationalStatus !== 'on'
                  ? 'bg-gray-500/50 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30'
              } text-white`}
              disabled={isBlocked || operationalStatus !== 'on'}
            >
              <span>{isBlocked ? 'Bloqueado' : operationalStatus !== 'on' ? 'Indisponível' : 'Acessar'}</span>
              {!isBlocked && operationalStatus === 'on' && (
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (template === 'modern') {
    return (
      <div 
        onClick={onClick}
        className={`cursor-pointer text-left relative w-full ${
          isBlocked || operationalStatus !== 'on' ? 'opacity-75' : ''
        }`}
      >
        <Card className={`w-[180px] h-[260px] relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-600 transition-all duration-300 ${
          isBlocked || operationalStatus !== 'on' 
            ? 'cursor-not-allowed' 
            : 'hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-600 hover:-translate-y-1'
        }`}>
          <PriceDisplay />
          <CardContent className="p-4 h-full flex flex-col pt-20">
            <div className="absolute top-3 left-3 z-20">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg transition-colors border border-purple-200 dark:border-purple-700">
                {React.createElement(module.icon, { className: "h-16 w-16 text-purple-600 dark:text-purple-400 group-hover:text-white" })}
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {module.title}
              </h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 mb-2 transition-colors flex-grow line-clamp-2">
              {module.description}
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className={`w-full mt-auto mb-1 ${
                isBlocked || operationalStatus !== 'on' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isBlocked || operationalStatus !== 'on'}
            >
              {isBlocked ? 'Bloqueado' : operationalStatus !== 'on' ? 'Indisponível' : 'Acessar'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (template === 'minimal') {
    return (
      <Card 
        onClick={onClick}
        className={`w-[180px] h-[260px] relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer ${
          isBlocked || operationalStatus !== 'on' 
            ? 'opacity-75 cursor-not-allowed' 
            : 'hover:shadow-md hover:-translate-y-1'
        }`}
      >
        <PriceDisplay />
        <CardContent className="p-4 h-full flex flex-col pt-20">
          <div className="absolute top-3 left-3 z-20">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg border">
              {React.createElement(module.icon, { className: "h-16 w-16 text-purple-600 dark:text-purple-400" })}
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{module.title}</h3>
            {getStatusBadge()}
          </div>
          <div className="flex-grow">
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-2">{module.description}</p>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className={`w-full mt-auto mb-1 ${
              isBlocked || operationalStatus !== 'on' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isBlocked || operationalStatus !== 'on'}
          >
            {getStatusIcon() || <Zap className="h-3 w-3" />}
            <span className="ml-2">
              {isBlocked ? 'Bloqueado' : operationalStatus !== 'on' ? 'Indisponível' : 'Acessar'}
            </span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Corporate template (default)
  return (
    <Card 
      onClick={onClick}
      className={`w-[180px] h-[260px] relative bg-white dark:bg-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer ${
        isBlocked || operationalStatus !== 'on' 
          ? 'opacity-75 cursor-not-allowed' 
          : 'hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 hover:-translate-y-1'
      }`}
    >
      <PriceDisplay />
      <CardContent className="p-4 h-full flex flex-col pt-20">
        <div className="absolute top-3 left-3 z-20">
          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 rounded-lg border border-purple-200 dark:border-purple-700">
            {React.createElement(module.icon, { className: "h-16 w-16 text-purple-600 dark:text-purple-400" })}
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">{module.title}</CardTitle>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex-grow line-clamp-3">{module.description}</p>
        <Button 
          className={`w-full transition-all duration-200 mt-auto mb-1 ${
            isBlocked || operationalStatus !== 'on'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
          } text-white`}
          disabled={isBlocked || operationalStatus !== 'on'}
        >
          {isBlocked ? 'Módulo Bloqueado' : operationalStatus !== 'on' ? 'Temporariamente Indisponível' : 'Acessar Módulo'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
