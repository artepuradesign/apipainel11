import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft, AlertTriangle, Clock, Shield, Zap } from 'lucide-react';

const Manutencao = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="w-full bg-card border-border backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 p-4 bg-orange-100 dark:bg-orange-900/50 rounded-full w-20 h-20 flex items-center justify-center">
              <Settings className="h-10 w-10 text-orange-600 dark:text-orange-400 animate-spin" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Módulo em Manutenção
            </CardTitle>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              Este módulo está temporariamente indisponível para melhorias e atualizações.
            </p>
          </CardHeader>
          
          <CardContent className="text-center space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="flex flex-col items-center p-4 md:p-6 bg-muted/50 rounded-lg border border-border">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Manutenção Programada</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Atualizações importantes para melhor performance
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 md:p-6 bg-muted/50 rounded-lg border border-border">
                <Shield className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Segurança</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Implementando as mais recentes correções de segurança
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 md:p-6 bg-muted/50 rounded-lg border border-border">
                <Zap className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Otimização</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Melhorando velocidade e eficiência do sistema
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 dark:from-orange-500/20 dark:to-yellow-500/20 p-6 rounded-lg border border-orange-200 dark:border-orange-700/30">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-foreground">
                  Voltaremos em Breve
                </h3>
              </div>
              <p className="text-muted-foreground mb-4 text-sm md:text-base">
                Nossa equipe técnica está trabalhando para que o módulo volte o mais rápido possível 
                com melhorias significativas. Agradecemos sua paciência!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium">
                  Atualizações de Sistema
                </span>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                  Correções de Bugs
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  Melhorias de Performance
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
                Status: <strong className="text-orange-600 dark:text-orange-400">Manutenção em andamento</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Previsão de retorno: Assim que as melhorias forem concluídas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Manutencao;