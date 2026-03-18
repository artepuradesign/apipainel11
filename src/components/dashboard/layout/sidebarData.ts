
import { SidebarItem } from './types';
import { createAssinanteSidebarItems } from './sidebar/assinanteSidebarItems';
import { Locale } from '@/contexts/LocaleContext';

// Função principal que retorna os menus baseado no role do usuário
export const createSidebarItems = (handleLogout: () => void, isSupport: boolean = false, panelMenus: SidebarItem[] = [], locale: Locale = 'pt-BR'): SidebarItem[] => {
  return createAssinanteSidebarItems(handleLogout, panelMenus, isSupport, locale);
};

// Items administrativos removidos - agora estão integrados nos menus principais
export const adminItems: SidebarItem[] = [];
