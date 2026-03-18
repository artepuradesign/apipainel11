
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, RefreshCw, Loader2 } from 'lucide-react';
import { useApiModules } from '@/hooks/useApiModules';
import { useApiPanels } from '@/hooks/useApiPanels';
import ApiModuleForm from './ApiModuleForm';
import ApiModuleEditForm from './ApiModuleEditForm';
import ApiModulesCardView from './ApiModulesCardView';

const ApiModulesManagement = () => {
  const { modules, isLoading: modulesLoading, loadModules, createModule, updateModule, deleteModule, toggleModuleStatus } = useApiModules();
  const { panels, isLoading: panelsLoading } = useApiPanels();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);

  console.log('🔍 [API_MODULES_MANAGEMENT] Estado atual:', {
    modulesCount: modules.length,
    panelsCount: panels.length,
    modulesLoading,
    panelsLoading,
    showCreateForm,
    editingModule: editingModule?.id
  });

  const handleCreateModule = () => {
    console.log('🔄 [API_MODULES_MANAGEMENT] Iniciando criação de novo módulo');
    setEditingModule(null);
    setShowCreateForm(true);
  };

  const handleEditModule = (module: any) => {
    console.log('🔄 [API_MODULES_MANAGEMENT] Iniciando edição do módulo:', module);
    setEditingModule(module);
    setShowCreateForm(false);
  };

  const handleFormClose = () => {
    console.log('🔄 [API_MODULES_MANAGEMENT] Fechando formulários');
    setShowCreateForm(false);
    setEditingModule(null);
  };

  const handleCreateSubmit = async (moduleData: any) => {
    try {
      console.log('🔄 [API_MODULES_MANAGEMENT] Criando novo módulo:', moduleData);
      await createModule(moduleData);
      console.log('✅ [API_MODULES_MANAGEMENT] Módulo criado com sucesso');
      handleFormClose();
    } catch (error) {
      console.error('❌ [API_MODULES_MANAGEMENT] Erro ao criar módulo:', error);
    }
  };

  const handleEditSubmit = async (moduleData: any) => {
    if (!editingModule) {
      console.error('❌ [API_MODULES_MANAGEMENT] Nenhum módulo sendo editado');
      return;
    }

    try {
      console.log('🔄 [API_MODULES_MANAGEMENT] Atualizando módulo:', {
        moduleId: editingModule.id,
        data: moduleData
      });
      
      await updateModule(editingModule.id, moduleData);
      console.log('✅ [API_MODULES_MANAGEMENT] Módulo atualizado com sucesso');
      handleFormClose();
    } catch (error) {
      console.error('❌ [API_MODULES_MANAGEMENT] Erro ao atualizar módulo:', error);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (confirm('Tem certeza que deseja excluir este módulo?')) {
      try {
        console.log(`🔄 [API_MODULES_MANAGEMENT] Excluindo módulo ID ${moduleId}`);
        await deleteModule(moduleId);
        console.log('✅ [API_MODULES_MANAGEMENT] Módulo excluído com sucesso');
      } catch (error) {
        console.error('❌ [API_MODULES_MANAGEMENT] Erro ao excluir módulo:', error);
      }
    }
  };

  const handleToggleStatus = async (moduleId: number) => {
    try {
      console.log(`🔄 [API_MODULES_MANAGEMENT] Alternando status do módulo ID ${moduleId}`);
      await toggleModuleStatus(moduleId);
      console.log('✅ [API_MODULES_MANAGEMENT] Status alternado com sucesso');
    } catch (error) {
      console.error('❌ [API_MODULES_MANAGEMENT] Erro ao alternar status:', error);
    }
  };

  const isLoading = modulesLoading || panelsLoading;

  // Renderizar formulário de criação
  if (showCreateForm) {
    return (
      <ApiModuleForm
        module={null}
        panels={panels}
        onSubmit={handleCreateSubmit}
        onCancel={handleFormClose}
      />
    );
  }

  // Renderizar formulário de edição
  if (editingModule) {
    return (
      <ApiModuleEditForm
        module={editingModule}
        panels={panels}
        onSubmit={handleEditSubmit}
        onCancel={handleFormClose}
      />
    );
  }

  // Renderizar visualização em cards
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
          <Button
            onClick={handleCreateModule}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Módulo
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando dados...</span>
          </CardContent>
        </Card>
      ) : modules.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum módulo encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comece criando seu primeiro módulo para o sistema.
            </p>
            <Button onClick={handleCreateModule} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Módulo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ApiModulesCardView
          modules={modules}
          panels={panels}
          onEdit={handleEditModule}
          onDelete={handleDeleteModule}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
};

export default ApiModulesManagement;
