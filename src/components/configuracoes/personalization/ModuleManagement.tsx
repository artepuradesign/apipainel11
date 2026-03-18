
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, RefreshCw, Loader2 } from 'lucide-react';
import { useApiModules } from '@/hooks/useApiModules';
import { Badge } from '@/components/ui/badge';

const ModuleManagement = () => {
  const { modules, isLoading, loadModules, createModule, updateModule, deleteModule } = useApiModules();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);

  const handleCreateModule = () => {
    setEditingModule(null);
    setShowCreateForm(true);
  };

  const handleEditModule = (module: any) => {
    setEditingModule(module);
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingModule(null);
  };

  const handleFormSubmit = async (moduleData: any) => {
    try {
      if (editingModule) {
        await updateModule(editingModule.id, moduleData);
      } else {
        await createModule(moduleData);
      }
      handleFormClose();
    } catch (error) {
      console.error('Erro ao salvar módulo:', error);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (confirm('Tem certeza que deseja excluir este módulo?')) {
      try {
        await deleteModule(moduleId);
      } catch (error) {
        console.error('Erro ao excluir módulo:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gerenciamento de Módulos (API)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure módulos do sistema via API externa
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadModules}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Módulos da API ({modules.length})
            </CardTitle>
            <Button
              onClick={handleCreateModule}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Módulo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Carregando módulos...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum módulo encontrado
                </div>
              ) : (
                modules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {module.title || module.name}
                          </span>
                          <Badge variant={module.is_active ? "default" : "secondary"}>
                            {module.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                          {module.is_premium && (
                            <Badge variant="outline" className="text-yellow-600">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {module.description}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          /{module.slug} • {module.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditModule(module)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteModule(module.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleManagement;
