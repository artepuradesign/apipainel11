import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  MessageSquare,
  Users,
  CreditCard,
  Crown,
  Zap,
  Target,
  Gift,
  Plus
} from 'lucide-react';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQ[] = [
  // Planos e Descontos
  {
    id: '1',
    question: 'Como funcionam os planos de desconto?',
    answer: 'Nossos planos oferecem descontos progressivos nas consultas. O Plano Básico oferece 15% de desconto, o Intermediário 25% e o Premium 40%. Quanto maior o plano, maiores as economias em suas consultas diárias.',
    category: 'Planos'
  },
  {
    id: '2',
    question: 'Qual plano escolher para economizar mais?',
    answer: 'Se você faz mais de 20 consultas por mês, recomendamos o Plano Intermediário. Para usuários que fazem mais de 50 consultas mensais, o Plano Premium oferece o melhor custo-benefício com até 40% de desconto.',
    category: 'Planos'
  },
  {
    id: '3',
    question: 'Posso cancelar meu plano a qualquer momento?',
    answer: 'Sim! Você pode cancelar seu plano a qualquer momento. O desconto permanece ativo até o final do período já pago, e depois você volta ao sistema pré-pago normal.',
    category: 'Planos'
  },

  // Sistema de Indicação
  {
    id: '4',
    question: 'Como funciona o sistema de indicações?',
    answer: 'Para cada amigo que você indicar e que se cadastrar na plataforma, você ganha R$ 5,00 de bônus na sua carteira digital. Seu amigo também recebe R$ 5,00 de boas-vindas. Não há limite para o número de indicações!',
    category: 'Indicações'
  },
  {
    id: '5',
    question: 'Quando recebo o bônus da indicação?',
    answer: 'O bônus é creditado automaticamente na sua carteira assim que seu amigo confirmar o cadastro e ativar a conta. O valor fica disponível imediatamente para uso.',
    category: 'Indicações'
  },
  {
    id: '6',
    question: 'Posso indicar quantas pessoas eu quiser?',
    answer: 'Sim! Não há limite para indicações. Quanto mais amigos você trouxer, mais bônus você acumula. É uma excelente forma de construir um saldo extra na plataforma.',
    category: 'Indicações'
  },

  // Sistema de Cupons
  {
    id: '7',
    question: 'Como usar cupons de desconto?',
    answer: 'Cupons podem ser aplicados durante a recarga da carteira ou na compra de planos. Digite o código do cupom no campo específico e clique em "Aplicar". O desconto será calculado automaticamente.',
    category: 'Cupons'
  },
  {
    id: '8',
    question: 'Onde encontro cupons de desconto?',
    answer: 'Cupons são distribuídos por email para usuários ativos, nas nossas redes sociais, e em promoções especiais. Fique atento às nossas comunicações para não perder nenhuma oportunidade!',
    category: 'Cupons'
  },
  {
    id: '9',
    question: 'Posso usar múltiplos cupons ao mesmo tempo?',
    answer: 'Normalmente apenas um cupom pode ser usado por transação. Porém, alguns cupons especiais podem ser combinados com outros benefícios. Sempre teste durante o checkout!',
    category: 'Cupons'
  },

  // Painel de Consultas (DESTAQUE)
  {
    id: '10',
    question: 'O que é o Painel de Consultas e por que é tão importante?',
    answer: 'O Painel de Consultas é o coração da nossa plataforma! Aqui você tem acesso a mais de 15 tipos diferentes de consultas: CPF completo, CNPJ, veículos, busca por nome, telefone, endereços e muito mais. É o painel mais completo do mercado.',
    category: 'Consultas'
  },
  {
    id: '11',
    question: 'Quais tipos de consultas posso fazer?',
    answer: 'Oferecemos: Consulta CPF Completa (Serasa, SPC, dados pessoais), CNPJ (situação fiscal, sócios), Veículos (histórico, débitos), Busca por Nome, Mãe, Pai, Telefone Reverso, Endereços, Score, Histórico Financeiro e muito mais!',
    category: 'Consultas'
  },
  {
    id: '12',
    question: 'Como economizar nas consultas?',
    answer: 'Adquira um plano de desconto! Com o Plano Premium, você economiza até 40% em cada consulta. Se faz muitas consultas diárias, o retorno do investimento é garantido já no primeiro mês.',
    category: 'Consultas'
  },
  {
    id: '13',
    question: 'As consultas são seguras e legais?',
    answer: 'Sim! Todas nossas consultas seguem rigorosamente a LGPD e são realizadas através de APIs oficiais dos órgãos competentes. Seus dados e os dados consultados estão sempre protegidos.',
    category: 'Consultas'
  },

  // Carteira Digital
  {
    id: '14',
    question: 'Como funciona a carteira digital?',
    answer: 'A carteira digital é dividida em duas partes: Saldo Livre (para recargas e compra de planos) e Saldo do Plano (créditos específicos para consultas). Ambos são utilizados automaticamente conforme suas necessidades.',
    category: 'Carteira'
  },
  {
    id: '15',
    question: 'Quais métodos de pagamento aceitos?',
    answer: 'Aceitamos PIX (instantâneo), Cartão de Crédito, PayPal e transferências bancárias. O PIX é o método mais rápido, com confirmação em até 5 minutos.',
    category: 'Carteira'
  },
  {
    id: '16',
    question: 'Posso sacar dinheiro da carteira?',
    answer: 'Atualmente o sistema não permite saques. Os créditos são destinados exclusivamente para uso na plataforma: consultas, upgrades de plano e outras funcionalidades disponíveis.',
    category: 'Carteira'
  },

  // Técnico
  {
    id: '17',
    question: 'Por que minha consulta falhou?',
    answer: 'Consultas podem falhar por: CPF/CNPJ inválido, dados não encontrados nos órgãos consultados, instabilidade temporária da API. Em caso de falha comprovada do sistema, o crédito é devolvido automaticamente.',
    category: 'Técnico'
  },
  {
    id: '18',
    question: 'Como recuperar minha senha?',
    answer: 'Use a opção "Esqueci minha senha" na tela de login. Enviaremos um email com instruções para redefinir. Verifique também a caixa de spam.',
    category: 'Técnico'
  },
  {
    id: '19',
    question: 'O sistema está lento, o que fazer?',
    answer: 'Tente limpar o cache do navegador, usar uma conexão de internet mais estável, ou acesse em horários de menor movimento (manhã cedo ou final da noite). Se persistir, entre em contato.',
    category: 'Técnico'
  },

  // Geral
  {
    id: '20',
    question: 'Como entrar em contato com o suporte?',
    answer: 'Você pode consultar as perguntas frequentes aqui mesmo nesta página. Para questões mais específicas, utilize os canais de contato disponíveis em nossa página principal.',
    category: 'Geral'
  }
];

const textByLocale: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    pageTitle: 'Central de Suporte',
    faqTitle: 'Perguntas Frequentes',
    faqSubtitle: 'Explore nossa base de conhecimento e encontre respostas rápidas',
    searchPlaceholder: 'Digite sua dúvida ou palavra-chave...',
    filterByCategory: 'Filtrar por categoria',
    all: 'Todas',
    highlight: 'DESTAQUE',
    showMore: 'Ver mais',
    showLess: 'Mostrar menos perguntas',
    notFound: 'Nenhuma pergunta encontrada',
    notFoundDesc: 'Não encontramos resultados para sua busca. Tente usar palavras-chave diferentes ou navegue pelas categorias.',
    stillQuestions: 'Ainda tem dúvidas?',
    stillQuestionsDesc: 'Nossa equipe está aqui para ajudar! Entre em contato conosco através dos canais disponíveis.',
  },
  en: {
    pageTitle: 'Support Center',
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Browse our knowledge base and find quick answers',
    searchPlaceholder: 'Type your question or keyword...',
    filterByCategory: 'Filter by category',
    all: 'All',
    highlight: 'HIGHLIGHT',
    showMore: 'Show more',
    showLess: 'Show fewer questions',
    notFound: 'No questions found',
    notFoundDesc: 'No results for your search. Try different keywords or browse categories.',
    stillQuestions: 'Still have questions?',
    stillQuestionsDesc: 'Our team is here to help! Contact us through available channels.',
  },
  es: {
    pageTitle: 'Centro de Soporte',
    faqTitle: 'Preguntas Frecuentes',
    faqSubtitle: 'Explora nuestra base de conocimiento y encuentra respuestas rápidas',
    searchPlaceholder: 'Escribe tu duda o palabra clave...',
    filterByCategory: 'Filtrar por categoría',
    all: 'Todas',
    highlight: 'DESTACADO',
    showMore: 'Ver más',
    showLess: 'Mostrar menos preguntas',
    notFound: 'No se encontraron preguntas',
    notFoundDesc: 'No encontramos resultados para tu búsqueda. Prueba otras palabras clave o navega por categorías.',
    stillQuestions: '¿Aún tienes dudas?',
    stillQuestionsDesc: '¡Nuestro equipo está aquí para ayudarte! Contáctanos por los canales disponibles.',
  },
};

const Suporte = () => {
  const { locale } = useLocale();
  const t = textByLocale[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mostrar apenas 5 FAQs inicialmente, ou todos se showAll for true ou se houver busca
  const displayedFAQs = searchTerm ? filteredFAQs : (showAll ? filteredFAQs : filteredFAQs.slice(0, 5));
  const hasMoreFAQs = !searchTerm && filteredFAQs.length > 5 && !showAll;

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const categories = [...new Set(faqData.map(faq => faq.category))];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Consultas': return <Target className="h-4 w-4" />;
      case 'Planos': return <Crown className="h-4 w-4" />;
      case 'Indicações': return <Users className="h-4 w-4" />;
      case 'Cupons': return <Gift className="h-4 w-4" />;
      case 'Carteira': return <CreditCard className="h-4 w-4" />;
      case 'Técnico': return <Zap className="h-4 w-4" />;
      case 'Geral': return <MessageSquare className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Consultas': return 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30';
      case 'Planos': return 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:border-amber-800 dark:from-amber-950/30 dark:to-yellow-950/30';
      case 'Indicações': return 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/30 dark:to-emerald-950/30';
      case 'Cupons': return 'border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 dark:border-purple-800 dark:from-purple-950/30 dark:to-violet-950/30';
      case 'Carteira': return 'border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 dark:border-orange-800 dark:from-orange-950/30 dark:to-red-950/30';
      case 'Técnico': return 'border-cyan-200 bg-gradient-to-r from-cyan-50 to-sky-50 dark:border-cyan-800 dark:from-cyan-950/30 dark:to-sky-950/30';
      default: return 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 dark:border-gray-700 dark:from-gray-800/50 dark:to-slate-800/50';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 relative z-10 px-1 sm:px-0">
      <DashboardTitleCard
        title={t.pageTitle}
        icon={<HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
      />

      {/* Card principal com design moderno */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <div className="p-2 bg-primary/10 rounded-xl">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            {t.faqTitle}
          </CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {t.faqSubtitle}
          </p>
        </CardHeader>
        <CardContent className="space-y-5 sm:space-y-8">
          {/* Busca aprimorada */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base border-2 focus:border-primary/50 bg-background/50"
            />
          </div>

          {/* Filtros por Categoria com design moderno */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">{t.filterByCategory}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <Button
                variant={searchTerm === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchTerm('')}
                className="h-10 sm:h-12 justify-start font-medium"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                {t.all}
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={searchTerm === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchTerm(category)}
                  className="h-10 sm:h-12 justify-start font-medium"
                >
                  {getCategoryIcon(category)}
                  <span className="ml-2">{category}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Lista de FAQs com design profissional */}
          <div className="space-y-4">
              {displayedFAQs.map((faq, index) => (
              <Collapsible
                key={faq.id}
                open={openItems.includes(faq.id)}
                onOpenChange={() => toggleItem(faq.id)}
              >
                <CollapsibleTrigger className="w-full group">
                  <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-md sm:group-hover:scale-[1.02] ${getCategoryStyle(faq.category)}`}>
                      <div className="flex items-center justify-between p-3 sm:p-6">
                      <div className="flex-1 text-left">
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${faq.category === 'Consultas' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-white/50 text-foreground dark:bg-gray-800/50'}`}>
                            {getCategoryIcon(faq.category)}
                          </div>
                          <div className="flex-1">
                              <h4 className="font-semibold text-sm sm:text-lg leading-tight group-hover:text-primary transition-colors">
                              {faq.question}
                            </h4>
                          </div>
                        </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-11">
                          <Badge variant="secondary" className="text-[11px] sm:text-xs font-medium">
                            {faq.category}
                          </Badge>
                          {faq.category === 'Consultas' && (
                            <Badge className="text-[11px] sm:text-xs bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300">
                              {t.highlight}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <div className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 group-hover:bg-primary/10 transition-colors">
                          {openItems.includes(faq.id) ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-3 sm:px-6 pb-3 sm:pb-6 -mt-2">
                      <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 sm:p-4 ml-11 border-l-4 border-primary/30">
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {/* Botão "Ver mais perguntas" */}
          {hasMoreFAQs && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => setShowAll(true)}
                variant="outline"
                size="lg"
                className="h-10 sm:h-12 px-6 sm:px-8 font-semibold border-2 hover:border-primary/50 hover:bg-primary/5"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t.showMore} {filteredFAQs.length - 5}
              </Button>
            </div>
          )}

          {/* Mostrar menos */}
          {showAll && !searchTerm && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => setShowAll(false)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                {t.showLess}
              </Button>
            </div>
          )}

          {/* Estado vazio melhorado */}
          {filteredFAQs.length === 0 && (
            <div className="text-center py-10 sm:py-12">
              <div className="p-4 bg-muted/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t.notFound}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t.notFoundDesc}
              </p>
            </div>
          )}

          {/* Informações de contato */}
          {!searchTerm && (
            <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">{t.stillQuestions}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  {t.stillQuestionsDesc}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Badge variant="outline" className="px-3 py-1">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Chat online
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <Users className="h-4 w-4 mr-1" />
                    Suporte técnico
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Suporte;