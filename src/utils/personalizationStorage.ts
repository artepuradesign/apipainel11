interface CustomPlan {
  id: number;
  name: string;
  price: string;
  description: string;
  billing_period: string;
  discount: number;
  hasHighlight: boolean;
  highlightText: string;
  status: 'ativo' | 'inativo';
  operationalStatus: 'on' | 'off' | 'atualizando';
  colors: {
    background: string;
    border: string;
    text: string;
    suit: string;
    highlight: string;
    marker: string;
  };
  cardSuit: string;
  selectedModules: string[];
  theme: string;
  cardTheme: 'light' | 'dark' | 'gradient';
}

interface CustomModule {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: string;
  path: string;
  operationalStatus: 'on' | 'off' | 'manutencao';
  iconSize: 'small' | 'medium' | 'large';
  showDescription: boolean;
  panelId: string;
}

interface SystemPanel {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  status: 'ativo' | 'inativo';
  route: string;
  themeId?: string;
  template: 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano';
}

const STORAGE_KEYS = {
  CUSTOM_PLANS: 'lovable_custom_plans',
  CUSTOM_MODULES: 'lovable_custom_modules',
  SYSTEM_PANELS: 'lovable_system_panels',
  PERSONALIZATION_SETTINGS: 'lovable_personalization_settings'
};

// Painéis atualizados do sistema com template corporate
const DEFAULT_PANELS: SystemPanel[] = [
  {
    id: 'coleta',
    name: 'Painel de Coleta',
    description: 'Coleta de Informações',
    icon: 'Download',
    order: 1,
    status: 'ativo',
    route: '/dashboard/coleta',
    themeId: 'blue',
    template: 'corporate'
  },
  {
    id: 'consulta',
    name: 'Painel de Consulta',
    description: 'Consultas de Dados',
    icon: 'Search',
    order: 2,
    status: 'ativo',
    route: '/dashboard/consulta',
    themeId: 'purple',
    template: 'corporate'
  },
  {
    id: 'checker',
    name: 'Painel de Consulta com Checker',
    description: 'Consultas com Checker',
    icon: 'BarChart',
    order: 3,
    status: 'ativo',
    route: '/dashboard/checker',
    themeId: 'green',
    template: 'corporate'
  },
  {
    id: 'beneficio',
    name: 'Painel de Benéfícios',
    description: 'Consultas de Benefícios',
    icon: 'Heart',
    order: 4,
    status: 'ativo',
    route: '/dashboard/beneficio',
    themeId: 'red',
    template: 'corporate'
  },
  {
    id: 'editor',
    name: 'Editor Online',
    description: 'Edição de Documentos',
    icon: 'Edit',
    order: 5,
    status: 'ativo',
    route: '/dashboard/editor',
    themeId: 'orange',
    template: 'corporate'
  },
  {
    id: 'editavel',
    name: 'Editável Matriz',
    description: 'Arquivos em .CDR ou .PSD',
    icon: 'Upload',
    order: 6,
    status: 'ativo',
    route: '/dashboard/editavel',
    themeId: 'indigo',
    template: 'corporate'
  },
  {
    id: 'qrcode',
    name: 'Painel QRCodes',
    description: 'Gera QRCodes Validados',
    icon: 'Cloud',
    order: 7,
    status: 'ativo',
    route: '/dashboard/qrcode',
    themeId: 'cyan',
    template: 'corporate'
  },
  {
    id: 'banco',
    name: 'Painel Bancos Digitais',
    description: 'Pagamentos PIX, Comprovante e Extrato',
    icon: 'DollarSign',
    order: 8,
    status: 'ativo',
    route: '/dashboard/banco',
    themeId: 'emerald',
    template: 'corporate'
  }
];

// Módulos atualizados do Painel de Consulta (sem R$ no preço)
const DEFAULT_CONSULTA_MODULES: CustomModule[] = [
  {
    id: 'busca-nome',
    title: 'NOME',
    description: 'Consultar por Nome',
    price: '2,00',
    icon: 'Search',
    path: '/dashboard/consulta/nome',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-cpf',
    title: 'CPF',
    description: 'Consultar por CPF',
    price: '2,00',
    icon: 'Search',
    path: '/dashboard/consulta/cpf',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-mae',
    title: 'MÃE',
    description: 'Consultar nome Mãe',
    price: '2,50',
    icon: 'Search',
    path: '/dashboard/consulta/mae',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-pai',
    title: 'PAI',
    description: 'Consultar nome Pai',
    price: '2,50',
    icon: 'Search',
    path: '/dashboard/consulta/pai',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-cnh',
    title: 'CNH',
    description: 'Consultar por CNH',
    price: '3,00',
    icon: 'Search',
    path: '/dashboard/consulta/cnh',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-rg',
    title: 'RG',
    description: 'Consultar por RG',
    price: '3,00',
    icon: 'Search',
    path: '/dashboard/consulta/rg',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-nis',
    title: 'NIS',
    description: 'Consultar por NIS',
    price: '2,00',
    icon: 'Search',
    path: '/dashboard/consulta/nis',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-pix',
    title: 'PIX',
    description: 'Consultar Chave PIX',
    price: '5,00',
    icon: 'Search',
    path: '/dashboard/consulta/pix',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-foto-cpf',
    title: 'Foto CPF',
    description: 'Consultar por CPF',
    price: '10,00',
    icon: 'Search',
    path: '/dashboard/consulta/foto-cpf',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-foto-nome',
    title: 'Foto Nome',
    description: 'Consultar por Nome',
    price: '10,00',
    icon: 'Search',
    path: '/dashboard/consulta/foto-nome',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-telefone',
    title: 'Telefone',
    description: 'Consultar TELEFONE',
    price: '2,00',
    icon: 'Search',
    path: '/dashboard/consulta/telefone',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-email',
    title: 'E-mail',
    description: 'Consultar EMAIL',
    price: '2,00',
    icon: 'Search',
    path: '/dashboard/consulta/email',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-endereco',
    title: 'Endereço',
    description: 'Consultar Endereço por CPF',
    price: '3,00',
    icon: 'Search',
    path: '/dashboard/consulta/endereco',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'score-boa-vista',
    title: 'SCORE BV',
    description: 'Consultar Score Boa Vista',
    price: '10,00',
    icon: 'Search',
    path: '/dashboard/consulta/scorebv',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'score-serasa',
    title: 'SCORE SERASA',
    description: 'Consultar Score Serasa',
    price: '10,00',
    icon: 'Search',
    path: '/dashboard/consulta/scoreserasa',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-dividas',
    title: 'Dívidas CPF',
    description: 'Consultar por CPF',
    price: '5,00',
    icon: 'Search',
    path: '/dashboard/consulta/dividas',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  },
  {
    id: 'busca-bo',
    title: 'Busca BO',
    description: 'Consultar por CPF',
    price: '10,00',
    icon: 'Search',
    path: '/dashboard/consulta/bo',
    operationalStatus: 'on',
    iconSize: 'medium',
    showDescription: true,
    panelId: 'consulta'
  }
];

// Planos padrão do sistema - TODOS com tema "preto" aplicado
const DEFAULT_PLANS: CustomPlan[] = [
  // Rainhas (Planos básicos) - TODOS com tema preto
  {
    id: 1001,
    name: "Rainha de Ouros",
    price: "100,00",
    description: "Plano básico para consultas essenciais",
    billing_period: "mensal",
    discount: 5,
    hasHighlight: false,
    highlightText: "",
    status: "ativo",
    operationalStatus: "on",
    colors: {
      background: "linear-gradient(135deg, rgba(55, 65, 81, 0.95) 0%, rgba(31, 41, 55, 0.9) 50%, rgba(17, 24, 39, 0.85) 100%)",
      border: "#374151",
      text: "#ffffff",
      suit: "#ffffff",
      highlight: "#10b981",
      marker: "#22c55e"
    },
    cardSuit: "♦",
    selectedModules: [
      "NOME", "CPF", "MÃE", "PAI", 
      "CNH", "RG", "NIS", "PIX"
    ],
    theme: "preto",
    cardTheme: "dark"
  },
  {
    id: 1002,
    name: "Rainha de Paus",
    price: "150,00",
    description: "Plano básico mais popular",
    billing_period: "mensal",
    discount: 10,
    hasHighlight: true,
    highlightText: "Mais popular",
    status: "ativo",
    operationalStatus: "on",
    colors: {
      background: "linear-gradient(135deg, rgba(55, 65, 81, 0.95) 0%, rgba(31, 41, 55, 0.9) 50%, rgba(17, 24, 39, 0.85) 100%)",
      border: "#374151",
      text: "#ffffff",
      suit: "#ffffff",
      highlight: "#10b981",
      marker: "#22c55e"
    },
    cardSuit: "♣",
    selectedModules: [
      "NOME", "CPF", "MÃE", "PAI", 
      "CNH", "RG", "NIS", "PIX"
    ],
    theme: "preto",
    cardTheme: "dark"
  },
  {
    id: 1003,
    name: "Rainha de Copas",
    price: "200,00",
    description: "Plano básico completo",
    billing_period: "mensal",
    discount: 15,
    hasHighlight: false,
    highlightText: "",
    status: "ativo",
    operationalStatus: "on",
    colors: {
      background: "linear-gradient(135deg, rgba(55, 65, 81, 0.95) 0%, rgba(31, 41, 55, 0.9) 50%, rgba(17, 24, 39, 0.85) 100%)",
      border: "#374151",
      text: "#ffffff",
      suit: "#ffffff",
      highlight: "#10b981",
      marker: "#22c55e"
    },
    cardSuit: "♥",
    selectedModules: [
      "NOME", "CPF", "MÃE", "PAI", 
      "CNH", "RG", "NIS", "PIX"
    ],
    theme: "preto",
    cardTheme: "dark"
  },
  {
    id: 1004,
    name: "Rainha de Espadas",
    price: "250,00",
    description: "Plano básico profissional",
    billing_period: "mensal",
    discount: 20,
    hasHighlight: true,
    highlightText: "Profissional",
    status: "ativo",
    operationalStatus: "on",
    colors: {
      background: "linear-gradient(135deg, rgba(55, 65, 81, 0.95) 0%, rgba(31, 41, 55, 0.9) 50%, rgba(17, 24, 39, 0.85) 100%)",
      border: "#374151",
      text: "#ffffff",
      suit: "#ffffff",
      highlight: "#10b981",
      marker: "#22c55e"
    },
    cardSuit: "♠",
    selectedModules: [
      "NOME", "CPF", "MÃE", "PAI", 
      "CNH", "RG", "NIS", "PIX"
    ],
    theme: "preto",
    cardTheme: "dark"
  },
  // Reis (Planos avançados) - TODOS com tema preto
  {
    id: 2001,
    name: "Rei de Ouros",
    price: "300,00",
    description: "Plano avançado com recursos premium",
    billing_period: "mensal",
    discount: 20,
    hasHighlight: false,
    highlightText: "",
    status: "ativo",
    operationalStatus: "on",
    colors: {
      background: "linear-gradient(135deg, rgba(55, 65, 81, 0.95) 0%, rgba(31, 41, 55, 0.9) 50%, rgba(17, 24, 39, 0.85) 100%)",
      border: "#374151",
      text: "#ffffff",
      suit: "#ffffff",
      highlight: "#10b981",
      marker: "#22c55e"
    },
    cardSuit: "♦",
    selectedModules: [
      "NOME", "CPF", "MÃE", "PAI", 
      "CNH", "RG", "NIS", "PIX"
    ],
    theme: "preto",
    cardTheme: "dark"
  },
  {
    id: 2002,
    name: "Rei de Paus",
    price: "350,00",
    description: "Plano avançado empresarial",
    billing_period: "mensal",
    discount: 30,
    hasHighlight: false,
    highlightText: "",
    status: "ativo",
    operationalStatus: "on",
    colors: {
      background: "linear-gradient(135deg, rgba(55, 65, 81, 0.95) 0%, rgba(31, 41, 55, 0.9) 50%, rgba(17, 24, 39, 0.85) 100%)",
      border: "#374151",
      text: "#ffffff",
      suit: "#ffffff",
      highlight: "#10b981",
      marker: "#22c55e"
    },
    cardSuit: "♣",
    selectedModules: [
      "NOME", "CPF", "MÃE", "PAI", 
      "CNH", "RG", "NIS", "PIX"
    ],
    theme: "preto",
    cardTheme: "dark"
  },
  {
    id: 2003,
    name: "Rei de Copas",
    price: "400,00",
    description: "Plano avançado com editor",
    billing_period: "mensal",
    discount: 40,
    hasHighlight: true,
    highlightText: "Editor",
    status: "ativo",
    operationalStatus: "on",
    colors: {
      background: "linear-gradient(135deg, rgba(55, 65, 81, 0.95) 0%, rgba(31, 41, 55, 0.9) 50%, rgba(17, 24, 39, 0.85) 100%)",
      border: "#374151",
      text: "#ffffff",
      suit: "#ffffff",
      highlight: "#10b981",
      marker: "#22c55e"
    },
    cardSuit: "♥",
    selectedModules: [
      "NOME", "CPF", "MÃE", "PAI", 
      "CNH", "RG", "NIS", "PIX"
    ],
    theme: "preto",
    cardTheme: "dark"
  },
  {
    id: 2004,
    name: "Rei de Espadas",
    price: "450,00",
    description: "Plano avançado premium",
    billing_period: "mensal",
    discount: 50,
    hasHighlight: true,
    highlightText: "Editor PRO",
    status: "ativo",
    operationalStatus: "on",
    colors: {
      background: "linear-gradient(135deg, rgba(55, 65, 81, 0.95) 0%, rgba(31, 41, 55, 0.9) 50%, rgba(17, 24, 39, 0.85) 100%)",
      border: "#374151",
      text: "#ffffff",
      suit: "#ffffff",
      highlight: "#10b981",
      marker: "#22c55e"
    },
    cardSuit: "♠",
    selectedModules: [
      "NOME", "CPF", "MÃE", "PAI", 
      "CNH", "RG", "NIS", "PIX"
    ],
    theme: "preto",
    cardTheme: "dark"
  }
];

// Planos personalizados
export const saveCustomPlans = (plans: CustomPlan[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PLANS, JSON.stringify(plans));
    console.log('Planos personalizados salvos:', plans.length);
  } catch (error) {
    console.error('Erro ao salvar planos personalizados:', error);
  }
};

export const loadCustomPlans = (): CustomPlan[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_PLANS);
    if (saved) {
      const plans = JSON.parse(saved);
      console.log('Planos personalizados carregados:', plans.length);
      return plans;
    } else {
      // Salvar planos padrão se não existirem
      saveCustomPlans(DEFAULT_PLANS);
      return DEFAULT_PLANS;
    }
  } catch (error) {
    console.error('Erro ao carregar planos personalizados:', error);
    return DEFAULT_PLANS;
  }
};

// Módulos personalizados
export const saveCustomModules = (modules: CustomModule[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_MODULES, JSON.stringify(modules));
    console.log('Módulos personalizados salvos:', modules.length);
  } catch (error) {
    console.error('Erro ao salvar módulos personalizados:', error);
  }
};

export const loadCustomModules = (): CustomModule[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_MODULES);
    if (saved) {
      const modules = JSON.parse(saved);
      console.log('Módulos personalizados carregados:', modules.length);
      return modules;
    } else {
      // Salvar módulos padrão se não existirem
      saveCustomModules(DEFAULT_CONSULTA_MODULES);
      return DEFAULT_CONSULTA_MODULES;
    }
  } catch (error) {
    console.error('Erro ao carregar módulos personalizados:', error);
    return DEFAULT_CONSULTA_MODULES;
  }
};

// Painéis do sistema
export const saveSystemPanels = (panels: SystemPanel[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_PANELS, JSON.stringify(panels));
    console.log('✅ Painéis do sistema salvos com sucesso:', panels.length);
  } catch (error) {
    console.error('❌ Erro ao salvar painéis do sistema:', error);
  }
};

export const loadSystemPanels = (): SystemPanel[] => {
  try {
    console.log('🔄 Iniciando carregamento dos painéis do sistema...');
    
    const saved = localStorage.getItem(STORAGE_KEYS.SYSTEM_PANELS);
    
    if (saved) {
      const panels = JSON.parse(saved);
      console.log('✅ Painéis carregados do localStorage:', panels.length);
      
      // Validar se os painéis são válidos
      if (Array.isArray(panels) && panels.length > 0) {
        return panels;
      }
    }
    
    console.log('⚠️ Nenhum painel encontrado ou dados inválidos, carregando padrões...');
    console.log('📦 Salvando painéis padrão:', DEFAULT_PANELS.length);
    
    // Salvar painéis padrão se não existirem ou se estiverem corrompidos
    saveSystemPanels(DEFAULT_PANELS);
    return DEFAULT_PANELS;
    
  } catch (error) {
    console.error('❌ Erro ao carregar painéis do sistema:', error);
    console.log('🔧 Retornando painéis padrão devido ao erro');
    
    // Em caso de erro, salvar e retornar os padrões
    saveSystemPanels(DEFAULT_PANELS);
    return DEFAULT_PANELS;
  }
};

// Configurações gerais de personalização
export const savePersonalizationSettings = (settings: any): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PERSONALIZATION_SETTINGS, JSON.stringify(settings));
    console.log('Configurações de personalização salvas');
  } catch (error) {
    console.error('Erro ao salvar configurações de personalização:', error);
  }
};

export const loadPersonalizationSettings = (): any => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PERSONALIZATION_SETTINGS);
    if (saved) {
      console.log('Configurações de personalização carregadas');
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Erro ao carregar configurações de personalização:', error);
  }
  return {};
};

// Limpar todos os dados de personalização
export const clearPersonalizationData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_PLANS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_MODULES);
    localStorage.removeItem(STORAGE_KEYS.SYSTEM_PANELS);
    localStorage.removeItem(STORAGE_KEYS.PERSONALIZATION_SETTINGS);
    console.log('Dados de personalização limpos');
  } catch (error) {
    console.error('Erro ao limpar dados de personalização:', error);
  }
};

export type { CustomPlan, CustomModule, SystemPanel };
export { DEFAULT_PANELS, DEFAULT_CONSULTA_MODULES, DEFAULT_PLANS };
