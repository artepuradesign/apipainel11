
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, GripVertical } from 'lucide-react';
import { loadCustomModules, saveCustomModules, type CustomModule } from '@/utils/personalizationStorage';

const DraggableModuleList = () => {
  const [modules, setModules] = useState<CustomModule[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    const savedModules = loadCustomModules();
    setModules(savedModules);
  }, []);

  const handleDragStart = (e: React.DragEvent, moduleId: string) => {
    setDraggedItem(moduleId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = modules.findIndex(m => m.id === draggedItem);
    const targetIndex = modules.findIndex(m => m.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newModules = [...modules];
    const [draggedModule] = newModules.splice(draggedIndex, 1);
    newModules.splice(targetIndex, 0, draggedModule);

    setModules(newModules);
    saveCustomModules(newModules);
    setDraggedItem(null);
  };

  const getStatusBadge = (operationalStatus: string) => {
    switch (operationalStatus) {
      case 'on':
        return <Badge className="bg-green-500 text-white">ON</Badge>;
      case 'off':
        return <Badge className="bg-red-500 text-white">OFF</Badge>;
      case 'manutencao':
        return <Badge className="bg-yellow-500 text-white">MANUTENÇÃO</Badge>;
      default:
        return <Badge className="bg-green-500 text-white">ON</Badge>;
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-base text-gray-900 dark:text-white">
          Organizar Módulos ({modules.length})
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Arraste e solte para reorganizar a ordem de exibição dos módulos
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
          {modules.map((module) => (
            <div
              key={module.id}
              draggable
              onDragStart={(e) => handleDragStart(e, module.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, module.id)}
              className={`p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                draggedItem === module.id ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <Package className="h-4 w-4 text-purple-500" />
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {module.title}
                </div>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(module.operationalStatus)}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    R$ {module.price}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {modules.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum módulo encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DraggableModuleList;
