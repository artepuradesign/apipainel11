import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, PanelsTopLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarItem } from '../types';
import { localeContent, useLocale } from '@/contexts/LocaleContext';

interface SidebarMenuProps {
  filteredItems: SidebarItem[];
  location: any;
  collapsed: boolean;
  isMobile: boolean;
  isTablet: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isSubmenuActive: (subItems?: SidebarItem[]) => boolean;
  handleSubItemClick: (subItem: SidebarItem) => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  filteredItems,
  location,
  collapsed,
  isMobile,
  isTablet,
  setMobileMenuOpen,
  isSubmenuActive,
  handleSubItemClick,
  setCollapsed
}) => {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const content = localeContent[locale];
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedSubItems, setExpandedSubItems] = useState<Set<string>>(new Set());
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const makeSubKey = useCallback((parentLabel: string, childLabel: string) => {
    return `${parentLabel}::${childLabel}`;
  }, []);

  // Quando o usuário está em uma rota filha (ex.: /dashboard/historico/consultas),
  // manter o menu pai automaticamente expandido para os subitens aparecerem como submenu.
  // Quando a rota muda, só manter abertos os menus correspondentes à rota atual
  React.useEffect(() => {
    if (collapsed) return;

    // 1) Calcula quais pais de 1º nível devem estar abertos (apenas os que contêm a rota ativa)
    const activeParents = new Set(
      filteredItems
        .filter((it) => it.subItems && it.subItems.some((sub) => {
          if (sub.path === location.pathname) return true;
          return !!sub.subItems?.some((nested) => nested.path === location.pathname);
        }))
        .map((it) => it.label)
    );

    // Substituir completamente - fecha menus que não correspondem à rota atual
    setExpandedItems(activeParents);

    // 2) Calcula quais submenus de 2º nível devem estar abertos
    const activeSubParents = new Set<string>();
    filteredItems.forEach((it) => {
      it.subItems?.forEach((sub) => {
        const hasNestedActive = sub.subItems?.some((nested) => nested.path === location.pathname);
        if (hasNestedActive) {
          activeSubParents.add(makeSubKey(it.label, sub.label));
        }
      });
    });

    setExpandedSubItems(activeSubParents);
  }, [collapsed, filteredItems, location.pathname, makeSubKey]);

  const handleItemClick = useCallback((item: SidebarItem, event: React.MouseEvent) => {
    if (!item.subItems) return;

    event.preventDefault();

    if (collapsed) {
      // Para sidebar colapsado, mostrar submenu à direita via portal
      const rect = event.currentTarget.getBoundingClientRect();
      setSubmenuPosition({
        top: rect.top,
        left: rect.right + 5
      });
      setClickedItem(clickedItem === item.label ? null : item.label);
    } else {
      // Para sidebar expandido, expandir/recolher submenu
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(item.label)) {
        newExpanded.delete(item.label);
      } else {
        newExpanded.add(item.label);
      }
      setExpandedItems(newExpanded);
    }
  }, [collapsed, expandedItems, clickedItem]);

  const handleMobileClick = useCallback(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, setMobileMenuOpen]);

  const adminDashboardItem = filteredItems.find((item) => item.path === '/dashboard/admin');
  const hasAdminDashboard = !!adminDashboardItem;
  const primaryMenuPath = hasAdminDashboard ? '/dashboard/admin' : '/dashboard';
  const primaryMenuLabel = hasAdminDashboard ? adminDashboardItem?.label || content.sidebarOnlinePanels : content.sidebarOnlinePanels;
  const onlinePanelsItem = filteredItems.find((item) => item.path === '/dashboard');
  const PrimaryMenuIcon = hasAdminDashboard ? (adminDashboardItem?.icon || PanelsTopLeft) : (onlinePanelsItem?.icon || PanelsTopLeft);

  const handleDashboardClick = useCallback((e: React.MouseEvent) => {
    navigate(primaryMenuPath);

    if (isMobile) {
      handleMobileClick();
    }
  }, [isMobile, handleMobileClick, navigate, primaryMenuPath]);



  React.useEffect(() => {
    if (clickedItem && collapsed) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('[data-submenu]') && !target.closest('[data-menu-item]')) {
          setClickedItem(null);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [clickedItem, collapsed]);

  const renderCollapsedSubmenu = useCallback((item: SidebarItem) => {
    if (!item.subItems || clickedItem !== item.label || !collapsed) return null;

    return createPortal(
      <div 
        data-submenu
        className="fixed w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[350] py-2"
        style={{
          top: `${submenuPosition.top}px`,
          left: `${submenuPosition.left}px`,
        }}
      >
        {item.subItems.map((subItem) => {
          const SubIcon = subItem.icon;
          const isSubActive = location.pathname === subItem.path;
          
          return (
            <Link
              key={subItem.path}
              to={subItem.path}
              onClick={() => {
                handleSubItemClick(subItem);
                handleMobileClick();
                setClickedItem(null);
              }}
              className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors hover:bg-brand-purple/10 hover:text-brand-purple dark:hover:bg-brand-purple/20 dark:hover:text-white
                ${isSubActive ? 'bg-brand-purple text-white' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <SubIcon size={18} className="mr-3 shrink-0" />
              <span className="flex-1 text-left font-medium">{subItem.label}</span>
            </Link>
          );
        })}
      </div>,
      document.body
    );
  }, [clickedItem, submenuPosition, collapsed, location.pathname, handleSubItemClick, handleMobileClick]);

  // Renderiza no topo o item principal (Dashboard admin para suporte, Painéis Online para demais)
  const menuItems = filteredItems.filter((item) => {
    if (hasAdminDashboard) {
      return item.path !== '/dashboard/admin';
    }
    return item.path !== '/dashboard';
  });

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
        {/* Header modernizado com gradiente */}
        <div className="px-3 pt-3 pb-2 bg-gradient-to-br from-brand-purple/5 via-purple-50/50 to-blue-50/30 dark:from-purple-900/10 dark:via-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center w-full transition-all duration-200 rounded-lg group relative overflow-hidden ${
            location.pathname === primaryMenuPath
              ? 'bg-gradient-to-r from-brand-purple to-purple-600 text-white shadow-md'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80'
          }`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="flex items-center flex-1 p-3"
                  onClick={handleDashboardClick}
                >
                  {location.pathname === primaryMenuPath && (
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 to-purple-600/20 animate-pulse-gentle" />
                  )}
                  <PrimaryMenuIcon className={`${collapsed ? 'mx-auto' : 'mr-3'} shrink-0`} size={20} />
                  {!collapsed && (
                    <span className="text-sm font-semibold relative z-10">{primaryMenuLabel}</span>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>{primaryMenuLabel}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>

      <ScrollArea className="flex-1 bg-gradient-to-b from-transparent to-gray-50/30 dark:to-gray-900/30">
        <nav className="pt-2 pb-4 px-2">
          <ul className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isPanelItem = item.path.includes('/dashboard/painel/');
              const isActive = location.pathname === item.path || 
                              (item.subItems && isSubmenuActive(item.subItems));
              const isExpanded = expandedItems.has(item.label);
              const panelIconStyle = isPanelItem
                ? {
                    color: item.iconColor || '#7C3AED',
                    backgroundColor: `${item.iconColor || '#7C3AED'}1A`
                  }
                : undefined;

              if (item.subItems) {
                return (
                  <li key={`${item.label}-${item.path}`} className="relative">
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            data-menu-item
                            className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                              isActive 
                                ? 'bg-gradient-to-r from-brand-purple/10 to-purple-100/50 dark:from-purple-900/20 dark:to-gray-700/50 text-brand-purple dark:text-purple-300 border border-brand-purple/20 dark:border-purple-700/30'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                            }`}
                            onClick={(e) => handleItemClick(item, e)}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-purple to-purple-600 rounded-l-lg" />
                            )}
                            <span
                              className={`${collapsed ? 'mx-auto' : 'mr-3'} shrink-0 inline-flex items-center justify-center rounded-md ${isPanelItem ? 'h-7 w-7' : ''}`}
                              style={panelIconStyle}
                            >
                              <Icon className={`${isActive && !isPanelItem ? 'text-brand-purple dark:text-purple-400' : ''}`} size={18} />
                            </span>
                            {!collapsed && (
                              <>
                                <span className="flex-1 text-left">{item.label}</span>
                                <div className={`ml-2 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                  <ChevronRight size={14} />
                                </div>
                              </>
                            )}
                          </div>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side="right">
                            <p>{item.label}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                      
                      {/* Submenu expandido com animação (suporta 2 níveis) */}
                      {!collapsed && isExpanded && item.subItems && (
                        <div className="ml-4 mt-1 space-y-0.5 pl-3 border-l-2 border-gray-200 dark:border-gray-700 animate-fade-in">
                          {item.subItems.map((subItem, subIndex) => {
                            const SubIcon = subItem.icon;

                            const hasNested = !!subItem.subItems && subItem.subItems.length > 0;
                            const nestedActive = hasNested
                              ? subItem.subItems!.some((nested) => nested.path === location.pathname)
                              : false;

                            const isSubActive = location.pathname === subItem.path || nestedActive;
                            const subKey = makeSubKey(item.label, subItem.label);
                            const isSubExpanded = expandedSubItems.has(subKey);

                            if (!hasNested) {
                              return (
                                <Link
                                  key={`${subItem.path}-${subIndex}`}
                                  to={subItem.path}
                                  onClick={() => {
                                    handleSubItemClick(subItem);
                                    handleMobileClick();
                                  }}
                                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200 group ${
                                    isSubActive
                                      ? 'bg-gradient-to-r from-brand-purple to-purple-600 text-white shadow-sm'
                                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-purple dark:hover:text-purple-400'
                                  }`}
                                >
                                  <SubIcon size={14} className="mr-2 shrink-0" />
                                  <span className="font-medium">{subItem.label}</span>
                                </Link>
                              );
                            }

                            return (
                              <div key={`${subItem.label}-${subIndex}`} className="space-y-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    // mantém o comportamento antigo: clicar em "Histórico" abre a página /dashboard/historico
                                    if (subItem.path && subItem.path !== '#') {
                                      navigate(subItem.path);
                                    }

                                    setExpandedSubItems((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(subKey)) next.delete(subKey);
                                      else next.add(subKey);
                                      return next;
                                    });

                                    if (isMobile) handleMobileClick();
                                  }}
                                  className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-all duration-200 group ${
                                    isSubActive
                                      ? 'bg-gradient-to-r from-brand-purple/10 to-purple-100/50 dark:from-purple-900/20 dark:to-gray-700/50 text-brand-purple dark:text-purple-300'
                                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-purple dark:hover:text-purple-400'
                                  }`}
                                >
                                  <SubIcon size={14} className="mr-2 shrink-0" />
                                  <span className="font-medium flex-1 text-left">{subItem.label}</span>
                                  <span className={`ml-2 transition-transform duration-200 ${isSubExpanded ? 'rotate-90' : ''}`}>
                                    <ChevronRight size={14} />
                                  </span>
                                </button>

                                {isSubExpanded && (
                                  <div className="ml-4 space-y-0.5 pl-3 border-l border-gray-200 dark:border-gray-700">
                                    {subItem.subItems!.map((nestedItem, nestedIndex) => {
                                      const NestedIcon = nestedItem.icon;
                                      const isNestedActive = location.pathname === nestedItem.path;

                                      return (
                                        <Link
                                          key={`${nestedItem.path}-${nestedIndex}`}
                                          to={nestedItem.path}
                                          onClick={() => {
                                            handleSubItemClick(nestedItem);
                                            handleMobileClick();
                                          }}
                                          className={`flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200 group ${
                                            isNestedActive
                                              ? 'bg-gradient-to-r from-brand-purple to-purple-600 text-white shadow-sm'
                                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-purple dark:hover:text-purple-400'
                                          }`}
                                        >
                                          <NestedIcon size={14} className="mr-2 shrink-0" />
                                          <span className="font-medium">{nestedItem.label}</span>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {renderCollapsedSubmenu(item)}
                  </li>
                );
              } else {
                return (
                  <li key={`${item.label}-${item.path}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link 
                          to={item.path}
                          className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative overflow-hidden ${
                            isActive
                              ? 'bg-gradient-to-r from-brand-purple/10 to-purple-100/50 dark:from-purple-900/20 dark:to-gray-700/50 text-brand-purple dark:text-purple-300 border border-brand-purple/20 dark:border-purple-700/30'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                          onClick={(e) => {
                            if (item.onClick) {
                              e.preventDefault();
                              item.onClick();
                            }
                            handleMobileClick();
                          }}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-purple to-purple-600 rounded-l-lg" />
                          )}
                          <span
                            className={`${collapsed ? 'mx-auto' : 'mr-3'} shrink-0 inline-flex items-center justify-center rounded-md ${isPanelItem ? 'h-7 w-7' : ''}`}
                            style={panelIconStyle}
                          >
                            <Icon className={`${isActive && !isPanelItem ? 'text-brand-purple dark:text-purple-400' : ''}`} size={18} />
                          </span>
                          {!collapsed && <span>{item.label}</span>}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </li>
                );
              }
            })}
          </ul>
        </nav>
      </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

export default SidebarMenu;
