import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RevendaToggle } from '@/components/revenda/RevendaToggle';
import { useAuth } from '@/contexts/AuthContext';
import { revendaService } from '@/services/revendaService';
import { API_BASE_URL } from '@/config/apiConfig';
import { cookieUtils } from '@/utils/cookieUtils';
import { RefreshCw, Store, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface RevendaHistorico {
  id: number;
  indicado_nome: string;
  indicado_email: string;
  status: string;
  plano_contratado_id: number | null;
  valor_plano: number;
  comissao_paga: number;
  total_comissao: number;
  data_ativacao_plano: string | null;
  data_pagamento_comissao: string | null;
  created_at: string;
}

interface DashboardStats {
  total_indicados: number;
  indicados_ativos: number;
  total_bonus: number;
  bonus_este_mes: number;
}

const textByLocale: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    sessionExpired: 'Sessão expirada. Faça login novamente.',
    loadError: 'Erro ao carregar dados de revenda',
    pageTitle: 'Revenda',
    totalReferrals: 'Total Indicados',
    activeReferrals: 'Indicados Ativos',
    totalCommissions: 'Total Comissões',
    thisMonth: 'Este Mês',
    historyTitle: 'Histórico de Revendas',
    historySubtitle: 'Comissões de 10% pagas quando seus indicados ativam planos',
    referred: 'Indicado',
    email: 'Email',
    status: 'Status',
    planValue: 'Valor Plano',
    commission: 'Comissão',
    paymentDate: 'Data Pagamento',
    notInformed: 'Não informado',
    paidOn: 'Pago em:',
    emptyTitle: 'Nenhuma revenda encontrada',
    emptyDesc: 'Quando seus indicados ativarem planos, as comissões aparecerão aqui',
    active: 'Ativo',
    pending: 'Pendente',
    inactive: 'Inativo',
  },
  en: {
    sessionExpired: 'Session expired. Please sign in again.',
    loadError: 'Error loading reseller data',
    pageTitle: 'Reseller',
    totalReferrals: 'Total Referrals',
    activeReferrals: 'Active Referrals',
    totalCommissions: 'Total Commissions',
    thisMonth: 'This Month',
    historyTitle: 'Reseller History',
    historySubtitle: '10% commissions paid when your referrals activate plans',
    referred: 'Referred',
    email: 'Email',
    status: 'Status',
    planValue: 'Plan Value',
    commission: 'Commission',
    paymentDate: 'Payment Date',
    notInformed: 'Not informed',
    paidOn: 'Paid on:',
    emptyTitle: 'No reseller records found',
    emptyDesc: 'When your referrals activate plans, commissions will appear here',
    active: 'Active',
    pending: 'Pending',
    inactive: 'Inactive',
  },
  es: {
    sessionExpired: 'Sesión expirada. Inicia sesión nuevamente.',
    loadError: 'Error al cargar datos de reventa',
    pageTitle: 'Reventa',
    totalReferrals: 'Total Referidos',
    activeReferrals: 'Referidos Activos',
    totalCommissions: 'Comisiones Totales',
    thisMonth: 'Este Mes',
    historyTitle: 'Historial de Reventa',
    historySubtitle: 'Comisiones del 10% pagadas cuando tus referidos activan planes',
    referred: 'Referido',
    email: 'Email',
    status: 'Estado',
    planValue: 'Valor del Plan',
    commission: 'Comisión',
    paymentDate: 'Fecha de Pago',
    notInformed: 'No informado',
    paidOn: 'Pagado en:',
    emptyTitle: 'No se encontraron reventas',
    emptyDesc: 'Cuando tus referidos activen planes, las comisiones aparecerán aquí',
    active: 'Activo',
    pending: 'Pendiente',
    inactive: 'Inactivo',
  },
};

const Revenda = () => {
  const { user } = useAuth();
  const { locale } = useLocale();
  const t = textByLocale[locale];
  const [historico, setHistorico] = useState<RevendaHistorico[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_indicados: 0,
    indicados_ativos: 0,
    total_bonus: 0,
    bonus_este_mes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const token = cookieUtils.get('session_token');
      const response = await fetch(`${API_BASE_URL}/revendas/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [REVENDA] Response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) {
          toast.error(t.sessionExpired);
        } else {
          toast.error(`${t.loadError} (${response.status})`);
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [REVENDA] Dashboard data:', result);

      if (result.success && result.data) {
        setStats(result.data.stats);
        setHistorico(result.data.referrals || []);
      } else {
        toast.error(result.message || 'Erro ao processar dados');
      }
    } catch (error) {
      console.error('❌ [REVENDA] Erro ao carregar dashboard:', error);
      if (error instanceof Error && !error.message.includes('401')) {
        toast.error(t.loadError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateString));
    } catch (error) {
      return '-';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      ativo: { className: 'bg-green-500', label: t.active },
      pendente: { className: 'bg-yellow-500', label: t.pending },
      inativo: { className: 'bg-gray-500', label: t.inactive }
    };

    const variant = variants[status] || variants.pendente;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      <DashboardTitleCard title={t.pageTitle} icon={<Store className="h-4 w-4 sm:h-5 sm:w-5" />} />
      <RevendaToggle />

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{t.totalReferrals}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.total_indicados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{t.activeReferrals}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.indicados_ativos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{t.totalCommissions}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{formatCurrency(stats.total_bonus)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{t.thisMonth}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{formatCurrency(stats.bonus_este_mes)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Revendas */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Store className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.historyTitle}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t.historySubtitle}
          </p>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {historico.length > 0 ? (
            <>
              {/* Layout Desktop - Tabela */}
              <div className="hidden sm:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.referred}</TableHead>
                      <TableHead>{t.email}</TableHead>
                      <TableHead>{t.status}</TableHead>
                      <TableHead className="text-right">{t.planValue}</TableHead>
                      <TableHead className="text-right">{t.commission}</TableHead>
                      <TableHead>{t.paymentDate}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historico.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.indicado_nome || t.notInformed}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.indicado_email || '-'}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          {item.valor_plano ? formatCurrency(item.valor_plano) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {item.comissao_paga ? formatCurrency(item.comissao_paga) : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(item.data_pagamento_comissao)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Layout Mobile - Cards */}
              <div className="sm:hidden space-y-3">
                {historico.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate flex-1">{item.indicado_nome || t.notInformed}</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.indicado_email || '-'}</p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">{t.planValue}</p>
                        <p className="text-sm font-medium">{item.valor_plano ? formatCurrency(item.valor_plano) : '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{t.commission}</p>
                        <p className="text-sm font-bold text-green-600">{item.comissao_paga ? formatCurrency(item.comissao_paga) : '-'}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t.paidOn} {formatDate(item.data_pagamento_comissao)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Store className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="font-medium text-sm sm:text-base">{t.emptyTitle}</p>
              <p className="text-xs sm:text-sm mt-2">
                {t.emptyDesc}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Revenda;
