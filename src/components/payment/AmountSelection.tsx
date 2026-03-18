
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CreditCard, Loader2, Ticket } from 'lucide-react';
import { formatBrazilianCurrency } from '@/utils/historicoUtils';

interface AmountSelectionProps {
  selectedAmount: number;
  customAmount: string;
  onAmountSelect: (amount: number) => void;
  onCustomChange: (value: string) => void;
  finalAmount: number;
  descontoCupom: number;
  valorFinalPagamento: number;
  cupomAplicado: any;
  canProceed: () => boolean;
  isProcessing: boolean;
  onPayment: () => void;
  hidePresets?: boolean;
}

const AmountSelection: React.FC<AmountSelectionProps> = ({
  selectedAmount,
  customAmount,
  onAmountSelect,
  onCustomChange,
  finalAmount,
  descontoCupom,
  valorFinalPagamento,
  cupomAplicado,
  canProceed,
  isProcessing,
  onPayment,
  hidePresets = false
}) => {
  const predefinedAmounts = [10, 25, 50, 100, 250, 500];

  const handleAmountSelect = (amount: number) => {
    onAmountSelect(amount);
  };

  const handleCustomChange = (value: string) => {
    onCustomChange(value);
  };

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Escolha o Valor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="custom-amount" className="text-xs sm:text-sm font-medium">
            Valor Personalizado
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium text-sm sm:text-base">
              R$
            </span>
            <Input
              id="custom-amount"
              type="number"
              min="10"
              max="10000"
              step="0.01"
              placeholder="0,00"
              value={customAmount}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="text-base sm:text-lg h-10 sm:h-12 font-semibold pl-8 sm:pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Valor mínimo: R$ 10,00
          </p>
        </div>
        
        {!hidePresets && (
        <div className="pt-3 sm:pt-4 border-t">
          <Label className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 block">
            Valores Sugeridos
          </Label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {predefinedAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "default" : "outline"}
                onClick={() => handleAmountSelect(amount)}
                className="h-10 sm:h-12 text-xs sm:text-sm font-semibold"
              >
                R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Button>
            ))}
          </div>
        </div>
        )}

        {/* Resumo de Pagamento */}
        {finalAmount > 0 && (
          <div className="pt-3 sm:pt-4 border-t space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-medium">
              Resumo do Pagamento
            </Label>
            
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor selecionado:</span>
                <span>{formatBrazilianCurrency(finalAmount)}</span>
              </div>
              {descontoCupom > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto do cupom:</span>
                  <span>-{formatBrazilianCurrency(descontoCupom)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">Total a pagar:</span>
                <span className="text-lg sm:text-xl font-bold">
                  {formatBrazilianCurrency(valorFinalPagamento)}
                </span>
              </div>
            </div>

            <Button
              onClick={onPayment}
              disabled={!canProceed() || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : valorFinalPagamento <= 0 && cupomAplicado ? (
                <>
                  <Ticket className="w-4 h-4 mr-2" />
                  Usar Cupom (Grátis)
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Adicionar Saldo
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AmountSelection;
