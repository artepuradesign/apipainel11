
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from '@/lib/utils';
import Autoplay from "embla-carousel-autoplay";
import TestimonialCard from './TestimonialCard';
import { Testimonial } from './TestimonialData';
import { useIsMobile } from '@/hooks/use-mobile';

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ testimonials }) => {
  const [autoSlideInterval, setAutoSlideInterval] = useState<NodeJS.Timeout | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const startAutoSlide = () => {
      const interval = setInterval(() => {
        setActiveSlide(prev => (prev + 1) % testimonials.length);
      }, 30000);
      setAutoSlideInterval(interval);
    };

    startAutoSlide();

    return () => {
      if (autoSlideInterval) clearInterval(autoSlideInterval);
    };
  }, [testimonials.length]);

  const handleSlideChange = (index: number) => {
    setActiveSlide(index);
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    const newInterval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % testimonials.length);
    }, 30000);

    setAutoSlideInterval(newInterval);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8 }}
      className="mb-8 overflow-visible"
    >
        <Carousel 
          opts={{ align: "start", loop: true }} 
          className="w-full overflow-visible"
          plugins={[
            Autoplay({
              delay: 30000,
            }) as any
          ]}
          setApi={api => {
            api?.on("select", () => {
              const visibleSlide = api.selectedScrollSnap();
              handleSlideChange(visibleSlide);
            });
          }}
        >
        <CarouselContent className={cn(
          "overflow-visible",
          isMobile ? "py-2" : "py-4"
        )}>
          {testimonials.map(testimonial => (
            <CarouselItem key={testimonial.id} className={cn(
              "overflow-visible",
              isMobile ? "basis-[85%] py-1" : "sm:basis-1/2 lg:basis-1/4 py-2"
            )}>
              <TestimonialCard testimonial={testimonial} />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="flex items-center justify-center mt-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/90 shadow-lg hover:bg-white hover:shadow-xl border border-gray-200/50 mr-4 dark:bg-gray-800/90 dark:hover:bg-gray-800 dark:border-gray-700/50 transition-all duration-300"
            onClick={() => {
              const prevSlide = (activeSlide - 1 + testimonials.length) % testimonials.length;
              handleSlideChange(prevSlide);
            }}
          >
            <ArrowLeft className="h-5 w-5 text-brand-purple dark:text-brand-purple" />
          </Button>
          
          <div className="flex gap-2 mx-4">
            {testimonials.map((_, i) => (
              <Button
                key={i}
                variant="ghost"
                size="icon"
                className={`w-3 h-3 p-0 rounded-full transition-all duration-300 ${
                  i === activeSlide 
                    ? 'bg-brand-purple dark:bg-purple-600 scale-125' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                onClick={() => handleSlideChange(i)}
              />
            ))}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/90 shadow-lg hover:bg-white hover:shadow-xl border border-gray-200/50 ml-4 dark:bg-gray-800/90 dark:hover:bg-gray-800 dark:border-gray-700/50 transition-all duration-300"
            onClick={() => {
              const nextSlide = (activeSlide + 1) % testimonials.length;
              handleSlideChange(nextSlide);
            }}
          >
            <ArrowRight className="h-5 w-5 text-brand-purple dark:text-brand-purple" />
          </Button>
        </div>
      </Carousel>
    </motion.div>
  );
};

export default TestimonialCarousel;
