
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from 'lucide-react';
import { motion } from "framer-motion";
import UserAvatar from '@/components/UserAvatar';
import { Testimonial } from './TestimonialData';
import { useIsMobile } from '@/hooks/use-mobile';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  const isMobile = useIsMobile();

  return (
    <motion.div 
      className={`overflow-visible ${isMobile ? 'h-auto min-h-[280px]' : 'h-full'}`}
      whileHover={{ 
        scale: isMobile ? 1.02 : 1.03, 
        y: isMobile ? -4 : -8,
        transition: { duration: 0.3, ease: "easeOut" } 
      }}
    >
      <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm group ${isMobile ? 'h-auto min-h-[280px]' : 'h-full'}`}>
        {/* Gradiente decorativo no topo */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple via-blue-500 to-purple-600"></div>
        
        {/* Ícone de aspas decorativo */}
        <div className={`absolute opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${isMobile ? 'top-2 right-2' : 'top-4 right-4'}`}>
          <Quote className={`text-brand-purple ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
        </div>

        <CardContent className={`relative ${isMobile ? 'p-4' : 'p-8'}`}>
          {/* Cabeçalho com avatar e info */}
          <div className={`flex items-start ${isMobile ? 'mb-4' : 'mb-6'}`}>
            <div className="relative">
              <UserAvatar 
                name={testimonial.name}
                instagramHandle={testimonial.instagram}
                size={isMobile ? "sm" : "md"}
                className="ring-2 ring-brand-purple/20 ring-offset-2 ring-offset-white dark:ring-offset-gray-800"
              />
              {/* Indicador online decorativo */}
              <div className={`absolute -bottom-1 -right-1 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`}></div>
            </div>
            
            <div className={`flex-1 ${isMobile ? 'ml-3' : 'ml-4'}`}>
              <h3 className={`font-semibold text-gray-900 dark:text-white mb-1 ${isMobile ? 'text-base' : 'text-lg'}`}>
                {testimonial.name}
              </h3>
              <p className={`text-gray-500 dark:text-gray-400 leading-relaxed ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {testimonial.position}
                {testimonial.company && `, ${testimonial.company}`}
              </p>
              
              {/* Exibir Instagram se disponível */}
              {testimonial.instagram && (
                <p className={`text-blue-500 dark:text-blue-400 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  @{testimonial.instagram}
                </p>
              )}
              
              {/* Estrelas modernas */}
              <div className={`flex items-center gap-1 ${isMobile ? 'mt-2' : 'mt-3'}`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`transition-all duration-200 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${
                      i < (testimonial.stars || 5) 
                        ? 'fill-yellow-400 text-yellow-400 scale-110' 
                        : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
                    }`} 
                  />
                ))}
                <span className={`ml-2 font-medium text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  {testimonial.stars || 5}.0
                </span>
              </div>
            </div>
          </div>

          {/* Conteúdo do depoimento */}
          <div className="relative">
            <blockquote className={`text-gray-700 dark:text-gray-300 leading-relaxed italic font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
              "{testimonial.content}"
            </blockquote>
            
            {/* Efeito de brilho sutil no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TestimonialCard;
