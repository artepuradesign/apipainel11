import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useApiPanels } from '@/hooks/useApiPanels';
import { useAuth } from '@/contexts/AuthContext';
import { ModuleTemplateProvider } from '@/contexts/ModuleTemplateContext';
import PanelsGrid from '@/components/dashboard/PanelsGrid';
import EmptyState from '@/components/ui/empty-state';
import * as Icons from 'lucide-react';

const ModulosContent = () => {
  const { panels, isLoading } = useApiPanels();

  // Filtrar apenas painéis de consulta ativos
  const consultaPanels = useMemo(() => {
    if (!Array.isArray(panels)) return [];
    return panels.filter(p => 
      p.is_active && 
      (p.name?.toLowerCase().includes('consult') || p.category?.toLowerCase().includes('consult'))
    );
  }, [panels]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icons.Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (consultaPanels.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhum painel de consulta ativo"
        description="Nenhum módulo de consulta disponível no momento."
      />
    );
  }

  return (
    <ModuleTemplateProvider>
      <div className="space-y-6 w-full">
        <PanelsGrid activePanels={consultaPanels} />
      </div>
    </ModuleTemplateProvider>
  );
};

const Modulos = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <ModulosContent />
    </DashboardLayout>
  );
};

export default Modulos;
