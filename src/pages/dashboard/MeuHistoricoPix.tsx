import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { usePaymentPolling } from "@/hooks/usePaymentPolling";
import { usePixPayments } from "@/hooks/usePixPayments";
import { API_BASE_URL } from '@/config/apiConfig';

interface PixPayment {
  id: number;
  payment_id: string;
  amount: number;
  amount_formatted?: string;
  description?: string;
  status: string;
  status_label?: string;
  created_at: string;
  approved_at?: string;
  expires_at?: string;
}

const MeuHistoricoPix: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PixPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const { deletePayment } = usePixPayments();

  // Verificação automática de pagamentos pendentes a cada 15 segundos
  const { checkNow } = usePaymentPolling({
    onUpdate: () => {
      console.log('🔄 Pagamentos atualizados, recarregando lista...');
      loadPayments();
    },
    interval: 15000, // 15 segundos
    enabled: true // sempre ativo nesta página
  });

  const loadPayments = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/mercadopago/list-payments?user_id=${user.id}&page=1&limit=50`;
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) throw new Error('Erro ao carregar pagamentos');
      
      const data = await res.json();
      if (data.success && data.data?.payments) {
        setPayments(data.data.payments);
      } else {
        setPayments([]);
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar pagamentos');
      toast.error('Erro ao carregar histórico de pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Forçar verificação imediata
      await checkNow();
      // Aguardar 2 segundos para o backend processar
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Recarregar pagamentos
      await loadPayments();
      toast.success('Pagamentos atualizados!');
    } catch (e: any) {
      toast.error('Erro ao atualizar pagamentos');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'pending':
      case 'action_required':
      case 'in_process':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
            <div>
              <CardTitle>Meus Pagamentos PIX</CardTitle>
              <CardDescription>
                Histórico de todos os seus pagamentos via PIX
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/adicionar-saldo')} 
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <p>{error}</p>
              <Button onClick={loadPayments} variant="outline" className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum pagamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(payment.status)}
                        <span className="text-sm text-muted-foreground">
                          #{payment.payment_id}
                        </span>
                      </div>
                      <p className="text-lg font-semibold">
                        {payment.amount_formatted || formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.description || 'Recarga PIX'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(payment.created_at)}
                      </p>
                      {payment.approved_at && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Aprovado em: {formatDate(payment.approved_at)}
                        </p>
                      )}
                    </div>
                    {(payment.status === 'pending' || payment.status === 'action_required' || payment.status === 'in_process') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={cancelling === payment.id}
                        onClick={async () => {
                          if (confirm('Deseja realmente cancelar este pagamento pendente?')) {
                            setCancelling(payment.id);
                            try {
                              const success = await deletePayment(payment.id);
                              if (success) {
                                toast.success('Pagamento cancelado com sucesso!');
                                await loadPayments();
                              }
                            } catch (e: any) {
                              toast.error('Erro ao cancelar pagamento');
                            } finally {
                              setCancelling(null);
                            }
                          }
                        }}
                      >
                        {cancelling === payment.id ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          'Cancelar'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MeuHistoricoPix;
