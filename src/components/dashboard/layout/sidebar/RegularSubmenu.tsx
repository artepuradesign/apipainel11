
import React from 'react';
import { SidebarItem } from '../types';

interface RegularSubmenuProps {
  item: SidebarItem;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  handleSubItemClick: (subItem: SidebarItem) => void;
  location: any;
}

const RegularSubmenu: React.FC<RegularSubmenuProps> = ({
  item,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  handleSubItemClick,
  location
}) => {
  if (!isHovered || !item.subItems) return null;

  return (
    <div 
      className="absolute left-full top-0 ml-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-2xl z-[100] transform transition-all duration-200 ease-out animate-in fade-in-0 slide-in-from-left-2" 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="py-2">
        {item.subItems.map(subItem => (
          <button 
            key={subItem.path} 
            onClick={() => handleSubItemClick(subItem)} 
            className={`flex items-center w-full px-4 py-3 text-sm transition-all duration-150 border-b border-gray-100 dark:border-gray-600 last:border-b-0 hover:scale-105 hover:bg-gradient-to-r hover:from-brand-purple/10 hover:to-purple-50 dark:hover:from-brand-purple/20 dark:hover:to-purple-900/30
                ${location.pathname === subItem.path ? 'bg-brand-purple text-white shadow-sm' : 'text-gray-700 hover:text-brand-purple dark:text-gray-200 dark:hover:text-white'}`}
          >
            <subItem.icon size={22} className="mr-3 shrink-0 transition-transform duration-150 group-hover:scale-110" />
            <span className="flex-1 text-left font-medium">{subItem.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RegularSubmenu;
