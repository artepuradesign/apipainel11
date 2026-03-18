import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleCounter } from '@/components/ui/simple-counter';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Gift, 
  UserCheck,
  QrCode,
  Ticket,
  Settings,
  Grid3X3,
  UserPlus,
  ClipboardList,
  CheckCircle,
  PackageCheck,
  ShoppingCart
} from 'lucide-react';
import { type DashboardStats } from '@/hooks/useApiDashboardAdmin';
import { pdfRgService } from '@/services/pdfRgService';
import { editarPdfService } from '@/services/pdfPersonalizadoService';
import { sistemasDominioComService } from '@/services/sistemasDominioComService';
import { sistemasDominioComBrService } from '@/services/sistemasDominioComBrService';
import { sistemasHospedagemVps6Service } from '@/services/sistemasHospedagemVps6Service';

interface UnifiedAdminStatsCardsProps {
  dashboardStats: DashboardStats | null;
}

const UnifiedAdminStatsCards: React.FC<UnifiedAdminStatsCardsProps> = ({ dashboardStats }) => {
  const navigate = useNavigate();
  const [pedidoStats, setPedidoStats] = useState({ pendentes: 0, aprovados: 0, finalizados: 0, total: 0, total_valor: 0 });

  useEffect(() => {
    const loadPedidoStats = async () => {
      try {
        const [
          pdfRes,
          editRes,
          dominioComPendentesRes,
          dominioComAprovadosRes,
          dominioComFinalizadosRes,
          dominioComTotalRes,
          dominioComBrPendentesRes,
          dominioComBrTotalRes,
          vpsPendentesRes,
          vpsAprovadosRes,
          vpsFinalizadosRes,
          vpsTotalRes,
        ] = await Promise.all([
          pdfRgService.listar({ limit: 1000 }).catch(() => ({ success: false, data: null })),
          editarPdfService.stats().catch(() => ({ success: false, data: null })),
          sistemasDominioComService.listAdmin({ limit: 1, status: 'registrado' }).catch(() => ({ success: false, data: null })),
          sistemasDominioComService.listAdmin({ limit: 1, status: 'em_propagacao' }).catch(() => ({ success: false, data: null })),
          sistemasDominioComService.listAdmin({ limit: 1, status: 'finalizado' }).catch(() => ({ success: false, data: null })),
          sistemasDominioComService.listAdmin({ limit: 1000 }).catch(() => ({ success: false, data: null })),
          sistemasDominioComBrService.listAdmin({ limit: 1, status: 'registrado' }).catch(() => ({ success: false, data: null })),
          sistemasDominioComBrService.listAdmin({ limit: 1000 }).catch(() => ({ success: false, data: null })),
          sistemasHospedagemVps6Service.listAdmin({ limit: 1, status: 'registrado' }).catch(() => ({ success: false, data: null })),
          sistemasHospedagemVps6Service.listAdmin({ limit: 1, status: 'em_configuracao' }).catch(() => ({ success: false, data: null })),
          sistemasHospedagemVps6Service.listAdmin({ limit: 1, status: 'finalizado' }).catch(() => ({ success: false, data: null })),
          sistemasHospedagemVps6Service.listAdmin({ limit: 1000 }).catch(() => ({ success: false, data: null })),
        ]);

        const getTotal = (res: any) => Number(res?.data?.pagination?.total || 0);
        const getValorTotal = (res: any, field: 'valor_cobrado' | 'preco_pago') =>
          (res?.data?.data || []).reduce((acc: number, item: any) => acc + Number(item?.[field] || 0), 0);

        let pendentes = 0, aprovados = 0, finalizados = 0, total = 0, totalValor = 0;

        if (pdfRes.success && pdfRes.data?.data) {
          pdfRes.data.data.forEach((p: any) => {
            total++;
            totalValor += Number(p.preco_pago || 0);
            if (p.status === 'pagamento_confirmado') pendentes++;
            else if (p.status === 'em_confeccao') aprovados++;
            else if (p.status === 'entregue') finalizados++;
          });
        }

        if (editRes.success && editRes.data) {
          const s = editRes.data;
          pendentes += Number(s.pendentes || 0);
          aprovados += Number(s.aprovados || 0);
          finalizados += Number(s.finalizados || 0);
          total += Number(s.total || 0);
          totalValor += Number(s.total_valor || 0);
        }

        pendentes += getTotal(dominioComPendentesRes) + getTotal(dominioComBrPendentesRes) + getTotal(vpsPendentesRes);
        aprovados += getTotal(dominioComAprovadosRes) + getTotal(vpsAprovadosRes);
        finalizados += getTotal(dominioComFinalizadosRes) + getTotal(vpsFinalizadosRes);

        total += getTotal(dominioComTotalRes) + getTotal(dominioComBrTotalRes) + getTotal(vpsTotalRes);
        totalValor += getValorTotal(dominioComTotalRes, 'valor_cobrado') + getValorTotal(dominioComBrTotalRes, 'valor_cobrado') + getValorTotal(vpsTotalRes, 'valor_cobrado');

        setPedidoStats({ pendentes, aprovados, finalizados, total, total_valor: totalValor });
      } catch (e) {
        console.warn('Erro ao carregar stats de pedidos:', e);
      }
    };

    loadPedidoStats();
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleCardClick = (path: string) => {
    navigate(path);
  };
  if (!dashboardStats) {
    return (
      <div className="space-y-4">
        {/* Linha 1 - Financeiro Principal */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
           {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
                  Carregando...
                </CardTitle>
                <div className="h-6 w-6 lg:h-8 lg:w-8 bg-muted rounded"></div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-6 lg:h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Linha 2 - Métodos de Pagamento */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
           {[...Array(2)].map((_, i) => (
            <Card key={i + 4} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
                  Carregando...
                </CardTitle>
                <div className="h-6 w-6 lg:h-8 lg:w-8 bg-muted rounded"></div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-6 lg:h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Linha 3 - Sistema e Usuários */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i + 8} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
                  Carregando...
                </CardTitle>
                <div className="h-6 w-6 lg:h-8 lg:w-8 bg-muted rounded"></div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-6 lg:h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Linha 1 - Financeiro Principal
  const financialData = [
    {
      title: "Saldo em Caixa",
      rawValue: dashboardStats.cash_balance,
      isCurrency: true,
      icon: DollarSign,
      bgColor: "bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400",
      description: "Saldo total do caixa central",
      path: "/dashboard/admin/caixa"
    },
    {
      title: "Compra de Planos",
      rawValue: dashboardStats.plan_sales || 0,
      isCurrency: true,
      icon: CreditCard,
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      description: "Valor total das compras de planos",
      path: "/dashboard/admin/compra-planos"
    },
    {
      title: "Total em Recargas",
      rawValue: dashboardStats.total_recharges,
      isCurrency: true,
      icon: TrendingUp,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      description: "Total recebido em recargas",
      path: "/dashboard/admin/recargas"
    },
    {
      title: "Total de Indicações",
      rawValue: dashboardStats.total_referrals,
      displayValue: `${dashboardStats.total_referrals} / ${formatCurrency(dashboardStats.total_commissions)}`,
      isCurrency: false,
      icon: Gift,
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      description: "Quantidade / Valor pago",
      path: "/dashboard/admin/indicacoes"
    }
  ];

  // Linha 2 - Métodos de Pagamento
  const paymentData = [
    {
      title: "Pagamento PIX",
      rawValue: dashboardStats.payment_pix || 0,
      isCurrency: true,
      icon: QrCode,
      bgColor: "bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400",
      description: "Transações instantâneas PIX",
      path: "/dashboard/admin/pagamentos-pix"
    },
    {
      title: "Cartão de Crédito",
      rawValue: dashboardStats.payment_card || 0,
      isCurrency: true,
      icon: CreditCard,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      description: "Pagamentos processados via cartão",
      path: "/dashboard/admin/pagamentos-cartao"
    },
    {
      title: "PayPal",
      rawValue: dashboardStats.payment_paypal || 0,
      isCurrency: true,
      icon: DollarSign,
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      description: "Pagamentos internacionais",
      path: "/dashboard/admin/pagamentos-paypal"
    },
    {
      title: "Total Cupom Usados",
      rawValue: dashboardStats.total_coupons_used || 0,
      isCurrency: true,
      icon: Ticket,
      bgColor: "bg-yellow-500/10",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      description: "Cupons de desconto utilizados",
      path: "/dashboard/admin/cupons"
    }
  ];

  // Linha 3 - Sistema e Usuários
  const systemData = [
    {
      title: "Painéis Ativos",
      rawValue: dashboardStats.active_plans || 0,
      isCurrency: false,
      icon: Settings,
      bgColor: "bg-cyan-500/10",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      description: "Painéis atualmente ativos",
      path: "/dashboard/admin/paineis-ativos"
    },
    {
      title: "Módulos Total",
      rawValue: dashboardStats.total_modules || 0,
      isCurrency: false,
      icon: Grid3X3,
      bgColor: "bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      description: "Módulos disponíveis no sistema",
      path: "/dashboard/admin/modulos"
    },
    {
      title: "Usuários Ativos",
      rawValue: dashboardStats.users_online || 0,
      isCurrency: false,
      icon: UserCheck,
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      description: "Usuários ativos nos últimos 5 min",
      path: "/dashboard/admin/usuarios-online"
    },
    {
      title: "Total de Usuários",
      rawValue: dashboardStats.total_users,
      isCurrency: false,
      icon: Users,
      bgColor: "bg-red-500/10",
      iconColor: "text-red-600 dark:text-red-400",
      description: "Usuários registrados",
      path: "/dashboard/gestao-usuarios"
    }
  ];

  const renderCardRow = (data: typeof financialData, title?: string) => (
    <div className="space-y-2">
      {title && <h3 className="text-lg font-semibold dashboard-text-primary">{title}</h3>}
      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        {data.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className="dashboard-card hover:shadow-lg transition-all duration-300 min-h-[120px] lg:min-h-[140px]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium dashboard-text-primary line-clamp-2 leading-tight">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 lg:p-2 ${stat.bgColor} rounded-lg flex-shrink-0`}>
                  <Icon className={`h-3 w-3 lg:h-4 lg:w-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-1 lg:pt-2">
                <div className="text-lg lg:text-2xl font-bold dashboard-text-primary mb-1 line-clamp-1">
                  <SimpleCounter 
                    value={stat.rawValue} 
                    className="inline"
                    duration={5000}
                    formatAsCurrency={stat.isCurrency}
                  />
                </div>
                <p className="text-xs dashboard-text-muted leading-tight line-clamp-2">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const allCards = [...financialData, ...paymentData, ...systemData] as Array<typeof financialData[0] & { displayValue?: string }>;

  const renderCard = (stat: any, index: number) => {
    const Icon = stat.icon;
    return (
      <Card 
        key={index} 
        className="dashboard-card hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 cursor-pointer group overflow-hidden relative"
        onClick={() => handleCardClick(stat.path)}
      >
        {/* Subtle gradient accent on top */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${stat.bgColor} opacity-60`} />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-5">
          <CardTitle className="text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary/80 transition-colors">
            {stat.title}
          </CardTitle>
          <div className={`p-2 lg:p-2.5 ${stat.bgColor} rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-4 w-4 lg:h-5 lg:w-5 ${stat.iconColor}`} />
          </div>
        </CardHeader>
        <CardContent className="pt-1 pb-4">
          <div className="text-xl lg:text-2xl font-extrabold tracking-tight dashboard-text-primary mb-1.5">
            {stat.displayValue || (
              <SimpleCounter 
                value={stat.rawValue} 
                className="inline"
                duration={5000}
                formatAsCurrency={stat.isCurrency}
              />
            )}
          </div>
          <p className="text-[10px] lg:text-xs text-muted-foreground/80 leading-snug group-hover:text-foreground/60 transition-colors">
            {stat.description}
          </p>
        </CardContent>
      </Card>
    );
  };

  const pedidosData = [
    {
      title: "Pedidos Aprovados",
      rawValue: pedidoStats.pendentes,
      isCurrency: false,
      icon: CheckCircle,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      description: "Aguardando produção",
      path: "/dashboard/admin/pedidos?status=pagamento_confirmado"
    },
    {
      title: "Em Confecção",
      rawValue: pedidoStats.aprovados,
      isCurrency: false,
      icon: ClipboardList,
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      description: "Em processo de confecção",
      path: "/dashboard/admin/pedidos?status=em_confeccao"
    },
    {
      title: "Pedidos Finalizados",
      rawValue: pedidoStats.finalizados,
      isCurrency: false,
      icon: PackageCheck,
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      description: "Entregues ao cliente",
      path: "/dashboard/admin/pedidos?status=entregue"
    },
    {
      title: "Total de Pedidos",
      rawValue: pedidoStats.total,
      displayValue: `${pedidoStats.total} / ${formatCurrency(pedidoStats.total_valor)}`,
      isCurrency: false,
      icon: ShoppingCart,
      bgColor: "bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
      description: "Quantidade / Valor total",
      path: "/dashboard/admin/pedidos"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Linha 0 - Pedidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {pedidosData.map((stat, i) => renderCard(stat, i + 100))}
      </div>
      {/* Linha 1 - Financeiro */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {financialData.map((stat, i) => renderCard(stat, i))}
      </div>
      {/* Linha 2 - Pagamentos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {paymentData.map((stat, i) => renderCard(stat, i + 4))}
      </div>
      {/* Linha 3 - Sistema */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {systemData.map((stat, i) => renderCard(stat, i + 8))}
      </div>
    </div>
  );
};

export default UnifiedAdminStatsCards;