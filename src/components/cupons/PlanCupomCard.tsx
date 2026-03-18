import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Ticket, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cupomApiService, CupomValidacao } from '@/services/cupomApiService';
import { useAuth } from '@/contexts/AuthContext';

interface PlanCupomCardProps {
  planValue: number;
  onCupomApplied: (cupom: CupomValidacao, desconto: number) => void;
  onCupomRemoved: () => void;
  cupomAplicado?: CupomValidacao | null;
  descontoCupom: number;
}

const PlanCupomCard = ({ 
  planValue, 
  onCupomApplied, 
  onCupomRemoved, 
  cupomAplicado, 
  descontoCupom 
}: PlanCupomCardProps) => {
  const { user } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const formatBrazilianCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleValidateCupom = async () => {
    if (!codigo.trim()) {
      toast.error('Digite um código de cupom');
      return;
    }

    setIsValidating(true);

    try {
      const response = await cupomApiService.validateCupom(codigo, user ? parseInt(user.id) : undefined);
      
      if (response.success && response.data) {
        const cupom = response.data;
        let desconto = 0;

        if (cupom.tipo === 'fixo') {
          desconto = cupom.valor;
        } else if (cupom.tipo === 'percentual') {
          desconto = (planValue * cupom.valor) / 100;
        }

        // Não permitir desconto maior que o valor do plano
        desconto = Math.min(desconto, planValue);

        onCupomApplied(cupom, desconto);
        setCodigo('');
        toast.success(`Cupom aplicado! Desconto de ${formatBrazilianCurrency(desconto)}`);
      } else {
        toast.error(response.error || 'Cupom inválido');
      }
    } catch (error) {
      toast.error('Erro ao validar cupom');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCupom = () => {
    onCupomRemoved();
    setCodigo('');
    toast.info('Cupom removido');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          Cupom de Desconto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!cupomAplicado ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o código do cupom"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                disabled={isValidating}
                className="flex-1"
              />
              <Button
                onClick={handleValidateCupom}
                disabled={!codigo.trim() || isValidating}
                variant="outline"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Aplicar'
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Digite um código de cupom válido para obter desconto no seu plano
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Cupom Aplicado!
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCupom}
                className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Código:</span>
                <Badge variant="outline">{cupomAplicado.codigo}</Badge>
              </div>
              
              {cupomAplicado.descricao && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  {cupomAplicado.descricao}
                </p>
              )}
              
              <div className="flex justify-between text-sm">
                <span>Desconto:</span>
                <span className="font-semibold text-green-700 dark:text-green-300">
                  {formatBrazilianCurrency(descontoCupom)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanCupomCard;