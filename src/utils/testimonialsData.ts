
export const addTestimonialExamples = () => {
  const exampleTestimonials = [
    {
      id: Date.now() + 1,
      name: "Maria Silva",
      company: "Consultoria Legal MS",
      message: "O sistema revolucionou nossa forma de trabalhar. As consultas são rápidas e precisas, economizando horas do nosso tempo diariamente.",
      rating: 5,
      status: "aprovado",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: Date.now() + 2,
      name: "João Santos",
      company: "Escritório Santos & Associados",
      message: "Interface intuitiva e resultados confiáveis. A equipe de suporte é excepcional, sempre pronta para ajudar quando precisamos.",
      rating: 5,
      status: "aprovado",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: Date.now() + 3,
      name: "Ana Costa",
      company: "Departamento Jurídico XYZ",
      message: "Excelente custo-benefício! Os planos se adequam perfeitamente às nossas necessidades e o retorno sobre investimento foi imediato.",
      rating: 5,
      status: "aprovado",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: Date.now() + 4,
      name: "Roberto Lima",
      company: "Consultoria Empresarial Lima",
      message: "A API é bem documentada e fácil de integrar. Conseguimos implementar o sistema em nosso software interno sem dificuldades.",
      rating: 4,
      status: "aprovado",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: Date.now() + 5,
      name: "Luciana Oliveira",
      company: "Advocacia Oliveira & Parceiros",
      message: "Os módulos personalizáveis são um diferencial incrível. Podemos configurar exatamente o que precisamos para cada tipo de cliente.",
      rating: 5,
      status: "aprovado",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: Date.now() + 6,
      name: "Carlos Mendes",
      company: "Escritório de Contabilidade Mendes",
      message: "Segurança e confiabilidade são pontos fortes da plataforma. Nossos dados estão sempre protegidos e as consultas são sempre atualizadas.",
      rating: 5,
      status: "aprovado",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Verificar se já existem depoimentos
  const existingTestimonials = JSON.parse(localStorage.getItem('testimonials') || '[]');
  
  // Se não há depoimentos ou há menos de 6, adicionar os exemplos
  if (existingTestimonials.length < 6) {
    localStorage.setItem('testimonials', JSON.stringify(exampleTestimonials));
    console.log('6 depoimentos de exemplo adicionados ao banco de dados simulado');
    return exampleTestimonials;
  }
  
  return existingTestimonials;
};

// Função para carregar depoimentos aprovados
export const loadApprovedTestimonials = () => {
  // Garantir que os exemplos estejam carregados
  addTestimonialExamples();
  
  const testimonials = JSON.parse(localStorage.getItem('testimonials') || '[]');
  
  // Retornar apenas os aprovados
  const approvedTestimonials = testimonials.filter((testimonial: any) => 
    testimonial.status === 'aprovado'
  );
  
  console.log('Testimonials loaded - exibindo apenas depoimentos aprovados na página inicial');
  return approvedTestimonials;
};
