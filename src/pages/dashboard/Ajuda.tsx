
import React, { useState } from 'react';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HelpCircle, Search, ChevronDown, ChevronRight } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQ[] = [
  {
    id: '1',
    question: 'Como consultar um CPF?',
    answer: 'Para consultar um CPF, acesse o menu "Consultas" > "Consultar CPF", digite o número do CPF e clique em "Consultar". Você verá informações como dados pessoais, situação na Receita Federal e outros detalhes disponíveis.',
    category: 'Consultas'
  },
  {
    id: '2',
    question: 'Como adicionar saldo à minha carteira?',
    answer: 'Vá até "Carteira Digital" e clique em "Adicionar Saldo". Escolha o método de pagamento (PIX, cartão, etc.) e o valor desejado. Após a confirmação do pagamento, o saldo será creditado automaticamente.',
    category: 'Carteira'
  },
  {
    id: '3',
    question: 'Como funciona o sistema de indicações?',
    answer: 'Você pode indicar amigos através do menu "Indicações". Cada pessoa que se cadastrar usando seu link de indicação renderá bônus para ambos quando ativar a conta.',
    category: 'Indicações'
  },
  {
    id: '4',
    question: 'Como consultar meu histórico de transações?',
    answer: 'Acesse o menu "Histórico" para ver todas as suas consultas realizadas, valores gastos e datas das operações.',
    category: 'Histórico'
  },
  {
    id: '5',
    question: 'Qual o valor mínimo para saque?',
    answer: 'O valor mínimo para saque é definido pelo administrador do sistema. Consulte as configurações da sua carteira para ver o valor atual.',
    category: 'Carteira'
  }
];

const Ajuda = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const categories = [...new Set(faqData.map(faq => faq.category))];

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Central de Ajuda" 
        subtitle="Encontre respostas para as perguntas mais frequentes"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Perguntas Frequentes (FAQ)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por perguntas, respostas ou categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={searchTerm === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchTerm('')}
            >
              Todas
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={searchTerm === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchTerm(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Lista de FAQs */}
          <div className="space-y-3">
            {filteredFAQs.map(faq => (
              <Collapsible
                key={faq.id}
                open={openItems.includes(faq.id)}
                onOpenChange={() => toggleItem(faq.id)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
                    <div>
                      <div className="font-medium">{faq.question}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Categoria: {faq.category}
                      </div>
                    </div>
                    {openItems.includes(faq.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 text-muted-foreground">
                    {faq.answer}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma pergunta encontrada para sua busca.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Ajuda;
