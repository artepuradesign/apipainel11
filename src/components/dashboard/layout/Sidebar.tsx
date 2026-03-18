
import React from 'react';
import SidebarMenu from './sidebar/SidebarMenu';
import { SidebarItem } from './types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLiquidGlass } from '@/contexts/LiquidGlassContext';
import { localeContent, useLocale } from '@/contexts/LocaleContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  filteredItems: SidebarItem[];
  location: any;
  isMobile: boolean;
  isTablet: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isSubmenuActive: (subItems?: SidebarItem[]) => boolean;
  handleSubItemClick: (subItem: SidebarItem) => void;
}

const Sidebar = ({
  collapsed,
  setCollapsed,
  mobileMenuOpen,
  filteredItems,
  location,
  isMobile,
  isTablet,
  setMobileMenuOpen,
  isSubmenuActive,
  handleSubItemClick
}: SidebarProps) => {
  const { config: liquidGlassConfig } = useLiquidGlass();
  const { locale } = useLocale();
  const content = localeContent[locale];
  const handleSidebarClick = () => {
    // Em tablets, clicar na sidebar colapsada expande e fixa
    if (isTablet && collapsed) {
      setCollapsed(false);
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };

  return (
    <aside 
      className={`
        ${isMobile ? 'fixed mobile-sidebar' : 'relative'} 
        ${isMobile && !mobileMenuOpen ? 'hidden' : 'block'} 
        h-full 
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
        ${isMobile ? '' : liquidGlassConfig.enabled ? 'liquid-glass-container border-r border-white/20' : 'bg-card border-r border-border'} 
        flex flex-col
        z-30
        ${collapsed ? 'cursor-pointer' : ''}
      `}
      onClick={handleSidebarClick}
    >
      {/* Botão flutuante circular para expandir/recolher */}
      {!isMobile && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleToggleClick}
                className={`
                  absolute top-5 -right-2.5 z-50
                  w-5 h-5 rounded-full
                  bg-white dark:bg-gray-800
                  border border-primary/40 dark:border-primary/50
                  shadow-md hover:shadow-lg
                  flex items-center justify-center
                  transition-all duration-200
                  hover:bg-primary hover:border-primary
                  hover:text-white
                  text-primary dark:text-primary
                  group
                `}
                aria-label={collapsed ? content.sidebarExpandMenu : content.sidebarCollapseMenu}
              >
                {collapsed ? (
                  <ChevronRight size={12} className="transition-transform group-hover:scale-110" />
                ) : (
                  <ChevronLeft size={12} className="transition-transform group-hover:scale-110" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <p>{collapsed ? content.sidebarExpandMenu : content.sidebarCollapseMenu}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Menu Items */}
      <SidebarMenu
        filteredItems={filteredItems}
        location={location}
        collapsed={collapsed}
        isMobile={isMobile}
        isTablet={isTablet}
        setMobileMenuOpen={setMobileMenuOpen}
        isSubmenuActive={isSubmenuActive}
        handleSubItemClick={handleSubItemClick}
        setCollapsed={setCollapsed}
      />
    </aside>
  );
};

export default Sidebar;
