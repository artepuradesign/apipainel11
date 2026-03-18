import React, { useEffect, useState, useCallback } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useTestimonials } from '@/hooks/useTestimonials';
import TestimonialForm from './testimonials/TestimonialForm';
import { useLiquidGlass } from '@/contexts/LiquidGlassContext';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import { Locale, useLocale } from '@/contexts/LocaleContext';

interface TestimonialType {
  id: number;
  name: string;
  company: string;
  message: string;
  rating: number;
  status: string;
  position?: string;
  avatar?: string;
  created_at: string;
}

const contentByLocale: Record<Locale, {
  title: string;
  subtitle: string;
  share: string;
  customerFallback: string;
  goToTestimonial: string;
}> = {
  'pt-BR': {
    title: 'Depoimentos',
    subtitle: 'Profissionais que confiam em nossa plataforma',
    share: 'Compartilhe sua experiência',
    customerFallback: 'Cliente',
    goToTestimonial: 'Ir para depoimento',
  },
  en: {
    title: 'Testimonials',
    subtitle: 'Professionals who trust our platform',
    share: 'Share your experience',
    customerFallback: 'Customer',
    goToTestimonial: 'Go to testimonial',
  },
  es: {
    title: 'Testimonios',
    subtitle: 'Profesionales que confían en nuestra plataforma',
    share: 'Comparte tu experiencia',
    customerFallback: 'Cliente',
    goToTestimonial: 'Ir al testimonio',
  },
};

const TestimonialCard = ({ testimonial, customerFallback }: { testimonial: TestimonialType; customerFallback: string }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? 'text-amber-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  return (
    <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-md hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9 ring-1 ring-brand-purple/20 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-brand-purple to-purple-600 text-white font-medium text-xs">
              {getInitials(testimonial.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">
              {testimonial.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {testimonial.position && testimonial.company
                ? `${testimonial.position} • ${testimonial.company}`
                : testimonial.company || testimonial.position || customerFallback
              }
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            {renderStars(testimonial.rating)}
          </div>
        </div>

        <blockquote className="flex-1 text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 relative pl-3 border-l-2 border-brand-purple/30">
          {testimonial.message}
        </blockquote>
      </CardContent>
    </Card>
  );
};

const Testimonials = ({ maxVisible }: { maxVisible?: number }) => {
  const { testimonials, loading } = useTestimonials();
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const { config: liquidGlassConfig } = useLiquidGlass();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { locale } = useLocale();
  const content = contentByLocale[locale];

  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 60000 })
  );

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  if (loading) {
    return (
      <section className="py-8 sm:py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10" />
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-purple mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0 && !loading) return null;

  const displayTestimonials = maxVisible ? testimonials.slice(0, maxVisible) : testimonials;

  return (
    <section className="py-8 sm:py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10" />
      <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-brand-purple/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl" />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {content.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {content.subtitle}
            </p>
          </div>
          {liquidGlassConfig.enabled ? (
            <LiquidGlassButton
              variant="outline"
              className="text-xs px-4"
              onClick={() => setShowTestimonialForm(true)}
            >
              {content.share}
            </LiquidGlassButton>
          ) : (
            <Button
              onClick={() => setShowTestimonialForm(true)}
              variant="outline"
              size="sm"
              className="border-brand-purple/30 text-brand-purple hover:bg-brand-purple hover:text-white transition-all duration-300 text-xs px-4"
            >
              {content.share}
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative"
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              slidesToScroll: 1,
            }}
            plugins={[autoplayPlugin.current as any]}
            className="w-full"
            onMouseEnter={autoplayPlugin.current.stop}
            onMouseLeave={autoplayPlugin.current.reset}
          >
            <CarouselContent className="-ml-2 sm:-ml-3">
              {displayTestimonials.map((testimonial, index) => (
                <CarouselItem
                  key={testimonial.id}
                  className="pl-2 sm:pl-3 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.03 * (index % 3) }}
                    className="h-full"
                  >
                    <TestimonialCard testimonial={testimonial} customerFallback={content.customerFallback} />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden sm:flex -left-4 lg:-left-6 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 border-gray-200/30 dark:border-gray-700/30 shadow-md h-8 w-8" />
            <CarouselNext className="hidden sm:flex -right-4 lg:-right-6 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 border-gray-200/30 dark:border-gray-700/30 shadow-md h-8 w-8" />
          </Carousel>

          {count > 0 && (
            <div className="flex justify-center mt-4 gap-1.5">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index + 1 === current
                      ? 'bg-brand-purple w-6'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 w-1.5'
                  }`}
                  aria-label={`${content.goToTestimonial} ${index + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <TestimonialForm isOpen={showTestimonialForm} onClose={() => setShowTestimonialForm(false)} />
    </section>
  );
};

export default Testimonials;
