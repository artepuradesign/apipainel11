import { useState, useEffect } from 'react';
import { PricingPlan } from './PricingCard';
import { loadCustomPlans, type CustomPlan } from '@/utils/personalizationStorage';

export const usePricingPlans = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load custom plans first
    const customPlans = loadCustomPlans();
    
    if (customPlans.length > 0) {
      // Convert custom plans to pricing plans format
      const convertedPlans = customPlans
        .filter(plan => plan.status === 'ativo')
        .map((customPlan, index) => convertCustomPlanToPricingPlan(customPlan, index + 1));
      
      console.log('Using custom plans:', convertedPlans.length);
      setPlans(convertedPlans);
    } else {
      // Fallback to default plans if no custom plans exist
      console.log('No custom plans found, using default plans');
      setPlans(getDefaultPlans());
    }
    
    setLoading(false);
  }, []);

  return { plans, loading };
};

const convertCustomPlanToPricingPlan = (customPlan: CustomPlan, id: number): PricingPlan => {
  // Generate features based on modules or use default features
  const features = customPlan.selectedModules && customPlan.selectedModules.length > 0
    ? customPlan.selectedModules.map(module => ({ text: module, included: true }))
    : getDefaultFeatures();

  // Determine badges based on plan name and properties
  const isFeatured = customPlan.hasHighlight || customPlan.name.toLowerCase().includes('popular');
  const isProfessional = customPlan.name.toLowerCase().includes('profissional') || customPlan.name.toLowerCase().includes('copas');
  const isEditor = customPlan.name.toLowerCase().includes('editor') && !customPlan.name.toLowerCase().includes('pro');
  const isEditorPro = customPlan.name.toLowerCase().includes('editor pro') || customPlan.name.toLowerCase().includes('espadas');

  return {
    id,
    name: customPlan.name,
    price: customPlan.price,
    description: customPlan.description,
    features,
    subscription_link: "/registro",
    billing_period: customPlan.billing_period,
    is_featured: isFeatured,
    is_professional: isProfessional,
    is_editor: isEditor,
    is_editor_pro: isEditorPro,
    consultations_included: "Conforme plano",
    color: mapColorsToTheme(customPlan.colors, customPlan.cardSuit),
    theme: customPlan.theme,
    cardSuit: customPlan.cardSuit
  };
};

const mapColorsToTheme = (colors: any, suit: string): string => {
  // Map suit to color theme
  const suitToTheme: { [key: string]: string } = {
    '♦': 'tone1', // Ouros - roxo
    '♣': 'tone2', // Paus - preto  
    '♥': 'tone3', // Copas - vermelho
    '♠': 'tone4'  // Espadas - azul
  };
  
  return suitToTheme[suit] || 'tone1';
};

const getDefaultFeatures = () => [
  { text: "Consultas de CPF", included: true },
  { text: "Consultas de CNPJ", included: true },
  { text: "Validação de documentos", included: true },
  { text: "Painel de controle", included: true },
  { text: "Suporte por e-mail", included: true },
  { text: "API REST", included: true },
  { text: "Relatórios básicos", included: true },
  { text: "Múltiplos usuários", included: false },
];

const getDefaultPlans = (): PricingPlan[] => [
  {
    id: 1,
    name: "Básico",
    price: "R$ 99,90",
    description: "Para pequenas empresas e profissionais autônomos",
    consultations_included: "500",
    billing_period: "mensal",
    features: [
      { text: "Consultas de CPF básicas", included: true },
      { text: "Consultas de CNPJ básicas", included: true },
      { text: "Validação de documentos", included: true },
      { text: "Painel de controle", included: true },
      { text: "Suporte por e-mail", included: true },
      { text: "API REST", included: false },
      { text: "Múltiplos usuários", included: false },
      { text: "Relatórios avançados", included: false },
    ],
    subscription_link: "/registro",
  },
  {
    id: 2,
    name: "Profissional",
    price: "R$ 149,90",
    description: "Para empresas em crescimento e negócios estabelecidos",
    consultations_included: "3.000",
    billing_period: "mensal",
    is_featured: true,
    features: [
      { text: "Consultas de CPF completas", included: true },
      { text: "Consultas de CNPJ completas", included: true },
      { text: "Validação de documentos", included: true },
      { text: "Painel de controle", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "API REST", included: true },
      { text: "Múltiplos usuários (até 5)", included: true },
      { text: "Relatórios avançados", included: false },
    ],
    subscription_link: "/registro",
  },
  {
    id: 3,
    name: "Empresarial",
    price: "R$ 199,90",
    description: "Para grandes empresas com alto volume de consultas",
    consultations_included: "10.000",
    billing_period: "mensal",
    features: [
      { text: "Consultas de CPF completas", included: true },
      { text: "Consultas de CNPJ completas", included: true },
      { text: "Validação de documentos", included: true },
      { text: "Painel de controle personalizado", included: true },
      { text: "Suporte prioritário 24/7", included: true },
      { text: "API REST com recursos avançados", included: true },
      { text: "Usuários ilimitados", included: true },
      { text: "Relatórios avançados", included: true },
    ],
    subscription_link: "/registro",
  },
  {
    id: 4,
    name: "Premium",
    price: "R$ 249,90",
    description: "Solução completa com geração de QR Codes válidos",
    consultations_included: "15.000",
    billing_period: "mensal",
    features: [
      { text: "Todas as funcionalidades do Empresarial", included: true },
      { text: "Geração de QR Codes para documentos", included: true },
      { text: "Verificador de autenticidade", included: true },
      { text: "Integração com certificados digitais", included: true },
      { text: "Customização com sua marca", included: true },
      { text: "Suporte dedicado", included: true },
      { text: "Acesso à API de QR Codes", included: true },
      { text: "Relatórios detalhados de uso", included: true },
    ],
    subscription_link: "/registro",
  },
];
