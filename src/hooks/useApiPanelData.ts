import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Panel, panelService } from '@/utils/apiService';

export const useApiPanelData = (painelId: string | undefined) => {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPanelData = async () => {
      if (!painelId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 [PANEL_DATA] Carregando dados do painel:', painelId);
        
        // Usar o service correto para buscar o painel
        const response = await panelService.getById(parseInt(painelId));
        
        console.log('📊 [PANEL_DATA] Resposta da API:', response);
        
        if (!response.success) {
          throw new Error(response.error || 'Erro ao carregar painel');
        }
        
        const foundPanel = response.data;
        console.log('🎯 [PANEL_DATA] Painel encontrado:', foundPanel);
        
        if (!foundPanel) {
          console.log('❌ [PANEL_DATA] Painel não encontrado');
          toast.error('Painel não encontrado');
          setPanel(null);
          setIsLoading(false);
          return;
        }

        if (!foundPanel.is_active) {
          console.log('❌ [PANEL_DATA] Painel não está ativo');
          toast.error('Este painel não está ativo');
          setPanel(null);
          setIsLoading(false);
          return;
        }

        setPanel(foundPanel);
        console.log('✅ [PANEL_DATA] Painel carregado com sucesso:', foundPanel.name);
        
      } catch (error) {
        console.error('❌ [PANEL_DATA] Erro ao carregar dados do painel:', error);
        toast.error('Erro ao carregar painel');
        setPanel(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPanelData();
  }, [painelId, navigate]);

  return { panel, isLoading };
};