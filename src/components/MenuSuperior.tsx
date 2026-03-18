import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Package, ChevronRight, LogIn, UserPlus, LayoutGrid, Gift, Languages } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ThemeSwitcher from './ThemeSwitcher';
import { cn } from '@/lib/utils';
import TextLogo from './TextLogo';
import NotificationIcon from './notifications/NotificationIcon';
import UserProfileDropdown from './menu/UserProfileDropdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useAuth } from '@/contexts/AuthContext';
import UserWalletDropdown from '@/components/ui/user-wallet-dropdown';
import { useLiquidGlass } from '@/contexts/LiquidGlassContext';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';

import SidebarMenu from './dashboard/layout/sidebar/SidebarMenu';
import { createSidebarItems } from './dashboard/layout/sidebarData';
import { usePanelMenus } from '@/hooks/usePanelMenus';
import { ScrollArea } from '@/components/ui/scroll-area';
import { languageOptions, localeContent, useLocale } from '@/contexts/LocaleContext';

const MenuSuperior = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState(languageOptions[0].locale);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isSupport } = useAuth();
  const { panelMenus } = usePanelMenus();
  const { config: liquidGlassConfig } = useLiquidGlass();
  const { locale, setLocale } = useLocale();

  const content = localeContent[locale];
  const selectedLanguageOption = languageOptions.find((option) => option.locale === locale) ?? languageOptions[0];

  const isDashboardPage = location.pathname.startsWith('/dashboard');
  const isHomePage = location.pathname === '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openLanguageModal = () => {
    setPendingLocale(locale);
    setIsLanguageModalOpen(true);
  };

  const applyLanguage = () => {
    setLocale(pendingLocale);
    setIsLanguageModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error('❌ [LOGOUT] Erro no logout:', error);
      navigate("/", { replace: true });
    }
  };

  const handleSubItemClick = (subItem: any) => {
    if (subItem.onClick) {
      subItem.onClick();
    } else if (subItem.path !== '#') {
      navigate(subItem.path);
    }
    setIsMenuOpen(false);
  };

  const sidebarItems = user ? createSidebarItems(handleLogout, isSupport, panelMenus, locale) : [];

  const isSubmenuActive = (subItems?: any[]) => {
    if (!subItems) return false;
    return subItems.some(subItem => location.pathname === subItem.path);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <header className={`sticky top-0 z-50 border-b ${liquidGlassConfig.enabled ? 'liquid-glass-container border-white/20' : 'bg-background border-border'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            <div className="hidden md:flex items-center space-x-4">
              <TextLogo to="/dashboard" />
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ThemeSwitcher />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{content.switchTheme}</p>
                  </TooltipContent>
                </Tooltip>

                {user && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <NotificationIcon />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{content.notifications}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <div className="flex">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={content.openLanguage}
                        onClick={openLanguageModal}
                        className="h-8 w-8 rounded-md flex items-center justify-center border border-border bg-background text-foreground hover:bg-muted transition-colors"
                      >
                        <span className="text-sm leading-none" aria-hidden="true">{selectedLanguageOption.flag}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{content.openLanguage}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <TextLogo to="/dashboard" showFullOnMobile={!user} />
              <ThemeSwitcher />
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <nav className="hidden lg:flex items-center space-x-1">
                {!isHomePage && (
                  <Link to="/">
                    <Button variant="ghost" size="sm" className={cn("text-muted-foreground hover:text-foreground", liquidGlassConfig.enabled && "hover:bg-white/10")}>{content.home}</Button>
                  </Link>
                )}
                <Link to="/modulos">
                  <Button variant="ghost" size="sm" className={cn("text-muted-foreground hover:text-foreground", liquidGlassConfig.enabled && "hover:bg-white/10")}>{content.modules}</Button>
                </Link>
                <Link to="/planos-publicos">
                  <Button variant="ghost" size="sm" className={cn("text-muted-foreground hover:text-foreground", liquidGlassConfig.enabled && "hover:bg-white/10")}>{content.plans}</Button>
                </Link>
                {!isDashboardPage && (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className={cn("menu-paineis-link text-muted-foreground hover:text-foreground font-semibold", liquidGlassConfig.enabled && "hover:bg-white/10")}>{content.panels}</Button>
                  </Link>
                )}
              </nav>

              {user ? (
                <>
                  <UserWalletDropdown onLogout={handleLogout} />
                  <UserProfileDropdown onLogout={handleLogout} />
                </>
              ) : (
                <>
                  {liquidGlassConfig.enabled ? (
                    <>
                      <span
                        className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200"
                        onClick={() => navigate('/registration')}
                      >
                        {content.register}
                      </span>
                      <LiquidGlassButton
                        variant="outline"
                        className="text-sm px-4 py-2"
                        onClick={() => navigate('/login')}
                        ariaLabel={content.login}
                      >
                        {content.login}
                      </LiquidGlassButton>
                    </>
                  ) : (
                    <>
                      <Link to="/registration" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                        {content.register}
                      </Link>
                      <Link to="/login">
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold">
                          {content.login}
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              {user && (
                <UserWalletDropdown onLogout={handleLogout} />
              )}
              <button onClick={toggleMenu} className="p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none relative z-[60]" aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998] animate-in fade-in-0 duration-200"
            onClick={toggleMenu}
          />

          <div className="md:hidden fixed inset-y-0 right-0 z-[9999] w-[85vw] max-w-[320px] animate-in slide-in-from-right duration-300">
            <div className="h-full flex flex-col bg-card border-l border-border shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                <span className="text-sm font-bold text-foreground tracking-tight">{content.menu}</span>
                <button
                  onClick={toggleMenu}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {user ? (
                <ScrollArea className="flex-1">
                  <div className="py-2">
                    <SidebarMenu
                      filteredItems={sidebarItems}
                      location={location}
                      collapsed={false}
                      isMobile={true}
                      isTablet={false}
                      setMobileMenuOpen={setIsMenuOpen}
                      isSubmenuActive={isSubmenuActive}
                      handleSubItemClick={handleSubItemClick}
                      setCollapsed={() => {}}
                    />
                  </div>

                  <div className="px-4 pb-6 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {content.logout}
                    </button>
                  </div>
                </ScrollArea>
              ) : (
                <ScrollArea className="flex-1">
                  <nav className="p-4 space-y-1">
                    {[
                      { to: '/login', icon: LogIn, label: content.login },
                      { to: '/registration', icon: UserPlus, label: content.createAccount },
                      { to: '/planos-publicos', icon: LayoutGrid, label: content.availablePanels },
                      { to: '/modulos', icon: Package, label: content.modules },
                      { to: '/indicacoes', icon: Gift, label: content.referrals },
                    ].map(({ to, icon: ItemIcon, label }) => (
                      <Link key={to} to={to} onClick={toggleMenu} className="block">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                          <ItemIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="flex-1">{label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                        </div>
                      </Link>
                    ))}
                  </nav>
                </ScrollArea>
              )}
            </div>
          </div>
        </>
      )}

      <Dialog open={isLanguageModalOpen} onOpenChange={setIsLanguageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              {content.languageModalTitle}
            </DialogTitle>
            <DialogDescription>{content.languageModalDescription}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {languageOptions.map((option) => {
              const isActive = option.locale === pendingLocale;

              return (
                <button
                  key={option.locale}
                  type="button"
                  onClick={() => setPendingLocale(option.locale)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors',
                    isActive
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className="text-base" aria-hidden="true">{option.flag}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setIsLanguageModalOpen(false)}>
              {content.cancel}
            </Button>
            <Button onClick={applyLanguage}>{content.applyLanguage}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default MenuSuperior;
