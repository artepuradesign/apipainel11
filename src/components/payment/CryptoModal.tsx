
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Clock, CheckCircle, Wallet } from 'lucide-react';
import { toast } from "sonner";

interface CryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentConfirm: () => void;
  isProcessing: boolean;
}

const CryptoModal: React.FC<CryptoModalProps> = ({
  isOpen,
  onClose,
  amount,
  onPaymentConfirm,
  isProcessing
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos em segundos
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  
  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 30 * 60; // Reset para 30 minutos
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const cryptoOptions = {
    BTC: {
      name: 'Bitcoin',
      address: '1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S',
      rate: 0.000012,
      symbol: '₿',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500'
    },
    ETH: {
      name: 'Ethereum',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      rate: 0.00018,
      symbol: 'Ξ',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500'
    },
    USDT: {
      name: 'Tether USD',
      address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5oREqwu',
      rate: 5.85,
      symbol: '₮',
      color: 'text-green-500',
      bgColor: 'bg-green-500'
    }
  };

  const currentCrypto = cryptoOptions[selectedCrypto as keyof typeof cryptoOptions];
  const cryptoAmount = (amount * currentCrypto.rate).toFixed(8);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(currentCrypto.address);
    setCopied(true);
    toast.success("Endereço copiado!");
    setTimeout(() => setCopied(false), 3000);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-4 max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Criptomoedas
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(amount)}
              </p>
            </div>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              <Clock className="w-3 h-3 mr-1" />
              Aguardando
            </Badge>
          </div>

          {/* Logo Crypto e Timer - Layout 50/50 - Altura reduzida */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Logo Crypto - 50% */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-white rounded-lg shadow-sm border flex items-center justify-center">
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto ${currentCrypto.bgColor} rounded-lg flex items-center justify-center mb-1`}>
                      <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-xs text-gray-500">{currentCrypto.name}</p>
                  </div>
                </div>
              </div>
              
              {/* Timer - 50% */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-lg font-mono font-bold text-orange-800 dark:text-orange-200">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                  Válido por 30 min
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  3-6 confirmações
                </p>
              </div>
            </div>
          </div>

          {/* Seleção de Criptomoeda */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Escolha a Criptomoeda
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(cryptoOptions).map(([key, crypto]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCrypto(key)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    selectedCrypto === key
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-orange-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className={`w-6 h-6 ${crypto.bgColor} rounded flex items-center justify-center`}>
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{key}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dados da Transação */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Dados para Transferência
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyAddress}
                className="h-7 text-xs"
              >
                {copied ? <CheckCircle className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600 dark:text-gray-400">Moeda:</span>
                <span className="font-medium">{currentCrypto.name} ({selectedCrypto})</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600 dark:text-gray-400">Rede:</span>
                <span className="font-medium">{selectedCrypto === 'USDT' ? 'TRC20' : 'Mainnet'}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400 text-xs">Endereço:</span>
                <div className="font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded mt-1 break-all">
                  {currentCrypto.address}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">Valor:</span>
                <span className="font-bold text-orange-600">
                  {cryptoAmount} {selectedCrypto}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
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

export default CryptoModal;
