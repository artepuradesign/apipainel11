
import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Package } from 'lucide-react';
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { loadCustomModules } from '@/utils/personalizationStorage';
import * as Icons from 'lucide-react';

const ModuleCard = ({
  icon: Icon,
  title,
  description,
  price,
  index = 0,
  operationalStatus = 'on'
}: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        y: -3,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="h-full"
    >
      <Card className={`group relative overflow-hidden border border-purple-200/50 dark:border-purple-700/30 shadow-lg hover:shadow-xl transition-all duration-300 h-full backdrop-blur-sm ${
        operationalStatus === 'off' 
          ? 'bg-gray-100/95 dark:bg-gray-700/95' 
          : 'bg-white/95 dark:bg-gray-800/95'
      }`}>
        {/* Decorative gradient line */}
        <div className={`absolute top-0 left-0 w-full h-1 ${
          operationalStatus === 'off' 
            ? 'bg-gray-400' 
            : 'bg-gradient-to-r from-brand-purple via-purple-500 to-blue-500'
        }`}></div>
        
        {/* Overlay para módulos inativos */}
        {operationalStatus === 'off' && (
          <div className="absolute inset-0 bg-gray-900/60 dark:bg-gray-900/80 rounded-lg z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center text-white">
              <Package className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Bloqueado</p>
              <p className="text-xs opacity-80">Upgrade necessário</p>
            </div>
          </div>
        )}
        
        <CardContent className="pt-6 pb-6 px-6 relative z-10">
          <div className="text-center">
            {/* Icon container */}
            <div className="relative mx-auto mb-4">
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center mx-auto border group-hover:scale-105 transition-all duration-300 ${
                operationalStatus === 'off'
                  ? 'bg-gray-200/50 border-gray-300/40 dark:bg-gray-600/40 dark:border-gray-600/40'
                  : 'bg-gradient-to-br from-brand-purple/15 to-purple-600/20 dark:from-purple-900/40 dark:to-purple-800/30 border-purple-300/40 dark:border-purple-700/40'
              }`}>
                <Icon className={`h-10 w-10 group-hover:scale-110 transition-all duration-300 ${
                  operationalStatus === 'off'
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-brand-purple dark:text-purple-400'
                }`} />
              </div>
            </div>
            
            <h4 className={`text-lg font-semibold mb-3 transition-colors duration-300 leading-tight ${
              operationalStatus === 'off'
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-gray-900 dark:text-white group-hover:text-brand-purple dark:group-hover:text-purple-400'
            }`}>
              {title}
            </h4>
            <p className={`text-sm leading-relaxed ${
              operationalStatus === 'off'
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              {description}
            </p>
            {price && (
              <div className="mt-3">
                <span className={`font-semibold ${
                  operationalStatus === 'off'
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-brand-purple dark:text-purple-400'
                }`}>
                  R$ {price}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Features = () => {
  const modulosData = loadCustomModules();

  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent || Package;
  };

  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 1024px)': { slidesToScroll: modulosData.length >= 5 ? 5 : modulosData.length },
        '(max-width: 1023px)': { slidesToScroll: modulosData.length >= 2 ? 2 : modulosData.length }
      }
    },
    [Autoplay({ delay: 30000, stopOnInteraction: false }) as any]
  );

  return (
    <section id="modules" className="py-20 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-white">
            Módulos Disponíveis
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto dark:text-gray-300">
            Conheça todos os módulos que oferecemos em nossos painéis personalizados
          </p>
        </motion.div>
        
        {/* Conditional rendering based on modules data */}
        {modulosData.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/95 dark:bg-gray-800/95 rounded-lg border border-purple-200/50 dark:border-purple-700/30 shadow-lg p-12 max-w-md mx-auto backdrop-blur-sm">
              <Package className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Nenhum módulo cadastrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Os módulos serão exibidos aqui quando forem cadastrados no painel de controle. 
                Configure seus módulos personalizados para começar a usar o sistema.
              </p>
            </div>
          </motion.div>
        ) : (
          /* Desktop: Grid até 5 colunas */
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {modulosData.map((modulo, index) => {
                const IconComponent = getIconComponent(modulo.icon);
                
                return (
                  <ModuleCard 
                    key={index}
                    icon={IconComponent}
                    title={modulo.title}
                    description={modulo.description}
                    price={modulo.price}
                    operationalStatus={modulo.operationalStatus}
                    index={index}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Features;
