
import { SidebarItem } from '../types';
import { panelService, moduleService, Panel, Module } from '@/utils/apiService';
import * as Icons from 'lucide-react';

// Função síncrona que retorna array vazio como fallback
export const createPanelMenus = (): SidebarItem[] => {
  return [];
};

const getPanelColor = (color?: string): string => {
  if (!color || typeof color !== 'string') return '#7C3AED';
  const normalized = color.trim();
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(normalized) ? normalized : '#7C3AED';
};

// Hook para carregar painéis da API
export const loadPanelMenusFromApi = async (premiumEnabled: boolean = false, hasActiveSubscription: boolean = false): Promise<SidebarItem[]> => {
  try {
    console.log('🔄 [PANEL_MENU] Carregando painéis e módulos da API...');
    
    // Carregar dados da API
    const [panelsResponse, modulesResponse] = await Promise.all([
      panelService.getAll(),
      moduleService.getAll()
    ]);
    
    if (!panelsResponse.success || !modulesResponse.success) {
      console.error('❌ [PANEL_MENU] Erro ao carregar dados da API');
      return [];
    }
    
    const panels = panelsResponse.data || [];
    const modules = modulesResponse.data || [];
    
    // Filtrar apenas painéis ativos e aplicar lógica de premium
    const activePanels = panels.filter(panel => {
      if (!panel.is_active) return false;
      if (!(panel as any).is_premium) return true;
      if (premiumEnabled) return true;
      if (hasActiveSubscription) return true;
      return false;
    });
    
    return activePanels.map(panel => {
      // Filtrar módulos que pertencem a este painel e estão ativos
      const panelModules = modules.filter(module => 
        module.panel_id === panel.id && module.operational_status === 'on' && module.is_active === true
      );
      
      // Obter o componente do ícone com tipo correto
      const IconComponent = (Icons as any)[panel.icon] || Icons.Package;
      
      // Criar subitens para cada módulo do painel
      const subItems = panelModules.map(module => {
        const ModuleIconComponent = (Icons as any)[module.icon] || Icons.Package;

         const moduleRouteRaw = (module.api_endpoint || module.path || '').toString().trim();
         const moduleRoute = moduleRouteRaw.startsWith('/')
           ? moduleRouteRaw
           : moduleRouteRaw.startsWith('dashboard/')
             ? `/${moduleRouteRaw}`
             : !moduleRouteRaw.includes('/') && moduleRouteRaw
               ? `/dashboard/${moduleRouteRaw}`
               : '';
        
        return {
          icon: ModuleIconComponent,
          label: module.title,
           // `api_endpoint` agora representa a rota interna da página do módulo (ex.: /dashboard/consultar-cpf-simples)
           path: moduleRoute || `/module/${module.slug}`,
          description: module.description,
          price: module.price ? module.price.toString() : '0'
        };
      });
      
      // Se há módulos, criar submenu, senão link direto
      if (panelModules.length > 0) {
        return {
          icon: IconComponent,
          label: panel.name,
          path: `/dashboard/painel/${panel.id}`,
          subItems: subItems,
          moduleCount: panelModules.length,
          description: panel.description,
          iconColor: getPanelColor((panel as Panel).color)
        };
      } else {
        // Painel sem módulos, apenas link direto
        return {
          icon: IconComponent,
          label: panel.name,
          path: `/dashboard/painel/${panel.id}`,
          moduleCount: 0,
          description: panel.description,
          iconColor: getPanelColor((panel as Panel).color)
        };
      }
    });
  } catch (error) {
    console.error('Erro ao criar menus de painéis:', error);
    return [];
  }
};
