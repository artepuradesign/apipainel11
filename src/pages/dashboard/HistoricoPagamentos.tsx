import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Calendar, DollarSign, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { useAuth } from '@/contexts/AuthContext';
import PixPaymentsSection from '@/components/dashboard/PixPaymentsSection';

interface PaymentHistory {
  id: string;
  date: string;
  plan: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  method: string;
  description: string;
  nextBilling?: string;
  features: string[];
  discount?: number;
}

const HistoricoPagamentos = () => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPaymentHistory();
    }
  }, [user]);

  const loadPaymentHistory = () => {
    if (!user) return;
    
    // Carregar histórico real do localStorage específico do usuário
    const history = JSON.parse(localStorage.getItem(`payment_history_${user.id}`) || "[]");
    
    // Se não existir histórico, criar um histórico de exemplo
    if (history.length === 0) {
      const mockHistory: PaymentHistory[] = [
        {
          id: `PAY-${Date.now()}-1`,
          date: new Date().toISOString().split('T')[0],
          plan: 'Recarga',
          amount: 100.00,
          status: 'success' as const,
          method: 'PIX',
          description: 'Recarga de saldo via PIX',
          features: ['Crédito adicionado à carteira', 'Transação instantânea']
        }
      ];
      localStorage.setItem(`payment_history_${user.id}`, JSON.stringify(mockHistory));
      setPaymentHistory(mockHistory);
    } else {
      setPaymentHistory(history);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const totalPaid = paymentHistory
    .filter(payment => payment.status === 'success')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const getNextBilling = () => {
    const currentPlan = localStorage.getItem(`user_plan_${user?.id}`) || "Pré-Pago";
    if (currentPlan === "Pré-Pago") return "N/A";
    
    const lastPayment = paymentHistory.find(p => p.status === 'success' && p.plan !== 'Recarga');
    if (lastPayment) {
      const nextDate = new Date(lastPayment.date);
      nextDate.setMonth(nextDate.getMonth() + 1);
      return formatDate(nextDate.toISOString());
    }
    return "N/A";
  };

  const getCurrentPlan = () => {
    return localStorage.getItem(`user_plan_${user?.id}`) || "Pré-Pago";
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Histórico de Pagamentos" 
        subtitle="Visualize todos os seus pagamentos e faturas"
        value={formatCurrency(totalPaid)}
        valueDetails="Total pago até agora"
      />

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pago</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Próxima Cobrança</p>
                <p className="text-2xl font-bold text-blue-600">{getNextBilling()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Plano Atual</p>
                <p className="text-2xl font-bold text-purple-600">{getCurrentPlan()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Pagamentos PIX */}
      <PixPaymentsSection />

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Histórico Detalhado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Plano/Serviço</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {formatDate(payment.date)}
                    </TableCell>
                    <TableCell>{payment.plan}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Pagamento</DialogTitle>
                          </DialogHeader>
                          {selectedPayment && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium text-gray-600">ID do Pagamento</p>
                                  <p className="font-mono">{selectedPayment.id}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-600">Data</p>
                                  <p>{formatDate(selectedPayment.date)}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-600">Plano</p>
                                  <p>{selectedPayment.plan}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-600">Valor</p>
                                  <p className="font-bold text-green-600">{formatCurrency(selectedPayment.amount)}</p>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <p className="font-medium text-gray-600 mb-2">Recursos Inclusos</p>
                                <ul className="space-y-1 text-sm">
                                  {selectedPayment.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="flex space-x-2">
                                <Button variant="outline" className="flex-1">
                                  Baixar Comprovante
                                </Button>
                                {selectedPayment.status === 'success' && (
                                  <Button variant="outline" className="flex-1">
                                    2ª Via
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhum pagamento registrado ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricoPagamentos;
