import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Clock, ChevronUp, ChevronDown, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCode from 'react-qr-code';

interface FloatingPendingPixProps {
  isVisible: boolean;
  pixData: {
    qr_code?: string;
    qr_code_base64?: string;
    payment_id?: string;
    expires_at?: string;
  } | null;
  amount: number;
  moduleName?: string;
  onOpenModal: () => void;
  onCancel: () => void;
}

const FloatingPendingPix: React.FC<FloatingPendingPixProps> = ({
  isVisible,
  pixData,
  amount,
  moduleName,
  onOpenModal,
  onCancel,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!pixData?.expires_at) return;
    const calc = () => {
      const diff = Math.floor((new Date(pixData.expires_at!).getTime() - Date.now()) / 1000);
      return Math.max(0, diff);
    };
    setTimeLeft(calc());
    const timer = setInterval(() => {
      const t = calc();
      setTimeLeft(t);
      if (t <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [pixData?.expires_at]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (!isVisible || !pixData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed bottom-4 right-4 z-[9999] max-w-[280px]"
      >
        <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2 bg-yellow-500/10 border-b border-border cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <QrCode className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              </div>
              <span className="text-xs font-semibold text-foreground">PIX Pendente</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono text-yellow-600 dark:text-yellow-400">
                {formatTime(timeLeft)}
              </span>
              {expanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Body */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-3 space-y-3">
                  {/* QR Code mini */}
                  {pixData.qr_code && (
                    <div
                      className="flex justify-center cursor-pointer"
                      onClick={onOpenModal}
                      title="Clique para ampliar"
                    >
                      <div className="bg-white p-2 rounded-lg border-2 border-green-500/30 hover:border-green-500 transition-colors">
                        <QRCode value={pixData.qr_code} size={100} />
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(amount)}
                    </p>
                    {moduleName && (
                      <p className="text-xs text-muted-foreground truncate">
                        {moduleName}
                      </p>
                    )}
                    {timeLeft <= 0 && (
                      <p className="text-xs text-destructive font-semibold">
                        QR Code expirado
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={onCancel}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs h-8 bg-green-600 hover:bg-green-700 text-white"
                      onClick={onOpenModal}
                    >
                      <QrCode className="w-3 h-3 mr-1" />
                      Abrir
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingPendingPix;
