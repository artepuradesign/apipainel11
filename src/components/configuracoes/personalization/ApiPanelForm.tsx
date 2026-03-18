import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from 'lucide-react';
import { Panel } from '@/utils/apiService';
import IconSelector from './IconSelector';
import SortOrderSelector from './SortOrderSelector';
import TemplatePreview from '@/components/configuracoes/personalization/TemplatePreview';

interface ApiPanelFormProps {
  panel?: Panel | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ApiPanelForm: React.FC<ApiPanelFormProps> = ({ panel, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Package',
    color: '#6366f1',
    background_color: '#f8fafc',
    category: 'general',
    template: 'modern' as 'modern' | 'corporate' | 'creative' | 'minimal' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'matrix',
    is_active: true,
    is_premium: false,
    sort_order: 0
  });

  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (panel) {
      setFormData({
        name: panel.name || '',
        slug: panel.slug || '',
        description: panel.description || '',
        icon: panel.icon || 'Package',
        color: panel.color || '#6366f1',
        background_color: panel.background_color || '#f8fafc',
        category: panel.category || 'general',
        template: (panel.template as any) || 'modern',
        is_active: panel.is_active ?? true,
        is_premium: panel.is_premium ?? false,
        sort_order: panel.sort_order || 0
      });
    }
  }, [panel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    handleInputChange('name', value);
    if (!panel) { // Only auto-generate slug for new panels
      handleInputChange('slug', generateSlug(value));
    }
  };

  const templates: Array<'modern' | 'corporate' | 'creative' | 'minimal' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'matrix'> = 
    ['modern', 'corporate', 'creative', 'minimal', 'elegant', 'forest', 'rose', 'cosmic', 'neon', 'matrix'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {panel ? 'Editar Painel' : 'Novo Painel'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {panel ? 'Modifique as configurações do painel' : 'Crie um novo painel personalizado'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Painel *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Painel de Consultas"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug/URL *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="ex: painel-consultas"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /dashboard/painel/{formData.slug}
                </p>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descrição do painel..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                    <SelectItem value="relatorios">Relatórios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Configurações Visuais */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Configurações Visuais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <IconSelector
                value={formData.icon}
                onChange={(value) => handleInputChange('icon', value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">Cor Principal</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="background_color">Cor de Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background_color"
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => handleInputChange('background_color', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.background_color}
                      onChange={(e) => handleInputChange('background_color', e.target.value)}
                      placeholder="#f8fafc"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <SortOrderSelector
                value={formData.sort_order}
                onChange={(value) => handleInputChange('sort_order', value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Templates */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Template de Exibição</CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={selectedTheme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTheme('light')}
              >
                Tema Claro
              </Button>
              <Button
                type="button"
                variant={selectedTheme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTheme('dark')}
              >
                Tema Escuro
              </Button>
            </div>
          </CardHeader>
           <CardContent>
             <div
               className="grid gap-[15px] justify-items-start"
               style={{
                 // Fiel ao tamanho real exibido no Dashboard
                 gridTemplateColumns: 'repeat(auto-fit, 150px)',
                 justifyContent: 'start'
               }}
             >
              {templates.map((template) => (
                <TemplatePreview
                  key={`${template}-${selectedTheme}`}
                  template={template}
                  theme={selectedTheme}
                  isSelected={formData.template === template}
                  onClick={() => handleInputChange('template', template)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configurações Avançadas */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Configurações Avançadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Painel Ativo</Label>
                <p className="text-sm text-gray-500">Permite o acesso ao painel</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Painel Premium</Label>
                <p className="text-sm text-gray-500">Requer plano premium para acesso</p>
              </div>
              <Switch
                checked={formData.is_premium}
                onCheckedChange={(checked) => handleInputChange('is_premium', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            {panel ? 'Atualizar Painel' : 'Criar Painel'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ApiPanelForm;
