
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HowItWorksSection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.AOS) {
      window.AOS.refresh();
    }
  }, []);

  const handleCreateAccount = () => {
    navigate('/registration');
  };

  const handleViewPlans = () => {
    navigate('/planos-disponiveis');
  };

  const handleAddBalance = () => {
    navigate('/dashboard/adicionar-saldo');
  };

  const handleAccessPanels = () => {
    navigate('/dashboard');
  };

  const steps = [
    {
      number: 1,
      title: "Crie sua conta",
      description: "Faça seu cadastro em menos de 1 minuto com e-mail e senha",
      buttonText: "Criar Conta",
      buttonAction: handleCreateAccount
    },
    {
      number: 2,
      title: "Escolha seu plano",
      description: "Selecione o plano que melhor se adapta às suas necessidades",
      buttonText: "Ver Planos",
      buttonAction: handleViewPlans
    },
    {
      number: 3,
      title: "Pague ou recarregue",
      description: "Assine um plano ou recarregue e economize nas consultas",
      buttonText: "Adicionar Saldo",
      buttonAction: handleAddBalance
    },
    {
      number: 4,
      title: "Faça suas consultas",
      description: "Acesse informações completas em segundos de forma segura",
      buttonText: "Acessar Painéis",
      buttonAction: handleAccessPanels
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div 
          className="text-center mb-8 md:mb-12"
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 dark:text-white">Como Funciona</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto dark:text-gray-300">
            Processo simples e rápido para realizar suas consultas
          </p>
        </div>
        
        {/* Grid responsivo: 1 coluna no mobile, 2 no tablet, 4 no desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="bg-white/95 dark:bg-gray-800/95 p-3 sm:p-6 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 text-center backdrop-blur-sm hover-lift transition-all duration-300 min-h-[240px] sm:min-h-[280px] flex flex-col"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay={index * 150}
            >
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-brand-purple/20 to-purple-600/30 dark:from-purple-900/40 dark:to-purple-800/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 border border-brand-purple/30 dark:border-purple-700/40 animate-pulse-grow"
                data-aos="zoom-in"
                data-aos-duration="600"
                data-aos-delay={index * 150 + 200}
              >
                <span className="text-base sm:text-lg md:text-2xl font-bold text-brand-purple dark:text-purple-300">
                  {step.number}
                </span>
              </div>
              
              <h3 
                className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white"
                data-aos="fade-in"
                data-aos-duration="500"
                data-aos-delay={index * 150 + 300}
              >
                {step.title}
              </h3>
              <p 
                className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 lg:mb-6 leading-relaxed flex-grow"
                data-aos="fade-in"
                data-aos-duration="500"
                data-aos-delay={index * 150 + 400}
              >
                {step.description}
              </p>
              
              <div
                className="mt-auto"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay={index * 150 + 500}
              >
                <Button 
                  className="w-full text-xs sm:text-sm lg:text-base bg-brand-purple hover:bg-brand-darkPurple text-white dark:bg-purple-600 dark:hover:bg-purple-700 hover-scale transition-all duration-300 py-2 sm:py-3 h-auto"
                  onClick={step.buttonAction}
                >
                  {step.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
