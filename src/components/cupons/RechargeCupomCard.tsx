import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Ticket, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cupomApiService, CupomValidacao } from '@/services/cupomApiService';
import { useAuth } from '@/contexts/AuthContext';
import { formatBrazilianCurrency } from '@/utils/historicoUtils';

interface RechargeCupomCardProps {
  valorRecarga: number;
  onCupomValidated: (cupom: CupomValidacao, desconto: number) => void;
  onCupomRemoved: () => void;
  cupomAplicado?: CupomValidacao | null;
  descontoCupom: number;
}

const RechargeCupomCard = ({ 
  valorRecarga, 
  onCupomValidated, 
  onCupomRemoved, 
  cupomAplicado, 
  descontoCupom 
}: RechargeCupomCardProps) => {
  const { user } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [isValidating, setIsValidating] = useState(false);

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

        // Calcular desconto baseado no valor da recarga
        if (cupom.tipo === 'fixo') {
          desconto = cupom.valor;
        } else if (cupom.tipo === 'percentual') {
          desconto = (valorRecarga * cupom.valor) / 100;
        }

        // Não permitir desconto maior que o valor da recarga
        desconto = Math.min(desconto, valorRecarga);

        onCupomValidated(cupom, desconto);
        toast.success(`Cupom válido! Desconto de ${formatBrazilianCurrency(desconto)} será aplicado`);
        setCodigo('');
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
                  'Validar'
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              O desconto será subtraído do valor total a pagar
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
                onClick={handleRemoveCupom}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700 dark:text-green-300">Código:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                  {cupomAplicado.codigo}
                </Badge>
              </div>
              
              {cupomAplicado.descricao && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {cupomAplicado.descricao}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-green-200 dark:border-green-700">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Desconto aplicado:
                </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  -{formatBrazilianCurrency(descontoCupom)}
                </span>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default RechargeCupomCard;