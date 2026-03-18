import React, { useState, useEffect, useCallback } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import PricingCard from './pricing/PricingCard';
import { getBasicPlans, getAdvancedPlans } from './pricing/pricingPlansData';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import type { ExternalPlan } from '@/services/externalApiService';

interface UnifiedPlansProps {
  title?: string;
  subtitle?: string;
  showDualButtons?: boolean;
  maxDesktopPlans?: number;
  maxMobilePlans?: number;
  planType?: 'queens' | 'kings';
  onPlanPurchase?: (planName: string) => void;
  onPlanUpdate?: (planName: string) => void;
  externalPlans?: ExternalPlan[];
}

const UnifiedPlans = ({ 
  title = "",
  subtitle = "",
  showDualButtons = false,
  maxDesktopPlans = 4,
  maxMobilePlans = 2,
  planType,
  onPlanPurchase,
  onPlanUpdate,
  externalPlans
}: UnifiedPlansProps) => {
  // hooks and state
  const [activeSlide, setActiveSlide] = useState(0);
  const [api, setApi] = useState<any | null>(null);
  const [shouldUseCarousel, setShouldUseCarousel] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Determinar quais planos usar - SEMPRE da API externa se fornecidos
  let plans;
  
  if (externalPlans && externalPlans.length > 0) {
    // Usar APENAS planos externos
    plans = externalPlans.map(externalPlan => ({
      id: externalPlan.id,
      name: externalPlan.name,
      price: externalPlan.priceFormatted,
      description: externalPlan.description,
      consultations_included: externalPlan.max_consultations === -1 ? 'Ilimitadas' : externalPlan.max_consultations.toString(),
      billing_period: 'mensal',
      features: externalPlan.features.map(feature => ({ text: feature, included: true })),
      subscription_link: "/registro",
      is_featured: externalPlan.is_popular,
      is_professional: externalPlan.category === 'premium' || externalPlan.category === 'king',
      is_editor: externalPlan.category === 'basic',
      is_editor_pro: externalPlan.category === 'premium',
      color: externalPlan.category === 'basic' ? 'tone1' : 'tone2',
      theme: externalPlan.theme?.cardTheme || 'default',
      cardSuit: externalPlan.cardSuit || '♦',
      cardType: externalPlan.cardType || 'queen',
      original_price: externalPlan.original_price,
      discountPercentage: externalPlan.discountPercentage
    }));
  } else {
    // Se não há planos externos, mostrar array vazio (não usar planos locais)
    plans = [];
  }

  // handlers and effects
  const handleSlideChange = useCallback((index: number) => {
    if (api) {
      api.scrollTo(index);
    }
    setActiveSlide(index);
  }, [api]);
  
  const autoRotate = useCallback(() => {
    if (!api || !shouldUseCarousel) return;
    const totalSlides = isMobile ? plans.length : (isTablet ? Math.ceil(plans.length / 3) : 0);
    if (totalSlides === 0) return;
    const nextSlide = (activeSlide + 1) % totalSlides;
    api.scrollTo(nextSlide);
    setActiveSlide(nextSlide);
  }, [api, activeSlide, shouldUseCarousel, isMobile, isTablet, plans.length]);

  const handlePlanPurchase = useCallback((planName: string) => {
    if (onPlanPurchase) {
      onPlanPurchase(planName);
    } else {
      toast.info(`Redirecionando para assinatura do plano ${planName}...`);
      setTimeout(() => {
        navigate('/registro');
      }, 1000);
    }
  }, [navigate, onPlanPurchase]);

  const handlePlanUpdate = useCallback((planName: string) => {
    if (onPlanUpdate) {
      onPlanUpdate(planName);
    } else {
      toast.info(`Você precisa fazer login para atualizar para o plano ${planName}`);
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  }, [navigate, onPlanUpdate]);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      
      setIsTablet(tablet);
      setShouldUseCarousel(mobile || tablet);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  useEffect(() => {
    if (!shouldUseCarousel) return;
    const interval = setInterval(autoRotate, 30000);
    return () => clearInterval(interval);
  }, [autoRotate, shouldUseCarousel]);
  
  useEffect(() => {
    if (!api || !shouldUseCarousel) return;
    setActiveSlide(api.selectedScrollSnap());
    api.on("select", () => {
      setActiveSlide(api.selectedScrollSnap());
    });
    return () => {
      api.off("select");
    };
  }, [api, shouldUseCarousel]);

  const totalSlides = isMobile ? plans.length : (isTablet ? Math.ceil(plans.length / 3) : 0);

  if (plans.length === 0) {
    return null; // Não mostrar nada se não há planos da API
  }

  return (
    <section className="relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {title && (
          <motion.div 
            className="text-center mb-16" 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">{subtitle}</p>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="relative overflow-visible"
        >
          {shouldUseCarousel ? (
            // carousel implementation
            <div className="px-6 sm:px-2">
              <Carousel 
                opts={{
                  align: "start",
                  loop: true,
                  slidesToScroll: 1
                }} 
                className="w-full overflow-visible" 
                setApi={setApi}
              >
                <CarouselContent className="py-4 overflow-visible -ml-6 md:-ml-4">
                  {plans.slice(0, isMobile ? maxMobilePlans : plans.length).map((plan, index) => (
                      <CarouselItem key={plan.id} className={`pl-6 md:pl-4 ${
                      isMobile ? 'basis-[85%]' : (isTablet ? 'basis-1/3' : 'basis-1/2')
                    } overflow-visible py-2`}>
                      <div className={`w-full ${isMobile ? 'max-w-[260px]' : 'max-w-sm'} mx-auto`}>
                        <PricingCard 
                          plan={plan}
                          showDualButtons={showDualButtons}
                          onBuyClick={handlePlanPurchase}
                          onUpdateClick={handlePlanUpdate}
                        />
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

                  <div className="flex gap-2 mx-4">
                    {Array.from({ length: totalSlides }).map((_, i) => (
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
          ) : (
            // grid implementation
            <div className="w-full">
              <div className={`grid gap-8 max-w-7xl mx-auto ${
                plans.length <= maxDesktopPlans ? `grid-cols-${Math.min(plans.length, 4)}` : 'grid-cols-4'
              }`}>
                {plans.slice(0, maxDesktopPlans).map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="w-full flex justify-center"
                  >
                    <div className="w-full max-w-[260px]">
                      <PricingCard 
                        plan={plan}
                        showDualButtons={showDualButtons}
                        onBuyClick={handlePlanPurchase}
                        onUpdateClick={handlePlanUpdate}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default UnifiedPlans;
