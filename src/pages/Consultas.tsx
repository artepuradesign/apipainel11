
import React, { useState } from 'react';
import { motion } from "framer-motion";
import MenuSuperior from '@/components/MenuSuperior';
import ConsultasTabs from '@/components/consultas/ConsultasTabs';
import HowItWorks from '@/components/consultas/HowItWorks';
import ModulosDisponiveis from '@/components/consultas/ModulosDisponiveis';
import Footer from '@/components/Footer';
import PageLayout from '@/components/layout/PageLayout';
import { toast } from "sonner";

const ConsultasPage = () => {
  const handleConsultaClick = (type: string) => {
    toast.info(`Redirecionando para consulta de ${type}...`);
    // Aqui você pode adicionar a lógica de redirecionamento
  };

  return (
    <PageLayout variant="default" backgroundOpacity="medium" showGradients={true}>
      <div className="flex flex-col">
        <MenuSuperior />
        
        {/* Header mais limpo e direto */}
        <section className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Consultas Inteligentes
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              >
                Realize consultas rápidas, seguras e precisas de CPF, CNPJ, Veículos e Score de Crédito
              </motion.p>
            </div>
            
            {/* Cards informativos mais simples */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            >
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4 Tipos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Modalidades diferentes disponíveis</p>
              </div>
              
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instantâneo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resultados em tempo real</p>
              </div>
              
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Com Desconto</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Planos pagos com valores reduzidos</p>
              </div>
              
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-3xl mb-3">🔄</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">R$ 50,00</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recarga mínima disponível</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Conteúdo principal com fundo branco limpo */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex-1">
          {/* Como Funciona - mais compacto */}
          <HowItWorks />
          
          {/* Módulos Disponíveis - nova seção */}
          <ModulosDisponiveis />
          
          {/* Abas de Consulta */}
          <ConsultasTabs onConsultaClick={handleConsultaClick} />
        </div>
        
        <Footer />
      </div>
    </PageLayout>
  );
};

export default ConsultasPage;
