import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { moduleService, panelService, Module, Panel } from '@/utils/apiService';
import ModuleCardTemplates from '@/components/configuracoes/personalization/ModuleCardTemplates';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useIsMobile } from '@/hooks/use-mobile';
import Autoplay from "embla-carousel-autoplay";

const ModulosCarousel = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { calculateDiscountedPrice, discountPercentage, hasActiveSubscription } = useUserSubscription();
  const isMobile = useIsMobile();

  // Carregar dados da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [modulesResponse, panelsResponse] = await Promise.all([
          moduleService.getAll(),
          panelService.getAll()
        ]);
        
        if (modulesResponse.success && panelsResponse.success) {
          // Filtrar APENAS painéis que têm is_premium = 0 (não premium)
          const nonPremiumPanels = panelsResponse.data.filter(panel => !panel.is_premium);
          
          if (nonPremiumPanels.length === 0) {
            setModules([]);
            setPanels([]);
            return;
          }
          
          const nonPremiumPanelIds = nonPremiumPanels.map(panel => panel.id);
          
          // Filtrar módulos: ativos + operacionais + de painéis não premium
          const filteredModules = modulesResponse.data.filter(module => {
            const isActive = module.is_active === true;
            const isOperational = module.operational_status === 'on';
            const isFromNonPremiumPanel = nonPremiumPanelIds.includes(module.panel_id);
            
            return isActive && isOperational && isFromNonPremiumPanel;
          });
          
          setModules(filteredModules);
          setPanels(nonPremiumPanels);
          
          console.log('📊 [CAROUSEL] Loaded modules:', filteredModules.length);
        } else {
          setError('Falha ao carregar dados da API');
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro de conexão com a API');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getPanelTemplate = (panelId: number): 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix' => {
    const validTemplates = ['corporate', 'creative', 'minimal', 'modern', 'elegant', 'forest', 'rose', 'cosmic', 'neon', 'sunset', 'arctic', 'volcano', 'matrix'];
    const panel = panels.find(p => p.id === panelId);
    const template = panel?.template && validTemplates.includes(panel.template) 
      ? panel.template as 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix'
      : 'modern';
    
    return template;
  };

  const formatPrice = (price: number | string) => {
    if (!price && price !== 0) return '0,00';
    
    if (typeof price === 'string') {
      const cleanPrice = price.replace(/[^\d,\.]/g, '');
      if (!cleanPrice) return '0,00';
      
      if (cleanPrice.includes(',')) {
        const parts = cleanPrice.split(',');
        if (parts.length === 2 && parts[1].length <= 2) {
          return cleanPrice;
        }
      }
      
      const numericValue = parseFloat(cleanPrice.replace(',', '.'));
      if (isNaN(numericValue)) return '0,00';
      
      return numericValue.toFixed(2).replace('.', ',');
    }
    
    const numericValue = typeof price === 'number' ? price : 0;
    return numericValue.toFixed(2).replace('.', ',');
  };

  const getItemsPerView = () => {
    if (isMobile) return 1;
    return window.innerWidth >= 1024 ? 4 : 2;
  };

  return (
    <section className="py-8 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Módulos Disponíveis</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Módulos disponíveis em nossos painéis personalizados
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando módulos...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-full max-w-lg">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-destructive/20 dark:border-destructive/20 shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-destructive/10 dark:bg-destructive/20 rounded-full">
                      <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Erro de Carregamento
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Não foi possível carregar os módulos da API
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        HTTP 500 - Erro interno do servidor
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => {
                        setError(null);
                        window.location.reload();
                      }}
                      className="bg-destructive hover:bg-destructive/90 text-white px-6 py-2"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar Novamente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12">
            <div className="backdrop-blur-sm bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 rounded-lg p-8 max-w-md mx-auto">
              <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Nenhum módulo cadastrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Os módulos serão exibidos aqui quando forem cadastrados no painel administrativo
              </p>
            </div>
          </div>
        ) : (
          <Carousel 
            opts={{ 
              align: "start", 
              loop: true,
              dragFree: true
            }}
            plugins={[
              Autoplay({
                delay: 10000,
                stopOnInteraction: true,
                stopOnMouseEnter: true
              }) as any
            ]}
            className="w-full max-w-full"
          >
            <CarouselContent className="ml-0">
              {modules.map((module, index) => {
                const template = getPanelTemplate(module.panel_id);
                const originalPrice = parseFloat(module.price?.toString().replace(',', '.') || '0');
                const { discountedPrice, hasDiscount } = calculateDiscountedPrice(originalPrice, module.panel_id);
                
                // Só mostrar desconto se o usuário tem assinatura ativa
                const shouldShowDiscount = hasDiscount && hasActiveSubscription;
                
                return (
                  <CarouselItem 
                    key={module.id} 
                    className="basis-[42%] sm:basis-[30%] md:basis-[23%] lg:basis-[19%] xl:basis-[16%] px-0"
                  >
                    <div className="w-full">
                      <ModuleCardTemplates
                        module={{
                          title: module.title,
                          description: module.description,
                          price: formatPrice(shouldShowDiscount ? discountedPrice : originalPrice),
                          originalPrice: shouldShowDiscount ? formatPrice(originalPrice) : undefined,
                          discountPercentage: shouldShowDiscount ? discountPercentage : undefined,
                          status: module.is_active ? 'ativo' : 'inativo',
                          operationalStatus: module.operational_status === 'maintenance' ? 'manutencao' : module.operational_status,
                          iconSize: 'medium',
                          showDescription: true,
                          icon: module.icon,
                          color: module.color
                        }}
                        template={template}
                      />
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default ModulosCarousel;