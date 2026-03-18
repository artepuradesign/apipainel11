
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Shield, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from "sonner";

interface PayPalModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentConfirm: () => void;
  isProcessing: boolean;
}

const PayPalModal: React.FC<PayPalModalProps> = ({
  isOpen,
  onClose,
  amount,
  onPaymentConfirm,
  isProcessing
}) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos
  
  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 15 * 60; // Reset para 15 minutos
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

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

  const handleRedirectToPayPal = () => {
    toast.info("Redirecionando para o PayPal...");
    // Simular redirecionamento
    setTimeout(() => {
      toast.success("Retornando do PayPal - confirme o pagamento");
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                PayPal
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(amount)}
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <Clock className="w-3 h-3 mr-1" />
              Aguardando
            </Badge>
          </div>

          {/* Logo PayPal e Timer - Layout 50/50 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 items-center">
              {/* Logo PayPal - 50% */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-white rounded-lg shadow-sm border flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-20 h-20 mx-auto text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.435-.983 4.814-4.494 6.823-8.677 6.823H9.73a.641.641 0 0 0-.633.74l-.744 4.717a.641.641 0 0 1-.633.74h-.644z"/>
                    </svg>
                    <p className="text-xs text-gray-500 mt-2">PayPal</p>
                  </div>
                </div>
              </div>
              
              {/* Timer - 50% */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xl font-mono font-bold text-blue-800 dark:text-blue-200">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  Sessão válida por 15 min
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Processamento instantâneo
                </p>
              </div>
            </div>
          </div>

          {/* Informações do PayPal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Detalhes do Pagamento
              </h3>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Protegido</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600 dark:text-gray-400">Comerciante:</span>
                <span className="font-medium">API Painel LTDA</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="font-medium">pagamentos@apipainel.com</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600 dark:text-gray-400">Método:</span>
                <span className="font-medium">PayPal Express</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600 dark:text-gray-400">Moeda:</span>
                <span className="font-medium">BRL (Real Brasileiro)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">Valor Total:</span>
                <span className="font-bold text-blue-600">R$ {amount.toFixed(2).replace('.', ',')}</span>
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </div>
              ) : (
                'Pagar com PayPal'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayPalModal;
