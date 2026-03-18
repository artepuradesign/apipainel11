import React from 'react';
import { motion } from "framer-motion";
import MenuSuperior from '@/components/MenuSuperior';
import Footer from '@/components/Footer';
import UnifiedPlans from '@/components/UnifiedPlans';
import AnimatedBackground from '@/components/dashboard/AnimatedBackground';
import { loadCustomPlans } from '@/utils/personalizationStorage';
import { Sparkles, Zap, Crown, Star } from 'lucide-react';

const PricingPage = () => {
  const plans = loadCustomPlans();
  const activePlans = plans.filter(plan => plan.status === 'ativo');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Fundo animado em 3 camadas */}
      <AnimatedBackground />

      {/* Conteúdo principal na segunda camada (z-20) */}
      <div className="relative z-20">
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
                Planos e Preços
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              >
                Escolha o plano ideal para suas necessidades e potencialize seus resultados
              </motion.p>
            </div>
            
            {/* Cards informativos mais elegantes */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            >
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-300">
                <Sparkles className="mx-auto mb-3 text-brand-purple dark:text-purple-400" size={32} />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{activePlans.length} Planos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configurados pela administração</p>
              </div>
              
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-300">
                <Zap className="mx-auto mb-3 text-brand-purple dark:text-purple-400" size={32} />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instantâneo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ativação imediata</p>
              </div>
              
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-300">
                <Crown className="mx-auto mb-3 text-brand-purple dark:text-purple-400" size={32} />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Personalizáveis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Temas únicos para cada plano</p>
              </div>
              
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-300">
                <Star className="mx-auto mb-3 text-brand-purple dark:text-purple-400" size={32} />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Premium</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Qualidade garantida</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Conteúdo principal com fundo branco limpo */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex-1">
          {/* Unified Plans com responsive carousel */}
          <UnifiedPlans 
            title="Todos os Planos Disponíveis"
            subtitle="Conheça nossos planos configurados pela administração com temas personalizados e módulos únicos"
            showDualButtons={true}
            maxDesktopPlans={4}
            maxMobilePlans={2}
          />
          
          {/* Seção de benefícios */}
          <section className="py-16 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Por que escolher a APIPainel?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Oferecemos a melhor experiência em consultas de dados com tecnologia de ponta
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="bg-gradient-to-br from-brand-purple to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Velocidade Máxima
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Consultas processadas em milissegundos com nossa infraestrutura otimizada
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Qualidade Premium
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Dados atualizados e verificados através de fontes oficiais confiáveis
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Suporte Especializado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Equipe técnica dedicada para ajudar você a aproveitar ao máximo nossa plataforma
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default PricingPage;
