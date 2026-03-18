import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'pt-BR' | 'en' | 'es';

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const languageOptions: Array<{ locale: Locale; flag: string; label: string }> = [
  { locale: 'pt-BR', flag: '🇧🇷', label: 'Português (Brasil)' },
  { locale: 'en', flag: '🇺🇸', label: 'English' },
  { locale: 'es', flag: '🇪🇸', label: 'Español' },
];

export const localeContent: Record<Locale, {
  switchTheme: string;
  notifications: string;
  home: string;
  modules: string;
  plans: string;
  panels: string;
  register: string;
  login: string;
  menu: string;
  logout: string;
  createAccount: string;
  availablePanels: string;
  referrals: string;
  openLanguage: string;
  languageModalTitle: string;
  languageModalDescription: string;
  applyLanguage: string;
  cancel: string;
  walletDeposit: string;
  walletBalance: string;
  walletWalletBalance: string;
  walletPlanBalance: string;
  walletPlan: string;
  walletDiscount: string;
  walletPlanStart: string;
  walletPlanEnd: string;
  walletDaysRemaining: string;
  walletDaysSuffix: string;
  walletExpired: string;
  walletRefresh: string;
  walletUserFallback: string;
  walletPrepaid: string;
  sidebarOnlinePanels: string;
  sidebarExpandMenu: string;
  sidebarCollapseMenu: string;
}> = {
  'pt-BR': {
    switchTheme: 'Alternar tema',
    notifications: 'Notificações',
    home: 'Início',
    modules: 'Módulos',
    plans: 'Planos',
    panels: 'Painéis',
    register: 'Cadastre-se',
    login: 'Entrar',
    menu: 'Menu',
    logout: 'Sair da conta',
    createAccount: 'Criar conta',
    availablePanels: 'Painéis disponíveis',
    referrals: 'Indicações',
    openLanguage: 'Idioma',
    languageModalTitle: 'Selecionar idioma',
    languageModalDescription: 'Escolha o idioma da plataforma e clique em aplicar.',
    applyLanguage: 'Aplicar',
    cancel: 'Cancelar',
    walletDeposit: 'Depósito',
    walletBalance: 'Saldo',
    walletWalletBalance: 'Saldo da Carteira',
    walletPlanBalance: 'Saldo do plano',
    walletPlan: 'Plano',
    walletDiscount: 'Desconto',
    walletPlanStart: 'Início do Plano',
    walletPlanEnd: 'Término do Plano',
    walletDaysRemaining: 'Dias Restantes',
    walletDaysSuffix: 'dias',
    walletExpired: 'Expirado',
    walletRefresh: 'Atualizar',
    walletUserFallback: 'Usuário',
    walletPrepaid: 'Pré-Pago',
    sidebarOnlinePanels: 'Painéis Online',
    sidebarExpandMenu: 'Expandir menu',
    sidebarCollapseMenu: 'Recolher menu',
  },
  en: {
    switchTheme: 'Switch theme',
    notifications: 'Notifications',
    home: 'Home',
    modules: 'Modules',
    plans: 'Plans',
    panels: 'Panels',
    register: 'Sign up',
    login: 'Sign in',
    menu: 'Menu',
    logout: 'Sign out',
    createAccount: 'Create account',
    availablePanels: 'Available panels',
    referrals: 'Referrals',
    openLanguage: 'Language',
    languageModalTitle: 'Select language',
    languageModalDescription: 'Choose the platform language and click apply.',
    applyLanguage: 'Apply',
    cancel: 'Cancel',
    walletDeposit: 'Deposit',
    walletBalance: 'Balance',
    walletWalletBalance: 'Wallet balance',
    walletPlanBalance: 'Plan balance',
    walletPlan: 'Plan',
    walletDiscount: 'Discount',
    walletPlanStart: 'Plan start',
    walletPlanEnd: 'Plan end',
    walletDaysRemaining: 'Days remaining',
    walletDaysSuffix: 'days',
    walletExpired: 'Expired',
    walletRefresh: 'Refresh',
    walletUserFallback: 'User',
    walletPrepaid: 'Prepaid',
    sidebarOnlinePanels: 'Online Panels',
    sidebarExpandMenu: 'Expand menu',
    sidebarCollapseMenu: 'Collapse menu',
  },
  es: {
    switchTheme: 'Cambiar tema',
    notifications: 'Notificaciones',
    home: 'Inicio',
    modules: 'Módulos',
    plans: 'Planes',
    panels: 'Paneles',
    register: 'Regístrate',
    login: 'Iniciar sesión',
    menu: 'Menú',
    logout: 'Cerrar sesión',
    createAccount: 'Crear cuenta',
    availablePanels: 'Paneles disponibles',
    referrals: 'Referidos',
    openLanguage: 'Idioma',
    languageModalTitle: 'Seleccionar idioma',
    languageModalDescription: 'Elige el idioma de la plataforma y pulsa aplicar.',
    applyLanguage: 'Aplicar',
    cancel: 'Cancelar',
    walletDeposit: 'Depósito',
    walletBalance: 'Saldo',
    walletWalletBalance: 'Saldo de la cartera',
    walletPlanBalance: 'Saldo del plan',
    walletPlan: 'Plan',
    walletDiscount: 'Descuento',
    walletPlanStart: 'Inicio del plan',
    walletPlanEnd: 'Fin del plan',
    walletDaysRemaining: 'Días restantes',
    walletDaysSuffix: 'días',
    walletExpired: 'Expirado',
    walletRefresh: 'Actualizar',
    walletUserFallback: 'Usuario',
    walletPrepaid: 'Prepago',
    sidebarOnlinePanels: 'Paneles Online',
    sidebarExpandMenu: 'Expandir menú',
    sidebarCollapseMenu: 'Contraer menú',
  },
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const getInitialLocale = (): Locale => {
  const storedLocale = localStorage.getItem('site-locale') as Locale | null;
  if (storedLocale && ['pt-BR', 'en', 'es'].includes(storedLocale)) {
    return storedLocale;
  }

  return 'pt-BR';
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem('site-locale', locale);
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
};
