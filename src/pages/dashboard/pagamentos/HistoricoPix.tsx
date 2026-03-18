import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/apiConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  QrCode as QrCodeIcon,
  RefreshCw
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import PixQRCodeModal from '@/components/payment/PixQRCodeModal';
import { usePixPaymentFlow } from '@/hooks/usePixPaymentFlow';
import { toast } from 'sonner';

interface Payment {
  id: number;
  user_id: number;
  payment_id: string;
  amount: number;
  amount_formatted?: string;
  description?: string | null;
  external_reference?: string | null;
  qr_code?: string | null;
  qr_code_base64?: string | null;
  transaction_id?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired' | string;
  status_detail?: string | null;
  status_label?: string;
  payer_email?: string | null;
  payer_name?: string | null;
  payer_identification_type?: string | null;
  payer_identification_number?: string | null;
  created_at: string;
  updated_at: string;
  approved_at?: string | null;
  expires_at?: string | null;
  last_webhook_at?: string | null;
}

const HistoricoPix: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pixResponse, checkingPayment, checkPaymentStatus } = usePixPaymentFlow();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // SEO
  useEffect(() => {
    const title = 'Histórico PIX | Pagamentos';
    const description = 'Gerencie e acompanhe todos os seus pagamentos PIX realizados via Mercado Pago.';
    document.title = title;

    const ensureTag = (tagName: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector(
        `${tagName}${attrs.name ? `[name="${attrs.name}"]` : ''}${attrs.rel ? `[rel="${attrs.rel}"]` : ''}`
      ) as HTMLMetaElement | HTMLLinkElement | null;
      if (!el) {
        el = document.createElement(tagName) as HTMLMetaElement | HTMLLinkElement;
        document.head.appendChild(el);
      }
      Object.entries(attrs).forEach(([k, v]) => (el as any)[k] = v);
    };

    ensureTag('meta', { name: 'description', content: description });
    ensureTag('link', { rel: 'canonical', href: `${window.location.origin}/dashboard/pagamentos/historico-pix` });
  }, []);

  const canNavigate = useMemo(() => !!user?.id, [user?.id]);

  const loadPayments = async () => {
    if (!canNavigate) return;
    
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/mercadopago/list-payments?user_id=${user!.id}&page=${page}&limit=${limit}`;
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} - ${txt}`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Falha ao carregar');
      }
      setPayments(json.data?.payments ?? []);
      setTotal(json.data?.pagination?.total ?? 0);
      setTotalPages(json.data?.pagination?.total_pages ?? 1);
    } catch (e: any) {
      setError(e.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [canNavigate, user?.id, page, limit]);

  const formatDate = (s?: string | null) => {
    if (!s) return '-';
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleString('pt-BR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMoney = (v?: number, fallback?: string) => {
    if (fallback) return fallback;
    if (typeof v !== 'number') return '-';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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

  // Filtrar pagamentos
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = !searchTerm || 
        p.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.payer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.payer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  // Verificar se QR Code ainda é válido (30 minutos desde created_at)
  const isQRCodeValid = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    return diffMinutes < 30;
  };

  // Abrir modal com dados do pagamento
  const handleQRCodeClick = (payment: Payment) => {
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
      loadPayments();
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de ações - sem card separado */}
      <div className="flex items-center justify-between gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/dashboard/integracoes/mercado-pago')} 
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Ocultar' : 'Mostrar'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadPayments}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros - quando visíveis */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por Payment ID, Email, Nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Itens por página</label>
                <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Pagamentos - Minimalista */}
      <Card>
        <CardContent className="p-0">
          {!canNavigate ? (
            <div className="p-8 text-center text-muted-foreground">
              Você precisa estar autenticado para visualizar.
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="text-destructive font-medium mb-2">Erro ao carregar pagamentos</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadPayments} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          ) : loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Carregando pagamentos...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <QrCodeIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhum pagamento encontrado com os filtros aplicados.' 
                  : 'Nenhum pagamento PIX registrado ainda.'}
              </p>
            </div>
          ) : (
            <>
              {/* Lista Minimalista - Desktop e Tablet */}
              <div className="hidden md:block space-y-3 p-4">
                {filteredPayments.map((p) => {
                  const qrValid = isQRCodeValid(p.created_at);
                  return (
                    <div key={p.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      {/* QR Code Compacto - Clicável */}
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
                        <p className="text-sm text-muted-foreground truncate">RECARGA PIX</p>
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

              {/* Lista Mobile - Simplificada */}
              <div className="md:hidden space-y-3 p-4">
                {filteredPayments.map((p) => {
                  const qrValid = isQRCodeValid(p.created_at);
                  return (
                    <div key={p.id} className="space-y-3 p-4 border rounded-lg">
                      {/* QR Code centralizado - Clicável */}
                      <div className="flex justify-center">
                        {p.qr_code && qrValid ? (
                          <div 
                            className="bg-white p-3 rounded border-2 border-green-500 cursor-pointer hover:border-green-600 transition-colors"
                            onClick={() => handleQRCodeClick(p)}
                          >
                            <QRCode value={p.qr_code} size={140} />
                            <p className="text-xs text-center text-green-600 font-medium mt-2">Toque para pagar</p>
                          </div>
                        ) : (
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-lg flex items-center justify-center" style={{ width: 160, height: 160 }}>
                            <div className="text-center">
                              <QrCodeIcon className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                              <p className="text-xs text-gray-500">QR Code Expirado</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Informações */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-green-600">
                            {formatMoney(p.amount, p.amount_formatted)}
                          </div>
                          {getStatusBadge(p.status, p.status_label)}
                        </div>
                        <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                          ID: {p.payment_id}
                        </code>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block mb-1">Descrição</span>
                          <span className="font-medium">RECARGA PIX</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Email</span>
                          <span className="font-medium truncate block" title={p.payer_email || '-'}>
                            {p.payer_email || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Nome</span>
                          <span className="font-medium truncate block" title={p.payer_name || '-'}>
                            {p.payer_name || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Criado</span>
                          <span className="font-medium">{formatDate(p.created_at)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Aprovado</span>
                          <span className="font-medium">{formatDate(p.approved_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginação */}
              <div className="p-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setPage(pageNum)}
                              isActive={page === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && page < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
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
          amount={payments.find(p => p.payment_id === selectedPayment.payment_id)?.amount || 0}
          onPaymentConfirm={handlePaymentConfirm}
          isProcessing={checkingPayment}
          pixData={selectedPayment}
        />
      )}
    </div>
  );
};

export default HistoricoPix;

