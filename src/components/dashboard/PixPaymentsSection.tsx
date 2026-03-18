import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePixPayments } from "@/hooks/usePixPayments";
import { AlertCircle, RefreshCw, QrCode as QrCodeIcon, CheckCircle, XCircle, Clock } from "lucide-react";
import QRCode from 'react-qr-code';
import PixQRCodeModal from '@/components/payment/PixQRCodeModal';
import { usePixPaymentFlow } from '@/hooks/usePixPaymentFlow';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/apiConfig';

export const PixPaymentsSection = () => {
  const { pixPayments, loading, error, formatDate, formatMoney, refreshPayments } = usePixPayments();
  const { pixResponse, checkingPayment, checkPaymentStatus } = usePixPaymentFlow();
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const getStatusBadge = (status: string, label?: string) => {
    const displayLabel = label || status;
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            {displayLabel}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            {displayLabel}
          </Badge>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            {displayLabel}
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            {displayLabel}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{displayLabel}</Badge>;
    }
  };

  // Verificar se QR Code ainda é válido (30 minutos desde created_at)
  const isQRCodeValid = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    return diffMinutes < 30;
  };

  // Pegar apenas os 3 últimos pagamentos
  const recentPayments = pixPayments.slice(0, 3);

  // Abrir modal com dados do pagamento
  const handleQRCodeClick = (payment: any) => {
    if (payment.qr_code && isQRCodeValid(payment.created_at)) {
      setSelectedPayment({
        payment_id: payment.payment_id,
        qr_code: payment.qr_code,
        qr_code_base64: payment.qr_code_base64,
        status: payment.status,
        expires_at: payment.expires_at
      });
      setShowModal(true);
    } else {
      toast.error('QR Code expirado ou inválido');
    }
  };

  const handlePaymentConfirm = async () => {
    if (selectedPayment?.payment_id) {
      toast.loading('Verificando pagamento...', { id: 'check-payment' });
      
      try {
        // Forçar verificação de pagamentos pendentes
        const checkResponse = await fetch(`${API_BASE_URL}/mercadopago/check-pending-payments`, {
          method: 'GET'
        });

        if (checkResponse.ok) {
          console.log('✅ Verificação de pagamentos pendentes concluída');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Verificar status atualizado
        await checkPaymentStatus(selectedPayment.payment_id);
        
        toast.success('Verificação concluída!', { id: 'check-payment' });
      } catch (error) {
        toast.error('Erro ao verificar pagamento', { id: 'check-payment' });
      }
      
      setShowModal(false);
      refreshPayments();
    }
  };

  return (
    <>
      {/* Lista de Pagamentos */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Carregando pagamentos...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="text-destructive font-medium mb-2">Erro ao carregar pagamentos</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={refreshPayments} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="p-12 text-center">
              <QrCodeIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhum pagamento PIX registrado ainda.</p>
            </div>
          ) : (
            <>
              {/* Lista Desktop e Tablet */}
              <div className="hidden md:block space-y-3 p-4">
                {recentPayments.map((p) => {
                  const qrValid = isQRCodeValid(p.created_at);
                  return (
                    <div key={p.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      {/* QR Code - Clicável */}
                      <div className="flex-shrink-0">
                        {p.qr_code && qrValid ? (
                          <div 
                            className="bg-white p-2 rounded border-2 border-green-500 cursor-pointer hover:border-green-600 transition-colors"
                            onClick={() => handleQRCodeClick(p)}
                            title="Clique para abrir o pagamento"
                          >
                            <QRCode value={p.qr_code} size={80} />
                          </div>
                        ) : (
                          <div className="bg-muted p-2 rounded border-2 border-border flex items-center justify-center" style={{ width: 84, height: 84 }}>
                            <QrCodeIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Informações Compactas */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-bold text-green-600">
                            {formatMoney(p.amount, p.amount_formatted)}
                          </span>
                          {getStatusBadge(p.status, p.status_label)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {p.description || 'RECARGA PIX'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(p.created_at)}</p>
                      </div>

                      {/* Info Adicional */}
                      <div className="flex-shrink-0 text-right hidden lg:block">
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={p.payer_email || '-'}>
                          {p.payer_email || '-'}
                        </p>
                        <code className="text-xs text-muted-foreground">
                          {p.payment_id.substring(0, 8)}...
                        </code>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lista Mobile */}
              <div className="md:hidden p-2">
                <div className="rounded-lg border border-border bg-card divide-y divide-border">
                  {recentPayments.map((p) => {
                    const qrValid = isQRCodeValid(p.created_at);

                    return (
                      <div key={p.id} className="px-3 py-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold truncate">
                                {formatMoney(p.amount, p.amount_formatted)}
                              </span>
                              {getStatusBadge(p.status, p.status_label)}
                            </div>
                            <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
                              {p.description || 'RECARGA PIX'}
                            </div>
                            <div className="mt-0.5 text-[10px] text-muted-foreground">
                              {formatDate(p.created_at)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {p.qr_code && qrValid ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleQRCodeClick(p)}
                              >
                                <QrCodeIcon className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                disabled
                                aria-disabled
                                title="QR Code expirado"
                              >
                                <QrCodeIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="mt-1.5">
                          <code className="text-[10px] bg-muted px-2 py-1 rounded inline-block max-w-full truncate">
                            ID: {p.payment_id}
                          </code>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Pagamento */}
      {selectedPayment && (
        <PixQRCodeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          amount={pixPayments.find(p => p.payment_id === selectedPayment.payment_id)?.amount || 0}
          onPaymentConfirm={handlePaymentConfirm}
          isProcessing={checkingPayment}
          pixData={selectedPayment}
        />
      )}
    </>
  );
};

export default PixPaymentsSection;
