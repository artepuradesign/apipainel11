
import React from 'react';
import { motion } from "framer-motion";
import MenuSuperior from '@/components/MenuSuperior';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/dashboard/AnimatedBackground';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Trophy, 
  Users, 
  Zap, 
  Shield, 
  Target, 
  Lightbulb,
  Award,
  TrendingUp
} from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Fundo animado colorido igual ao da tela de login */}
      <AnimatedBackground />

      <div className="relative z-10">
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
                Sobre a APIPainel
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              >
                Transformando o acesso a dados em uma experiência simples, rápida e confiável desde 2015
              </motion.p>
            </div>
            
            {/* Estatísticas impressionantes */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-300">
                <Trophy className="mx-auto mb-3 text-brand-purple dark:text-purple-400" size={32} />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">9+</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Anos de experiência</p>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-300">
                <Users className="mx-auto mb-3 text-brand-purple dark:text-purple-400" size={32} />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">10k+</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clientes satisfeitos</p>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-300">
                <TrendingUp className="mx-auto mb-3 text-brand-purple dark:text-purple-400" size={32} />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">1M+</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Consultas realizadas</p>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-300">
                <Award className="mx-auto mb-3 text-brand-purple dark:text-purple-400" size={32} />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">99.9%</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disponibilidade</p>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Conteúdo principal com fundo branco limpo */}
        <div className="bg-white dark:bg-gray-900 flex-1">
          {/* Nossa História */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="mb-8 border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-br from-brand-purple to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                        <Lightbulb className="text-white" size={24} />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Nossa História</h2>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      Fundada em 2015, a APIPainel nasceu da necessidade de simplificar o acesso a informações 
                      cadastrais de forma segura, rápida e confiável. O que começou como uma simples plataforma 
                      de consultas de CPF evoluiu para se tornar uma solução completa de dados empresariais.
                    </p>
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                      Ao longo dos anos, investimos constantemente em tecnologia de ponta e segurança avançada, 
                      garantindo que nossos clientes tenham acesso às informações mais atualizadas e precisas do mercado.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
          
          {/* Missão e Valores */}
          <section className="py-16 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Missão e Valores
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Nossa missão é democratizar o acesso a dados cadastrais, oferecendo soluções 
                  acessíveis e confiáveis para empresas de todos os tamanhos
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Confiabilidade</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Dados precisos e atualizados obtidos através de fontes oficiais para decisões seguras e assertivas
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <div className="bg-gradient-to-br from-brand-purple to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Agilidade</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Consultas rápidas com resultados instantâneos através de nossa infraestrutura otimizada
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Target className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Inovação</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Desenvolvimento contínuo de novas funcionalidades para atender às demandas do mercado
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
          
          {/* Nossa Equipe */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-br from-violet-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                        <Users className="text-white" size={24} />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Nossa Equipe</h2>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      Contamos com uma equipe multidisciplinar de especialistas em tecnologia, segurança da 
                      informação e análise de dados, trabalhando incansavelmente para melhorar nossos serviços 
                      e garantir a melhor experiência para nossos clientes.
                    </p>
                    <div className="flex justify-center mt-8">
                      <img 
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                        alt="Nossa equipe" 
                        className="rounded-2xl shadow-lg max-w-full h-auto"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default About;
