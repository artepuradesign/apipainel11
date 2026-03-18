
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, BarChart3, Users, Search } from 'lucide-react';
import { type DashboardStats } from '@/hooks/useApiDashboardAdmin';
import { useApiModules } from '@/hooks/useApiModules';

// Componente para exibir a contagem de módulos da API externa
const ModulesCount = () => {
  const { modules } = useApiModules();
  const activeModules = modules.filter(module => module.is_active === true);
  
  return (
    <div className="text-2xl font-bold text-blue-600">
      {activeModules.length}
    </div>
  );
};

interface AdminDetailedStatsProps {
  dashboardStats: DashboardStats | null;
  stats: {
    totalConsultations: number;
    consultationsToday: number;
  };
}

const AdminDetailedStats: React.FC<AdminDetailedStatsProps> = ({ dashboardStats, stats }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total em Recargas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total em Recargas</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(dashboardStats.total_recharges)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total recebido em recargas
          </p>
        </CardContent>
      </Card>

      {/* Total de Comissões */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Comissões</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(dashboardStats.total_commissions)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total pago em comissões
          </p>
        </CardContent>
      </Card>

      {/* Módulos Disponíveis - Usando API Externa */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Módulos</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ModulesCount />
          <p className="text-xs text-muted-foreground">
            Módulos disponíveis
          </p>
        </CardContent>
      </Card>

      {/* Consultas Realizadas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Consultas Realizadas</CardTitle>
          <Search className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardStats.total_consultations.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total de consultas realizadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDetailedStats;
