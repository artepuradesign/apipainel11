
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarItem } from '../types';
import RegularSubmenu from './RegularSubmenu';
import PanelSubmenu from './PanelSubmenu';

interface SidebarMenuItemProps {
  item: SidebarItem;
  collapsed: boolean;
  isMobile: boolean;
  isSubmenuActive: (subItems?: SidebarItem[]) => boolean;
  onMouseEnter?: (itemLabel: string, event: React.MouseEvent) => void;
  onMouseLeave?: (itemLabel: string) => void;
  getHoverState?: (itemLabel: string) => boolean;
  handleSubmenuMouseEnter?: () => void;
  handleSubItemClick?: (subItem: SidebarItem) => void;
  setMobileMenuOpen?: (open: boolean) => void;
  location: any;
  hoverTimeouts?: React.MutableRefObject<{[key: string]: NodeJS.Timeout}>;
  cancelTimeout?: (itemLabel: string) => void;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  item,
  collapsed,
  isMobile,
  isSubmenuActive,
  onMouseEnter,
  onMouseLeave,
  getHoverState,
  handleSubmenuMouseEnter,
  handleSubItemClick,
  setMobileMenuOpen,
  location,
  hoverTimeouts,
  cancelTimeout
}) => {
  const Icon = item.icon;
  const isActive = location.pathname === item.path || 
                  (item.subItems && isSubmenuActive(item.subItems));

  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    }
    if (isMobile && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const handleMouseEnterItem = (event: React.MouseEvent) => {
    if (onMouseEnter && collapsed) {
      onMouseEnter(item.label, event);
    }
  };

  const handleMouseLeaveItem = () => {
    if (onMouseLeave && collapsed) {
      onMouseLeave(item.label);
    }
  };

  const hasModuleCount = typeof item.moduleCount === 'number' && item.moduleCount > 0;
  const moduleCount = item.moduleCount || 0;
  const isHovered = getHoverState ? getHoverState(item.label) : false;

  // Determine if this is a panel item (has subItems that aren't the standard consultation types)
  const isPanelItem = !!item.subItems && item.path.includes('/painel/');
  
  // Show module count for panel items that have modules
  const shouldShowModuleCount = isPanelItem && hasModuleCount;

  return (
    <li className="relative">
      {item.subItems ? (
        <div 
          className={`group flex items-center justify-between w-full px-3 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
            isActive ? 'bg-gray-100 dark:bg-gray-800 text-brand-purple dark:text-brand-purple font-medium' : 'text-gray-700 dark:text-gray-300'
          }`}
          onMouseEnter={handleMouseEnterItem}
          onMouseLeave={handleMouseLeaveItem}
        >
          <div className="flex items-center">
            <Icon className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
            {!collapsed && (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">{item.label}</span>
                <div className="flex items-center gap-2">
                  {shouldShowModuleCount && (
                    <div className="flex items-center justify-center w-5 h-5 bg-brand-purple text-white rounded-full text-xs font-bold">
                      {moduleCount}
                    </div>
                  )}
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `group flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors ${
              isActive
                ? 'bg-gray-100 dark:bg-gray-800 text-brand-purple dark:text-brand-purple font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`
          }
          onClick={handleClick}
        >
          <Icon className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <span>{item.label}</span>
              {shouldShowModuleCount && (
                <div className="flex items-center justify-center w-5 h-5 bg-brand-purple text-white rounded-full text-xs font-bold">
                  {moduleCount}
                </div>
              )}
            </div>
          )}
        </NavLink>
      )}

      {/* Render submenu when collapsed and hovered */}
      {collapsed && isHovered && item.subItems && (
        <>
          {isPanelItem ? (
            <PanelSubmenu
              item={item}
              isHovered={isHovered}
              onMouseEnter={handleSubmenuMouseEnter || (() => {})}
              onMouseLeave={handleMouseLeaveItem}
              handleSubItemClick={handleSubItemClick || (() => {})}
            />
          ) : (
            <RegularSubmenu
              item={item}
              isHovered={isHovered}
              onMouseEnter={handleSubmenuMouseEnter || (() => {})}
              onMouseLeave={handleMouseLeaveItem}
              handleSubItemClick={handleSubItemClick || (() => {})}
              location={location}
            />
          )}
        </>
      )}
    </li>
  );
};

export default SidebarMenuItem;
