import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Ticket, Gift, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cupomApiService, CupomValidacao } from '@/services/cupomApiService';
import { useAuth } from '@/contexts/AuthContext';

interface CupomValidationCardProps {
  onCupomUsed?: (valorAdicionado: number) => void;
  prefilledCupomCode?: string;
}

const CupomValidationCard = ({ onCupomUsed, prefilledCupomCode }: CupomValidationCardProps) => {
  const { user } = useAuth();
  const [codigo, setCodigo] = useState(prefilledCupomCode || '');
  const [isValidating, setIsValidating] = useState(false);
  const [isUsing, setIsUsing] = useState(false);
  const [cupomValidado, setCupomValidado] = useState<CupomValidacao | null>(null);

  // Reagir a mudanças no código preenchido
  useEffect(() => {
    if (prefilledCupomCode && prefilledCupomCode !== codigo) {
      setCodigo(prefilledCupomCode);
      setCupomValidado(null);
    }
  }, [prefilledCupomCode, codigo]);

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
    setCupomValidado(null);

    try {
      const response = await cupomApiService.validateCupom(codigo, user ? parseInt(user.id) : undefined);
      
      if (response.success && response.data) {
        setCupomValidado(response.data);
        toast.success('Cupom válido! Clique em "Usar Cupom" para aplicar');
      } else {
        toast.error(response.error || 'Cupom inválido');
      }
    } catch (error) {
      toast.error('Erro ao validar cupom');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUseCupom = async () => {
    if (!cupomValidado || !user) return;

    setIsUsing(true);

    try {
      const response = await cupomApiService.useCupom(cupomValidado.codigo, parseInt(user.id));
      
      if (response.success && response.data) {
        toast.success(
          `Cupom aplicado! ${formatBrazilianCurrency(response.data.saldo_adicionado)} adicionado à sua carteira`
        );
        
        // Limpar formulário
        setCodigo('');
        setCupomValidado(null);
        
        // Notificar parent component
        onCupomUsed?.(response.data.saldo_adicionado);
        
        // Trigger balance update event
        window.dispatchEvent(new CustomEvent('balanceUpdated', { 
          detail: { shouldAnimate: true }
        }));
      } else {
        // Tratar mensagens de erro específicas de forma amigável
        const errorMessage = response.error || 'Erro ao usar cupom';
        
        if (errorMessage.includes('já utilizou') || errorMessage.includes('already used')) {
          toast.error('🎫 Você já utilizou este cupom anteriormente!');
        } else if (errorMessage.includes('expirado') || errorMessage.includes('expired')) {
          toast.error('⏰ Este cupom está expirado!');
        } else if (errorMessage.includes('esgotado') || errorMessage.includes('exhausted')) {
          toast.error('📊 Este cupom atingiu o limite máximo de uso!');
        } else if (errorMessage.includes('inválido') || errorMessage.includes('invalid')) {
          toast.error('❌ Código de cupom inválido!');
        } else if (errorMessage.includes('não encontrado') || errorMessage.includes('not found')) {
          toast.error('🔍 Cupom não encontrado!');
        } else {
          toast.error(`❌ ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      toast.error('🌐 Erro de conexão. Tente novamente!');
    } finally {
      setIsUsing(false);
    }
  };

  const resetForm = () => {
    setCodigo('');
    setCupomValidado(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Digite o código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          disabled={isValidating || isUsing}
          className="flex-1 h-9 sm:h-10 text-sm"
        />
        <Button
          onClick={handleValidateCupom}
          disabled={!codigo.trim() || isValidating || isUsing}
          variant="outline"
          className="h-9 sm:h-10 px-3 sm:px-4"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Validar'
          )}
        </Button>
      </div>

      {cupomValidado && (
        <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Cupom Válido!</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-1.5 py-0.5">
              {cupomValidado.codigo}
            </Badge>
          </div>
          
          {cupomValidado.descricao && (
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 line-clamp-2">
              {cupomValidado.descricao}
            </p>
          )}
          
          <div className="flex items-center justify-between pt-1 border-t border-green-200 dark:border-green-700">
            <span className="text-xs sm:text-sm text-green-700 dark:text-green-300">Desconto:</span>
            <span className="text-sm sm:text-base font-semibold text-green-600 dark:text-green-400">
              {cupomValidado.tipo === 'fixo' 
                ? formatBrazilianCurrency(cupomValidado.valor)
                : `${cupomValidado.valor}%`
              }
            </span>
          </div>
          
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleUseCupom}
              disabled={isUsing}
              className="flex-1 h-9 sm:h-10 bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              {isUsing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  <span className="hidden sm:inline">Aplicando...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-1.5" />
                  <span>Usar Cupom</span>
                </>
              )}
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              disabled={isUsing}
              className="h-9 sm:h-10 px-3 border-green-300 text-green-700 hover:bg-green-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CupomValidationCard;