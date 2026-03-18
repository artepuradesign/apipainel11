
import React from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { loadCustomModules } from '@/utils/personalizationStorage';
import { SidebarItem } from '../types';
import EmptyState from '@/components/ui/empty-state';

interface PanelSubmenuProps {
  item: SidebarItem;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  handleSubItemClick: (subItem: SidebarItem) => void;
}

const PanelSubmenu: React.FC<PanelSubmenuProps> = ({
  item,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  handleSubItemClick
}) => {
  if (!isHovered || !item.subItems) return null;

  const modules = loadCustomModules();
  const panelModules = modules.filter(module => 
    module.panelId === item.path.split('/').pop() && module.operationalStatus === 'on'
  );

  return (
    <div 
      className="absolute left-full top-0 ml-2 w-96 bg-white/75 dark:bg-gray-800/75 border border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm rounded-lg shadow-2xl z-[100] transform transition-all duration-200 ease-out animate-in fade-in-0 slide-in-from-left-2" 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Header do painel */}
      <div className="flex flex-col space-y-1.5 p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <item.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold leading-none tracking-tight">{item.label}</h3>
              {item.moduleCount !== undefined && (
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                    {item.moduleCount}
                  </div>
                </div>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Módulos do painel */}
      {panelModules.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 p-6 pt-0 max-h-80 overflow-y-auto">
          {panelModules.map(module => {
            const subItem = item.subItems?.find(sub => sub.path === module.path);
            if (!subItem) return null;
            
            return (
              <Card 
                key={module.path}
                className="group relative overflow-hidden h-full backdrop-blur-sm transition-all duration-300 bg-white/95 dark:bg-gray-800/95 border border-purple-200/50 dark:border-purple-700/30 shadow-lg hover:shadow-xl cursor-pointer"
                onClick={() => handleSubItemClick(subItem)}
              >
                {/* Decorative gradient line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple via-purple-500 to-blue-500"></div>
                
                <CardContent className="p-4">
                  {/* Icon container */}
                  <div className="relative mx-auto mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto border transition-all duration-300 bg-gradient-to-br from-brand-purple/15 to-purple-600/20 dark:from-purple-900/40 dark:to-purple-800/30 border-purple-300/40 dark:border-purple-700/40 group-hover:scale-105">
                      <subItem.icon className="h-6 w-6 transition-all duration-300 text-brand-purple dark:text-purple-400 group-hover:scale-110" />
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-semibold text-center transition-colors duration-300 leading-tight text-gray-900 dark:text-white group-hover:text-brand-purple dark:group-hover:text-purple-400 mb-2">
                    {subItem.label}
                  </h4>
                  
                  {subItem.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed text-center mb-2">
                      {subItem.description}
                    </p>
                  )}
                  
                  {subItem.price && (
                    <div className="text-center">
                      <span className="font-semibold text-brand-purple dark:text-purple-400 text-sm">
                        R$ {subItem.price}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="p-6 pt-0">
          <EmptyState 
            icon={Settings}
            title="Nenhum módulo configurado"
            description="Configure módulos na página de Personalização para este painel."
          />
        </div>
      )}
    </div>
  );
};

export default PanelSubmenu;
