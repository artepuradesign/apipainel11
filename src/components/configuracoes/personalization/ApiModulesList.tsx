
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Loader2, Package } from 'lucide-react';
import { Module, Panel } from '@/utils/apiService';
import * as Icons from 'lucide-react';

interface ApiModulesListProps {
  modules: Module[];
  panels: Panel[];
  isLoading: boolean;
  onEdit: (module: Module) => void;
  onDelete: (moduleId: number) => void;
}

const ApiModulesList: React.FC<ApiModulesListProps> = ({ modules, panels, isLoading, onEdit, onDelete }) => {
  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent || Package;
  };

  const getPanelName = (panelId: number) => {
    const panel = panels.find(p => p.id === panelId);
    return panel?.name || 'Painel não encontrado';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on':
        return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
      case 'off':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="text-yellow-600">Manutenção</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando módulos...</span>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum módulo encontrado
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((module) => {
        const ModuleIcon = getIconComponent(module.icon);
        
        return (
          <div key={module.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <ModuleIcon className="h-5 w-5" style={{ color: module.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {module.title}
                  </span>
                  {getStatusBadge(module.operational_status)}
                  {module.is_premium && (
                    <Badge variant="outline" className="text-purple-600">
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {module.description}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Painel: {getPanelName(module.panel_id)} • Preço: {module.priceFormatted} • {module.category}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(module)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(module.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApiModulesList;
