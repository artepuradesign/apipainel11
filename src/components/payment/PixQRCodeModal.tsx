import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, Clock, QrCode, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from "sonner";

interface PixResponse {
  payment_id?: string;
  order_id?: string;
  status?: string;
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
  expires_at?: string;
}

interface PixQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentConfirm: () => void;
  isProcessing: boolean;
  pixData?: PixResponse | null;
  onGenerateNew?: () => void;
}

const PixQRCodeModal: React.FC<PixQRCodeModalProps> = ({
  isOpen,
  onClose,
  amount,
  onPaymentConfirm,
  isProcessing,
  pixData,
  onGenerateNew
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Verificar se o pagamento foi aprovado
  const isApproved = pixData?.status === 'approved';
  
  // Calcular tempo restante baseado no expires_at do Mercado Pago
  useEffect(() => {
    if (!pixData?.expires_at || isApproved) return;
    
    const calculateTimeLeft = () => {
      // O Mercado Pago retorna a data de expiração no formato ISO
      const expiresDate = new Date(pixData.expires_at!);
      const now = new Date();
      
      // Calcular diferença em segundos
      const diff = Math.floor((expiresDate.getTime() - now.getTime()) / 1000);
      
      // Garantir que não seja negativo
      return Math.max(0, diff);
    };
    
    // Calcular tempo inicial
    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);
    
    // Se já estiver expirado desde o início, avisar
    if (initialTime <= 0) {
      toast.warning("QR Code expirado! Clique em 'Novo' para gerar outro.");
      return;
    }
    
    // Atualizar a cada segundo
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);
      
      if (newTime <= 0) {
        toast.warning("QR Code expirado! Clique em 'Novo' para gerar outro.");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [pixData?.expires_at]);
  
  const handleCopyCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    }
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
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md w-full p-4 sm:p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Pagamento PIX
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(amount)}
              </p>
            </div>
            {isApproved ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Pago
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Clock className="w-3 h-3 mr-1" />
                Aguardando
              </Badge>
            )}
          </div>

          {/* QR Code e Timer */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
            {pixData?.qr_code_base64 ? (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center relative">
                  <div className="bg-white p-3 sm:p-4 rounded-lg">
                    <img 
                      src={`data:image/png;base64,${pixData.qr_code_base64}`}
                      alt="QR Code PIX"
                      className={`w-40 h-40 sm:w-44 sm:h-44 ${isApproved ? 'opacity-30 blur-sm' : ''}`}
                    />
                    {isApproved && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-green-500 text-white rounded-full p-6">
                          <CheckCircle2 className="w-16 h-16" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Timer ou Status Pago */}
                {isApproved ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <span className="text-xl font-bold text-green-800 dark:text-green-200">
                        Pagamento Aprovado!
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Este QR Code já foi utilizado
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Seu saldo foi creditado com sucesso
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-xl font-mono font-bold text-yellow-800 dark:text-yellow-200">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                      Tempo restante
                    </p>
                    {timeLeft <= 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">
                        QR Code expirado
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-56 sm:h-64 text-center">
                <QrCode className="w-20 h-20 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Carregando QR Code...</p>
              </div>
            )}
          </div>

          {/* PIX Code */}
          {pixData?.qr_code && !isApproved && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Código PIX (Copia e Cola)
                </h3>
                <div className="flex gap-2">
                  {onGenerateNew && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onGenerateNew}
                      className="h-8"
                      disabled={isProcessing}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Novo
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                    className="h-8"
                  >
                    {copied ? <CheckCircle className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
              </div>
              
              <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border text-xs font-mono break-all text-gray-600 dark:text-gray-300 max-h-14 sm:max-h-16 overflow-y-auto">
                {pixData.qr_code}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {isApproved ? (
              <Button 
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Fechar
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={onPaymentConfirm}
                  disabled={isProcessing || timeLeft <= 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  title={timeLeft <= 0 ? 'QR Code expirado. Clique em "Novo" para gerar outro.' : ''}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verificando...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Paguei
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixQRCodeModal;
