
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Module, Panel } from '@/utils/apiService';
import { toast } from 'sonner';
import IconSelector from './IconSelector';
import ColorSelector from './ColorSelector';

interface ApiModuleEditFormProps {
  module: Module;
  panels: Panel[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const ApiModuleEditForm = ({ module, panels, onSubmit, onCancel }: ApiModuleEditFormProps) => {
  const [formData, setFormData] = useState({
    panel_id: '',
    title: '',
    slug: '',
    description: '',
    icon: 'Package',
    color: '#6366f1',
    price: '0.00',
    cost_price: '0.00',
    path: '',
    category: 'general',
    operational_status: 'on' as 'on' | 'off' | 'maintenance',
    is_active: true,
    is_premium: false,
    api_endpoint: '',
    api_method: 'POST' as 'GET' | 'POST' | 'PUT' | 'DELETE',
    sort_order: 0,
    settings: '{}'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (module) {
      console.log('🔄 [API_MODULE_EDIT_FORM] Carregando módulo para edição:', module);
      
      setFormData({
        panel_id: module.panel_id?.toString() || '',
        title: module.title || '',
        slug: module.slug || '',
        description: module.description || '',
        icon: module.icon || 'Package',
        color: module.color || '#6366f1',
        price: module.price?.toString() || '0.00',
        cost_price: module.cost_price?.toString() || '0.00',
        path: module.path || '',
        category: module.category || 'general',
        operational_status: module.operational_status || 'on',
        is_active: Boolean(module.is_active),
        is_premium: Boolean(module.is_premium),
        // Neste sistema, o campo API Endpoint é usado como o link/rota interna da página do módulo
        // (ex.: /dashboard/consultar-cpf-simples). Se vier vazio, aproveita o `path` legado.
        api_endpoint: module.api_endpoint || module.path || '',
        api_method: (module.api_method as 'GET' | 'POST' | 'PUT' | 'DELETE') || 'POST',
        sort_order: module.sort_order || 0,
        settings: typeof module.settings === 'object' ? JSON.stringify(module.settings) : (module.settings || '{}')
      });
    }
  }, [module]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    console.log('🔄 [API_MODULE_EDIT_FORM] ===== INICIANDO ATUALIZAÇÃO =====');
    console.log('📋 [API_MODULE_EDIT_FORM] Módulo original:', module);
    console.log('📝 [API_MODULE_EDIT_FORM] Dados do formulário:', formData);
    
    // Validações
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    
    if (!formData.panel_id) {
      toast.error('Painel é obrigatório');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Slug é obrigatório');
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados EXATAMENTE como a API espera
      const updateData = {
        panel_id: parseInt(formData.panel_id, 10),
        name: formData.title.trim(), // Campo name para compatibilidade
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || '',
        icon: formData.icon || 'Package',
        color: formData.color || '#6366f1',
        price: parseFloat(formData.price) || 0.00,
        cost_price: parseFloat(formData.cost_price) || 0.00,
        path: formData.path.trim() || '',
        category: formData.category || 'general',
        operational_status: formData.operational_status || 'on',
        is_active: formData.is_active ? 1 : 0, // Converter para number
        is_premium: formData.is_premium ? 1 : 0, // Converter para number
        api_endpoint: formData.api_endpoint.trim() || '',
        api_method: formData.api_method || 'POST',
        sort_order: Number(formData.sort_order) || 0,
        settings: formData.settings || '{}'
      };

      console.log('📤 [API_MODULE_EDIT_FORM] Dados estruturados para API:', updateData);
      console.log('🆔 [API_MODULE_EDIT_FORM] ID do módulo a ser atualizado:', module.id);
      
      await onSubmit(updateData);
      
      console.log('✅ [API_MODULE_EDIT_FORM] Atualização concluída com sucesso');
      
    } catch (error) {
      console.error('❌ [API_MODULE_EDIT_FORM] Erro durante atualização:', error);
      toast.error('Erro ao atualizar módulo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    console.log(`🔄 [API_MODULE_EDIT_FORM] Campo alterado: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Editar Módulo</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Editando: {module.title} (ID: {module.id})
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="w-full">
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Painel e Título */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="panel_id">Painel *</Label>
                <Select 
                  value={formData.panel_id} 
                  onValueChange={(value) => handleChange('panel_id', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um painel" />
                  </SelectTrigger>
                  <SelectContent>
                    {panels.map((panel) => (
                      <SelectItem key={panel.id} value={panel.id.toString()}>
                        {panel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Título do módulo"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Slug e Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="URL amigável"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleChange('category', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="consultas">Consultas</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="relatorios">Relatórios</SelectItem>
                    <SelectItem value="veiculos">Veículos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descrição do módulo"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Ícone e Cor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <IconSelector
                  value={formData.icon}
                  onChange={(value) => handleChange('icon', value)}
                  label="Ícone"
                />
              </div>

              <ColorSelector
                value={formData.color}
                onChange={(value) => handleChange('color', value)}
                label="Cor"
                disabled={isSubmitting}
              />
            </div>

            {/* Preços */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço de Venda</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="cost_price">Preço de Custo</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_price}
                  onChange={(e) => handleChange('cost_price', e.target.value)}
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* API Endpoint e Método */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <Label htmlFor="api_endpoint">Link da página do módulo</Label>
                <Input
                  id="api_endpoint"
                  value={formData.api_endpoint}
                  onChange={(e) => handleChange('api_endpoint', e.target.value)}
                   placeholder="/dashboard/consultar-cpf-simples"
                  disabled={isSubmitting}
                />
                 <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                   Use uma rota interna do sistema (começando com <span className="font-mono">/dashboard/</span>).
                 </p>
              </div>

              <div>
                <Label htmlFor="api_method">Método HTTP</Label>
                <Select 
                  value={formData.api_method} 
                  onValueChange={(value) => handleChange('api_method', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status e Configurações */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="operational_status">Status Operacional</Label>
                <Select 
                  value={formData.operational_status} 
                  onValueChange={(value) => handleChange('operational_status', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on">Ativo</SelectItem>
                    <SelectItem value="off">Inativo</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="is_active">Status Geral</Label>
                <Select 
                  value={formData.is_active ? "true" : "false"} 
                  onValueChange={(value) => handleChange('is_active', value === "true")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="is_premium">Tipo</Label>
                <Select 
                  value={formData.is_premium ? "true" : "false"} 
                  onValueChange={(value) => handleChange('is_premium', value === "true")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Básico</SelectItem>
                    <SelectItem value="true">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort_order">Ordem</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button 
                type="submit" 
                className="flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <AlertCircle className="h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Atualizar Módulo
                  </>
                )}
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
  );
};

export default ApiModuleEditForm;
