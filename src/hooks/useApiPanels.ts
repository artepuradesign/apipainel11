
import { useState, useEffect } from 'react';
import { panelService, type Panel } from '@/utils/apiService';
import { toast } from 'sonner';

export const useApiPanels = () => {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPanels = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 [PANELS] Iniciando carregamento de painéis...');
      
      const response = await panelService.getAll();
      
      console.log('📊 [PANELS] Resposta da API:', response);
      
      if (response.success && response.data) {
        setPanels(response.data);
        console.log('✅ [PANELS] Painéis carregados:', response.data.length, 'painéis');
        // Removido toast automático para evitar notificações desnecessárias na aba módulos
      } else {
        console.error('❌ [PANELS] Erro na resposta:', response.error);
        toast.error(response.error || 'Erro ao carregar painéis');
        setPanels([]);
      }
    } catch (error) {
      console.error('❌ [PANELS] Erro ao conectar com a API:', error);
      toast.error('Erro de conexão com a API de painéis');
      setPanels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createPanel = async (panelData: Omit<Panel, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🔄 [PANELS] Criando painel:', panelData);
      
      const response = await panelService.create(panelData);
      
      if (response.success) {
        toast.success('Painel criado com sucesso!');
        await loadPanels();
        return response.data;
      } else {
        console.error('❌ [PANELS] Erro ao criar:', response.error);
        toast.error(response.error || 'Erro ao criar painel');
        throw new Error(response.error || 'Erro ao criar painel');
      }
    } catch (error) {
      console.error('❌ [PANELS] Erro ao criar painel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updatePanel = async (id: number, panelData: Partial<Panel>) => {
    try {
      console.log('🔄 [PANELS] Atualizando painel:', id, panelData);
      
      const response = await panelService.update(id, panelData);
      
      if (response.success) {
        toast.success('Painel atualizado com sucesso!');
        await loadPanels();
      } else {
        console.error('❌ [PANELS] Erro ao atualizar:', response.error);
        toast.error(response.error || 'Erro ao atualizar painel');
        throw new Error(response.error || 'Erro ao atualizar painel');
      }
    } catch (error) {
      console.error('❌ [PANELS] Erro ao atualizar painel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      throw error;
    }
  };

  const deletePanel = async (id: number) => {
    try {
      console.log('🔄 [PANELS] Excluindo painel:', id);
      
      const response = await panelService.delete(id);
      
      if (response.success) {
        toast.success('Painel excluído com sucesso!');
        await loadPanels();
      } else {
        console.error('❌ [PANELS] Erro ao excluir:', response.error);
        toast.error(response.error || 'Erro ao excluir painel');
        throw new Error(response.error || 'Erro ao excluir painel');
      }
    } catch (error) {
      console.error('❌ [PANELS] Erro ao excluir painel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    console.log('🚀 [PANELS] Hook inicializado, carregando painéis...');
    loadPanels();
  }, []);

  return {
    panels,
    isLoading,
    loadPanels,
    createPanel,
    updatePanel,
    deletePanel
  };
};
