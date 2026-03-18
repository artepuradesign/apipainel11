
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Play, Pause } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import Autoplay from "embla-carousel-autoplay";
import PricingCard from '@/components/pricing/PricingCard';
import { usePricingPlans } from '@/components/pricing/usePricingPlans';

interface PricingPlansProps {
  plans?: any[];
  title?: string;
}

const PricingPlans = ({ plans: propPlans, title = "Planos Disponíveis" }: PricingPlansProps) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [api, setApi] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  const { plans: hookPlans, loading } = usePricingPlans();
  
  // Use plans from props if provided, otherwise use hook plans
  const plans = propPlans || hookPlans;
  
  // Use carousel for all screen sizes
  const [shouldUseCarousel] = useState(true);
  
  // Create autoplay plugin
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  // Handle play/pause based on hover and playing state - only after API is ready
  useEffect(() => {
    if (!api) return;
    
    const autoplay = autoplayPlugin.current;
    if (!autoplay) return;
    
    // Adicionar delay para garantir que o embla está completamente inicializado
    const timer = setTimeout(() => {
      try {
        if (isPlaying && !isHovered) {
          autoplay.play();
        } else {
          autoplay.stop();
        }
      } catch (error) {
        console.error('Error controlling autoplay:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [api, isPlaying, isHovered]);
  
  const handleSlideChange = useCallback((index: number) => {
    if (api) {
      api.scrollTo(index);
    }
    setActiveSlide(index);
  }, [api]);
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  useEffect(() => {
    if (!api) return;
    setActiveSlide(api.selectedScrollSnap());
    api.on("select", () => {
      setActiveSlide(api.selectedScrollSnap());
    });
    return () => {
      api.off("select");
    };
  }, [api]);

  if (loading && !propPlans) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white">Carregando planos...</p>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Nenhum plano disponível no momento</p>
        </div>
      </div>
    );
  }

  // Always use carousel view now
  const totalSlides = plans.length;
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Conheça nossos planos configurados pela administração.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
        className="relative overflow-visible"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="px-4 sm:px-6">
          <Carousel 
            opts={{
              align: "start",
              loop: true,
              slidesToScroll: 1
            }} 
            className="w-full max-w-full" 
            plugins={[autoplayPlugin.current as any]}
            setApi={setApi}
          >
            <CarouselContent className="py-4 ml-4">
              {plans.map((plan, index) => (
                <CarouselItem key={plan.id} className={`${isMobile ? 'pl-4 pr-8 basis-[85%]' : 'px-3 basis-1/4'} py-2`}>
                  <div className={`w-full ${isMobile ? 'max-w-[260px]' : 'max-w-sm'} mx-auto`}>
                    <PricingCard plan={plan} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="flex items-center justify-center mt-8">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-white shadow-md hover:bg-gray-100 mr-4 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white" 
                onClick={() => {
                  const prevSlide = (activeSlide - 1 + totalSlides) % totalSlides;
                  handleSlideChange(prevSlide);
                }}
              >
                <ArrowLeft className="h-5 w-5 dark:text-white" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/90 shadow-lg hover:bg-white hover:shadow-xl border border-gray-200/50 dark:bg-gray-800/90 dark:hover:bg-gray-800 dark:border-gray-700/50 transition-all duration-300"
                onClick={togglePlayPause}
              >
                {isPlaying && !isHovered ? (
                  <Pause className="h-5 w-5 text-brand-purple dark:text-brand-purple" />
                ) : (
                  <Play className="h-5 w-5 text-brand-purple dark:text-brand-purple" />
                )}
              </Button>

              <div className="flex gap-2 mx-4">
                {Array.from({ length: plans.length }).map((_, i) => (
                  <Button 
                    key={i} 
                    variant="ghost" 
                    size="icon" 
                    className={`w-2 h-2 p-0 rounded-full ${i === activeSlide ? 'bg-brand-purple dark:bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`} 
                    onClick={() => handleSlideChange(i)} 
                  />
                ))}
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-white shadow-md hover:bg-gray-100 ml-4 dark:bg-gray-800 dark:hover:bg-gray-700" 
                onClick={() => {
                  const nextSlide = (activeSlide + 1) % totalSlides;
                  handleSlideChange(nextSlide);
                }}
              >
                <ArrowRight className="h-5 w-5 dark:text-white" />
              </Button>
            </div>
          </Carousel>
        </div>
      </motion.div>
    </div>
  );

  // Remove the grid view completely since we always use carousel now
};

export default PricingPlans;
