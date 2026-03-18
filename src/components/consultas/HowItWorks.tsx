
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HowItWorks = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/registration');
  };

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-white">Como Funciona</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto dark:text-gray-300">
            Processo simples e rápido para realizar suas consultas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/95 dark:bg-gray-700/95 p-6 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-600/50 text-center backdrop-blur-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-purple/20 to-purple-600/30 dark:from-purple-900/40 dark:to-purple-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-purple/30 dark:border-purple-700/40">
              <span className="text-2xl font-bold text-brand-purple dark:text-purple-300">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Crie sua conta</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Faça seu cadastro em menos de 1 minuto com e-mail e senha</p>
          </div>
          
          <div className="bg-white/95 dark:bg-gray-700/95 p-6 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-600/50 text-center backdrop-blur-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-purple/20 to-purple-600/30 dark:from-purple-900/40 dark:to-purple-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-purple/30 dark:border-purple-700/40">
              <span className="text-2xl font-bold text-brand-purple dark:text-purple-300">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Escolha seu plano</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Selecione o plano que melhor se adapta às suas necessidades</p>
          </div>
          
          <div className="bg-white/95 dark:bg-gray-700/95 p-6 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-600/50 text-center backdrop-blur-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-purple/20 to-purple-600/30 dark:from-purple-900/40 dark:to-purple-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-purple/30 dark:border-purple-700/40">
              <span className="text-2xl font-bold text-brand-purple dark:text-purple-300">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Pague ou recarregue</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Pague um plano e ganhe desconto em todas consultas e serviços ou recarregue para usar</p>
          </div>
          
          <div className="bg-white/95 dark:bg-gray-700/95 p-6 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-600/50 text-center backdrop-blur-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-purple/20 to-purple-600/30 dark:from-purple-900/40 dark:to-purple-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-purple/30 dark:border-purple-700/40">
              <span className="text-2xl font-bold text-brand-purple dark:text-purple-300">4</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Faça suas consultas</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Acesse informações completas em segundos de forma segura</p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            className="bg-brand-purple hover:bg-brand-darkPurple dark:bg-purple-600 dark:hover:bg-purple-700 text-white"
            onClick={handleStartClick}
          >
            Comece agora mesmo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
