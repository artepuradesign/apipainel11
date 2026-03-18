
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, CreditCard, Gift, Monitor, Layout } from 'lucide-react';
import { useApiModules } from '@/hooks/useApiModules';
import { useApiPanels } from '@/hooks/useApiPanels';
import { useOnlineUsersAdmin } from '@/hooks/useOnlineUsersAdmin';
import { SimpleCounter } from '@/components/ui/simple-counter';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { type DashboardStats } from '@/hooks/useApiDashboardAdmin';

interface AdminStatsCardsProps {
  dashboardStats: DashboardStats | null;
}

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ dashboardStats }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!dashboardStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {/* Saldo em Caixa */}
      <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium dashboard-text-primary line-clamp-1">Caixa</CardTitle>
          <div className="p-1.5 lg:p-2 bg-green-500/10 rounded-lg">
            <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-1 lg:pt-2">
          <SimpleCounter 
            value={dashboardStats.cash_balance}
            className="text-lg lg:text-2xl font-bold dashboard-text-primary mb-1"
            duration={1200}
            formatAsCurrency={true}
          />
          <p className="text-xs dashboard-text-muted leading-tight line-clamp-2">
            Saldo total do caixa central
          </p>
        </CardContent>
      </Card>

      {/* Compra de Planos */}
      <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium dashboard-text-primary line-clamp-1">Planos</CardTitle>
          <div className="p-1.5 lg:p-2 bg-purple-500/10 rounded-lg">
            <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-1 lg:pt-2">
          <SimpleCounter 
            value={dashboardStats.plan_sales || 0}
            className="text-lg lg:text-2xl font-bold dashboard-text-primary mb-1"
            duration={1200}
            formatAsCurrency={true}
          />
          <p className="text-xs dashboard-text-muted leading-tight line-clamp-2">
            Valor total das compras de planos
          </p>
        </CardContent>
      </Card>

      {/* Total em Recargas */}
      <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium dashboard-text-primary line-clamp-1">Recargas</CardTitle>
          <div className="p-1.5 lg:p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-1 lg:pt-2">
          <SimpleCounter 
            value={dashboardStats.total_recharges}
            className="text-lg lg:text-2xl font-bold dashboard-text-primary mb-1"
            duration={1200}
            formatAsCurrency={true}
          />
          <p className="text-xs dashboard-text-muted leading-tight line-clamp-2">
            Total recebido em recargas
          </p>
        </CardContent>
      </Card>

      {/* Total de Comissões */}
      <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium dashboard-text-primary line-clamp-1">Indicações</CardTitle>
          <div className="p-1.5 lg:p-2 bg-orange-500/10 rounded-lg">
            <Gift className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-1 lg:pt-2">
          <SimpleCounter 
            value={dashboardStats.total_commissions}
            className="text-lg lg:text-2xl font-bold dashboard-text-primary mb-1"
            duration={1200}
            formatAsCurrency={true}
          />
          <p className="text-xs dashboard-text-muted leading-tight line-clamp-2">
            Total pago em indicações
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const AdminStatsCardsSecondRow: React.FC<AdminStatsCardsProps> = ({ dashboardStats }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const { modules } = useApiModules();
  const { panels } = useApiPanels();
  const { onlineCount } = useOnlineUsersAdmin();
  const activeModules = modules.filter(module => module.is_active === true);
  const activePanels = panels.filter(panel => panel.is_active === true);

  if (!dashboardStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {/* Total de Usuários */}
      <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium dashboard-text-primary line-clamp-1">Usuários</CardTitle>
          <div className="p-1.5 lg:p-2 bg-indigo-500/10 rounded-lg">
            <Users className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-1 lg:pt-2">
          <AnimatedCounter 
            value={dashboardStats.total_users}
            className="text-lg lg:text-2xl font-bold dashboard-text-primary mb-1"
          />
          <p className="text-xs dashboard-text-muted leading-tight line-clamp-2">
            Usuários registrados
          </p>
        </CardContent>
      </Card>

      {/* Usuários Online */}
      <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium dashboard-text-primary line-clamp-1">Online</CardTitle>
          <div className="p-1.5 lg:p-2 bg-emerald-500/10 rounded-lg">
            <Users className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-1 lg:pt-2">
          <AnimatedCounter 
            value={onlineCount}
            className="text-lg lg:text-2xl font-bold dashboard-text-primary mb-1"
          />
          <p className="text-xs dashboard-text-muted leading-tight line-clamp-2">
            Usuários ativos
          </p>
        </CardContent>
      </Card>

      {/* Módulos */}
      <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium dashboard-text-primary line-clamp-1">Módulos</CardTitle>
          <div className="p-1.5 lg:p-2 bg-sky-500/10 rounded-lg">
            <Monitor className="h-4 w-4 lg:h-5 lg:w-5 text-sky-600 dark:text-sky-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-1 lg:pt-2">
          <SimpleCounter 
            value={activeModules.length}
            className="text-lg lg:text-2xl font-bold dashboard-text-primary mb-1"
            duration={2000}
          />
          <p className="text-xs dashboard-text-muted leading-tight line-clamp-2">
            Módulos disponíveis
          </p>
        </CardContent>
      </Card>

      {/* Painéis */}
      <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium dashboard-text-primary line-clamp-1">Painéis</CardTitle>
          <div className="p-1.5 lg:p-2 bg-rose-500/10 rounded-lg">
            <Layout className="h-4 w-4 lg:h-5 lg:w-5 text-rose-600 dark:text-rose-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-1 lg:pt-2">
          <SimpleCounter 
            value={activePanels.length}
            className="text-lg lg:text-2xl font-bold dashboard-text-primary mb-1"
            duration={2000}
          />
          <p className="text-xs dashboard-text-muted leading-tight line-clamp-2">
            Painéis disponíveis
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export { AdminStatsCardsSecondRow };
export default AdminStatsCards;
