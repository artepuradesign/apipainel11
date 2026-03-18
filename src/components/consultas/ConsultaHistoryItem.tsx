import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Props {
  document: string;
  date: string;
  price: number; // final price with discount
  original_price?: number; // original module price
  discount_percent?: number; // percent (0-100)
  saldo_usado?: 'plano' | 'carteira' | 'misto' | string;
  status?: string;
}

const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR');
const formatCPF = (cpf: string) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

export const ConsultaHistoryItem: React.FC<Props> = ({ document, date, price, original_price, discount_percent = 0, saldo_usado = 'carteira', status = 'completed' }) => {
  // Função para determinar o label correto do saldo usado
  const getSaldoUsedoLabel = (saldo: string) => {
    const saldoLower = saldo?.toLowerCase() || 'carteira';
    
    if (saldoLower === 'plano') {
      return '💎 Saldo do Plano';
    }
    if (saldoLower === 'misto') {
      return '💎+💰 Plano + Carteira';
    }
    return '💰 Carteira Digital';
  };
  
  // Função para determinar a classe CSS baseada no saldo usado
  const getSaldoUsedoClass = (saldo: string) => {
    const saldoLower = saldo?.toLowerCase() || 'carteira';
    
    if (saldoLower === 'plano') {
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    }
    if (saldoLower === 'misto') {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  const usedLabel = getSaldoUsedoLabel(saldo_usado);
  const usedClass = getSaldoUsedoClass(saldo_usado);

  const showDiscount = original_price && original_price > price;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="text-sm font-mono text-muted-foreground">{formatCPF(document)}</div>
          <div className="text-xs text-muted-foreground">{formatDate(date)}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="space-y-1">
            <div className="font-semibold text-red-600 text-lg">-{formatCurrency(price)}</div>
            {showDiscount && (
              <div className="space-y-1">
                <div className="text-xs text-gray-500 line-through">Valor original: {formatCurrency(original_price!)}</div>
                <div className="text-xs text-green-600 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                  ✅ Economizou: {formatCurrency((original_price || 0) - price)} {discount_percent ? `(${discount_percent}%)` : ''}
                </div>
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${usedClass}`}>{usedLabel}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={status === 'completed' ? 'default' : status === 'failed' ? 'destructive' : 'outline'} className={`text-xs ${status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800' : ''}`}>
            {status === 'completed' ? 'Sucesso' : status === 'failed' ? 'Falhou' : status === 'processing' ? 'Processando' : status}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ConsultaHistoryItem;
