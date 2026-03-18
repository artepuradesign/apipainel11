
import { Gauge, PanelsTopLeft, User, Wallet, History, MessageSquare, Gift, Ticket, FileText, Database, Plug, Store, SlidersHorizontal, ClipboardList, Cog, Droplets, BarChart3, Settings, Users, Palette, CreditCard, RefreshCw } from 'lucide-react';
import { SidebarItem } from '../types';
import { Locale } from '@/contexts/LocaleContext';

type SidebarLabels = {
  dashboard: string;
  onlinePanels: string;
  myAccount: string;
  personalData: string;
  myOrders: string;
  digitalWallet: string;
  coupons: string;
  useCoupons: string;
  manageCoupons: string;
  preferences: string;
  support: string;
  history: string;
  overview: string;
  queries: string;
  apiRecords: string;
  pixPayments: string;
  reloadsAndDeposits: string;
  purchasesAndPlans: string;
  usedCoupons: string;
  administration: string;
  adminTestimonials: string;
  authentications: string;
  cpfDatabase: string;
  counters: string;
  manageTickets: string;
  userManagement: string;
  liquidGlass: string;
  orders: string;
  customization: string;
  presets: string;
  integrations: string;
  indications: string;
  referAndEarn: string;
  resale: string;
  mercadoPagoPix: string;
  mercadoPagoCard: string;
  mercadoPagoBoleto: string;
};

const sidebarLabels: Record<Locale, SidebarLabels> = {
  'pt-BR': {
    dashboard: 'Dashboard',
    onlinePanels: 'Painéis Online',
    myAccount: 'Minha Conta',
    personalData: 'Dados Pessoais',
    myOrders: 'Meus Pedidos',
    digitalWallet: 'Carteira Digital',
    coupons: 'Cupons',
    useCoupons: 'Usar Cupons',
    manageCoupons: 'Gerenciar Cupons',
    preferences: 'Preferências',
    support: 'Suporte',
    history: 'Histórico',
    overview: 'Visão geral',
    queries: 'Consultas',
    apiRecords: 'Cadastros na API',
    pixPayments: 'Pagamentos PIX',
    reloadsAndDeposits: 'Recargas e Depósitos',
    purchasesAndPlans: 'Compras e Planos',
    usedCoupons: 'Cupons Utilizados',
    administration: 'Administração',
    adminTestimonials: 'Admin Depoimentos',
    authentications: 'Autenticações',
    cpfDatabase: 'Base de CPFs',
    counters: 'Contadores',
    manageTickets: 'Gerenciar Chamados',
    userManagement: 'Gestão de Usuários',
    liquidGlass: 'Liquid Glass',
    orders: 'Pedidos',
    customization: 'Personalização',
    presets: 'Predefinições',
    integrations: 'Integrações',
    indications: 'Indicações',
    referAndEarn: 'Indique e Ganhe',
    resale: 'Revenda',
    mercadoPagoPix: 'Mercado Pago - PIX',
    mercadoPagoCard: 'Mercado Pago - Cartão',
    mercadoPagoBoleto: 'Mercado Pago - Boleto',
  },
  en: {
    dashboard: 'Dashboard',
    onlinePanels: 'Online Panels',
    myAccount: 'My Account',
    personalData: 'Personal Data',
    myOrders: 'My Orders',
    digitalWallet: 'Digital Wallet',
    coupons: 'Coupons',
    useCoupons: 'Use Coupons',
    manageCoupons: 'Manage Coupons',
    preferences: 'Preferences',
    support: 'Support',
    history: 'History',
    overview: 'Overview',
    queries: 'Queries',
    apiRecords: 'API Records',
    pixPayments: 'PIX Payments',
    reloadsAndDeposits: 'Top-ups and Deposits',
    purchasesAndPlans: 'Purchases and Plans',
    usedCoupons: 'Used Coupons',
    administration: 'Administration',
    adminTestimonials: 'Admin Testimonials',
    authentications: 'Authentications',
    cpfDatabase: 'CPF Database',
    counters: 'Counters',
    manageTickets: 'Manage Tickets',
    userManagement: 'User Management',
    liquidGlass: 'Liquid Glass',
    orders: 'Orders',
    customization: 'Customization',
    presets: 'Presets',
    integrations: 'Integrations',
    indications: 'Referrals',
    referAndEarn: 'Refer and Earn',
    resale: 'Resale',
    mercadoPagoPix: 'Mercado Pago - PIX',
    mercadoPagoCard: 'Mercado Pago - Card',
    mercadoPagoBoleto: 'Mercado Pago - Boleto',
  },
  es: {
    dashboard: 'Dashboard',
    onlinePanels: 'Paneles Online',
    myAccount: 'Mi Cuenta',
    personalData: 'Datos Personales',
    myOrders: 'Mis Pedidos',
    digitalWallet: 'Cartera Digital',
    coupons: 'Cupones',
    useCoupons: 'Usar Cupones',
    manageCoupons: 'Gestionar Cupones',
    preferences: 'Preferencias',
    support: 'Soporte',
    history: 'Historial',
    overview: 'Resumen',
    queries: 'Consultas',
    apiRecords: 'Registros en API',
    pixPayments: 'Pagos PIX',
    reloadsAndDeposits: 'Recargas y Depósitos',
    purchasesAndPlans: 'Compras y Planes',
    usedCoupons: 'Cupones Utilizados',
    administration: 'Administración',
    adminTestimonials: 'Admin Testimonios',
    authentications: 'Autenticaciones',
    cpfDatabase: 'Base de CPFs',
    counters: 'Contadores',
    manageTickets: 'Gestionar Tickets',
    userManagement: 'Gestión de Usuarios',
    liquidGlass: 'Liquid Glass',
    orders: 'Pedidos',
    customization: 'Personalización',
    presets: 'Preajustes',
    integrations: 'Integraciones',
    indications: 'Referidos',
    referAndEarn: 'Recomienda y Gana',
    resale: 'Reventa',
    mercadoPagoPix: 'Mercado Pago - PIX',
    mercadoPagoCard: 'Mercado Pago - Tarjeta',
    mercadoPagoBoleto: 'Mercado Pago - Boleto',
  },
};

export const createAssinanteSidebarItems = (handleLogout: () => void, panelMenus: SidebarItem[] = [], isSupport: boolean = false, locale: Locale = 'pt-BR'): SidebarItem[] => {
  const t = sidebarLabels[locale];

  return [
    ...(isSupport ? [{
      icon: Gauge,
      label: t.dashboard,
      path: '/dashboard/admin'
    }] : []),
    {
      icon: PanelsTopLeft,
      label: t.onlinePanels,
      path: '/dashboard'
    },
    ...panelMenus,
    {
      icon: User,
      label: t.myAccount,
      path: '#',
      subItems: [
        {
          icon: User,
          label: t.personalData,
          path: '/dashboard/dados-pessoais'
        },
        {
          icon: ClipboardList,
          label: t.myOrders,
          path: '/dashboard/meus-pedidos'
        },
        {
          icon: Wallet,
          label: t.digitalWallet,
          path: '/dashboard/carteira'
        },
        ...(isSupport ? [
          {
            icon: Ticket,
            label: t.coupons,
            path: '/dashboard/cupons',
            subItems: [
              {
                icon: Ticket,
                label: t.useCoupons,
                path: '/dashboard/cupons'
              },
              {
                icon: Gift,
                label: t.manageCoupons,
                path: '/dashboard/admin/cupons'
              }
            ]
          }
        ] : [
          {
            icon: Ticket,
            label: t.coupons,
            path: '/dashboard/cupons'
          }
        ]),
        {
          icon: Cog,
          label: t.preferences,
          path: '/dashboard/preferencias'
        },
        {
          icon: MessageSquare,
          label: t.support,
          path: '/dashboard/suporte'
        },
        {
          icon: History,
          label: t.history,
          path: '/dashboard/historico',
          subItems: [
            {
              icon: History,
              label: t.overview,
              path: '/dashboard/historico'
            },
            {
              icon: History,
              label: t.queries,
              path: '/dashboard/historico/consultas'
            },
            {
              icon: FileText,
              label: t.apiRecords,
              path: '/dashboard/historico/cadastros-api'
            },
            {
              icon: CreditCard,
              label: t.pixPayments,
              path: '/dashboard/historico/pagamentos-pix'
            },
            {
              icon: RefreshCw,
              label: t.reloadsAndDeposits,
              path: '/dashboard/historico/recargas-depositos'
            },
            {
              icon: Wallet,
              label: t.purchasesAndPlans,
              path: '/dashboard/historico/compras-planos'
            },
            {
              icon: Ticket,
              label: t.usedCoupons,
              path: '/dashboard/historico/cupons-utilizados'
            }
          ]
        }
      ]
    },
    ...(isSupport ? [{
      icon: Settings,
      label: t.administration,
      path: '#',
      subItems: [
        {
          icon: FileText,
          label: t.adminTestimonials,
          path: '/dashboard/admin-depoimentos'
        },
        {
          icon: Settings,
          label: t.authentications,
          path: '/dashboard/admin/autenticacoes'
        },
        {
          icon: Database,
          label: t.cpfDatabase,
          path: '/dashboard/admin/base-cpf'
        },
        {
          icon: BarChart3,
          label: t.counters,
          path: '/dashboard/admin/contadores'
        },
        {
          icon: MessageSquare,
          label: t.manageTickets,
          path: '/dashboard/gerenciar-chamados'
        },
        {
          icon: Gift,
          label: t.manageCoupons,
          path: '/dashboard/admin/cupons'
        },
        {
          icon: Users,
          label: t.userManagement,
          path: '/dashboard/gestao-usuarios'
        },
        {
          icon: Droplets,
          label: t.liquidGlass,
          path: '/dashboard/admin/liquid-glass'
        },
        {
          icon: ClipboardList,
          label: t.orders,
          path: '/dashboard/admin/pedidos'
        },
        {
          icon: Palette,
          label: t.customization,
          path: '/dashboard/personalizacao'
        },
        {
          icon: SlidersHorizontal,
          label: t.presets,
          path: '/dashboard/admin/predefinicoes'
        },
      ]
    }] : []),
    ...(isSupport ? [{
      icon: Plug,
      label: t.integrations,
      path: '#',
      subItems: [
        {
          icon: CreditCard,
          label: t.mercadoPagoPix,
          path: '/dashboard/integracoes/mercado-pago'
        },
        {
          icon: CreditCard,
          label: t.mercadoPagoCard,
          path: '/dashboard/integracoes/mercado-pago-cartao'
        },
        {
          icon: CreditCard,
          label: t.mercadoPagoBoleto,
          path: '/dashboard/integracoes/mercado-pago-boleto'
        },
      ]
    }] : []),
    {
      icon: Gift,
      label: t.indications,
      path: '#',
      subItems: [
        {
          icon: Gift,
          label: t.referAndEarn,
          path: '/dashboard/indique'
        },
        {
          icon: Store,
          label: t.resale,
          path: '/dashboard/revenda'
        }
      ]
    },
  ];
};
