
import React from 'react';
import { motion } from 'framer-motion';
import ApiDemo from '@/components/ApiDemo';
import MenuSuperior from '@/components/MenuSuperior';
import Footer from '@/components/Footer';
import PageLayout from '@/components/layout/PageLayout';
import { Code2, Zap, Shield, Clock } from 'lucide-react';

const ApiDocs = () => {
  return (
    <PageLayout variant="default" backgroundOpacity="medium" showGradients={true}>
      <div className="min-h-screen flex flex-col">
        <div className="relative z-10">
          <MenuSuperior />
          
          {/* Header renovado */}
          <section className="py-16 relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
                >
                  API RESTful
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
                >
                  Integre nossos serviços diretamente no seu sistema com nossa API simples, rápida e confiável
                </motion.p>
              </div>
              
              {/* Características da API */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12"
              >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100/50 dark:border-gray-700/50 text-center">
                  <Code2 className="mx-auto mb-4 text-brand-purple dark:text-purple-400" size={32} />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">RESTful</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Padrão REST para facilitar a integração</p>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100/50 dark:border-gray-700/50 text-center">
                  <Zap className="mx-auto mb-4 text-brand-purple dark:text-purple-400" size={32} />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rápida</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Respostas em milissegundos</p>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100/50 dark:border-gray-700/50 text-center">
                  <Shield className="mx-auto mb-4 text-brand-purple dark:text-purple-400" size={32} />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Segura</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Autenticação via Bearer Token</p>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100/50 dark:border-gray-700/50 text-center">
                  <Clock className="mx-auto mb-4 text-brand-purple dark:text-purple-400" size={32} />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">24/7</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Disponibilidade total</p>
                </div>
              </motion.div>

              {/* Informações técnicas */}
              <div className="bg-gradient-to-r from-brand-purple/10 to-indigo-500/10 backdrop-blur-sm rounded-xl p-8 max-w-4xl mx-auto border border-white/20 dark:border-gray-700/20">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                  Como Integrar
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30 dark:border-gray-700/30">
                      <span className="text-brand-purple font-bold text-lg">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Obter API Key</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cadastre-se e gere sua chave de acesso</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30 dark:border-gray-700/30">
                      <span className="text-brand-purple font-bold text-lg">2</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fazer Requisição</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Use HTTP GET com sua API Key</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30 dark:border-gray-700/30">
                      <span className="text-brand-purple font-bold text-lg">3</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Receber Dados</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dados estruturados em JSON</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Demonstração da API */}
          <ApiDemo />
          
          <Footer />
        </div>
      </div>
    </PageLayout>
  );
};

export default ApiDocs;
