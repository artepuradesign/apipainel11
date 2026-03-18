
import React, { useState, useEffect } from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';
import { loadCustomModules, loadSystemPanels, type CustomModule, type SystemPanel } from '@/utils/personalizationStorage';
// ModuleCard antigo removido - agora usamos apenas ModuleCardTemplates
import EmptyState from '../ui/empty-state';
import { Lock, Package, Settings, Eye, ShoppingCart } from 'lucide-react';
import * as Icons from 'lucide-react';
import ModuleCardTemplates from '@/components/configuracoes/personalization/ModuleCardTemplates';
import { calculateDiscountedPrice } from '@/utils/planUtils';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleRecords } from '@/hooks/useModuleRecords';

// Tipo para módulos da API
interface ApiModule {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: string;
  path: string;
  api_endpoint?: string;
  operationalStatus: 'on' | 'off' | 'manutencao';
  panelId: string;
  color: string;
  iconSize: 'small' | 'medium' | 'large';
  showDescription: boolean;
}

// Tipo para painéis da API  
interface ApiPanel {
  id: number;
  name: string;
  description: string;
  template: 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix';
  icon: string;
}

interface ModulesGridProps {
  currentPlan: string;
  onModuleClick: (path: string, moduleName: string, modulePrice: string) => void;
  panelFilter?: string;
}

const ModulesGrid: React.FC<ModulesGridProps> = ({ currentPlan, onModuleClick, panelFilter = '' }) => {
  const [modules, setModules] = useState<(CustomModule | ApiModule)[]>([]);
  const [panels, setPanels] = useState<(SystemPanel | ApiPanel)[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix'>('modern');
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { totalAvailableBalance, isLoading: isBalanceLoading, hasLoadedOnce, loadTotalAvailableBalance } = useUserBalance();
  const { user } = useAuth();
  const { hasRecordsInModule } = useModuleRecords();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Detectar tema escuro
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Observer para mudanças no tema
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    loadModules();
    
    return () => observer.disconnect();
  }, [panelFilter]);

  useEffect(() => {
    // Listen for panels updates
    const handlePanelsUpdate = (event: any) => {
      console.log('Panels updated, reloading modules...');
      loadModules();
    };

    window.addEventListener('panelsUpdated', handlePanelsUpdate);
    
    return () => {
      window.removeEventListener('panelsUpdated', handlePanelsUpdate);
    };
  }, [panelFilter]);

  const loadModules = async () => {
    setIsLoading(true);
    
    try {
      // Para a página inicial, carregar da API
      if (!panelFilter) {
        const { moduleService, panelService } = await import('@/utils/apiService');
        
        const [modulesResponse, panelsResponse] = await Promise.all([
          moduleService.getAll(),
          panelService.getAll()
        ]);
        
        if (modulesResponse.success && panelsResponse.success) {
          // Converter painéis da API para formato compatível
          const validTemplates = ['corporate', 'creative', 'minimal', 'modern', 'elegant', 'forest', 'rose', 'cosmic', 'neon', 'sunset', 'arctic', 'volcano', 'matrix'];
          
          const convertedPanels: ApiPanel[] = panelsResponse.data.map(panel => {
            const template = panel.template && validTemplates.includes(panel.template) 
              ? panel.template as 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix'
              : 'modern';
              
            return {
              id: panel.id,
              name: panel.name,
              description: panel.description || '',
              template,
              icon: panel.icon || 'Package'
            };
          });
          
          console.log('🎨 [TEMPLATES] Painéis com templates da API:', convertedPanels.map(p => ({ id: p.id, name: p.name, template: p.template })));
          setPanels(convertedPanels);
          
          // Filtrar apenas módulos ativos
          const activeModules = modulesResponse.data.filter(module => 
            module.is_active && module.operational_status === 'on'
          );
          
          // Converter para formato compatível
          const convertedModules: ApiModule[] = activeModules.map(module => ({
            id: module.id.toString(),
            title: module.title,
            description: module.description || '',
            price: typeof module.price === 'number' ? module.price.toFixed(2).replace('.', ',') : (module.price || '0,00'),
            icon: module.icon || 'Package',
            // `api_endpoint` agora representa a rota interna da página do módulo (ex.: /dashboard/consultar-cpf-simples)
            api_endpoint: module.api_endpoint || module.path || '',
            path: (() => {
              const raw = (module.api_endpoint || module.path || '').toString().trim();
              if (!raw) return `/module/${module.slug}`;
              if (raw.startsWith('/')) return raw;
              if (raw.startsWith('dashboard/')) return `/${raw}`;
              if (!raw.includes('/')) return `/dashboard/${raw}`;
              return `/module/${module.slug}`;
            })(),
            operationalStatus: module.operational_status as 'on' | 'off' | 'manutencao',
            panelId: module.panel_id.toString(),
            color: module.color || '#6366f1',
            iconSize: 'medium' as const,
            showDescription: true
          }));
          
          setModules(convertedModules);
        }
      } else {
        // Para outras páginas, usar sistema local
        const savedModules = loadCustomModules();
        const savedPanels = loadSystemPanels();
        
        setPanels(savedPanels);
        
        // Get template from the current panel
        const currentPanel = savedPanels.find(panel => panel.id === panelFilter);
        if (currentPanel && currentPanel.template) {
          setCurrentTemplate(currentPanel.template);
        }
        
        if (savedModules.length > 0) {
          // Filtrar módulos por painel se especificado
          const filteredModules = panelFilter 
            ? savedModules.filter(module => module.panelId === panelFilter)
            : savedModules;
            
          // Ordenar módulos: operacionais primeiro, depois inativos
          const sortedModules = filteredModules.sort((a, b) => {
            if (a.operationalStatus === 'on' && b.operationalStatus === 'off') return -1;
            if (a.operationalStatus === 'off' && b.operationalStatus === 'on') return 1;
            return 0;
          });
          
          setModules(sortedModules);
        } else {
          setModules([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent || Package;
  };

  const activeModulesCount = modules.filter(m => m.operationalStatus === 'on').length;
  const inactiveModulesCount = modules.filter(m => m.operationalStatus === 'off').length;
  const currentPanel = panels.find(p => p.id === panelFilter);

  const handleModuleCountClick = () => {
    toast.success(`${activeModulesCount} módulos ativos disponíveis`, {
      description: `${inactiveModulesCount} módulos inativos requerem upgrade do plano`,
    });
  };

  const checkBalanceAndNavigate = (module: CustomModule | ApiModule) => {
    if (!user) return;

    if (isBalanceLoading || !hasLoadedOnce) {
      toast.info('Verificando saldo...', {
        description: 'Aguarde um instante e tente novamente.'
      });
      loadTotalAvailableBalance();
      return;
    }

    const price = parseFloat(module.price.replace(',', '.'));
    const panelId = 'panelId' in module ? parseInt(module.panelId) : undefined;
    const { finalPrice } = calculateDiscountedPrice(price, currentPlan, panelId);
    
    console.log('Verificando saldo para módulo:', {
      moduleName: module.title,
      originalPrice: price,
      finalPrice,
      totalAvailableBalance,
      currentPlan
    });
    
    // Verificar se o usuário tem registros no módulo
    const moduleRoute = module.path;
    const userHasRecords = hasRecordsInModule(moduleRoute);

    if (totalAvailableBalance < finalPrice && !userHasRecords) {
      toast.error(
        `Saldo insuficiente para ${module.title}! Valor necessário: R$ ${finalPrice.toFixed(2)}`,
        {
          action: {
            label: "Adicionar Saldo",
            onClick: () => window.location.href = '/dashboard/adicionar-saldo'
          }
        }
      );
      return;
    }

    if (totalAvailableBalance < finalPrice && userHasRecords) {
      toast.info(
        `Você pode visualizar seu histórico em ${module.title}, mas precisa de saldo para novas consultas.`,
        { duration: 4000 }
      );
    }

    onModuleClick(module.path, module.title, finalPrice.toString());
  };

  const handleModuleClick = (module: CustomModule | ApiModule) => {
    if (module.operationalStatus === 'off') {
      toast.warning(`Módulo ${module.title} temporariamente indisponível`, {
        description: "Este módulo está em manutenção"
      });
      return;
    }

    if (module.operationalStatus === 'manutencao') {
      toast.info(`Módulo ${module.title} em manutenção`, {
        description: "Voltará em breve"
      });
      return;
    }

    // Verificar saldo antes de navegar
    checkBalanceAndNavigate(module);
  };

  if (isLoading) {
    return (
      <div className="bg-white/75 dark:bg-gray-800/75 rounded-lg border border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando módulos...</span>
        </div>
      </div>
    );
  }

  const PanelIcon = currentPanel ? getIconComponent(currentPanel.icon) : Package;

  return (
    <div className="bg-white/75 dark:bg-gray-800/75 rounded-lg border border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <PanelIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>
                {currentPanel ? currentPanel.name : 'Módulos de Consulta'}
              </CardTitle>
              <div className="flex gap-2">
                <div 
                  className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold cursor-pointer hover:bg-green-600 transition-colors"
                  onClick={handleModuleCountClick}
                  title="Módulos ativos"
                >
                  {activeModulesCount}
                </div>
                {inactiveModulesCount > 0 && (
                  <div 
                    className="flex items-center justify-center w-8 h-8 bg-gray-500 text-white rounded-full text-sm font-bold cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={handleModuleCountClick}
                    title="Módulos inativos"
                  >
                    <Lock className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
            <CardDescription>
              {currentPanel 
                ? currentPanel.description 
                : "Selecione o tipo de consulta que deseja realizar"
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      {modules.length === 0 ? (
        <div className="p-6 pt-0">
          <EmptyState 
            icon={Settings}
            title="Nenhum módulo configurado"
            description="Configure módulos na página de Personalização para este painel."
            className="justify-start"
          />
        </div>
      ) : (
        <div className={`flex flex-wrap justify-center p-6 pt-0 ${isMobile ? 'gap-2' : 'gap-6'}`}>
           {modules.map((module) => {
             // Para página inicial, usar template do painel do módulo
             const moduleTemplate = !panelFilter 
               ? (() => {
                   const modulePanel = panels.find(p => p.id?.toString() === module.panelId);
                   const template = modulePanel?.template || 'modern';
                   console.log(`🎨 [TEMPLATE] Módulo "${module.title}" (painel ${module.panelId}) usando template: ${template}`);
                   return template;
                 })()
               : currentTemplate;

             // Calcular preço com desconto se houver plano ativo
             const originalPrice = parseFloat(module.price.replace(',', '.'));
             const panelId = 'panelId' in module ? parseInt(module.panelId) : undefined;
             const { finalPrice, discount, discountAmount } = calculateDiscountedPrice(originalPrice, currentPlan, panelId);
             const hasDiscount = discount > 0;
             
              // Verificar se tem saldo suficiente
              const hasSufficientBalance = !hasLoadedOnce || isBalanceLoading ? true : totalAvailableBalance >= finalPrice;
              const userHasRecordsInModule = hasRecordsInModule(module.path);
            
             return (
               <div 
                 key={`${module.id}-${moduleTemplate}`} 
                 className={`flex-shrink-0 relative cursor-pointer ${isMobile ? 'w-[calc(50%-0.25rem)]' : ''}`}
                 onClick={() => handleModuleClick(module)}
               >
                {/* Overlay para módulos inativos */}
                {module.operationalStatus === 'off' && (
                  <div className="absolute inset-0 bg-gray-900/60 dark:bg-gray-900/80 rounded-lg z-10 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center text-white">
                      <Lock className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Bloqueado</p>
                      <p className="text-xs opacity-80">Upgrade necessário</p>
                    </div>
                  </div>
                )}

                {/* Overlay para saldo insuficiente - COM histórico (pode entrar para visualizar) */}
                {module.operationalStatus !== 'off' && !hasSufficientBalance && userHasRecordsInModule && (
                  <div className="absolute inset-0 bg-black/50 dark:bg-black/70 rounded-lg z-10 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center text-white space-y-1">
                      <Eye className="h-7 w-7 mx-auto mb-1 text-green-400" />
                      <p className="text-sm font-medium">Visualizar</p>
                      <ShoppingCart className="h-5 w-5 mx-auto text-yellow-400" />
                      <p className="text-[10px] opacity-80">Comprar para nova consulta</p>
                    </div>
                  </div>
                )}

                {/* Overlay para saldo insuficiente - SEM histórico (bloqueado) */}
                {module.operationalStatus !== 'off' && !hasSufficientBalance && !userHasRecordsInModule && (
                  <div className="absolute inset-0 bg-red-900/60 dark:bg-red-900/80 rounded-lg z-10 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center text-white">
                      <Lock className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Saldo Insuficiente</p>
                      <p className="text-xs opacity-80">R$ {finalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                )}
                
                 <div className={isMobile ? 'transform scale-90' : ''}>
                   <ModuleCardTemplates
                     module={{
                       title: module.title,
                       description: module.description,
                       price: hasDiscount 
                         ? `${finalPrice.toFixed(2).replace('.', ',')}` 
                         : module.price,
                       originalPrice: hasDiscount ? module.price : undefined,
                       discountPercentage: hasDiscount ? discount : undefined,
                       status: module.operationalStatus === 'off' ? 'inativo' : 'ativo',
                       operationalStatus: module.operationalStatus,
                       iconSize: isMobile ? 'small' : ('iconSize' in module ? module.iconSize : 'medium'),
                       showDescription: isMobile ? false : ('showDescription' in module ? module.showDescription : true),
                       icon: module.icon,
                       color: 'color' in module ? module.color : '#6366f1'
                     }}
                     template={moduleTemplate}
                   />
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModulesGrid;
