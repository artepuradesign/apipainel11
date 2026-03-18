
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, RefreshCw, Loader2, Power, PowerOff, Edit, Trash2 } from 'lucide-react';
import { useApiModules } from '@/hooks/useApiModules';
import { useApiPanels } from '@/hooks/useApiPanels';
import ApiModuleForm from './ApiModuleForm';
import { Badge } from '@/components/ui/badge';

const ApiModuleManagement = () => {
  const { modules, isLoading, loadModules, createModule, updateModule, deleteModule, toggleModuleStatus } = useApiModules();
  const { panels, isLoading: panelsLoading } = useApiPanels();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);

  const handleCreateModule = () => {
    console.log('🔄 [MODULE_MANAGEMENT] Iniciando criação de novo módulo');
    setEditingModule(null);
    setShowCreateForm(true);
  };

  const handleEditModule = (module: any) => {
    console.log('🔄 [MODULE_MANAGEMENT] Iniciando edição do módulo:', module);
    setEditingModule(module);
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    console.log('🔄 [MODULE_MANAGEMENT] Fechando formulário');
    setShowCreateForm(false);
    setEditingModule(null);
  };

  const handleFormSubmit = async (moduleData: any) => {
    try {
      console.log('🔄 [MODULE_MANAGEMENT] Submetendo dados do formulário:', {
        isEditing: !!editingModule,
        moduleId: editingModule?.id,
        moduleData
      });

      if (editingModule) {
        console.log(`🔄 [MODULE_MANAGEMENT] Atualizando módulo ID ${editingModule.id}`);
        await updateModule(editingModule.id, moduleData);
        console.log('✅ [MODULE_MANAGEMENT] Módulo atualizado com sucesso');
      } else {
        console.log('🔄 [MODULE_MANAGEMENT] Criando novo módulo');
        await createModule(moduleData);
        console.log('✅ [MODULE_MANAGEMENT] Módulo criado com sucesso');
      }
      
      handleFormClose();
    } catch (error) {
      console.error('❌ [MODULE_MANAGEMENT] Erro ao salvar módulo:', error);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (confirm('Tem certeza que deseja excluir este módulo?')) {
      try {
        console.log(`🔄 [MODULE_MANAGEMENT] Excluindo módulo ID ${moduleId}`);
        await deleteModule(moduleId);
        console.log('✅ [MODULE_MANAGEMENT] Módulo excluído com sucesso');
      } catch (error) {
        console.error('❌ [MODULE_MANAGEMENT] Erro ao excluir módulo:', error);
      }
    }
  };

  const handleToggleStatus = async (moduleId: number) => {
    try {
      console.log(`🔄 [MODULE_MANAGEMENT] Alternando status do módulo ID ${moduleId}`);
      await toggleModuleStatus(moduleId);
      console.log('✅ [MODULE_MANAGEMENT] Status alternado com sucesso');
    } catch (error) {
      console.error('❌ [MODULE_MANAGEMENT] Erro ao alternar status:', error);
    }
  };

  if (showCreateForm) {
    return (
      <ApiModuleForm
        module={editingModule}
        panels={panels}
        onSubmit={handleFormSubmit}
        onCancel={handleFormClose}
      />
    );
  }

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
              disabled={isLoading || panelsLoading}
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
                  <div key={`module-${module.id}`} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {module.title}
                          </span>
                          <Badge variant={module.is_active ? "default" : "secondary"}>
                            {module.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                          {module.is_premium && (
                            <Badge variant="outline" className="text-yellow-600">
                              Premium
                            </Badge>
                          )}
                          <Badge variant={
                            module.operational_status === 'on' ? 'default' : 
                            module.operational_status === 'maintenance' ? 'secondary' : 'destructive'
                          }>
                            {module.operational_status === 'on' ? 'Operacional' : 
                             module.operational_status === 'maintenance' ? 'Manutenção' : 'Desligado'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {module.description}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {module.priceFormatted} • /{module.slug} • {module.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(module.id)}
                        title={module.operational_status === 'on' ? 'Desligar' : 'Ligar'}
                        className="p-2"
                      >
                        {module.operational_status === 'on' ? 
                          <PowerOff className="h-4 w-4" /> : 
                          <Power className="h-4 w-4" />
                        }
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditModule(module)}
                        title="Editar módulo"
                        className="p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteModule(module.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                        title="Excluir módulo"
                      >
                        <Trash2 className="h-4 w-4" />
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

export default ApiModuleManagement;
