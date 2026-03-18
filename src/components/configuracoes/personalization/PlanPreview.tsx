
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PlanPreviewProps {
  plan: {
    name: string;
    price: string;
    description: string;
    billing_period: string;
    discount: number;
    hasHighlight: boolean;
    highlightText?: string;
    colors: {
      background: string;
      border: string;
      text: string;
      suit: string;
      highlight: string;
    };
    cardSuit: string;
    selectedModules?: string[];
  };
}

const PlanPreview = ({ plan }: PlanPreviewProps) => {
  const defaultFeatures = [
    'Consulta de CPF',
    'Consulta de CNPJ',
    'Busca por Veículos',
    'Score de Crédito',
    'Validação de Dados',
    'Relatórios Detalhados',
    'Suporte Técnico',
    'API de Integração'
  ];

  // Função para determinar se a cor é clara
  const isLightColor = (color: string): boolean => {
    // Para cores hex
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return brightness > 155;
    }
    // Para cores como purple, violet, etc. - assumir que são escuras
    return false;
  };

  const buttonTextColor = isLightColor(plan.colors.suit) ? '#374151' : 'white';

  return (
    <div className="relative max-w-[300px]">
      {/* Highlight Badge */}
      {plan.hasHighlight && (
        <div 
          className="absolute -top-3 right-2 z-20 px-3 py-1 rounded-full text-xs font-semibold text-white border-2 border-white shadow-lg"
          style={{ backgroundColor: plan.colors.highlight }}
        >
          {plan.highlightText || 'Destaque'}
        </div>
      )}

      <Card 
        className="h-full flex flex-col shadow-lg relative transition-all duration-300"
        style={{
          background: plan.colors.background,
          borderColor: plan.colors.border,
          color: plan.colors.text
        }}
      >
        {/* Card Decorations - Simplified without cardType */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-3 left-3 text-lg font-bold opacity-15"
            style={{ color: '#ffffff' }}
          >
            {plan.cardSuit}
          </div>
          <div 
            className="absolute bottom-3 right-3 text-lg font-bold opacity-15 transform rotate-180"
            style={{ color: '#ffffff' }}
          >
            {plan.cardSuit}
          </div>
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl opacity-5"
            style={{ color: '#ffffff' }}
          >
            {plan.cardSuit}
          </div>
        </div>

        <CardHeader className="pb-4 relative z-10">
          <CardTitle className="text-lg font-bold flex items-center gap-2 mb-2">
            <span className="text-xl" style={{ color: plan.colors.suit }}>
              {plan.cardSuit}
            </span>
            <span className="truncate">{plan.name}</span>
          </CardTitle>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">
              R$ {plan.price}
            </span>
            <span className="text-sm opacity-75">
              /{plan.billing_period}
            </span>
          </div>
          
          {plan.discount > 0 && (
            <div className="mt-2">
              <Badge className="bg-green-500 text-white">
                {plan.discount}% de desconto
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-grow pt-0 pb-4 relative z-10">
          <div className="space-y-2">
            {plan.selectedModules && plan.selectedModules.length > 0 ? (
              <>
                <div className="text-sm font-medium mb-2">Módulos Incluídos:</div>
                {plan.selectedModules.slice(0, 6).map((module, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 flex-shrink-0" style={{ color: plan.colors.highlight }} />
                    <span className="truncate">{module}</span>
                  </div>
                ))}
                {plan.selectedModules.length > 6 && (
                  <div className="text-xs opacity-75">
                    +{plan.selectedModules.length - 6} módulos adicionais
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-sm font-medium mb-2">Funcionalidades:</div>
                {defaultFeatures.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 flex-shrink-0" style={{ color: plan.colors.highlight }} />
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>

        <div className="p-4 pt-0 relative z-10">
          <Button 
            className="w-full"
            style={{ 
              backgroundColor: plan.colors.suit,
              color: buttonTextColor
            }}
          >
            Assinar Plano
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PlanPreview;
