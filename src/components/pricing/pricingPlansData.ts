
// Pricing plans data
export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingPlan {
  id: number;
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  subscription_link: string;
  is_featured?: boolean;
  is_professional?: boolean;
  is_editor?: boolean;
  is_editor_pro?: boolean;
  consultations_included: string;
  billing_period?: string;
  color?: string;
  theme?: string;
  cardSuit?: string;
  cardType?: string;
  badge?: string;
  planCategory?: 'basic' | 'advanced'; // Nova propriedade para classificação
}

export const pricingPlans: PricingPlan[] = [
  // Planos Básicos - Rainhas (reorganizados por cor conforme imagem)
  {
    id: 1,
    name: "Rainha de Ouros",
    price: "R$ 100",
    description: "Plano básico para consultas essenciais",
    features: [
      { text: "Busca CPF, Nome", included: true },
      { text: "Data de Nascimento", included: true },
      { text: "Busca Nome Mãe, Pai", included: true },
      { text: "Telefone e E-mail", included: true },
      { text: "CEP, Endereço", included: true },
      { text: "Busca Foto", included: false },
      { text: "Busca CNPJ", included: false },
      { text: "Busca Placa", included: false },
    ],
    subscription_link: "/registro",
    is_featured: false,
    consultations_included: "200 consultas",
    billing_period: "mensal",
    color: "tone1", // Tom claro
    theme: "tone1",
    cardSuit: "♦",
    cardType: "Queen",
    badge: "Básico",
    planCategory: "basic"
  },
  {
    id: 2,
    name: "Rainha de Paus",
    price: "R$ 150",
    description: "Plano básico mais popular",
    features: [
      { text: "Busca CPF, Nome", included: true },
      { text: "Data de Nascimento", included: true },
      { text: "Busca Nome Mãe, Pai", included: true },
      { text: "Telefone e E-mail", included: true },
      { text: "CEP, Endereço", included: true },
      { text: "Busca Foto", included: false },
      { text: "Busca CNPJ", included: true },
      { text: "Busca Placa", included: false },
    ],
    subscription_link: "/registro",
    is_featured: true, // Mais popular
    consultations_included: "300 consultas",
    billing_period: "mensal",
    color: "tone3", // Tom roxo (lilás)
    theme: "tone3",
    cardSuit: "♣",
    cardType: "Queen",
    badge: "Mais popular",
    planCategory: "basic"
  },
  {
    id: 3,
    name: "Rainha de Copas",
    price: "R$ 200",
    description: "Plano básico completo",
    features: [
      { text: "Busca CPF, Nome", included: true },
      { text: "Data de Nascimento", included: true },
      { text: "Busca Nome Mãe, Pai", included: true },
      { text: "Telefone e E-mail", included: true },
      { text: "CEP, Endereço", included: true },
      { text: "Busca Foto", included: true },
      { text: "Busca CNPJ", included: true },
      { text: "Busca Placa", included: true },
    ],
    subscription_link: "/registro",
    is_featured: false,
    consultations_included: "400 consultas",
    billing_period: "mensal",
    color: "tone2", // Tom médio
    theme: "tone2",
    cardSuit: "♥",
    cardType: "Queen",
    badge: "Profissional",
    planCategory: "basic"
  },
  {
    id: 4,
    name: "Rainha de Espadas",
    price: "R$ 250",
    description: "Plano básico profissional",
    features: [
      { text: "Checker CPF, Nome", included: true },
      { text: "Data de Nascimento", included: true },
      { text: "Busca Nome Mãe, Pai", included: true },
      { text: "Telefone e E-mail", included: true },
      { text: "CEP, Endereço", included: true },
      { text: "Busca Foto", included: true },
      { text: "Busca CNPJ", included: true },
      { text: "Busca Placa", included: true },
    ],
    subscription_link: "/registro",
    is_featured: false,
    is_professional: true,
    consultations_included: "500 consultas",
    billing_period: "mensal",
    color: "tone4", // Tom escuro
    theme: "tone4",
    cardSuit: "♠",
    cardType: "Queen",
    badge: "Avançado",
    planCategory: "basic"
  },
  // Planos Avançados - Reis (mesma ordem de cores)
  {
    id: 5,
    name: "Rei de Ouros",
    price: "R$ 300",
    description: "Plano avançado com recursos premium",
    features: [
      { text: "Buscas Completas", included: true, highlight: true },
      { text: "Checker CPF, Nome", included: true },
      { text: "Checker Nascimento", included: true },
      { text: "Checker Foto + BO", included: false },
      { text: "Checker CNPJ", included: false },
      { text: "Checker Veículos", included: false },
      { text: "Editor de Docs", included: false },
    ],
    subscription_link: "/registro",
    is_featured: false,
    consultations_included: "500 créditos",
    billing_period: "mensal",
    color: "tone1", // Tom claro - igual Rainha de Ouros
    theme: "tone1",
    cardSuit: "♦",
    cardType: "King",
    badge: "Premium",
    planCategory: "advanced"
  },
  {
    id: 6,
    name: "Rei de Paus",
    price: "R$ 350",
    description: "Plano avançado empresarial",
    features: [
      { text: "Buscas Completas", included: true, highlight: true },
      { text: "Checker CPF, Nome", included: true },
      { text: "Checker Nascimento", included: true },
      { text: "Checker Foto + BO", included: true },
      { text: "Checker CNPJ", included: true },
      { text: "Checker Veículos", included: true },
      { text: "Editor de Docs", included: false },
    ],
    subscription_link: "/registro",
    is_featured: false,
    consultations_included: "600 créditos",
    billing_period: "mensal",
    color: "tone3", // Tom roxo (lilás) - igual Rainha de Paus
    theme: "tone3",
    cardSuit: "♣",
    cardType: "King",
    badge: "Empresarial",
    planCategory: "advanced"
  },
  {
    id: 7,
    name: "Rei de Copas",
    price: "R$ 400",
    description: "Plano avançado com editor",
    features: [
      { text: "Buscas Completas", included: true, highlight: true },
      { text: "Checker CPF, Nome", included: true },
      { text: "Checker Nascimento", included: true },
      { text: "Checker Foto + BO", included: true },
      { text: "Checker CNPJ", included: true },
      { text: "Checker Veículos", included: true },
      { text: "Editor de Docs", included: true },
    ],
    subscription_link: "/registro",
    is_featured: false,
    is_editor: true,
    consultations_included: "700 créditos",
    billing_period: "mensal",
    color: "tone2", // Tom médio - igual Rainha de Copas
    theme: "tone2",
    cardSuit: "♥",
    cardType: "King",
    badge: "Editor",
    planCategory: "advanced"
  },
  {
    id: 8,
    name: "Rei de Espadas",
    price: "R$ 450",
    description: "Plano avançado premium",
    features: [
      { text: "Buscas Completas", included: true, highlight: true },
      { text: "Checker CPF, Nome", included: true },
      { text: "Checker Nascimento", included: true },
      { text: "Checker Foto + BO", included: true },
      { text: "Checker CNPJ", included: true },
      { text: "Checker Veículos", included: true },
      { text: "Editor de Docs", included: true },
    ],
    subscription_link: "/registro",
    is_featured: false,
    is_editor_pro: true,
    consultations_included: "800 créditos",
    billing_period: "mensal",
    color: "tone4", // Tom escuro - igual Rainha de Espadas
    theme: "tone4",
    cardSuit: "♠",
    cardType: "King",
    badge: "Editor PRO",
    planCategory: "advanced"
  }
];

// Funções utilitárias para filtrar planos
export const getBasicPlans = (): PricingPlan[] => {
  return pricingPlans.filter(plan => plan.planCategory === 'basic');
};

export const getAdvancedPlans = (): PricingPlan[] => {
  return pricingPlans.filter(plan => plan.planCategory === 'advanced');
};

export const getPlansByCategory = (category: 'basic' | 'advanced'): PricingPlan[] => {
  return pricingPlans.filter(plan => plan.planCategory === category);
};
