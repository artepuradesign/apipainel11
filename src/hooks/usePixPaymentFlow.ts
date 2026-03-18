import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { pixPaymentsApiService } from '@/services/pixPaymentsApiService';
import { apiRequest, fetchApiConfig, getApiUrl } from '@/config/api';

interface PixPaymentData {
  payerFirstName: string;
  payerLastName: string;
  email: string;
  identificationType: string;
  identificationNumber: string;
  transactionAmount: string;
  description: string;
}

interface PixResponse {
  success: boolean;
  order_id?: string;
  status?: string;
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
  payment_id?: string;
  message?: string;
  expires_at?: string;
}

export const usePixPaymentFlow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pixResponse, setPixResponse] = useState<PixResponse | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const createPixPayment = async (amount: number, userData?: any) => {
    setLoading(true);
    setPixResponse(null);

    try {
      // Preparar dados do pagador
      const fullName = userData?.full_name || user?.full_name || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'USUARIO';
      const lastName = nameParts.slice(1).join(' ') || 'SISTEMA';
      
      const paymentData = {
        payerFirstName: firstName.toUpperCase(),
        payerLastName: lastName.toUpperCase(),
        email: (userData?.email || user?.email || '').toLowerCase(),
        identificationType: userData?.cpf ? 'CPF' : 'CPF',
        identificationNumber: (userData?.cpf || '').replace(/\D/g, ''),
        transactionAmount: amount.toFixed(2),
        description: 'Recarga de Saldo',
        payer_name: fullName.toUpperCase(),
        user_id: user?.id || null
      };

      console.log('🔥 [PIX_FLOW] Criando pagamento PIX:', paymentData);

      await fetchApiConfig();
      const responseData = await apiRequest<any>('/mercadopago/create-pix-payment.php', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });

      console.log('🔥 [PIX_FLOW] Response:', responseData);

      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao processar pagamento');
      }

      if (responseData.success && responseData.data) {
        // Extrair payment_id da URL do ticket
        let finalPaymentId = responseData.data.payment_id;
        
        if (responseData.data.ticket_url) {
          const match = responseData.data.ticket_url.match(/\/payments\/(\d+)\//);
          if (match) {
            finalPaymentId = match[1];
          }
        }
        
        // Garantir expires_at correto (fallback 15min se não vier do backend)
        const expiresAt: string = responseData.data.expires_at
          ? String(responseData.data.expires_at)
          : new Date(Date.now() + 15 * 60 * 1000).toISOString();
        
        const finalResponse = {
          ...responseData.data,
          expires_at: expiresAt,
          payment_id: finalPaymentId,
          success: true
        } as PixResponse;
        
        setPixResponse(finalResponse);
        toast.success('QR Code PIX gerado com sucesso!');
        return finalResponse;
      } else {
        throw new Error(responseData.message || 'Erro ao gerar pagamento PIX');
      }
    } catch (error: any) {
      console.error('❌ [PIX_FLOW] Erro:', error);
      toast.error(error.message || 'Erro ao conectar com o servidor');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    setCheckingPayment(true);
    try {
      const uid = user?.id;
      if (!uid) throw new Error('Usuário não autenticado');

      const attempts = 12; // ~60s (12 x 5s)
      const delayMs = 5000;

      for (let i = 0; i < attempts; i++) {
        console.log(`🔍 [PIX_FLOW] Tentativa ${i + 1}/${attempts} - consultando webhook`);
        const res = await pixPaymentsApiService.listPixPayments(Number(uid), 1, 100);

        if (res.success && res.data?.payments?.length) {
          const found = res.data.payments.find(p => String(p.payment_id) === String(paymentId));

          if (found) {
            // Atualizar estado local (status e expires_at do backend, se existir)
            setPixResponse(prev => prev ? { ...prev, status: found.status, expires_at: found.expires_at || prev.expires_at } : prev);

            if (found.status === 'approved') {
              toast.success('Pagamento aprovado!', { description: 'Seu saldo foi creditado.' });
              setTimeout(() => navigate('/dashboard'), 1500);
              return 'approved';
            }
            if (found.status === 'rejected') {
              toast.error('Pagamento rejeitado');
              return 'rejected';
            }
            if (found.status === 'cancelled' || found.status === 'expired') {
              toast.warning(found.status === 'expired' ? 'QR Code expirado' : 'Pagamento cancelado');
              return found.status;
            }
          }
        }

        // Se não encontrou ainda, aguardar e tentar novamente
        await new Promise(r => setTimeout(r, delayMs));
      }

      // Fallback: ainda pendente após polling - manter compatibilidade com checagem direta
      console.log('ℹ️ [PIX_FLOW] Fallback para checagem direta do provedor');
      await fetchApiConfig();
      const data = await apiRequest<any>(`/mercadopago/check-payment-status-live.php?payment_id=${paymentId}`).catch(() => ({}));
      const newStatus = data?.data?.status || 'pending';
      setPixResponse(prev => prev ? { ...prev, status: newStatus } : prev);

      return newStatus;
    } catch (error: any) {
      console.error('❌ [PIX_FLOW] Erro ao verificar status:', error);
      toast.error('Erro ao verificar status do pagamento');
      return null;
    } finally {
      setCheckingPayment(false);
    }
  };

  const cancelPayment = async (paymentId: string) => {
    try {
      // Aqui você pode implementar a lógica de cancelamento se necessário
      console.log('❌ [PIX_FLOW] Cancelando pagamento:', paymentId);
      
      // Por enquanto, apenas atualizar o estado local
      setPixResponse(null);
      toast.info('Pagamento cancelado');
    } catch (error: any) {
      console.error('❌ [PIX_FLOW] Erro ao cancelar:', error);
      toast.error('Erro ao cancelar pagamento');
    }
  };

  const generateNewPayment = async (amount: number, userData?: any) => {
    // Cancelar pagamento anterior se existir
    if (pixResponse?.payment_id) {
      await cancelPayment(pixResponse.payment_id);
    }
    
    // Criar novo pagamento
    return await createPixPayment(amount, userData);
  };

  return {
    loading,
    pixResponse,
    checkingPayment,
    createPixPayment,
    checkPaymentStatus,
    cancelPayment,
    generateNewPayment
  };
};
