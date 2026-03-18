import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Power, ArrowLeft, AlertCircle, Info, MessageCircle, HelpCircle } from 'lucide-react';

const ModuloOff = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="w-full bg-card border-border backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 p-4 bg-red-100 dark:bg-red-900/50 rounded-full w-20 h-20 flex items-center justify-center">
              <Power className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Módulo Desativado
            </CardTitle>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              Este módulo está temporariamente desativado e não está disponível no momento.
            </p>
          </CardHeader>
          
          <CardContent className="text-center space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="flex flex-col items-center p-4 md:p-6 bg-muted/50 rounded-lg border border-border">
                <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Temporariamente Offline</h3>
                <p className="text-sm text-muted-foreground text-center">
                  O módulo foi desativado por motivos técnicos ou administrativos
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 md:p-6 bg-muted/50 rounded-lg border border-border">
                <Info className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Verificação</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Nossa equipe está investigando e trabalhando na solução
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 md:p-6 bg-muted/50 rounded-lg border border-border">
                <MessageCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Comunicação</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Manteremos você informado sobre atualizações do status
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 p-6 rounded-lg border border-red-200 dark:border-red-700/30">
              <div className="flex items-center justify-center gap-2 mb-3">
                <HelpCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-foreground">
                  Precisa de Ajuda?
                </h3>
              </div>
              <p className="text-muted-foreground mb-4 text-sm md:text-base">
                Se você precisa urgentemente deste módulo ou tem dúvidas sobre o motivo da desativação, 
                entre em contato com nosso suporte técnico.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                  Análise Técnica
                </span>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium">
                  Suporte Dedicado
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                  Monitoramento Contínuo
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
                Status: <strong className="text-red-600 dark:text-red-400">Desativado</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Para mais informações, consulte nosso canal de suporte oficial
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModuloOff;