import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { CheckCircle2, CreditCard, Loader2, XCircle } from 'lucide-react';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useAuth } from '@/contexts/AuthContext';
import { useUserDataApi } from '@/hooks/useUserDataApi';
import { apiRequest, fetchApiConfig } from '@/config/api';
import { formatMoneyBR } from '@/utils/formatters';

interface CardResult {
  success?: boolean;
  data?: {
    payment_id?: string;
    status?: string;
    status_detail?: string;
    transaction_amount?: number;
  };
  message?: string;
  error?: string;
}

const MercadoPagoCartao: React.FC = () => {
  const { user } = useAuth();
  const { userData } = useUserDataApi();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CardResult | null>(null);
  const [formData, setFormData] = useState({
    transactionAmount: '100.00',
    description: 'Recarga via Cartão',
    cardholderName: '',
    cardNumber: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    email: '',
    identificationNumber: ''
  });

  useEffect(() => {
    if (!userData) return;
    setFormData((prev) => ({
      ...prev,
      cardholderName: (userData.full_name || '').toUpperCase(),
      email: (userData.email || '').toLowerCase(),
      identificationNumber: (userData.cpf || '').replace(/\D/g, '')
    }));
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 16);
      const formatted = onlyDigits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      setFormData((prev) => ({ ...prev, cardNumber: formatted }));
      return;
    }

    if (name === 'securityCode') {
      setFormData((prev) => ({ ...prev, securityCode: value.replace(/\D/g, '').slice(0, 4) }));
      return;
    }

    if (name === 'expirationMonth') {
      setFormData((prev) => ({ ...prev, expirationMonth: value.replace(/\D/g, '').slice(0, 2) }));
      return;
    }

    if (name === 'expirationYear') {
      setFormData((prev) => ({ ...prev, expirationYear: value.replace(/\D/g, '').slice(0, 4) }));
      return;
    }

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

      const response = await apiRequest<CardResult>('/mercadopago/create-card-payment.php', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id || null,
          transactionAmount: Number(formData.transactionAmount || 0).toFixed(2),
          description: formData.description,
          cardholderName: formData.cardholderName,
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expirationMonth: formData.expirationMonth,
          expirationYear: formData.expirationYear,
          securityCode: formData.securityCode,
          installments: 1,
          email: formData.email,
          identificationType: 'CPF',
          identificationNumber: formData.identificationNumber,
        })
      });

      setResult(response);

      if (response?.success) {
        toast.success('Pagamento em cartão processado');
      } else {
        toast.error(response?.message || response?.error || 'Falha no pagamento com cartão');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao processar pagamento com cartão');
    } finally {
      setLoading(false);
    }
  };

  const status = result?.data?.status;

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardTitleCard
        title="Mercado Pago - Cartão"
        subtitle="Recebimento de recarga com cartão de crédito"
        icon={<CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/integracoes/mercado-pago"
      />

      <Card>
        <CardHeader>
          <CardTitle>Dados do pagamento</CardTitle>
          <CardDescription>Preencha os dados para cobrar via cartão</CardDescription>
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
              <Label htmlFor="cardholderName">Nome no cartão</Label>
              <Input id="cardholderName" name="cardholderName" value={formData.cardholderName} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do cartão</Label>
              <Input id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="1234 5678 9012 3456" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="expirationMonth">Mês</Label>
                <Input id="expirationMonth" name="expirationMonth" value={formData.expirationMonth} onChange={handleInputChange} placeholder="12" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expirationYear">Ano</Label>
                <Input id="expirationYear" name="expirationYear" value={formData.expirationYear} onChange={handleInputChange} placeholder="2028" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityCode">CVV</Label>
                <Input id="securityCode" name="securityCode" value={formData.securityCode} onChange={handleInputChange} placeholder="123" required />
              </div>
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
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
              Processar pagamento
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span>Status</span>
              <Badge variant={status === 'approved' ? 'default' : 'secondary'}>
                {status === 'approved' ? 'Aprovado' : status || 'Em análise'}
              </Badge>
            </div>
            {result?.data?.payment_id && <p className="text-sm">Pagamento: <strong>{result.data.payment_id}</strong></p>}
            {result?.data?.transaction_amount !== undefined && (
              <p className="text-sm">Valor: <strong>R$ {formatMoneyBR(Number(result.data.transaction_amount))}</strong></p>
            )}
            {status === 'approved' ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Pagamento aprovado com sucesso.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <XCircle className="h-4 w-4" />
                {result?.message || result?.error || result?.data?.status_detail || 'Aguardando processamento do cartão.'}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MercadoPagoCartao;
