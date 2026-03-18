import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Layout } from 'lucide-react';
import { useApiModules } from '@/hooks/useApiModules';
import { useApiPanels } from '@/hooks/useApiPanels';

const AdminModulesAndPanelsCards: React.FC = () => {
  const { modules } = useApiModules();
  const { panels } = useApiPanels();
  
  const activeModules = modules.filter(module => module.is_active === true);
  const activePanels = panels.filter(panel => panel.is_active === true);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Módulos */}
      <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium dashboard-text-primary">Módulos</CardTitle>
          <div className="p-2 bg-sky-500/10 rounded-lg">
            <Monitor className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold dashboard-text-primary mb-1">
            {activeModules.length}
          </div>
          <p className="text-xs dashboard-text-muted">
            Módulos disponíveis
          </p>
        </CardContent>
      </Card>

      {/* Painéis */}
      <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium dashboard-text-primary">Painéis</CardTitle>
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <Layout className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold dashboard-text-primary mb-1">
            {activePanels.length}
          </div>
          <p className="text-xs dashboard-text-muted">
            Painéis disponíveis
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminModulesAndPanelsCards;