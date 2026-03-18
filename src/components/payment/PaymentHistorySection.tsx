
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, CheckCircle, Clock, XCircle, Receipt } from 'lucide-react';
import { toast } from "sonner";

interface PaymentHistoryItem {
  id: string;
  type: string;
  method: string;
  amount: number;
  status: string;
  date: string;
  description: string;
}

interface PaymentHistorySectionProps {
  paymentHistory: PaymentHistoryItem[];
}

const PaymentHistorySection: React.FC<PaymentHistorySectionProps> = ({
  paymentHistory
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Aguardando</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Falhou</Badge>;
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

  const getFilteredHistory = (method?: string) => {
    if (!method || method === 'all') return paymentHistory;
    return paymentHistory.filter(item => item.method === method);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <History className="w-5 h-5 mr-2 text-brand-purple" />
          Histórico de Pagamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
            <TabsTrigger value="PIX" className="text-xs">PIX</TabsTrigger>
            <TabsTrigger value="Cartão de Crédito" className="text-xs">Cartão</TabsTrigger>
            <TabsTrigger value="Criptomoedas" className="text-xs">Crypto</TabsTrigger>
          </TabsList>

          {['all', 'PIX', 'Cartão de Crédito', 'Criptomoedas'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3 max-h-64 overflow-y-auto">
              {getFilteredHistory(tab === 'all' ? undefined : tab).length > 0 ? (
                getFilteredHistory(tab === 'all' ? undefined : tab).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{payment.description}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{payment.method}</span>
                        <span>{formatDate(payment.date)}</span>
                        <span className="font-mono">{payment.id}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 mt-1"
                        onClick={() => toast.info("Comprovante em desenvolvimento")}
                      >
                        <Receipt className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {tab === 'all' ? 'Nenhum pagamento encontrado' : `Nenhum pagamento via ${tab}`}
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PaymentHistorySection;
