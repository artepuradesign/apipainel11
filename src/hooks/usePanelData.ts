
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loadSystemPanels, loadCustomModules, type SystemPanel } from '@/utils/personalizationStorage';

export const usePanelData = (painelId: string | undefined) => {
  const [panel, setPanel] = useState<SystemPanel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadPanelData = () => {
    try {
      console.log('usePanelData - Carregando dados do painel:', painelId);
      
      const panels = loadSystemPanels();
      console.log('usePanelData - Painéis disponíveis:', panels);
      
      const foundPanel = panels.find(p => p.id === painelId);
      console.log('usePanelData - Painel encontrado:', foundPanel);
      
      if (!foundPanel) {
        console.log('usePanelData - Painel não encontrado');
        toast.error('Painel não encontrado');
        navigate('/dashboard');
        return;
      }

      if (foundPanel.status !== 'ativo') {
        console.log('usePanelData - Painel não está ativo:', foundPanel.status);
        toast.error('Este painel não está ativo');
        navigate('/dashboard');
        return;
      }

      setPanel(foundPanel);
      
      // Carregar módulos do painel
      const allModules = loadCustomModules();
      const panelModules = allModules.filter(m => m.panelId === foundPanel.id);
      
      console.log('usePanelData - Todos os módulos:', allModules.length);
      console.log('usePanelData - Módulos do painel:', panelModules.length);
      console.log('usePanelData - Módulos filtrados:', panelModules);
      
    } catch (error) {
      console.error('usePanelData - Erro ao carregar dados do painel:', error);
      toast.error('Erro ao carregar painel');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (painelId) {
      loadPanelData();
    }
  }, [painelId]);

  return { panel, isLoading, loadPanelData };
};
