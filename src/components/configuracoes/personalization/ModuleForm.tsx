
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from 'lucide-react';

interface ModuleFormProps {
  module?: {
    id: string;
    title: string;
    description: string;
    price: string;
    icon: string;
    path: string;
    operationalStatus: string;
    iconSize: string;
    showDescription: boolean;
    panelId: string;
  } | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  availablePanels: any[];
}

const ModuleForm = ({ module, onClose, onSubmit, availablePanels }: ModuleFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '0.00',
    icon: 'Package',
    operationalStatus: 'on',
    panelId: ''
  });

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title || '',
        description: module.description || '',
        price: module.price || '0.00',
        icon: module.icon || 'Package',
        operationalStatus: module.operationalStatus || 'on',
        panelId: module.panelId || ''
      });
    }
  }, [module]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>
            {module ? 'Editar Módulo' : 'Novo Módulo'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="panelId">Painel</Label>
            <Select value={formData.panelId} onValueChange={(value) => handleChange('panelId', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um painel" />
              </SelectTrigger>
              <SelectContent>
                {availablePanels.map((panel) => (
                  <SelectItem key={panel.id} value={panel.id.toString()}>
                    {panel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Título do Módulo</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Digite o título do módulo"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição do módulo"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="price">Preço</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="icon">Ícone</Label>
            <Select value={formData.icon} onValueChange={(value) => handleChange('icon', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Package">Package</SelectItem>
                <SelectItem value="Search">Search</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="FileText">FileText</SelectItem>
                <SelectItem value="Calculator">Calculator</SelectItem>
                <SelectItem value="Mail">Mail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="operationalStatus">Status Operacional</Label>
            <Select value={formData.operationalStatus} onValueChange={(value) => handleChange('operationalStatus', value)}>
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

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ModuleForm;
