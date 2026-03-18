import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft, Code, Wrench, Coffee, Rocket } from 'lucide-react';

const NovoModulo = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="w-full bg-card border-border backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 p-4 bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center">
              <Construction className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Módulo em Desenvolvimento
            </CardTitle>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              Este módulo está sendo desenvolvido com as mais modernas tecnologias e estará disponível em breve!
            </p>
          </CardHeader>
          
          <CardContent className="text-center space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="flex flex-col items-center p-4 md:p-6 bg-muted/50 rounded-lg border border-border">
                <Code className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Em Desenvolvimento</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Nossa equipe está codificando as funcionalidades mais avançadas
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 md:p-6 bg-muted/50 rounded-lg border border-border">
                <Wrench className="h-8 w-8 text-orange-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Testes Rigorosos</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Garantindo máxima qualidade e estabilidade do sistema
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 md:p-6 bg-muted/50 rounded-lg border border-border">
                <Coffee className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Otimização</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Últimos ajustes de performance antes do lançamento
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Rocket className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Novidades em Breve
                </h3>
              </div>
              <p className="text-muted-foreground mb-4 text-sm md:text-base">
                Acompanhe nossos canais para ser notificado quando este módulo estiver disponível. 
                Estamos trabalhando para oferecer a melhor experiência possível!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                  Interface Moderna
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                  Alta Performance
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                  Fácil de Usar
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                  Tecnologia Avançada
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard/suporte')}
                className="px-8 py-3"
              >
                Contatar Suporte
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Status: <strong className="text-foreground">Em desenvolvimento ativo</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Versão de produção prevista para as próximas atualizações
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovoModulo;