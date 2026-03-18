
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, X } from 'lucide-react';

interface Module {
  id: number;
  title: string;
  panel_id: number;
  is_active: boolean;
}

interface Plan {
  id: number;
  name: string;
  description: string;
  price: string;
  original_price: string;
  duration_days: string;
  max_consultations: string;
  max_api_calls: string;
  features: string[];
  modules_included: number[];
  badge: string;
  is_popular: boolean;
  status: 'ativo' | 'inativo';
  category: string;
  sort_order: string;
}

interface PlanFormProps {
  plan: Plan | null;
  onClose: () => void;
  onSubmit: (plan: any) => void;
  availableModules: Module[];
}

const PlanForm = ({ plan, onClose, onSubmit, availableModules }: PlanFormProps) => {
  const [formData, setFormData] = useState<Partial<Plan>>({
    name: '',
    description: '',
    price: '',
    original_price: '',
    duration_days: '30',
    max_consultations: '-1',
    max_api_calls: '-1',
    features: [],
    modules_included: [],
    badge: '',
    is_popular: false,
    status: 'ativo',
    category: 'Basic',
    sort_order: '0'
  });

  useEffect(() => {
    if (plan) {
      setFormData(plan);
    }
  }, [plan]);

  // Atualizar recursos automaticamente quando os módulos disponíveis mudarem ou quando o plano for carregado
  useEffect(() => {
    if (formData.modules_included && formData.modules_included.length > 0 && availableModules.length > 0) {
      const selectedModuleNames = availableModules
        .filter(module => formData.modules_included?.includes(module.id))
        .map(module => module.title);
      
      if (selectedModuleNames.length > 0) {
        setFormData(prev => ({
          ...prev,
          features: selectedModuleNames
        }));
      }
    }
  }, [availableModules, formData.modules_included]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleModuleToggle = (moduleId: number, checked: boolean) => {
    const currentModules = formData.modules_included || [];
    let updatedModules;
    
    if (checked) {
      updatedModules = [...currentModules, moduleId];
    } else {
      updatedModules = currentModules.filter(id => id !== moduleId);
    }
    
    // Atualizar os módulos inclusos
    setFormData(prev => ({
      ...prev,
      modules_included: updatedModules
    }));
    
    // Atualizar automaticamente o campo features com os nomes dos módulos selecionados
    const selectedModuleNames = availableModules
      .filter(module => updatedModules.includes(module.id))
      .map(module => module.title);
    
    setFormData(prev => ({
      ...prev,
      features: selectedModuleNames
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {plan ? 'Editar Plano' : 'Novo Plano'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure as informações do plano
          </p>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Informações do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Plano</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Digite o nome do plano"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  value={formData.price || ''}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="original_price">Preço Original (R$)</Label>
                <Input
                  id="original_price"
                  value={formData.original_price || ''}
                  onChange={(e) => handleChange('original_price', e.target.value)}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_days">Duração (dias)</Label>
                <Input
                  id="duration_days"
                  value={formData.duration_days || ''}
                  onChange={(e) => handleChange('duration_days', e.target.value)}
                  placeholder="30"
                  type="number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_consultations">Máx. Consultas (-1 = ilimitado)</Label>
                <Input
                  id="max_consultations"
                  value={formData.max_consultations || ''}
                  onChange={(e) => handleChange('max_consultations', e.target.value)}
                  placeholder="-1"
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category || 'Basic'} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Básico</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Joker">Joker</SelectItem>
                    <SelectItem value="Rei">Rei</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || 'ativo'} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  value={formData.badge || ''}
                  onChange={(e) => handleChange('badge', e.target.value)}
                  placeholder="Mais Popular"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descreva o plano"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="features">Recursos do Plano (um por linha)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleChange('features', [])}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              </div>
              <Textarea
                id="features"
                value={Array.isArray(formData.features) ? formData.features.join('\n') : ''}
                onChange={(e) => handleChange('features', e.target.value.split('\n').filter(line => line.trim()))}
                placeholder="Digite um recurso por linha ou selecione módulos abaixo para preenchimento automático"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Os recursos podem ser preenchidos manualmente ou automaticamente com base nos módulos selecionados abaixo.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_popular"
                  checked={formData.is_popular || false}
                  onCheckedChange={(checked) => handleChange('is_popular', checked)}
                />
                <Label htmlFor="is_popular">Marcar como popular</Label>
              </div>
            </div>

            {availableModules.length > 0 && (
              <div className="space-y-4">
                <Label>Módulos Inclusos</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-4 border rounded-lg">
                  {availableModules
                    .filter(module => module.is_active)
                    .map((module) => (
                      <div key={module.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`module-${module.id}`}
                          checked={(formData.modules_included || []).includes(module.id)}
                          onCheckedChange={(checked) => handleModuleToggle(module.id, checked as boolean)}
                        />
                        <Label htmlFor={`module-${module.id}`} className="text-sm">
                          {module.title}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {plan ? 'Atualizar' : 'Criar'} Plano
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanForm;
