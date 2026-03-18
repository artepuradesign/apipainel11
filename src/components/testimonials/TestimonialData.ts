
export interface Testimonial {
  id: number;
  name: string;
  position: string | null;
  company: string | null;
  instagram?: string | null;
  photo_url?: string | null;
  stars: number | null;
  content: string;
}

export const testimonialsData: Testimonial[] = [
  {
    id: 1,
    name: 'Maria Silva',
    position: 'Gerente de Compliance',
    company: 'Banco Nacional',
    instagram: 'maria.silva.oficial',
    content: 'A API do APIPainel transformou nosso processo de compliance. Conseguimos validar documentos em segundos, o que antes levava horas.',
    stars: 5
  },
  {
    id: 2,
    name: 'Carlos Mendes',
    position: 'CTO',
    company: 'Fintech Solutions',
    instagram: null,
    content: 'Integramos o APIPainel ao nosso sistema de onboarding e reduzimos em 70% o tempo de cadastro de novos clientes. O suporte técnico é excepcional.',
    stars: 5
  },
  {
    id: 3,
    name: 'Ana Luiza Costa',
    position: 'Analista de RH',
    company: 'Empresa ABC',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    content: 'Utilizamos o APIPainel para validar documentos durante o processo de contratação. A precisão das informações e a rapidez nas consultas fazem toda diferença.',
    stars: 4
  },
  {
    id: 4,
    name: 'Roberto Almeida',
    position: 'Diretor de Tecnologia',
    company: 'Seguros SA',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    content: 'A consulta de CPF e CNPJ da APIPainel é uma ferramenta essencial para nossa análise de risco. Os dados são completos e atualizados em tempo real.',
    stars: 5
  },
  {
    id: 5,
    name: 'Juliana Santos',
    position: 'Gestora de Crédito',
    company: 'Banco Digital',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    content: 'Desde que implementamos a API de consulta, nossos processos de análise de crédito se tornaram muito mais ágeis e precisos. O retorno sobre o investimento foi imediato.',
    stars: 5
  },
  {
    id: 6,
    name: 'Marcelo Oliveira',
    position: 'Advogado',
    company: 'Escritório Legal & Associados',
    photo_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    content: 'As consultas de veículos do APIPainel nos ajudam a construir casos mais sólidos para nossos clientes. A quantidade de informações detalhadas é impressionante.',
    stars: 5
  },
  {
    id: 7,
    name: 'Patricia Moraes',
    position: 'Gerente Comercial',
    company: 'Imobiliária Central',
    photo_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    content: 'Reduzimos significativamente os riscos nas locações após implementar as consultas de score de crédito do APIPainel. Um serviço indispensável no mercado imobiliário.',
    stars: 5
  },
  {
    id: 8,
    name: 'Fernando Costa',
    position: 'Analista de Fraude',
    company: 'E-commerce Mega',
    photo_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    content: 'A integração da API de consultas nos ajudou a reduzir as fraudes em mais de 60%. O investimento valeu cada centavo e o ROI foi alcançado em menos de 3 meses.',
    stars: 5
  }
];
