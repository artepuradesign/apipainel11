import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Save, Crown, Package, Layers, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { useApiPanels } from '@/hooks/useApiPanels';
import { useApiModules } from '@/hooks/useApiModules';
import { toast } from 'sonner';

interface ApiPlanFormProps {
  plan?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const ApiPlanForm: React.FC<ApiPlanFormProps> = ({ plan, onSubmit, onCancel }) => {
  const { panels, isLoading: panelsLoading } = useApiPanels();
  const { modules, isLoading: modulesLoading } = useApiModules();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    original_price: 0,
    duration_days: 30,
    max_consultations: -1,
    max_api_calls: -1,
    features: [],
    modules_included: [],
    panels_included: [],
    category: 'Empresarial',
    is_active: true,
    is_popular: false,
    sort_order: 0,
    badge: '',
    discount_percentage: 0,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openPanels, setOpenPanels] = useState<number[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isPlanDataLoaded, setIsPlanDataLoaded] = useState(false);

  // Inicializar dados do plano quando plano mudar
  useEffect(() => {
    console.log('🔍 [PLAN FORM DEBUG] useEffect disparado - plan:', !!plan, 'plan.id:', plan?.id);
    if (plan) {
      console.log('🔄 [PLAN FORM] Carregando dados do plano:', plan);
      console.log('🔍 [PLAN FORM] Modules_included raw:', plan.modules_included);
      console.log('🔍 [PLAN FORM] Features raw:', plan.features);
      
      // Processar modules_included
      let modulesIncluded = [];
      if (Array.isArray(plan.modules_included)) {
        modulesIncluded = plan.modules_included;
      } else if (plan.modules_included && typeof plan.modules_included === 'string') {
        try {
          modulesIncluded = JSON.parse(plan.modules_included);
        } catch (e) {
          console.error('❌ [PLAN FORM] Erro ao parsear modules_included:', e);
          modulesIncluded = [];
        }
      }
      
      // Processar features
      let features = [];
      if (Array.isArray(plan.features)) {
        features = plan.features;
      } else if (plan.features && typeof plan.features === 'string') {
        try {
          features = JSON.parse(plan.features);
        } catch (e) {
          console.error('❌ [PLAN FORM] Erro ao parsear features:', e);
          features = [];
        }
      }

      console.log('📊 [PLAN FORM] Modules_included processado:', modulesIncluded);
      console.log('📊 [PLAN FORM] Features processado:', features);

      setFormData({
        name: plan.name || '',
        slug: plan.slug || '',
        description: plan.description || '',
        price: plan.price || 0,
        original_price: plan.original_price || 0,
        duration_days: plan.duration_days || 30,
        max_consultations: plan.max_consultations || -1,
        max_api_calls: plan.max_api_calls || -1,
        features: features,
        modules_included: modulesIncluded,
        panels_included: Array.isArray(plan.panels_included) ? plan.panels_included : [],
        category: plan.category || 'Empresarial',
        is_active: plan.is_active ?? true,
        is_popular: plan.is_popular ?? false,
        sort_order: plan.sort_order || 0,
        badge: plan.badge || '',
        discount_percentage: plan.discount_percentage || 0,
      });
      
      console.log('✅ [PLAN FORM] FormData atualizado com módulos:', modulesIncluded);
      setIsPlanDataLoaded(true);
    } else {
      // Resetar para novo plano
      console.log('🆕 [PLAN FORM] Inicializando novo plano');
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: 0,
        original_price: 0,
        duration_days: 30,
        max_consultations: -1,
        max_api_calls: -1,
        features: [],
        modules_included: [],
        panels_included: [],
        category: 'Empresarial',
        is_active: true,
        is_popular: false,
        sort_order: 0,
        badge: '',
        discount_percentage: 0,
      });
      setIsPlanDataLoaded(true);
    }
  }, [plan]);


  // Sincronizar painéis e módulos quando carregar dados do plano
  useEffect(() => {
    console.log('🎯 [PLAN FORM DEBUG] useEffect sincronização - modules:', modules.length, 'panels:', panels.length, 'isPlanDataLoaded:', isPlanDataLoaded, 'isInitialLoad:', isInitialLoad);
    console.log('🎯 [PLAN FORM DEBUG] plan exists:', !!plan, 'modules_included length:', formData.modules_included.length);
    console.log('🎯 [PLAN FORM DEBUG] formData.modules_included:', formData.modules_included);
    
    if (modules.length > 0 && panels.length > 0 && isPlanDataLoaded && isInitialLoad) {
      console.log('🎯 [PLAN FORM] Iniciando sincronização total dos painéis e módulos...');
      
      if (plan && formData.modules_included.length > 0) {
        // Para planos existentes: sincronizar painéis baseado nos módulos inclusos
        const requiredPanels = new Set<number>();
        const validModules = new Set<number>();
        
        // Encontrar painéis que contêm os módulos inclusos e validar módulos existentes
        console.log('🔍 [PLAN FORM] Analisando módulos inclusos para sincronização:', formData.modules_included);
        
        formData.modules_included.forEach(moduleId => {
          // Converter para número se for string
          const numericModuleId = typeof moduleId === 'string' ? parseInt(moduleId) : moduleId;
          const module = modules.find(m => m.id === numericModuleId && m.is_active);
          
          console.log('🔍 [PLAN FORM] Procurando módulo ID:', numericModuleId, 'encontrado:', !!module, module ? `(${module.name})` : '');
          
          if (module && module.panel_id) {
            requiredPanels.add(module.panel_id);
            validModules.add(module.id);
            console.log('🔍 [PLAN FORM] Módulo válido', module.name, 'pertence ao painel ID:', module.panel_id);
          } else {
            console.warn('⚠️ [PLAN FORM] Módulo ID', numericModuleId, 'não encontrado ou inativo - será removido');
          }
        });
        
        const panelsToInclude = Array.from(requiredPanels);
        const validModulesArray = Array.from(validModules);
        
        console.log('📋 [PLAN FORM] Painéis a serem marcados automaticamente:', panelsToInclude);
        console.log('📋 [PLAN FORM] Módulos válidos mantidos:', validModulesArray);
        console.log('📋 [PLAN FORM] Expandindo painéis com módulos:', panelsToInclude);
        
        // Expandir painéis que têm módulos
        setOpenPanels(panelsToInclude);
        
        // Sincronizar painéis_included e modules_included (manter apenas módulos válidos)
        setFormData(prev => ({
          ...prev,
          panels_included: panelsToInclude,
          modules_included: validModulesArray
        }));
        
        console.log('✅ [PLAN FORM] Sincronização concluída - painéis marcados:', panelsToInclude.length, 'módulos válidos:', validModulesArray.length);
      } else {
        // Para novos planos, expandir todos os painéis por padrão
        console.log('📋 [PLAN FORM] Novo plano - expandindo todos os painéis');
        setOpenPanels(panels.map(panel => panel.id));
      }
      
      // Marcar que a inicialização foi feita
      setIsInitialLoad(false);
    }
  }, [plan, modules, panels, isPlanDataLoaded, isInitialLoad, formData.modules_included]);

  // Atualizar recursos automaticamente baseado nos painéis e módulos selecionados - com sincronia total
  useEffect(() => {
    if (modules.length > 0 && panels.length > 0 && isPlanDataLoaded) {
      const generateFeatures = () => {
        const features = new Set<string>(); // Usar Set para evitar duplicatas
        
        console.log('🔄 [PLAN FORM] Gerando recursos - painéis inclusos:', formData.panels_included);
        console.log('🔄 [PLAN FORM] Gerando recursos - módulos inclusos:', formData.modules_included);
        
        // 1. Adicionar painéis selecionados primeiro
        const selectedPanels = panels.filter(panel => formData.panels_included.includes(panel.id));
        selectedPanels.forEach(panel => {
          features.add(`📋 ${panel.name}`);
          console.log('➕ [FEATURES] Adicionado painel:', panel.name);
        });
        
        // 2. Adicionar TODOS os módulos selecionados (incluindo os de painéis marcados)
        const selectedModules = modules.filter(module => {
          const isModuleSelected = formData.modules_included.some(id => {
            const numericId = typeof id === 'string' ? parseInt(id) : id;
            return numericId === module.id;
          });
          return isModuleSelected && module.is_active;
        });
        
        selectedModules.forEach(module => {
          // Apenas o nome do módulo, sem nome do painel em parênteses
          features.add(`${module.title || module.name}`);
          console.log('➕ [FEATURES] Adicionado módulo:', module.title || module.name);
        });
        
        const featuresArray = Array.from(features);
        
        console.log('🔄 [PLAN FORM] Recursos gerados - Painéis:', selectedPanels.length, 'Módulos:', selectedModules.length);
        console.log('📊 [PLAN FORM] Recursos finais:', featuresArray);
        
        setFormData(prev => ({
          ...prev,
          features: featuresArray
        }));
      };
      
      generateFeatures();
    }
  }, [formData.modules_included, formData.panels_included, modules, panels, isPlanDataLoaded]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name
    if (field === 'name' && !plan) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handlePanelToggle = (panelId: number, checked: boolean) => {
    console.log('🔄 [PANEL TOGGLE] Painel ID:', panelId, 'marcado:', checked);
    
    const currentPanels = formData.panels_included || [];
    const panelModules = modules.filter(m => m.panel_id === panelId && m.is_active);
    
    if (checked) {
      // Marcar painel e TODOS os seus módulos automaticamente
      console.log('✅ [PANEL TOGGLE] Marcando painel e seus módulos:', panelModules.length, 'módulos');
      
      const allPanelModuleIds = panelModules.map(m => m.id);
      
      setFormData(prev => ({
        ...prev,
        panels_included: [...currentPanels, panelId],
        modules_included: [...new Set([...prev.modules_included, ...allPanelModuleIds])] // Evitar duplicatas
      }));
      
      // Abrir automaticamente o painel quando selecionado
      if (!openPanels.includes(panelId)) {
        setOpenPanels(prev => [...prev, panelId]);
      }
    } else {
      // Ao desmarcar painel, remover também TODOS os seus módulos
      console.log('❌ [PANEL TOGGLE] Desmarcando painel e removendo seus módulos');
      
      const panelModuleIds = panelModules.map(m => m.id);
      
      setFormData(prev => ({
        ...prev,
        panels_included: currentPanels.filter(id => id !== panelId),
        modules_included: prev.modules_included.filter(id => {
          const numericId = typeof id === 'string' ? parseInt(id) : id;
          return !panelModuleIds.includes(numericId);
        })
      }));
      
      // Fechar o painel quando desmarcado
      setOpenPanels(prev => prev.filter(id => id !== panelId));
    }
  };

  const handleModuleToggle = (moduleId: number, checked: boolean) => {
    console.log('🔄 [MODULE TOGGLE] Módulo ID:', moduleId, 'marcado:', checked);
    
    const currentModules = formData.modules_included || [];
    const module = modules.find(m => m.id === moduleId);
    
    if (!module) {
      console.error('❌ [MODULE TOGGLE] Módulo não encontrado:', moduleId);
      return;
    }
    
    if (checked) {
      // Adicionar módulo e verificar se deve marcar o painel
      console.log('✅ [MODULE TOGGLE] Adicionando módulo:', module.name);
      
      setFormData(prev => ({
        ...prev,
        modules_included: [...new Set([...currentModules, moduleId])] // Evitar duplicatas
      }));
      
      // Se o módulo pertence a um painel, verificar se deve marcar o painel automaticamente
      if (module.panel_id && !formData.panels_included.includes(module.panel_id)) {
        console.log('📋 [MODULE TOGGLE] Marcando painel automaticamente:', module.panel_id);
        
        setFormData(prev => ({
          ...prev,
          panels_included: [...prev.panels_included, module.panel_id]
        }));
        
        // Abrir o painel automaticamente
        if (!openPanels.includes(module.panel_id)) {
          setOpenPanels(prev => [...prev, module.panel_id]);
        }
      }
    } else {
      // Remover módulo e verificar se deve desmarcar o painel
      console.log('❌ [MODULE TOGGLE] Removendo módulo:', module.name);
      
      setFormData(prev => ({
        ...prev,
        modules_included: prev.modules_included.filter(id => {
          const numericId = typeof id === 'string' ? parseInt(id) : id;
          return numericId !== moduleId;
        })
      }));
      
      // Verificar se ainda há módulos deste painel selecionados após remover este
      if (module.panel_id) {
        const remainingPanelModules = modules
          .filter(m => m.panel_id === module.panel_id && m.id !== moduleId && m.is_active)
          .filter(m => {
            // Verificar com os módulos que permanecerão após a remoção
            const updatedModulesIncluded = currentModules.filter(id => {
              const numericId = typeof id === 'string' ? parseInt(id) : id;
              return numericId !== moduleId;
            });
            
            return updatedModulesIncluded.some(id => {
              const numericId = typeof id === 'string' ? parseInt(id) : id;
              return numericId === m.id;
            });
          });
        
        console.log('🔍 [MODULE TOGGLE] Módulos restantes no painel:', remainingPanelModules.length);
        
        // Se não há mais módulos deste painel, desmarcar o painel automaticamente
        if (remainingPanelModules.length === 0) {
          console.log('📋 [MODULE TOGGLE] Desmarcando painel automaticamente:', module.panel_id);
          
          setFormData(prev => ({
            ...prev,
            panels_included: prev.panels_included.filter(id => id !== module.panel_id)
          }));
        }
      }
    }
  };

  const togglePanelOpen = (panelId: number) => {
    setOpenPanels(prev => 
      prev.includes(panelId) 
        ? prev.filter(id => id !== panelId)
        : [...prev, panelId]
    );
  };

  const toggleAllPanelModules = (panelId: number) => {
    const panelModules = modules.filter(m => m.panel_id === panelId && m.is_active).map(m => m.id);
    const allSelected = panelModules.every(moduleId => 
      formData.modules_included.some(id => {
        const numericId = typeof id === 'string' ? parseInt(id) : id;
        return numericId === moduleId;
      })
    );
    
    if (allSelected) {
      // Desmarcar todos
      setFormData(prev => ({
        ...prev,
        modules_included: prev.modules_included.filter(id => {
          const numericId = typeof id === 'string' ? parseInt(id) : id;
          return !panelModules.includes(numericId);
        })
      }));
    } else {
      // Selecionar todos
      setFormData(prev => ({
        ...prev,
        modules_included: [...new Set([...prev.modules_included, ...panelModules])]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log('📤 [PLAN FORM] Iniciando submit do plano:', formData);
    
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price.toString()),
        original_price: formData.original_price ? parseFloat(formData.original_price.toString()) : null,
        duration_days: parseInt(formData.duration_days.toString()),
        max_consultations: parseInt(formData.max_consultations.toString()),
        max_api_calls: parseInt(formData.max_api_calls.toString()),
        sort_order: parseInt(formData.sort_order.toString()),
        discount_percentage: parseInt(formData.discount_percentage.toString()) || 0
      };
      
      console.log('📤 [PLAN FORM] Dados processados para envio:', submitData);
      
      await onSubmit(submitData);
      
      console.log('✅ [PLAN FORM] Submit concluído com sucesso');
    } catch (error) {
      console.error('❌ [PLAN FORM] Erro ao salvar plano:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'Empresarial', label: 'Empresarial' },
    { value: 'Rainha', label: 'Rainha' },
    { value: 'Rei', label: 'Rei' },
    { value: 'Joker', label: 'Joker' }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h3 className="text-lg font-semibold">
            {plan ? 'Editar Plano' : 'Novo Plano'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure as informações do plano e selecione painéis e módulos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Informações do Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Plano *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Plano Premium"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="plano-premium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descrição do plano..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="original_price">Preço Original (R$)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.original_price}
                      onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration_days">Duração (dias)</Label>
                    <Input
                      id="duration_days"
                      type="number"
                      min="1"
                      value={formData.duration_days}
                      onChange={(e) => handleInputChange('duration_days', parseInt(e.target.value) || 30)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_consultations">Máx. Consultas (-1 = ilimitado)</Label>
                    <Input
                      id="max_consultations"
                      type="number"
                      value={formData.max_consultations}
                      onChange={(e) => handleInputChange('max_consultations', parseInt(e.target.value) || -1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_percentage">Desconto (%)</Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => handleInputChange('discount_percentage', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Recursos (controlados pela seleção de módulos)</Label>
                  <Textarea
                    id="features"
                    value={formData.features.join('\n')}
                    placeholder="Os recursos são atualizados automaticamente conforme você seleciona módulos na seção 'Painéis Inclusos'"
                    rows={6}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">
                    ℹ️ Para alterar os recursos, marque/desmarque módulos na seção "Painéis Inclusos" ao lado.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="badge">Badge</Label>
                    <Input
                      id="badge"
                      value={formData.badge}
                      onChange={(e) => handleInputChange('badge', e.target.value)}
                      placeholder="Mais Popular"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Ordem de Exibição</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                    <Label htmlFor="is_active">Plano Ativo</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_popular"
                      checked={formData.is_popular}
                      onCheckedChange={(checked) => handleInputChange('is_popular', checked)}
                    />
                    <Label htmlFor="is_popular">Ativar Badge</Label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Salvando...' : 'Salvar Plano'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Seleção de Painéis e Módulos - Nova Interface Melhorada */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4" />
                Painéis Inclusos
                <span className="ml-auto text-sm font-normal text-gray-500">
                  {formData.panels_included.length} selecionados
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {panelsLoading ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  Carregando painéis...
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {panels.map((panel) => {
                      const isPanelSelected = formData.panels_included.includes(panel.id);
                      const panelModules = modules.filter(m => m.panel_id === panel.id && m.is_active);
                      const isPanelOpen = openPanels.includes(panel.id);
                      const selectedModulesCount = panelModules.filter(m => 
                        formData.modules_included.some(id => {
                          const numericId = typeof id === 'string' ? parseInt(id) : id;
                          return numericId === m.id;
                        })
                      ).length;
                      
                      return (
                        <div key={panel.id} className="border rounded-lg">
                          {/* Header do Painel */}
                          <div className="p-4">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                id={`panel-${panel.id}`}
                                checked={isPanelSelected}
                                onCheckedChange={(checked) => handlePanelToggle(panel.id, checked as boolean)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <Label
                                    htmlFor={`panel-${panel.id}`}
                                    className="text-sm font-medium leading-none cursor-pointer"
                                  >
                                    📋 {panel.name}
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    {isPanelSelected && panelModules.length > 0 && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                        {selectedModulesCount}/{panelModules.length} módulos
                                      </span>
                                    )}
                                     {panelModules.length > 0 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => togglePanelOpen(panel.id)}
                                        className="h-6 w-6 p-0"
                                        title={isPanelOpen ? "Recolher módulos" : "Expandir módulos"}
                                      >
                                        {isPanelOpen ? (
                                          <span className="text-lg font-bold">−</span>
                                        ) : (
                                          <span className="text-lg font-bold">+</span>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {panel.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Módulos do Painel (Collapsible) */}
                          {panelModules.length > 0 && (
                            <Collapsible open={isPanelOpen}>
                              <CollapsibleContent>
                                <div className="border-t bg-gray-50 dark:bg-gray-900/50 p-4">
                                  {panelModules.length === 0 ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <AlertCircle className="h-4 w-4" />
                                      Ainda não há módulos cadastrados para este painel
                                    </div>
                                  ) : (
                                     <div className="space-y-3">
                                       <div className="flex items-center justify-between">
                                         <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                           Módulos disponíveis:
                                         </p>
                                          <div className="flex gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => toggleAllPanelModules(panel.id)}
                                              className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                                            >
                                               {panelModules.every(m => formData.modules_included.some(id => {
                                                 const numericId = typeof id === 'string' ? parseInt(id) : id;
                                                 return numericId === m.id;
                                               })) 
                                                 ? 'Desmarcar todos' 
                                                 : 'Selecionar todos'}
                                            </Button>
                                          </div>
                                       </div>
                                       <div className="space-y-2">
                                        {panelModules.map((module) => (
                                          <div key={module.id} className="flex items-start space-x-2">
                                            <Checkbox
                                              id={`module-${module.id}`}
                                               checked={formData.modules_included.some(id => {
                                                 const numericId = typeof id === 'string' ? parseInt(id) : id;
                                                 return numericId === module.id;
                                               })}
                                              onCheckedChange={(checked) => handleModuleToggle(module.id, checked as boolean)}
                                              className="mt-0.5"
                                            />
                                            <div className="flex-1 min-w-0">
                                              <Label
                                                htmlFor={`module-${module.id}`}
                                                className="text-xs font-medium cursor-pointer block"
                                              >
                                                {module.title || module.name}
                                              </Label>
                                              {module.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                  {module.description}
                                                </p>
                                              )}
                                              {module.price && module.price > 0 && (
                                                <p className="text-xs text-green-600 font-medium">
                                                  R$ {module.price.toFixed(2)}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiPlanForm;
