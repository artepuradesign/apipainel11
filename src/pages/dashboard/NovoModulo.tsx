
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft, Code, Wrench, Coffee } from 'lucide-react';

const NovoModulo = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-full w-20 h-20 flex items-center justify-center">
              <Construction className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Módulo em Desenvolvimento
            </CardTitle>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Este módulo está sendo desenvolvido e estará disponível em breve!
            </p>
          </CardHeader>
          
          <CardContent className="text-center space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="flex flex-col items-center p-4 md:p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Code className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Em Codificação</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Nossa equipe está trabalhando nas funcionalidades
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 md:p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Wrench className="h-8 w-8 text-orange-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Testes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Garantindo qualidade e estabilidade
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 md:p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Coffee className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Finalização</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Últimos ajustes antes do lançamento
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🚀 Novidades em Breve
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm md:text-base">
                Acompanhe nossos canais para ser notificado quando este módulo estiver disponível. 
                Estamos trabalhando para oferecer a melhor experiência possível!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  Interface Moderna
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  Alta Performance
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  Fácil de Usar
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard/suporte')}
                className="px-8 py-3 border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
              >
                Contatar Suporte
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tempo estimado de desenvolvimento: <strong>Em andamento</strong>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                ID do Módulo: novo-modulo-dev
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovoModulo;
