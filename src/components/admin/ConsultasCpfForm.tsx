import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsultaCpf } from '@/services/consultasCpfService';

interface ConsultasCpfFormProps {
  initialData?: ConsultaCpf | null;
  onSubmit: (data: Partial<ConsultaCpf>) => void;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit' | 'view';
}

const ConsultasCpfForm: React.FC<ConsultasCpfFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState<Partial<ConsultaCpf>>({
    module_type: 'cpf',
    status: 'processing',
    cost: 0,
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleJsonFieldChange = (field: string, value: string) => {
    try {
      const parsed = value.trim() ? JSON.parse(value) : null;
      handleInputChange(field, parsed);
    } catch (error) {
      // If invalid JSON, store as string
      handleInputChange(field, value);
    }
  };

  const formatCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Nova Consulta' : mode === 'edit' ? 'Editar Consulta' : 'Visualizar Consulta';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {mode === 'view' ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isReadOnly && (
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Consulta</CardTitle>
            <CardDescription>Dados principais da consulta realizada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">ID do Usuário *</Label>
              <Input
                id="user_id"
                type="number"
                value={formData.user_id || ''}
                onChange={(e) => handleInputChange('user_id', parseInt(e.target.value) || 0)}
                placeholder="ID do usuário"
                required
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document">CPF Consultado *</Label>
              <Input
                id="document"
                value={formData.document || ''}
                onChange={(e) => handleInputChange('document', formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                required
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="module_type">Tipo de Módulo</Label>
              <Select 
                value={formData.module_type || 'cpf'} 
                onValueChange={(value) => handleInputChange('module_type', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cpf_completo">CPF Completo</SelectItem>
                  <SelectItem value="cpf_basico">CPF Básico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost">Custo (R$)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost || 0}
                onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status || 'processing'} 
                onValueChange={(value) => handleInputChange('status', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados Técnicos</CardTitle>
            <CardDescription>Informações técnicas da consulta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ip_address">Endereço IP</Label>
              <Input
                id="ip_address"
                value={formData.ip_address || ''}
                onChange={(e) => handleInputChange('ip_address', e.target.value)}
                placeholder="192.168.1.1"
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user_agent">User Agent</Label>
              <Textarea
                id="user_agent"
                value={formData.user_agent || ''}
                onChange={(e) => handleInputChange('user_agent', e.target.value)}
                placeholder="Mozilla/5.0..."
                rows={2}
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="result_data">Resultado da Consulta (JSON)</Label>
              <Textarea
                id="result_data"
                value={typeof formData.result_data === 'object' ? JSON.stringify(formData.result_data, null, 2) : formData.result_data || ''}
                onChange={(e) => handleJsonFieldChange('result_data', e.target.value)}
                placeholder='{"nome": "João Silva", "situacao": "Regular"}'
                rows={6}
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metadata">Metadados (JSON)</Label>
              <Textarea
                id="metadata"
                value={typeof formData.metadata === 'object' ? JSON.stringify(formData.metadata, null, 2) : formData.metadata || ''}
                onChange={(e) => handleJsonFieldChange('metadata', e.target.value)}
                placeholder='{"origem": "api", "versao": "1.0"}'
                rows={4}
                readOnly={isReadOnly}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {mode === 'view' && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Data de Criação</Label>
              <p className="text-sm text-muted-foreground">
                {formData.created_at ? new Date(formData.created_at).toLocaleString('pt-BR') : 'N/A'}
              </p>
            </div>
            <div>
              <Label>Última Atualização</Label>
              <p className="text-sm text-muted-foreground">
                {formData.updated_at ? new Date(formData.updated_at).toLocaleString('pt-BR') : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
};

export default ConsultasCpfForm;