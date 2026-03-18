
import React from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarItem } from './types';

interface SubmenuPortalsProps {
  searchHoverOpen: boolean;
  settingsHoverOpen: boolean;
  eventosHoverOpen: boolean;
  gestaoHoverOpen?: boolean;
  searchIconPosition: { top: number; left: number };
  settingsIconPosition: { top: number; left: number };
  eventosIconPosition: { top: number; left: number };
  gestaoIconPosition?: { top: number; left: number };
  sidebarItems: SidebarItem[];
  location: any;
  handleSubmenuMouseEnter: () => void;
  handleSubmenuMouseLeave: () => void;
  handleSubItemClick: (subItem: SidebarItem) => void;
}

const SubmenuPortals = ({
  searchHoverOpen,
  settingsHoverOpen,
  eventosHoverOpen,
  gestaoHoverOpen = false,
  searchIconPosition,
  settingsIconPosition,
  eventosIconPosition,
  gestaoIconPosition = { top: 0, left: 0 },
  sidebarItems,
  location,
  handleSubmenuMouseEnter,
  handleSubmenuMouseLeave,
  handleSubItemClick
}: SubmenuPortalsProps) => {
  const { isSupport } = useAuth();

  const searchItem = sidebarItems.find(item => item.label === 'Consultas');
  const settingsItem = sidebarItems.find(item => item.label === 'Configurações' || item.label === 'Configurações do Sistema');
  const eventosItem = sidebarItems.find(item => item.label === 'Eventos e Promoções');
  const gestaoItem = sidebarItems.find(item => item.label === 'Gestão de Usuários');

  const filterSubItemsByRole = (subItems?: SidebarItem[]) => {
    if (!subItems) return [];
    return subItems.filter(subItem => {
      if (!subItem.roles) return true;
      return subItem.roles.some(role => {
        if (role === 'suporte') return isSupport;
        return false;
      });
    });
  };

  return (
    <>
      {/* Search Portal */}
      {searchHoverOpen && searchItem?.subItems && createPortal(
        <div 
          className="fixed w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-[300] transform transition-all duration-200 ease-out animate-in fade-in-0 slide-in-from-left-2"
          style={{
            top: `${searchIconPosition.top}px`,
            left: `${searchIconPosition.left}px`,
            pointerEvents: 'auto'
          }}
          onMouseEnter={handleSubmenuMouseEnter} 
          onMouseLeave={handleSubmenuMouseLeave}
        >
          <div className="py-2">
            {searchItem.subItems.map(subItem => (
              <button 
                key={subItem.path} 
                onClick={() => handleSubItemClick(subItem)} 
                className={`flex items-center w-full px-4 py-3 text-sm transition-all duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:scale-105 hover:bg-gradient-to-r hover:from-brand-purple/10 hover:to-purple-50 dark:hover:from-brand-purple/20 dark:hover:to-purple-900/30
                  ${location.pathname === subItem.path ? 'bg-brand-purple text-white shadow-sm' : 'text-gray-700 hover:text-brand-purple dark:text-gray-300 dark:hover:text-white'}`}
              >
                <subItem.icon size={22} className="mr-3 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                <span className="flex-1 text-left font-medium">{subItem.label}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Settings Portal */}
      {settingsHoverOpen && settingsItem?.subItems && createPortal(
        <div 
          className="fixed w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-[300] transform transition-all duration-200 ease-out animate-in fade-in-0 slide-in-from-left-2"
          style={{
            top: `${settingsIconPosition.top}px`,
            left: `${settingsIconPosition.left}px`,
            pointerEvents: 'auto'
          }}
          onMouseEnter={handleSubmenuMouseEnter} 
          onMouseLeave={handleSubmenuMouseLeave}
        >
          <div className="py-2">
            {settingsItem.subItems.map(subItem => (
              <button 
                key={subItem.path} 
                onClick={() => handleSubItemClick(subItem)} 
                className={`flex items-center w-full px-4 py-3 text-sm transition-all duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:scale-105 hover:bg-gradient-to-r hover:from-brand-purple/10 hover:to-purple-50 dark:hover:from-brand-purple/20 dark:hover:to-purple-900/30
                  ${location.pathname === subItem.path ? 'bg-brand-purple text-white shadow-sm' : 'text-gray-700 hover:text-brand-purple dark:text-gray-300 dark:hover:text-white'}`}
              >
                <subItem.icon size={22} className="mr-3 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                <span className="flex-1 text-left font-medium">{subItem.label}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Eventos Portal */}
      {eventosHoverOpen && eventosItem?.subItems && createPortal(
        <div 
          className="fixed w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-[300] transform transition-all duration-200 ease-out animate-in fade-in-0 slide-in-from-left-2"
          style={{
            top: `${eventosIconPosition.top}px`,
            left: `${eventosIconPosition.left}px`,
            pointerEvents: 'auto'
          }}
          onMouseEnter={handleSubmenuMouseEnter} 
          onMouseLeave={handleSubmenuMouseLeave}
        >
          <div className="py-2">
            {eventosItem.subItems.map(subItem => (
              <button 
                key={subItem.path} 
                onClick={() => handleSubItemClick(subItem)} 
                className={`flex items-center w-full px-4 py-3 text-sm transition-all duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:scale-105 hover:bg-gradient-to-r hover:from-brand-purple/10 hover:to-purple-50 dark:hover:from-brand-purple/20 dark:hover:to-purple-900/30
                  ${location.pathname === subItem.path ? 'bg-brand-purple text-white shadow-sm' : 'text-gray-700 hover:text-brand-purple dark:text-gray-300 dark:hover:text-white'}`}
              >
                <subItem.icon size={22} className="mr-3 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                <span className="flex-1 text-left font-medium">{subItem.label}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}


      {/* Gestão Portal */}
      {gestaoHoverOpen && gestaoItem?.subItems && createPortal(
        <div 
          className="fixed w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-[300] transform transition-all duration-200 ease-out animate-in fade-in-0 slide-in-from-left-2"
          style={{
            top: `${gestaoIconPosition.top}px`,
            left: `${gestaoIconPosition.left}px`,
            pointerEvents: 'auto'
          }}
          onMouseEnter={handleSubmenuMouseEnter} 
          onMouseLeave={handleSubmenuMouseLeave}
        >
          <div className="py-2">
            {gestaoItem.subItems.map(subItem => (
              <button 
                key={subItem.path} 
                onClick={() => handleSubItemClick(subItem)} 
                className={`flex items-center w-full px-4 py-3 text-sm transition-all duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:scale-105 hover:bg-gradient-to-r hover:from-brand-purple/10 hover:to-purple-50 dark:hover:from-brand-purple/20 dark:hover:to-purple-900/30
                  ${location.pathname === subItem.path ? 'bg-brand-purple text-white shadow-sm' : 'text-gray-700 hover:text-brand-purple dark:text-gray-300 dark:hover:text-white'}`}
              >
                <subItem.icon size={22} className="mr-3 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                <span className="flex-1 text-left font-medium">{subItem.label}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SubmenuPortals;
