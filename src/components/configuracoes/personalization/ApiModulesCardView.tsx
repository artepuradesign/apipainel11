
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Power, PowerOff, Package } from 'lucide-react';
import { Module, Panel } from '@/utils/apiService';
import * as Icons from 'lucide-react';
import ModuleCardTemplates from './ModuleCardTemplates';
import ModuleGridWrapper from './ModuleGridWrapper';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { getDiscount } from '@/utils/planUtils';
import { formatMoneyBR } from '@/utils/formatters';

interface ApiModulesCardViewProps {
  modules: Module[];
  panels: Panel[];
  onEdit: (module: Module) => void;
  onDelete: (moduleId: number) => void;
  onToggleStatus: (moduleId: number) => void;
}

const ApiModulesCardView: React.FC<ApiModulesCardViewProps> = ({
  modules,
  panels,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const { calculateDiscountedPrice, subscription, planInfo } = useUserSubscription();
  const { user } = useAuth();
  
  // Obter plano atual
  const currentPlan = subscription?.plan_name || planInfo?.name || 
                      (user ? localStorage.getItem(`user_plan_${user.id}`) || 'Pré-Pago' : 'Pré-Pago');
  
  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent || Package;
  };

  // Agrupar módulos por painel
  const modulesByPanel = modules.reduce((acc, module) => {
    const panelId = module.panel_id;
    if (!acc[panelId]) {
      acc[panelId] = [];
    }
    acc[panelId].push(module);
    return acc;
  }, {} as Record<number, Module[]>);

  // Ordena pela Ordem de Exibição (sort_order) definida em Painéis > Editar Painel,
  // mantendo compatível com a organização usada no /dashboard.
  const sortedPanelsByDisplayOrder = [...panels].sort((a, b) => {
    const aOrder = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : 0;
    const bOrder = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 0;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.id - b.id;
  });

  const panelIdsInDashboardOrder = sortedPanelsByDisplayOrder
    .map((panel) => panel.id)
    .filter((panelId) => !!modulesByPanel[panelId]?.length);

  const orphanPanelIds = Object.keys(modulesByPanel)
    .map(Number)
    .filter((panelId) => !sortedPanelsByDisplayOrder.some((panel) => panel.id === panelId));

  const orderedPanelIds = [...panelIdsInDashboardOrder, ...orphanPanelIds];

  const getPanelName = (panelId: number) => {
    const panel = panels.find(p => p.id === panelId);
    return panel?.name || `Painel ${panelId}`;
  };

  const getPanelIcon = (panelId: number) => {
    const panel = panels.find(p => p.id === panelId);
    return getIconComponent(panel?.icon || 'Package');
  };

  const getPanelTemplate = (panelId: number): 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix' => {
    const validTemplates = ['corporate', 'creative', 'minimal', 'modern', 'elegant', 'forest', 'rose', 'cosmic', 'neon', 'sunset', 'arctic', 'volcano', 'matrix'];
    const panel = panels.find(p => p.id === panelId);
    const template = panel?.template && validTemplates.includes(panel.template)
      ? panel.template as 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix'
      : 'modern';

    console.log(`🎨 [TEMPLATE PERSONALIZAÇÃO - MÓDULOS] Painel ${panelId} usando template: ${template} (original: ${panel?.template})`);
    return template;
  };

  // Função para formatar o preço (SEM R$)
  const formatPrice = (price: number | string) => {
    if (price === null || price === undefined || price === '') return '0,00';

    const numericValue = typeof price === 'string'
      ? Number(price.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''))
      : Number(price);

    return formatMoneyBR(Number.isFinite(numericValue) ? numericValue : 0);
  };

  return (
    <div className="space-y-8">
      {orderedPanelIds.map((panelId) => {
        const panelModules = modulesByPanel[panelId] || [];
        const PanelIcon = getPanelIcon(panelId);
        
        return (
          <div key={panelId} className="bg-white/75 dark:bg-gray-800/75 rounded-lg border border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                      <PanelIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle>
                      {getPanelName(Number(panelId))}
                    </CardTitle>
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                      {panelModules.length}
                    </div>
                    <Badge variant="outline" className="text-xs font-mono bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                      {getPanelTemplate(Number(panelId))}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Módulos configurados para este painel usando template <span className="font-mono">{getPanelTemplate(Number(panelId))}</span>
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <ModuleGridWrapper className="p-6 pt-0">
              {panelModules.map((module) => {
                const template = getPanelTemplate(Number(panelId));
                
                // Calcular preços com desconto
                const originalPrice = parseFloat(module.price?.toString().replace(',', '.') || '0');
                const planDiscount = getDiscount(currentPlan, module.panel_id);
                const hasDiscount = planDiscount > 0;
                const discountAmount = hasDiscount ? (originalPrice * planDiscount) / 100 : 0;
                const discountedPrice = hasDiscount ? originalPrice - discountAmount : originalPrice;
                
                console.log('🔍 Debug ApiModulesCardView - Dados do módulo:', {
                  moduleName: module.title,
                  originalPrice,
                  discountedPrice,
                  hasDiscount,
                  planDiscount,
                  currentPlan,
                  formatOriginal: formatPrice(originalPrice),
                  formatDiscounted: formatPrice(discountedPrice),
                  willShowOriginalPrice: hasDiscount ? formatPrice(originalPrice) : undefined,
                  willShowDiscountPercentage: hasDiscount ? planDiscount : undefined
                });
                
                const isInactive = !module.is_active || module.operational_status !== 'on';
                
                return (
                  <div key={module.id} className={`relative ${isInactive ? 'opacity-50 grayscale' : ''}`}>
                    <ModuleCardTemplates
                      module={{
                        title: module.title,
                        description: module.description,
                        price: formatPrice(hasDiscount ? discountedPrice : originalPrice),
                        originalPrice: hasDiscount ? formatPrice(originalPrice) : undefined,
                        discountPercentage: hasDiscount ? planDiscount : undefined,
                        status: module.is_active ? 'ativo' : 'inativo',
                        operationalStatus: module.operational_status === 'maintenance' ? 'manutencao' : module.operational_status,
                        iconSize: 'medium',
                        showDescription: true,
                        icon: module.icon,
                        color: module.color
                      }}
                      template={template}
                    />
                    
                    {/* Overlay com botões de ação */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center z-50">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleStatus(module.id);
                          }}
                          title={module.operational_status === 'on' ? 'Desligar' : 'Ligar'}
                          className="bg-white/95 hover:bg-white text-gray-700 hover:text-gray-900 border-gray-200 shadow-lg"
                        >
                          {module.operational_status === 'on' ? 
                            <PowerOff className="h-3 w-3" /> : 
                            <Power className="h-3 w-3" />
                          }
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEdit(module);
                          }}
                          title="Editar módulo"
                          className="bg-white/95 hover:bg-white text-gray-700 hover:text-gray-900 border-gray-200 shadow-lg"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete(module.id);
                          }}
                          className="bg-white/95 hover:bg-white text-red-600 hover:text-red-700 border-gray-200 shadow-lg"
                          title="Excluir módulo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </ModuleGridWrapper>
          </div>
        );
      })}
    </div>
  );
};

export default ApiModulesCardView;
