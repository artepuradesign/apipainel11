
import React from 'react';
import { motion } from 'framer-motion';
import MenuSuperior from '@/components/MenuSuperior';
import Footer from '@/components/Footer';
import PageLayout from '@/components/layout/PageLayout';
import PricingPlans from '@/pages/PricingPlans';

const PlanosDisponiveis = () => {
  return (
    <PageLayout 
      variant="landing" 
      backgroundOpacity="medium" 
      showGradients={true}
      className="flex flex-col min-h-screen"
    >
      <MenuSuperior />
      
      <div className="flex-1 pt-20">
        <motion.div 
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Planos Disponíveis
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Escolha o plano ideal para suas necessidades. Todos os planos incluem módulos personalizados e recursos exclusivos.
            </p>
          </div>

          <PricingPlans title="Todos os Planos" />

          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Dúvidas sobre os planos?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Nossa equipe está pronta para ajudar você a escolher o melhor plano para suas necessidades.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/suporte" 
                  className="bg-brand-purple hover:bg-brand-darkPurple text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Falar com Suporte
                </a>
                <a 
                  href="/registration" 
                  className="bg-transparent border-2 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Criar Conta Grátis
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      <Footer />
    </PageLayout>
  );
};

export default PlanosDisponiveis;
