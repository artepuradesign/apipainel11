
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ChevronRight, LogOut } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import TextLogo from '../../TextLogo';
import { SidebarItem } from './types';

interface ModernSidebarProps {
  sidebarItems: SidebarItem[];
  location: any;
  isMobile: boolean;
}

const ModernSidebar = ({ sidebarItems, location, isMobile }: ModernSidebarProps) => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredSubItem, setHoveredSubItem] = useState<string | null>(null);

  const handleItemClick = (item: SidebarItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path !== '#') {
      navigate(item.path);
    }
  };

  const isActive = (item: SidebarItem): boolean => {
    if (item.subItems) {
      return item.subItems.some(subItem => {
        if (subItem.subItems) {
          return subItem.subItems.some(nestedItem => location.pathname === nestedItem.path);
        }
        return location.pathname === subItem.path;
      });
    }
    return location.pathname === item.path;
  };

  const renderNestedSubmenu = (subItem: SidebarItem, parentLabel: string) => {
    if (!subItem.subItems || hoveredSubItem !== subItem.label) return null;

    return (
      <div 
        className="absolute left-full top-0 ml-2 z-[60] min-w-[220px] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-in slide-in-from-left-2 duration-200"
        onMouseEnter={() => setHoveredSubItem(subItem.label)}
        onMouseLeave={() => setHoveredSubItem(null)}
      >
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 mb-1">
          {subItem.label}
        </div>
        {subItem.subItems.map((nestedItem) => {
          const NestedIcon = nestedItem.icon;
          const isNestedActive = location.pathname === nestedItem.path;
          
          return (
            <button
              key={nestedItem.path}
              onClick={() => handleItemClick(nestedItem)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                isNestedActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <NestedIcon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{nestedItem.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderSubmenu = (item: SidebarItem) => {
    if (!item.subItems || hoveredItem !== item.label) return null;

    return (
      <div 
        className="absolute left-full top-0 ml-2 z-50 min-w-[220px] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-in slide-in-from-left-2 duration-200"
        onMouseEnter={() => setHoveredItem(item.label)}
        onMouseLeave={() => {
          setHoveredItem(null);
          setHoveredSubItem(null);
        }}
      >
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 mb-1">
          {item.label}
        </div>
        {item.subItems.map((subItem) => {
          const SubIcon = subItem.icon;
          const hasNestedSubItems = subItem.subItems && subItem.subItems.length > 0;
          const isSubActive = subItem.subItems 
            ? subItem.subItems.some(nested => location.pathname === nested.path)
            : location.pathname === subItem.path;
          
          return (
            <div 
              key={subItem.path} 
              className="relative"
              onMouseLeave={() => hasNestedSubItems && setHoveredSubItem(null)}
            >
              <button
                onClick={() => !hasNestedSubItems && handleItemClick(subItem)}
                onMouseEnter={() => hasNestedSubItems && setHoveredSubItem(subItem.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  isSubActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <SubIcon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{subItem.label}</span>
                {hasNestedSubItems && (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                {subItem.moduleCount !== undefined && subItem.moduleCount > 0 && !hasNestedSubItems && (
                  <div className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-xs font-bold">
                    {subItem.moduleCount}
                  </div>
                )}
              </button>
              {renderNestedSubmenu(subItem, item.label)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMenuItem = (item: SidebarItem) => {
    const Icon = item.icon;
    const active = isActive(item);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const hasModuleCount = typeof item.moduleCount === 'number' && item.moduleCount > 0;
    const isPanelItem = item.subItems && item.label !== 'Consultas' && item.path.includes('/painel/');
    const shouldShowModuleCount = isPanelItem && hasModuleCount;

    return (
      <SidebarMenuItem key={item.path} className="relative">
        <SidebarMenuButton 
          asChild
          isActive={active}
          className="group"
        >
          <div
            onMouseEnter={() => hasSubItems && setHoveredItem(item.label)}
            onMouseLeave={() => !hasSubItems && setHoveredItem(null)}
            onClick={() => handleItemClick(item)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
              active 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            } ${item.className || ''}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            
            {/* Module Count Badge */}
            {shouldShowModuleCount && (
              <div className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-xs font-bold">
                {item.moduleCount}
              </div>
            )}
            
            {/* Chevron for items with submenus */}
            {hasSubItems && (
              <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            )}
          </div>
        </SidebarMenuButton>
        
        {/* Render submenu */}
        {renderSubmenu(item)}
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900">
        <div className="flex items-center justify-between">
          <TextLogo to="/" />
          <SidebarTrigger className="ml-auto h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-3">
        <SidebarMenu className="space-y-1">
          {sidebarItems.map(renderMenuItem)}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/50">
        {/* Footer vazio - ícones de redes sociais removidos */}
      </SidebarFooter>
    </Sidebar>
  );
};

export default ModernSidebar;
