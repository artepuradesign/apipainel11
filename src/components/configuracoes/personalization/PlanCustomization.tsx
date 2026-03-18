import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Edit, Trash2, Save, CreditCard, Palette, Star, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { saveCustomPlans, loadCustomPlans, loadCustomModules, loadSystemPanels, type CustomPlan, type CustomModule, type SystemPanel } from '@/utils/personalizationStorage';
import { formatPriceInput } from '@/utils/priceFormatter';
import { cardThemes } from './CardThemes';
import ColorPicker from './ColorPicker';
import PlanPreview from './PlanPreview';
import ApiReferencePlans from './ApiReferencePlans';
import QuickSetup from './QuickSetup';

const PlanCustomization = () => {
  const [plans, setPlans] = useState<CustomPlan[]>([]);
  const [modules, setModules] = useState<CustomModule[]>([]);
  const [panels, setPanels] = useState<SystemPanel[]>([]);
  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState<{ planId: number; colorType: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const savedPlans = loadCustomPlans();
    const savedModules = loadCustomModules();
    const savedPanels = loadSystemPanels();
    setPlans(savedPlans);
    setModules(savedModules);
    setPanels(savedPanels);
    setIsLoading(false);
  }, []);

  const handleSaveChanges = () => {
    saveCustomPlans(plans);
    setHasUnsavedChanges(false);
    toast.success('Configurações dos planos salvas!', {
      description: 'Todas as alterações foram aplicadas com sucesso'
    });
  };

  const handleUpdateAllPlansToBlackTheme = () => {
    if (plans.length === 0) {
      toast.error('Nenhum plano encontrado para atualizar!');
      return;
    }

    const blackTheme = cardThemes.find(theme => theme.id === 'preto');
    if (!blackTheme) {
      toast.error('Tema preto não encontrado!');
      return;
    }

    const updatedPlans = plans.map(plan => ({
      ...plan,
      theme: 'preto',
      colors: { 
        ...blackTheme.colors,
        marker: plan.colors.marker || '#22c55e'
      }
    }));

    setPlans(updatedPlans);
    setHasUnsavedChanges(true);
    
    toast.success(`${plans.length} planos atualizados para o tema Preto!`, {
      description: 'Clique em "Salvar Configurações" para confirmar as alterações'
    });
  };

  const handleCreatePlan = () => {
    const newPlan: CustomPlan = {
      id: Date.now(),
      name: 'Novo Plano',
      price: '0,00',
      description: 'Descrição do novo plano',
      billing_period: 'mensal',
      discount: 0,
      hasHighlight: false,
      highlightText: 'POPULAR',
      status: 'ativo',
      operationalStatus: 'on',
      colors: {
        background: '#ffffff',
        border: '#e5e7eb',
        text: '#111827',
        suit: '#8b5cf6',
        highlight: '#22c55e',
        marker: '#22c55e'
      },
      cardSuit: '♠',
      selectedModules: [],
      theme: 'tone1',
      cardTheme: 'light'
    };
    
    const updatedPlans = [...plans, newPlan];
    setPlans(updatedPlans);
    setEditingPlan(newPlan.id);
    setShowForm(true);
    setHasUnsavedChanges(true);
    toast.success('Novo plano criado! Configure os detalhes no formulário.');
  };

  const handleDeletePlan = (planId: number) => {
    const updatedPlans = plans.filter(plan => plan.id !== planId);
    setPlans(updatedPlans);
    setHasUnsavedChanges(true);
    setShowForm(false);
    setEditingPlan(null);
    toast.success('Plano removido! Clique em "Salvar" para confirmar.');
  };

  const updatePlanField = (planId: number, field: string, value: any) => {
    const updatedPlans = plans.map(plan => 
      plan.id === planId 
        ? { ...plan, [field]: value }
        : plan
    );
    setPlans(updatedPlans);
    setHasUnsavedChanges(true);
  };

  const handlePriceChange = (planId: number, value: string) => {
    const formattedPrice = formatPriceInput(value);
    updatePlanField(planId, 'price', formattedPrice);
  };

  const updatePlanColor = (planId: number, colorType: string, color: string) => {
    const updatedPlans = plans.map(plan => 
      plan.id === planId 
        ? { ...plan, colors: { ...plan.colors, [colorType]: color } }
        : plan
    );
    setPlans(updatedPlans);
    setHasUnsavedChanges(true);
  };

  const handleColorPickerOpen = (planId: number, colorType: string) => {
    setColorPickerTarget({ planId, colorType });
    setShowColorPicker(true);
  };

  const handleColorChange = (color: string) => {
    if (colorPickerTarget) {
      updatePlanColor(colorPickerTarget.planId, colorPickerTarget.colorType, color);
      setShowColorPicker(false);
      setColorPickerTarget(null);
    }
  };

  const handleThemeChange = (planId: number, themeId: string) => {
    const selectedTheme = cardThemes.find(theme => theme.id === themeId);
    if (selectedTheme) {
      const updatedPlans = plans.map(plan => 
        plan.id === planId 
          ? { 
              ...plan, 
              theme: themeId,
              colors: { ...selectedTheme.colors, marker: plan.colors.marker || '#22c55e' }
            }
          : plan
      );
      setPlans(updatedPlans);
      setHasUnsavedChanges(true);
    }
  };

  const toggleModuleSelection = (planId: number, moduleName: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const currentModules = plan.selectedModules || [];
    const updatedModules = currentModules.includes(moduleName)
      ? currentModules.filter(name => name !== moduleName)
      : [...currentModules, moduleName];

    updatePlanField(planId, 'selectedModules', updatedModules);
  };

  const togglePanelModules = (planId: number, panelId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const panelModules = modules.filter(m => m.panelId === panelId).map(m => m.title);
    const currentModules = plan.selectedModules || [];
    
    const allPanelModulesSelected = panelModules.every(moduleName => 
      currentModules.includes(moduleName)
    );

    let updatedModules;
    if (allPanelModulesSelected) {
      updatedModules = currentModules.filter(moduleName => !panelModules.includes(moduleName));
    } else {
      updatedModules = [...new Set([...currentModules, ...panelModules])];
    }

    updatePlanField(planId, 'selectedModules', updatedModules);
  };

  const getStatusBadge = (status: string) => {
    return status === 'ativo' 
      ? <Badge className="bg-green-500 text-white">ATIVO</Badge>
      : <Badge variant="secondary">INATIVO</Badge>;
  };

  const handleEditPlan = (planId: number) => {
    setEditingPlan(planId);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const cardSuits = ['♠', '♥', '♦', '♣'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Setup Section */}
      {plans.length === 0 && (
        <QuickSetup />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuração de Planos</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure planos personalizados para exibição na página inicial e de preços
          </p>
          {hasUnsavedChanges && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              ⚠️ Você tem alterações não salvas
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {plans.length > 0 && (
            <Button 
              onClick={handleUpdateAllPlansToBlackTheme}
              className="bg-gray-800 hover:bg-gray-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Aplicar Tema Preto a Todos
            </Button>
          )}
          <Button 
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
          <Button onClick={handleCreatePlan} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Lista de Planos */}
        <div className={`transition-all duration-300 ${showForm ? 'w-1/2' : 'w-full'}`}>
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <CreditCard className="h-5 w-5" />
                  Planos Personalizados ({plans.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {plans.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plano</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-lg">
                                {plan.cardSuit}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{plan.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">R$ {plan.price}</div>
                                {plan.hasHighlight && (
                                  <Badge className="bg-yellow-500 text-white text-xs mt-1">
                                    <Star className="h-3 w-3 mr-1" />
                                    {plan.highlightText}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(plan.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPlan(plan.id)}
                                className="text-orange-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePlan(plan.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum plano configurado</p>
                    <p className="text-sm">Use o Setup Rápido acima ou clique em "Novo Plano"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview do Plano */}
            {editingPlan && showForm && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-base text-gray-900 dark:text-white">Preview do Plano</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    {plans
                      .filter(plan => plan.id === editingPlan)
                      .map(plan => (
                        <PlanPreview key={plan.id} plan={plan} />
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Formulário de Edição - Slide da direita */}
        {showForm && editingPlan && (
          <div className="w-1/2 animate-slide-in-right">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 dark:text-white">
                    Editar Plano: {plans.find(p => p.id === editingPlan)?.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 max-h-[800px] overflow-y-auto">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-900 dark:text-white">Nome do Plano</Label>
                      <Input
                        value={plans.find(p => p.id === editingPlan)?.name || ''}
                        onChange={(e) => updatePlanField(editingPlan, 'name', e.target.value)}
                        className="bg-white dark:bg-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-900 dark:text-white">Preço</Label>
                      <Input
                        value={plans.find(p => p.id === editingPlan)?.price || ''}
                        onChange={(e) => handlePriceChange(editingPlan, e.target.value)}
                        className="bg-white dark:bg-gray-600"
                        placeholder="0,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-900 dark:text-white">Período de Cobrança</Label>
                      <Select 
                        value={plans.find(p => p.id === editingPlan)?.billing_period || 'mensal'} 
                        onValueChange={(value) => updatePlanField(editingPlan, 'billing_period', value)}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                          <SelectItem value="trimestral">Trimestral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-900 dark:text-white">Desconto (%)</Label>
                      <Input
                        type="number"
                        value={plans.find(p => p.id === editingPlan)?.discount || 0}
                        onChange={(e) => updatePlanField(editingPlan, 'discount', parseInt(e.target.value) || 0)}
                        className="bg-white dark:bg-gray-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-900 dark:text-white">Status</Label>
                      <Select 
                        value={plans.find(p => p.id === editingPlan)?.status || 'ativo'} 
                        onValueChange={(value: 'ativo' | 'inativo') => 
                          updatePlanField(editingPlan, 'status', value)
                        }
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">ATIVO</SelectItem>
                          <SelectItem value="inativo">INATIVO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="highlight"
                          checked={plans.find(p => p.id === editingPlan)?.hasHighlight || false}
                          onCheckedChange={(checked) => updatePlanField(editingPlan, 'hasHighlight', checked)}
                        />
                        <Label htmlFor="highlight" className="text-gray-900 dark:text-white">
                          Plano em Destaque
                        </Label>
                      </div>
                      {plans.find(p => p.id === editingPlan)?.hasHighlight && (
                        <Input
                          placeholder="Texto do destaque"
                          value={plans.find(p => p.id === editingPlan)?.highlightText || ''}
                          onChange={(e) => updatePlanField(editingPlan, 'highlightText', e.target.value)}
                          className="bg-white dark:bg-gray-600"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-white">Descrição</Label>
                  <Textarea
                    value={plans.find(p => p.id === editingPlan)?.description || ''}
                    onChange={(e) => updatePlanField(editingPlan, 'description', e.target.value)}
                    rows={3}
                    className="bg-white dark:bg-gray-600"
                  />
                </div>

                {/* Personalização do Card */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Personalização do Card
                  </h5>
                  
                  {/* Tema do Card */}
                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Tema do Card</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {cardThemes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => handleThemeChange(editingPlan, theme.id)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            plans.find(p => p.id === editingPlan)?.theme === theme.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {theme.name}
                          </div>
                          <div 
                            className="w-full h-8 rounded"
                            style={{ 
                              background: theme.colors.background.includes('gradient') 
                                ? theme.colors.background 
                                : theme.colors.background 
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Naipe do Card</Label>
                    <Select 
                      value={plans.find(p => p.id === editingPlan)?.cardSuit || '♠'} 
                      onValueChange={(value) => updatePlanField(editingPlan, 'cardSuit', value)}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cardSuits.map((suit) => (
                          <SelectItem key={suit} value={suit}>{suit} {suit === '♠' ? 'Espadas' : suit === '♥' ? 'Copas' : suit === '♦' ? 'Ouros' : 'Paus'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cores Personalizadas */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'background', label: 'Fundo' },
                      { key: 'border', label: 'Borda' },
                      { key: 'text', label: 'Texto' },
                      { key: 'suit', label: 'Naipe' },
                      { key: 'highlight', label: 'Destaque' },
                      { key: 'marker', label: 'Marcador' }
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                        <Label className="text-gray-900 dark:text-white">{label}</Label>
                        <div className="flex gap-2">
                          <div
                            className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
                            style={{ backgroundColor: plans.find(p => p.id === editingPlan)?.colors[key as keyof typeof plans[0]['colors']] }}
                            onClick={() => handleColorPickerOpen(editingPlan, key)}
                          />
                          <Input
                            value={plans.find(p => p.id === editingPlan)?.colors[key as keyof typeof plans[0]['colors']] || '#ffffff'}
                            onChange={(e) => updatePlanColor(editingPlan, key, e.target.value)}
                            className="bg-white dark:bg-gray-600 flex-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Módulos Incluídos */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 dark:text-white">Módulos Incluídos no Plano</h5>
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {panels.map((panel) => {
                      const panelModules = modules.filter(m => m.panelId === panel.id);
                      const currentModules = plans.find(p => p.id === editingPlan)?.selectedModules || [];
                      const allPanelModulesSelected = panelModules.every(m => currentModules.includes(m.title));
                      
                      return (
                        <div key={panel.id} className="space-y-2">
                          <div className="flex items-center space-x-2 py-2 border-b border-gray-200 dark:border-gray-600">
                            <Checkbox
                              checked={allPanelModulesSelected && panelModules.length > 0}
                              onCheckedChange={() => togglePanelModules(editingPlan, panel.id)}
                            />
                            <Label className="font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => togglePanelModules(editingPlan, panel.id)}>
                              {panel.name} ({panelModules.length} módulos)
                            </Label>
                          </div>
                          <div className="ml-6 space-y-2">
                            {panelModules.map((module) => (
                              <div key={module.id} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={currentModules.includes(module.title)}
                                  onCheckedChange={() => toggleModuleSelection(editingPlan, module.title)}
                                />
                                <Label className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer" onClick={() => toggleModuleSelection(editingPlan, module.title)}>
                                  {module.title} - R$ {module.price}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Button
                    onClick={handleCloseForm}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Concluir Edição
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCloseForm}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum plano configurado</p>
          <p className="text-sm">Clique em "Novo Plano" para começar</p>
        </div>
      )}

      <ColorPicker
        isOpen={showColorPicker}
        onClose={() => {
          setShowColorPicker(false);
          setColorPickerTarget(null);
        }}
        currentColor={colorPickerTarget ? plans.find(p => p.id === colorPickerTarget.planId)?.colors[colorPickerTarget.colorType as keyof typeof plans[0]['colors']] || '#ffffff' : '#ffffff'}
        onColorChange={handleColorChange}
        title="Escolher Cor"
      />

      {/* Referência da API */}
      <ApiReferencePlans />
    </div>
  );
};

export default PlanCustomization;
