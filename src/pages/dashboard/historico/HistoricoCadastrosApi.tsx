import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, RefreshCw, ShoppingCart, Package, FileEdit } from 'lucide-react';
import { centralCashApiService, type CentralCashTransaction } from '@/services/centralCashApiService';
import { pdfRgService, type PdfRgPedido } from '@/services/pdfRgService';
import { editarPdfService, type EditarPdfPedido } from '@/services/pdfPersonalizadoService';
import { formatDate } from '@/utils/historicoUtils';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface UnifiedOrder {
  id: string;
  type: 'pdf_rg' | 'pdf_personalizado' | 'module_purchase';
  description: string;
  amount: number;
  status: string;
  created_at: string;
  meta?: Record<string, any>;
}

const textByLocale: Record<Locale, {
  statusLabels: Record<string, string>;
  title: string;
  sectionTitle: string;
  records: string;
  loading: string;
  empty: string;
  module: string;
  modulePurchase: string;
  customPdf: string;
}> = {
  'pt-BR': {
    statusLabels: { realizado: 'Realizado', pagamento_confirmado: 'Pgto Confirmado', em_confeccao: 'Em Confecção', entregue: 'Entregue' },
    title: 'Histórico · Cadastros na API',
    sectionTitle: 'Pedidos e Compras',
    records: 'registros',
    loading: 'Carregando pedidos...',
    empty: 'Nenhum pedido encontrado',
    module: 'Módulo',
    modulePurchase: 'Compra de módulo',
    customPdf: 'PDF Personalizado',
  },
  en: {
    statusLabels: { realizado: 'Placed', pagamento_confirmado: 'Payment Confirmed', em_confeccao: 'In Production', entregue: 'Delivered' },
    title: 'History · API Registrations',
    sectionTitle: 'Orders and Purchases',
    records: 'records',
    loading: 'Loading orders...',
    empty: 'No orders found',
    module: 'Module',
    modulePurchase: 'Module purchase',
    customPdf: 'Custom PDF',
  },
  es: {
    statusLabels: { realizado: 'Realizado', pagamento_confirmado: 'Pago Confirmado', em_confeccao: 'En Producción', entregue: 'Entregado' },
    title: 'Historial · Registros en la API',
    sectionTitle: 'Pedidos y Compras',
    records: 'registros',
    loading: 'Cargando pedidos...',
    empty: 'No se encontraron pedidos',
    module: 'Módulo',
    modulePurchase: 'Compra de módulo',
    customPdf: 'PDF Personalizado',
  },
};

const HistoricoCadastrosApi = () => {
  const { locale } = useLocale();
  const t = textByLocale[locale];
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cashResult, rgResult, persResult] = await Promise.allSettled([
        centralCashApiService.getRecentTransactions(100),
        pdfRgService.listar({ limit: 100 }),
        editarPdfService.listar({ limit: 100 }),
      ]);

      const unified: UnifiedOrder[] = [];

      if (cashResult.status === 'fulfilled' && cashResult.value.success && cashResult.value.data) {
        const modulePurchases = cashResult.value.data.filter(
          (t: CentralCashTransaction) =>
            t.transaction_type === 'compra_modulo' ||
            t.description?.toLowerCase().includes('compra de')
        );
        modulePurchases.forEach((tx: CentralCashTransaction) => {
          let parsedMeta: any = null;
          try {
            if (tx.metadata) parsedMeta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;
          } catch {}
          unified.push({
            id: `cash_${tx.id}`,
            type: 'module_purchase',
            description: tx.description || t.modulePurchase,
            amount: tx.amount,
            status: 'completed',
            created_at: tx.created_at,
            meta: { payment_method: tx.payment_method, module_name: parsedMeta?.module_name },
          });
        });
      }

      if (rgResult.status === 'fulfilled' && rgResult.value.success && rgResult.value.data) {
        rgResult.value.data.data.forEach((p: PdfRgPedido) => {
          unified.push({
            id: `rg_${p.id}`,
            type: 'pdf_rg',
            description: `PDF RG - ${p.nome || p.cpf}`,
            amount: p.preco_pago,
            status: p.status,
            created_at: p.created_at,
            meta: { cpf: p.cpf, nome: p.nome },
          });
        });
      }

      if (persResult.status === 'fulfilled' && persResult.value.success && persResult.value.data) {
        persResult.value.data.data.forEach((p: EditarPdfPedido) => {
          unified.push({
            id: `pers_${p.id}`,
            type: 'pdf_personalizado',
            description: `${t.customPdf} - ${(p as any).nome || (p as any).cpf || p.id}`,
            amount: p.preco_pago,
            status: p.status,
            created_at: p.created_at,
            meta: { cpf: (p as any).cpf, nome: (p as any).nome },
          });
        });
      }

      unified.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(unified);
    } catch (error) {
      console.error('Erro ao carregar cadastros:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getTypeBadge = (type: UnifiedOrder['type']) => {
    switch (type) {
      case 'pdf_rg':
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-blue-500/10 text-blue-600 border-blue-500/30">PDF RG</Badge>;
      case 'pdf_personalizado':
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-violet-500/10 text-violet-600 border-violet-500/30">PDF Personalizado</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">Módulo</Badge>;
    }
  };

  const getBorderColor = (type: UnifiedOrder['type']) => {
    switch (type) {
      case 'pdf_rg': return 'border-l-blue-500';
      case 'pdf_personalizado': return 'border-l-violet-500';
      default: return 'border-l-emerald-500';
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6 relative z-10 px-1 sm:px-0">
      <DashboardTitleCard
        title={t.title}
        icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/historico"
        right={
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading} className="h-8 sm:h-9">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        }
      />

      <Card>
        <CardHeader className="p-3 sm:p-6 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              {t.sectionTitle}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {orders.length} {t.records}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
              <p className="text-sm text-muted-foreground">{t.loading}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t.empty}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-l-4 ${getBorderColor(order.type)} bg-muted/30`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeBadge(order.type)}
                      <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                    </div>
                    <p className="text-sm font-medium truncate">{order.description}</p>
                    {order.meta?.module_name && (
                      <p className="text-xs text-muted-foreground">{t.module}: {order.meta.module_name}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{formatCurrency(order.amount)}</p>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      {t.statusLabels[order.status] || order.status}
                    </Badge>
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

export default HistoricoCadastrosApi;
