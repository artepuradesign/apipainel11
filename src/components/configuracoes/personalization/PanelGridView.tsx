
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Package } from 'lucide-react';
import { Panel } from '@/utils/apiService';
import * as Icons from 'lucide-react';

interface PanelGridViewProps {
  panels: Panel[];
  onEdit: (panel: Panel) => void;
  onDelete: (panelId: number) => void;
}

const PanelGridView: React.FC<PanelGridViewProps> = ({
  panels,
  onEdit,
  onDelete
}) => {
  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent || Package;
  };

  if (panels.length === 0) {
    return (
      <div className="bg-white/75 dark:bg-gray-800/75 rounded-lg border border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm p-8">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum painel encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Comece criando seu primeiro painel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/75 dark:bg-gray-800/75 rounded-lg border border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-sm font-semibold">Painéis Disponíveis</CardTitle>
            <div className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-xs font-bold">
              {panels.length}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 pt-2">
        {panels.map((panel) => {
          const PanelIcon = getIconComponent(panel.icon);
          return (
            <div key={panel.id} className="group w-full">
              <Card className="w-full bg-white dark:bg-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 h-full flex flex-col">
                <CardContent className="p-3 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 rounded-lg border border-purple-200 dark:border-purple-700 shrink-0">
                      <PanelIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {panel.name}
                    </h3>
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 flex-grow">
                    {panel.description || 'Sem descrição'}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    {panel.is_premium ? (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-yellow-600 border-yellow-600">
                        Premium
                      </Badge>
                    ) : (
                      <span />
                    )}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(panel)}
                        className="h-7 px-2 text-xs"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(panel.id)}
                        className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PanelGridView;
