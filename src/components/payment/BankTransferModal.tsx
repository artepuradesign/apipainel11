
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, Clock, Building2, X, RefreshCw } from 'lucide-react';
import { toast } from "sonner";

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentConfirm: () => void;
  isProcessing: boolean;
}

const BankTransferModal: React.FC<BankTransferModalProps> = ({
  isOpen,
  onClose,
  amount,
  onPaymentConfirm,
  isProcessing
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 horas em segundos
  
  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 24 * 60 * 60; // Reset para 24h
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);
  
  const handleCopyData = () => {
    const bankData = `Banco: Banco do Brasil (001)
Agência: 1234-5
Conta: 98765-4
Favorecido: API Painel LTDA
CNPJ: 12.345.678/0001-99
Valor: R$ ${amount.toFixed(2).replace('.', ',')}`;
    
    navigator.clipboard.writeText(bankData);
    setCopied(true);
    toast.success("Dados bancários copiados!");
    setTimeout(() => setCopied(false), 3000);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Transferência Bancária
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(amount)}
              </p>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Clock className="w-3 h-3 mr-1" />
              Aguardando
            </Badge>
          </div>

          {/* Dados Bancários e Timer - Layout 50/50 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 items-center">
              {/* Dados Bancários - 50% */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-white rounded-lg shadow-sm border flex items-center justify-center">
                  <div className="text-center">
                    <Building2 className="w-20 h-20 mx-auto text-gray-400" />
                    <p className="text-xs text-gray-500 mt-2">Dados Bancários</p>
                  </div>
                </div>
              </div>
              
              {/* Timer - 50% */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xl font-mono font-bold text-yellow-800 dark:text-yellow-200">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                  Válido por 24 horas
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Processamento em 1-2 dias úteis
                </p>
              </div>
            </div>
          </div>

          {/* Dados Bancários */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Dados para Transferência
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyData}
                className="h-8"
              >
                {copied ? <CheckCircle className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600 dark:text-gray-400">Banco:</span>
                <span className="font-medium">Banco do Brasil (001)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600 dark:text-gray-400">Agência:</span>
                <span className="font-medium">1234-5</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600 dark:text-gray-400">Conta:</span>
                <span className="font-medium">98765-4</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600 dark:text-gray-400">Favorecido:</span>
                <span className="font-medium">API Painel LTDA</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600 dark:text-gray-400">CNPJ:</span>
                <span className="font-medium">12.345.678/0001-99</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">Valor:</span>
                <span className="font-bold text-green-600">R$ {amount.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={onPaymentConfirm}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </div>
              ) : (
                'Transferi'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankTransferModal;
