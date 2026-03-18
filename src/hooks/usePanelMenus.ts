import { useState, useEffect } from 'react';
import { SidebarItem } from '@/components/dashboard/layout/types';
import { loadPanelMenusFromApi } from '@/components/dashboard/layout/sidebar/panelMenus';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSubscription } from '@/hooks/useUserSubscription';

export const usePanelMenus = () => {
  const [panelMenus, setPanelMenus] = useState<SidebarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { hasActiveSubscription } = useUserSubscription();

  const isPremiumEnabled = user ? !!(user as any).premium_enabled : false;

  useEffect(() => {
    const loadPanels = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 [PANEL_HOOK] Carregando painéis para o menu...', { isPremiumEnabled, hasActiveSubscription });
        
        const menus = await loadPanelMenusFromApi(isPremiumEnabled, hasActiveSubscription);
        setPanelMenus(menus);
        
        console.log('✅ [PANEL_HOOK] Painéis carregados para o menu:', menus.length);
      } catch (error) {
        console.error('❌ [PANEL_HOOK] Erro ao carregar painéis:', error);
        setPanelMenus([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPanels();
  }, [isPremiumEnabled, hasActiveSubscription]);

  return { panelMenus, isLoading };
};
