import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { moduleService, panelService, Module, Panel } from '@/utils/apiService';
import ModuleCardTemplates from '@/components/configuracoes/personalization/ModuleCardTemplates';
import ModuleGridWrapper from '@/components/configuracoes/personalization/ModuleGridWrapper';
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  User, 
  Building2, 
  Car, 
  TrendingUp, 
  Search, 
  FileText, 
  Shield, 
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const ModulosDisponiveis = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          console.log('🔍 [DEBUG] Todos os painéis da API:', panelsResponse.data.map(p => ({ 
            id: p.id, 
            name: p.name, 
            is_premium: p.is_premium 
          })));
          
          // Filtrar APENAS painéis que têm is_premium = 0 (não premium)
          const nonPremiumPanels = panelsResponse.data.filter(panel => !panel.is_premium);
          console.log('🎯 [DEBUG] Painéis NÃO premium encontrados:', nonPremiumPanels.map(p => ({ 
            id: p.id, 
            name: p.name 
          })));
          
          if (nonPremiumPanels.length === 0) {
            console.log('⚠️ [DEBUG] Nenhum painel não premium encontrado!');
            setModules([]);
            setPanels([]);
            return;
          }
          
          const nonPremiumPanelIds = nonPremiumPanels.map(panel => panel.id);
          console.log('🔢 [DEBUG] IDs dos painéis não premium:', nonPremiumPanelIds);
          
          console.log('📋 [DEBUG] Todos os módulos da API:', modulesResponse.data.map(m => ({ 
            title: m.title, 
            panel_id: m.panel_id, 
            is_active: m.is_active, 
            operational_status: m.operational_status 
          })));
          
          // Filtrar módulos: ativos + operacionais + de painéis não premium
          const filteredModules = modulesResponse.data.filter(module => {
            const isActive = module.is_active === true;
            const isOperational = module.operational_status === 'on';
            const isFromNonPremiumPanel = nonPremiumPanelIds.includes(module.panel_id);
            
            console.log(`🔍 [DEBUG] Módulo "${module.title}": ativo=${isActive}, operacional=${isOperational}, painel_não_premium=${isFromNonPremiumPanel} (painel_id: ${module.panel_id})`);
            
            return isActive && isOperational && isFromNonPremiumPanel;
          });
          
          console.log('✅ [DEBUG] Módulos FINAIS exibidos:', filteredModules.map(m => ({ 
            title: m.title, 
            panel_id: m.panel_id 
          })));
          
          setModules(filteredModules);
          setPanels(nonPremiumPanels);
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
    
    console.log(`🎨 [TEMPLATE HOME] Módulo painel ${panelId} usando template: ${template} (original: ${panel?.template})`);
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

  return (
    <section className="pt-40 pb-40 relative overflow-hidden">
      {/* Background animado igual aos Planos */}
      <div className="absolute inset-0 w-full h-full">
        {/* Gradiente de fundo principal */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 dark:from-purple-900 dark:via-pink-900 dark:to-indigo-900" />
        
        {/* Gradiente adicional para profundidade */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-purple-100/20 to-pink-100/10 dark:from-transparent dark:via-purple-900/20 dark:to-pink-900/10" />
        
        {/* Elementos animados flutuantes */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/60 via-pink-400/60 to-red-400/60 dark:from-purple-400/80 dark:via-pink-400/80 dark:to-red-400/80 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 dark:opacity-90 animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-400/60 via-cyan-400/60 to-teal-400/60 dark:from-blue-400/80 dark:via-cyan-400/80 dark:to-teal-400/80 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 dark:opacity-90 animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-br from-indigo-400/60 via-purple-400/60 to-pink-400/60 dark:from-indigo-400/80 dark:via-purple-400/80 dark:to-pink-400/80 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 dark:opacity-90 animate-pulse" style={{animationDuration: '5s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-white">
            Módulos Disponíveis
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto dark:text-gray-300">
            Conheça todos os módulos que oferecemos em nossos painéis personalizados
          </p>
        </motion.div>

        {error ? (
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
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
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
          <div className="mb-8">
             <Carousel 
               opts={{ 
                 align: "start", 
                 loop: false,
                 slidesToScroll: 1
               }} 
               className="w-full"
             >
                <CarouselContent className="py-4 -ml-4 md:-ml-6">
                  {modules.map((module, index) => {
                    const template = getPanelTemplate(module.panel_id);
                    
                    return (
                      <CarouselItem key={index} className="basis-full md:basis-1/3 py-2 pl-4 md:pl-6">
                        <div className="w-full max-w-[280px] md:max-w-[200px] mx-auto">
                          <ModuleCardTemplates
                            module={{
                              title: module.title,
                              description: module.description,
                              price: formatPrice(module.price || 0),
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
                <div className="flex justify-center gap-4 mt-6">
                  <CarouselPrevious className="relative translate-y-0 left-0" />
                  <CarouselNext className="relative translate-y-0 right-0" />
                </div>
             </Carousel>
          </div>
        )}

      </div>
    </section>
  );
};

export default ModulosDisponiveis;
