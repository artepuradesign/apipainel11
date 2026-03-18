import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BaseCpf } from '@/services/baseCpfService';

interface BaseCpfFormProps {
  initialData?: BaseCpf | null;
  onSubmit: (data: Partial<BaseCpf>) => void;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit' | 'view';
}

const BaseCpfForm: React.FC<BaseCpfFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState<Partial<BaseCpf>>({
    qualidade_dados: 50,
    fonte_dados: 'cadastro_manual',
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
  const title = mode === 'create' ? 'Cadastrar CPF' : mode === 'edit' ? 'Editar CPF' : 'Visualizar CPF';

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold dashboard-text-primary">{title}</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto text-xs sm:text-sm">
            {mode === 'view' ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isReadOnly && (
            <Button type="submit" disabled={loading} className="w-full sm:w-auto text-xs sm:text-sm">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 w-full h-auto">
          <TabsTrigger value="basic" className="text-xs sm:text-sm py-2">Básicos</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm py-2">Docs</TabsTrigger>
          <TabsTrigger value="financial" className="text-xs sm:text-sm py-2">Financeiro</TabsTrigger>
          <TabsTrigger value="json" className="text-xs sm:text-sm py-2">JSON</TabsTrigger>
          <TabsTrigger value="metadata" className="text-xs sm:text-sm py-2">Meta</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-3 sm:mt-4">
          <Card className="dashboard-card">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="dashboard-text-primary text-sm sm:text-base lg:text-lg">Informações Básicas</CardTitle>
              <CardDescription className="dashboard-text-muted text-xs sm:text-sm">Dados pessoais principais</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf || ''}
                  onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome || ''}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome completo"
                  required
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento || ''}
                  onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Select 
                  value={formData.sexo || ''} 
                  onValueChange={(value) => handleInputChange('sexo', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mae">Nome da Mãe</Label>
                <Input
                  id="mae"
                  value={formData.mae || ''}
                  onChange={(e) => handleInputChange('mae', e.target.value)}
                  placeholder="Nome da mãe"
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pai">Nome do Pai</Label>
                <Input
                  id="pai"
                  value={formData.pai || ''}
                  onChange={(e) => handleInputChange('pai', e.target.value)}
                  placeholder="Nome do pai"
                  readOnly={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-3 sm:mt-4">
          <Card className="dashboard-card">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="dashboard-text-primary text-sm sm:text-base lg:text-lg">Documentos</CardTitle>
              <CardDescription className="dashboard-text-muted text-xs sm:text-sm">RG, PIS, CNS e outros documentos</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg || ''}
                  onChange={(e) => handleInputChange('rg', e.target.value)}
                  placeholder="Número do RG"
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="orgao_emissor">Órgão Emissor</Label>
                <Input
                  id="orgao_emissor"
                  value={formData.orgao_emissor || ''}
                  onChange={(e) => handleInputChange('orgao_emissor', e.target.value)}
                  placeholder="Ex: SSP"
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="uf_emissao">UF Emissão</Label>
                <Input
                  id="uf_emissao"
                  value={formData.uf_emissao || ''}
                  onChange={(e) => handleInputChange('uf_emissao', e.target.value.toUpperCase())}
                  placeholder="Ex: SP"
                  maxLength={2}
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pis">PIS</Label>
                <Input
                  id="pis"
                  value={formData.pis || ''}
                  onChange={(e) => handleInputChange('pis', e.target.value)}
                  placeholder="Número do PIS"
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cns">CNS</Label>
                <Input
                  id="cns"
                  value={formData.cns || ''}
                  onChange={(e) => handleInputChange('cns', e.target.value)}
                  placeholder="Cartão Nacional de Saúde"
                  readOnly={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-3 sm:mt-4">
          <Card className="dashboard-card">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="dashboard-text-primary text-sm sm:text-base lg:text-lg">Dados Financeiros</CardTitle>
              <CardDescription className="dashboard-text-muted text-xs sm:text-sm">Renda, poder aquisitivo e informações financeiras</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="renda">Renda (R$)</Label>
                <Input
                  id="renda"
                  type="number"
                  step="0.01"
                  value={formData.renda || ''}
                  onChange={(e) => handleInputChange('renda', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="poder_aquisitivo">Poder Aquisitivo</Label>
                <Select 
                  value={formData.poder_aquisitivo || ''} 
                  onValueChange={(value) => handleInputChange('poder_aquisitivo', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alto">Alto</SelectItem>
                    <SelectItem value="Médio Alto">Médio Alto</SelectItem>
                    <SelectItem value="Médio">Médio</SelectItem>
                    <SelectItem value="Médio Baixo">Médio Baixo</SelectItem>
                    <SelectItem value="Baixo">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="poder_aquisitivo">Poder Aquisitivo</Label>
                <Select 
                  value={formData.poder_aquisitivo || ''} 
                  onValueChange={(value) => handleInputChange('poder_aquisitivo', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                    <SelectItem value="muito_alto">Muito Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="mt-3 sm:mt-4">
          <Card className="dashboard-card">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="dashboard-text-primary text-sm sm:text-base lg:text-lg">Dados Estruturados (JSON)</CardTitle>
              <CardDescription className="dashboard-text-muted text-xs sm:text-sm">Dados complexos em formato JSON</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefones">Telefones (JSON)</Label>
                  <Textarea
                    id="telefones"
                    value={typeof formData.telefones === 'object' ? JSON.stringify(formData.telefones, null, 2) : formData.telefones || ''}
                    onChange={(e) => handleJsonFieldChange('telefones', e.target.value)}
                    placeholder='["(11) 99999-9999"]'
                    rows={3}
                    readOnly={isReadOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emails">Emails (JSON)</Label>
                  <Textarea
                    id="emails"
                    value={typeof formData.emails === 'object' ? JSON.stringify(formData.emails, null, 2) : formData.emails || ''}
                    onChange={(e) => handleJsonFieldChange('emails', e.target.value)}
                    placeholder='["email@exemplo.com"]'
                    rows={3}
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="mt-3 sm:mt-4">
          <Card className="dashboard-card">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="dashboard-text-primary text-sm sm:text-base lg:text-lg">Metadados</CardTitle>
              <CardDescription className="dashboard-text-muted text-xs sm:text-sm">Informações sobre a qualidade e origem dos dados</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="nivel_consulta">Nível de Consulta</Label>
                <Select 
                  value={formData.nivel_consulta || 'basico'} 
                  onValueChange={(value) => handleInputChange('nivel_consulta', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="completo">Completo</SelectItem>
                    <SelectItem value="detalhado">Detalhado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fonte_dados">Fonte dos Dados</Label>
                <Input
                  id="fonte_dados"
                  value={formData.fonte_dados || ''}
                  onChange={(e) => handleInputChange('fonte_dados', e.target.value)}
                  placeholder="Ex: cadastro_manual, api_externa"
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qualidade_dados">Qualidade dos Dados (%)</Label>
                <Input
                  id="qualidade_dados"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.qualidade_dados || 50}
                  onChange={(e) => handleInputChange('qualidade_dados', parseInt(e.target.value) || 50)}
                  readOnly={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
};

export default BaseCpfForm;