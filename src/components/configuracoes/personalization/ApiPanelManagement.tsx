
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from 'lucide-react';
import { useApiPanels } from '@/hooks/useApiPanels';
import ApiPanelForm from './ApiPanelForm';
import PanelGridView from './PanelGridView';
import type { Panel } from '@/utils/apiService';

const ApiPanelManagement = () => {
  const { panels, isLoading, loadPanels, createPanel, updatePanel, deletePanel } = useApiPanels();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);

  const handleCreatePanel = () => {
    setEditingPanel(null);
    setShowCreateForm(true);
  };

  const handleEditPanel = (panel: Panel) => {
    setEditingPanel(panel);
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingPanel(null);
  };

  const handleFormSubmit = async (panelData: any) => {
    try {
      if (editingPanel) {
        await updatePanel(editingPanel.id, panelData);
      } else {
        await createPanel(panelData);
      }
      handleFormClose();
    } catch (error) {
      console.error('Erro ao salvar painel:', error);
    }
  };

  const handleDeletePanel = async (panelId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este painel? Esta ação não pode ser desfeita.')) {
      try {
        await deletePanel(panelId);
      } catch (error) {
        console.error('Erro ao excluir painel:', error);
      }
    }
  };

  if (showCreateForm) {
    return (
      <ApiPanelForm
        panel={editingPanel}
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
            Gerenciamento de Painéis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure e gerencie os painéis do sistema via API externa
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadPanels}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={handleCreatePanel}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Painel
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Carregando painéis da API...
          </span>
        </div>
      ) : (
        <PanelGridView
          panels={panels}
          onEdit={handleEditPanel}
          onDelete={handleDeletePanel}
        />
      )}
    </div>
  );
};

export default ApiPanelManagement;
