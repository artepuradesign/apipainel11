
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Package } from 'lucide-react';
import { Panel } from '@/utils/apiService';
import * as Icons from 'lucide-react';

interface ApiPanelsListProps {
  panels: Panel[];
  onEdit: (panel: Panel) => void;
  onDelete: (panelId: number) => void;
  onView: (panel: Panel) => void;
}

const ApiPanelsList: React.FC<ApiPanelsListProps> = ({
  panels,
  onEdit,
  onDelete,
  onView
}) => {
  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent || Package;
  };

  return (
    <div className="space-y-4">
      {panels.map((panel) => {
        const PanelIcon = getIconComponent(panel.icon);
        
        return (
          <div
            key={panel.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: panel.background_color || '#f8fafc',
                  borderColor: panel.color || '#6366f1'
                }}
              >
                <PanelIcon 
                  className="h-6 w-6" 
                  style={{ color: panel.color || '#6366f1' }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {panel.name}
                  </h3>
                  <Badge variant={panel.is_active ? "default" : "secondary"}>
                    {panel.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {panel.is_premium && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Premium
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {panel.description || 'Sem descrição'}
                </p>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Categoria: {panel.category}</span>
                  <span>Template: {panel.template}</span>
                  <span>Ordem: {panel.sort_order}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(panel)}
                className="p-2"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(panel)}
                className="p-2"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(panel.id)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
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

export default ApiPanelsList;
