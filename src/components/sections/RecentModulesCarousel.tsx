import React from 'react';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Link } from 'react-router-dom';
import ModuleCardTemplates from '@/components/configuracoes/personalization/ModuleCardTemplates';
import { useApiModules } from '@/hooks/useApiModules';
import { useAuth } from '@/contexts/AuthContext';
import { Locale, useLocale } from '@/contexts/LocaleContext';

const contentByLocale: Record<Locale, { badge: string; title: string; subtitle: string }> = {
  'pt-BR': {
    badge: 'Novidades',
    title: 'Últimos módulos adicionados',
    subtitle: 'Confira os módulos mais recentes da plataforma',
  },
  en: {
    badge: 'News',
    title: 'Latest modules added',
    subtitle: 'Check out the most recent platform modules',
  },
  es: {
    badge: 'Novedades',
    title: 'Últimos módulos agregados',
    subtitle: 'Descubre los módulos más recientes de la plataforma',
  },
};

const RecentModulesCarousel: React.FC = () => {
  const { modules, isLoading } = useApiModules();
  const { user, loading: authLoading } = useAuth();
  const { locale } = useLocale();
  const content = contentByLocale[locale];

  const getModulePageRoute = (module: (typeof modules)[number]): string => {
    const raw = (module?.api_endpoint || module?.path || '').toString().trim();
    if (!raw) return `/module/${module.slug}`;
    if (raw.startsWith('/')) return raw;
    if (raw.startsWith('dashboard/')) return `/${raw}`;
    if (!raw.includes('/')) return `/dashboard/${raw}`;
    return `/module/${module.slug}`;
  };

  const activeModules = modules
    .filter(m => m.is_active && m.operational_status === 'on')
    .slice(-10)
    .reverse();

  if (authLoading || !user) return null;
  if (isLoading || activeModules.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-background via-card/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            {content.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {content.title}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        <Carousel
          opts={{ align: 'start', loop: true }}
          plugins={[Autoplay({ delay: 3000 }) as any]}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {activeModules.map((mod) => (
              <CarouselItem
                key={mod.id}
                className="pl-2 basis-[155px]"
              >
                <Link to={getModulePageRoute(mod)} className="block homepage-module-card">
                  <ModuleCardTemplates
                    module={{
                      title: mod.title,
                      description: mod.description,
                      price: `${Number(mod.price).toFixed(2).replace('.', ',')}`,
                      status: 'ativo',
                      operationalStatus: 'on',
                      iconSize: 'medium',
                      showDescription: true,
                      icon: mod.icon || 'Package',
                      color: mod.color,
                    }}
                    template="modern"
                  />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default RecentModulesCarousel;
