import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Copy, FileText, Loader2, QrCode } from 'lucide-react';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useAuth } from '@/contexts/AuthContext';
import { useUserDataApi } from '@/hooks/useUserDataApi';
import { apiRequest, fetchApiConfig } from '@/config/api';
import { formatMoneyBR } from '@/utils/formatters';

interface BoletoResponseData {
  payment_id?: string;
  status?: string;
  ticket_url?: string;
  qr_code?: string;
  qr_code_base64?: string;
  expires_at?: string;
  barcode?: string;
}

interface BoletoResponse {
  success?: boolean;
  data?: BoletoResponseData;
  message?: string;
  error?: string;
}

const ENDPOINTS = [
  '/mercadopago/create-boleto-payment.php',
  '/mercadopago/create-boleto-pix-payment.php',
  '/mercadopago/create-ticket-payment.php'
];

const MercadoPagoBoleto: React.FC = () => {
  const { user } = useAuth();
  const { userData } = useUserDataApi();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BoletoResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [formData, setFormData] = useState({
    transactionAmount: '100.00',
    description: 'Recarga via Boleto',
    payer_name: '',
    email: '',
    identificationNumber: ''
  });

  useEffect(() => {
    if (!userData) return;
    setFormData((prev) => ({
      ...prev,
      payer_name: (userData.full_name || '').toUpperCase(),
      email: (userData.email || '').toLowerCase(),
      identificationNumber: (userData.cpf || '').replace(/\D/g, '')
    }));
  }, [userData]);

  const expiresAt = useMemo(() => {
    const fromApi = result?.data?.expires_at;
    if (fromApi) return fromApi;
    return '';
  }, [result?.data?.expires_at]);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const seconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(seconds);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const formatRemaining = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'identificationNumber') {
      setFormData((prev) => ({ ...prev, identificationNumber: value.replace(/\D/g, '').slice(0, 11) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      await fetchApiConfig();

      const now = new Date();
      const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const payload = {
        user_id: user?.id || null,
        transactionAmount: Number(formData.transactionAmount || 0).toFixed(2),
        description: formData.description,
        payer_name: formData.payer_name,
        email: formData.email,
        identificationType: 'CPF',
        identificationNumber: formData.identificationNumber,
        payment_method_id: 'bolbradesco',
        date_of_expiration: threeDays.toISOString(),
        expiration_date: threeDays.toISOString(),
        expires_at: threeDays.toISOString(),
        expires_in_days: 3,
        include_pix_qr: true
      };

      let finalResponse: BoletoResponse | null = null;
      let lastError: unknown = null;

      for (const endpoint of ENDPOINTS) {
        try {
          const response = await apiRequest<BoletoResponse>(endpoint, {
            method: 'POST',
            body: JSON.stringify(payload)
          });

          if (response?.success) {
            finalResponse = {
              ...response,
              data: {
                ...response.data,
                expires_at: response.data?.expires_at || threeDays.toISOString()
              }
            };
            break;
          }

          lastError = response?.error || response?.message || `Falha no endpoint ${endpoint}`;
        } catch (error) {
          lastError = error;
          console.warn(`[BOLETO] Endpoint indisponível: ${endpoint}`, error);
        }
      }

      if (!finalResponse) {
        const message = lastError instanceof Error ? lastError.message : String(lastError || 'Nenhum endpoint de boleto disponível no backend.');
        throw new Error(message);
      }

      setResult(finalResponse);
      toast.success('Boleto gerado com sucesso (validade de até 3 dias)');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao gerar boleto');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    const code = result?.data?.qr_code || result?.data?.barcode;
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardTitleCard
        title="Mercado Pago - Boleto"
        subtitle="Boleto com QR Code Pix (validade máxima de 3 dias)"
        icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/integracoes/mercado-pago"
      />

      <Card>
        <CardHeader>
          <CardTitle>Gerar boleto</CardTitle>
          <CardDescription>Este boleto já solicita QR Code Pix com expiração em até 3 dias.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="transactionAmount">Valor (R$)</Label>
                <Input id="transactionAmount" name="transactionAmount" type="number" min="1" step="0.01" value={formData.transactionAmount} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" name="description" value={formData.description} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payer_name">Nome do pagador</Label>
              <Input id="payer_name" name="payer_name" value={formData.payer_name} onChange={handleInputChange} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="identificationNumber">CPF</Label>
                <Input id="identificationNumber" name="identificationNumber" value={formData.identificationNumber} onChange={handleInputChange} required />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Gerar boleto + QR Pix
            </Button>
          </form>
        </CardContent>
      </Card>

      {result?.data && (
        <Card>
          <CardHeader>
            <CardTitle>Pagamento gerado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span>Status</span>
              <Badge variant="secondary">{result.data.status || 'pending'}</Badge>
            </div>

            <p className="text-sm">Valor: <strong>R$ {formatMoneyBR(Number(formData.transactionAmount || 0))}</strong></p>
            <p className="text-sm">Validade máxima: <strong>3 dias</strong></p>
            {expiresAt && <p className="text-sm">Tempo restante: <strong>{formatRemaining(timeLeft)}</strong></p>}

            {result.data.ticket_url && (
              <Button variant="outline" className="w-full" onClick={() => window.open(result.data.ticket_url, '_blank')}>
                Abrir boleto
              </Button>
            )}

            {result.data.qr_code_base64 && (
              <div className="rounded-md border bg-white p-4 flex justify-center">
                <img src={`data:image/png;base64,${result.data.qr_code_base64}`} alt="QR Code Pix do boleto" className="w-56 h-56" />
              </div>
            )}

            {(result.data.qr_code || result.data.barcode) && (
              <div className="space-y-2">
                <Label>Código para copiar</Label>
                <div className="flex gap-2">
                  <Input value={result.data.qr_code || result.data.barcode || ''} readOnly className="font-mono text-xs" />
                  <Button variant="outline" onClick={copyCode}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {!result.data.qr_code_base64 && !result.data.qr_code && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <QrCode className="h-4 w-4" />
                O backend ainda não retornou QR Pix para este boleto.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MercadoPagoBoleto;
