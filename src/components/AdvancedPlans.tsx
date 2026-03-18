import React, { useEffect, useState, useCallback } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import PricingCard from './pricing/PricingCard';
import { getAdvancedPlans } from './pricing/pricingPlansData';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

const AdvancedPlans = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [api, setApi] = useState<any | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Check screen sizes
  const [shouldUseCarousel, setShouldUseCarousel] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      const desktop = width >= 1024;
      
      setIsTablet(tablet);
      setShouldUseCarousel(mobile || tablet); // Carousel for mobile and tablet
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get advanced plans (King plans)
  const advancedPlans = getAdvancedPlans();

  const handleSlideChange = useCallback((index: number) => {
    if (api) {
      api.scrollTo(index);
    }
    setActiveSlide(index);
  }, [api]);
  
  const autoRotate = useCallback(() => {
    if (!api || !shouldUseCarousel) return;
    // Mobile: 4 slides (1 per slide), Tablet: 2 slides (3 plans visible, 2 slides total), Desktop: grid
    const totalSlides = isMobile ? 4 : (isTablet ? 2 : 0);
    if (totalSlides === 0) return;
    const nextSlide = (activeSlide + 1) % totalSlides;
    api.scrollTo(nextSlide);
    setActiveSlide(nextSlide);
  }, [api, activeSlide, shouldUseCarousel, isMobile, isTablet]);
  
  useEffect(() => {
    if (!shouldUseCarousel) return;
    const interval = setInterval(autoRotate, 30000); // 30 seconds
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

  const handlePlanPurchase = (planName: string) => {
    toast.info(`Redirecionando para assinatura do plano ${planName}...`);
    setTimeout(() => {
      navigate('/registro');
    }, 1000);
  };

  const handlePlanUpdate = (planName: string) => {
    toast.info(`Você precisa fazer login para atualizar para o plano ${planName}`);
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  if (shouldUseCarousel) {
    // Carousel view for mobile and tablet
    const totalSlides = isMobile ? 4 : (isTablet ? 2 : 0);
    
    return (
      <section id="advanced-pricing" className="py-16 bg-gray-50 dark:bg-gray-800 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16" 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Planos Avançados - Reis</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Conheça nossos planos premium com recursos exclusivos para grandes volumes de consultas.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="relative overflow-visible"
          >
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
                  {advancedPlans.map((plan, index) => (
                      <CarouselItem key={plan.id} className={`pl-6 md:pl-4 ${
                      isMobile ? 'basis-[85%]' : (isTablet ? 'basis-1/3' : 'basis-1/2')
                    } overflow-visible py-2`}>
                      <div className={`w-full ${isMobile ? 'max-w-[260px]' : 'max-w-sm'} mx-auto`}>
                        <PricingCard 
                          plan={plan}
                          showDualButtons={true}
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
          </motion.div>
        </div>
      </section>
    );
  }

  // Grid view for desktop (lg and above)
  return (
    <section id="advanced-pricing" className="py-16 bg-gray-50 dark:bg-gray-800 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16" 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Planos Avançados - Reis</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">Conheça nossos planos premium com recursos exclusivos para grandes volumes de consultas.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <div className="grid grid-cols-4 gap-8 max-w-7xl mx-auto">
            {advancedPlans.map((plan, index) => (
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
                    showDualButtons={true}
                    onBuyClick={handlePlanPurchase}
                    onUpdateClick={handlePlanUpdate}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AdvancedPlans;
