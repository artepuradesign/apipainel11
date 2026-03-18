import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseCpf } from '@/services/baseCpfService';
import { formatCpf, formatCep, formatPhone, formatDateOfBirth } from '@/utils/formatters';
import { 
  User, FileText, Mail, Phone, MapPin, Calendar, 
  Globe, Camera, Database, Save, X, Briefcase
} from 'lucide-react';

interface BaseCpfEditFormProps {
  initialData?: BaseCpf | null;
  onSubmit: (data: Partial<BaseCpf>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const BaseCpfEditForm: React.FC<BaseCpfEditFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>Dados pessoais principais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf || ''}
                  onChange={(e) => handleInputChange('cpf', formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ref">Referência</Label>
                <Input
                  id="ref"
                  value={formData.ref || ''}
                  onChange={(e) => handleInputChange('ref', e.target.value)}
                  placeholder="Referência do registro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento || ''}
                  onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Select 
                  value={formData.sexo || ''} 
                  onValueChange={(value) => handleInputChange('sexo', value)}
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pai">Nome do Pai</Label>
                <Input
                  id="pai"
                  value={formData.pai || ''}
                  onChange={(e) => handleInputChange('pai', e.target.value)}
                  placeholder="Nome do pai"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="naturalidade">Naturalidade</Label>
                <Input
                  id="naturalidade"
                  value={formData.naturalidade || ''}
                  onChange={(e) => handleInputChange('naturalidade', e.target.value)}
                  placeholder="Cidade de nascimento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uf_naturalidade">UF Naturalidade</Label>
                <Select 
                  value={formData.uf_naturalidade || ''} 
                  onValueChange={(value) => handleInputChange('uf_naturalidade', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC - Acre</SelectItem>
                    <SelectItem value="AL">AL - Alagoas</SelectItem>
                    <SelectItem value="AP">AP - Amapá</SelectItem>
                    <SelectItem value="AM">AM - Amazonas</SelectItem>
                    <SelectItem value="BA">BA - Bahia</SelectItem>
                    <SelectItem value="CE">CE - Ceará</SelectItem>
                    <SelectItem value="DF">DF - Distrito Federal</SelectItem>
                    <SelectItem value="ES">ES - Espírito Santo</SelectItem>
                    <SelectItem value="GO">GO - Goiás</SelectItem>
                    <SelectItem value="MA">MA - Maranhão</SelectItem>
                    <SelectItem value="MT">MT - Mato Grosso</SelectItem>
                    <SelectItem value="MS">MS - Mato Grosso do Sul</SelectItem>
                    <SelectItem value="MG">MG - Minas Gerais</SelectItem>
                    <SelectItem value="PA">PA - Pará</SelectItem>
                    <SelectItem value="PB">PB - Paraíba</SelectItem>
                    <SelectItem value="PR">PR - Paraná</SelectItem>
                    <SelectItem value="PE">PE - Pernambuco</SelectItem>
                    <SelectItem value="PI">PI - Piauí</SelectItem>
                    <SelectItem value="RJ">RJ - Rio de Janeiro</SelectItem>
                    <SelectItem value="RN">RN - Rio Grande do Norte</SelectItem>
                    <SelectItem value="RS">RS - Rio Grande do Sul</SelectItem>
                    <SelectItem value="RO">RO - Rondônia</SelectItem>
                    <SelectItem value="RR">RR - Roraima</SelectItem>
                    <SelectItem value="SC">SC - Santa Catarina</SelectItem>
                    <SelectItem value="SP">SP - São Paulo</SelectItem>
                    <SelectItem value="SE">SE - Sergipe</SelectItem>
                    <SelectItem value="TO">TO - Tocantins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor">Cor/Raça</Label>
                <Select 
                  value={formData.cor || ''} 
                  onValueChange={(value) => handleInputChange('cor', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Branca">Branca</SelectItem>
                    <SelectItem value="Preta">Preta</SelectItem>
                    <SelectItem value="Parda">Parda</SelectItem>
                    <SelectItem value="Amarela">Amarela</SelectItem>
                    <SelectItem value="Indígena">Indígena</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado_civil">Estado Civil</Label>
                <Select 
                  value={formData.estado_civil || ''} 
                  onValueChange={(value) => handleInputChange('estado_civil', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro">Solteiro</SelectItem>
                    <SelectItem value="Casado">Casado</SelectItem>
                    <SelectItem value="União Estável">União Estável</SelectItem>
                    <SelectItem value="Separado">Separado</SelectItem>
                    <SelectItem value="Divorciado">Divorciado</SelectItem>
                    <SelectItem value="Viúvo">Viúvo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escolaridade">Escolaridade</Label>
                <Select 
                  value={formData.escolaridade || ''} 
                  onValueChange={(value) => handleInputChange('escolaridade', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fundamental Incompleto">Fundamental Incompleto</SelectItem>
                    <SelectItem value="Fundamental Completo">Fundamental Completo</SelectItem>
                    <SelectItem value="Médio Incompleto">Médio Incompleto</SelectItem>
                    <SelectItem value="Médio Completo">Médio Completo</SelectItem>
                    <SelectItem value="Superior Incompleto">Superior Incompleto</SelectItem>
                    <SelectItem value="Superior Completo">Superior Completo</SelectItem>
                    <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="situacao_cpf">Receita Federal</Label>
                <Select 
                  value={formData.situacao_cpf || ''} 
                  onValueChange={(value) => handleInputChange('situacao_cpf', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Suspensa">Suspensa</SelectItem>
                    <SelectItem value="Cancelada por Multiplicidade">Cancelada por Multiplicidade</SelectItem>
                    <SelectItem value="Nula">Nula</SelectItem>
                    <SelectItem value="Cancelada de Ofício">Cancelada de Ofício</SelectItem>
                    <SelectItem value="Pendente de Regularização">Pendente de Regularização</SelectItem>
                    <SelectItem value="Cancelada a Pedido">Cancelada a Pedido</SelectItem>
                    <SelectItem value="Titular Falecido">Titular Falecido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cns">CNS</Label>
                <Input
                  id="cns"
                  value={formData.cns || ''}
                  onChange={(e) => handleInputChange('cns', e.target.value)}
                  placeholder="Cartão Nacional de Saúde"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_obito">Data de Óbito</Label>
                <Input
                  id="data_obito"
                  type="date"
                  value={formData.data_obito || ''}
                  onChange={(e) => handleInputChange('data_obito', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contatos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informações de Contato
            </CardTitle>
            <CardDescription>E-mail, telefone e endereço</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senha_email">Senha do E-mail</Label>
                <Input
                  id="senha_email"
                  type="password"
                  value={formData.senha_email || ''}
                  onChange={(e) => handleInputChange('senha_email', e.target.value)}
                  placeholder="Senha do e-mail"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone || ''}
                  onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
            <CardDescription>Endereço residencial</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep || ''}
                  onChange={(e) => handleInputChange('cep', formatCep(e.target.value))}
                  placeholder="00000-000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  value={formData.logradouro || ''}
                  onChange={(e) => handleInputChange('logradouro', e.target.value)}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero || ''}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  placeholder="123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={formData.complemento || ''}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                  placeholder="Apto, Bloco, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro || ''}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  placeholder="Bairro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade || ''}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="uf_endereco">UF</Label>
                <Select 
                  value={formData.uf_endereco || ''} 
                  onValueChange={(value) => handleInputChange('uf_endereco', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC - Acre</SelectItem>
                    <SelectItem value="AL">AL - Alagoas</SelectItem>
                    <SelectItem value="AP">AP - Amapá</SelectItem>
                    <SelectItem value="AM">AM - Amazonas</SelectItem>
                    <SelectItem value="BA">BA - Bahia</SelectItem>
                    <SelectItem value="CE">CE - Ceará</SelectItem>
                    <SelectItem value="DF">DF - Distrito Federal</SelectItem>
                    <SelectItem value="ES">ES - Espírito Santo</SelectItem>
                    <SelectItem value="GO">GO - Goiás</SelectItem>
                    <SelectItem value="MA">MA - Maranhão</SelectItem>
                    <SelectItem value="MT">MT - Mato Grosso</SelectItem>
                    <SelectItem value="MS">MS - Mato Grosso do Sul</SelectItem>
                    <SelectItem value="MG">MG - Minas Gerais</SelectItem>
                    <SelectItem value="PA">PA - Pará</SelectItem>
                    <SelectItem value="PB">PB - Paraíba</SelectItem>
                    <SelectItem value="PR">PR - Paraná</SelectItem>
                    <SelectItem value="PE">PE - Pernambuco</SelectItem>
                    <SelectItem value="PI">PI - Piauí</SelectItem>
                    <SelectItem value="RJ">RJ - Rio de Janeiro</SelectItem>
                    <SelectItem value="RN">RN - Rio Grande do Norte</SelectItem>
                    <SelectItem value="RS">RS - Rio Grande do Sul</SelectItem>
                    <SelectItem value="RO">RO - Rondônia</SelectItem>
                    <SelectItem value="RR">RR - Roraima</SelectItem>
                    <SelectItem value="SC">SC - Santa Catarina</SelectItem>
                    <SelectItem value="SP">SP - São Paulo</SelectItem>
                    <SelectItem value="SE">SE - Sergipe</SelectItem>
                    <SelectItem value="TO">TO - Tocantins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos
            </CardTitle>
            <CardDescription>RG, CNH, títulos e outros documentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg || ''}
                  onChange={(e) => handleInputChange('rg', e.target.value)}
                  placeholder="Número do RG"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgao_emissor">Órgão Emissor RG</Label>
                <Input
                  id="orgao_emissor"
                  value={formData.orgao_emissor || ''}
                  onChange={(e) => handleInputChange('orgao_emissor', e.target.value)}
                  placeholder="Ex: SSP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uf_emissao">UF Emissão RG</Label>
                <Select 
                  value={formData.uf_emissao || ''} 
                  onValueChange={(value) => handleInputChange('uf_emissao', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC - Acre</SelectItem>
                    <SelectItem value="AL">AL - Alagoas</SelectItem>
                    <SelectItem value="AP">AP - Amapá</SelectItem>
                    <SelectItem value="AM">AM - Amazonas</SelectItem>
                    <SelectItem value="BA">BA - Bahia</SelectItem>
                    <SelectItem value="CE">CE - Ceará</SelectItem>
                    <SelectItem value="DF">DF - Distrito Federal</SelectItem>
                    <SelectItem value="ES">ES - Espírito Santo</SelectItem>
                    <SelectItem value="GO">GO - Goiás</SelectItem>
                    <SelectItem value="MA">MA - Maranhão</SelectItem>
                    <SelectItem value="MT">MT - Mato Grosso</SelectItem>
                    <SelectItem value="MS">MS - Mato Grosso do Sul</SelectItem>
                    <SelectItem value="MG">MG - Minas Gerais</SelectItem>
                    <SelectItem value="PA">PA - Pará</SelectItem>
                    <SelectItem value="PB">PB - Paraíba</SelectItem>
                    <SelectItem value="PR">PR - Paraná</SelectItem>
                    <SelectItem value="PE">PE - Pernambuco</SelectItem>
                    <SelectItem value="PI">PI - Piauí</SelectItem>
                    <SelectItem value="RJ">RJ - Rio de Janeiro</SelectItem>
                    <SelectItem value="RN">RN - Rio Grande do Norte</SelectItem>
                    <SelectItem value="RS">RS - Rio Grande do Sul</SelectItem>
                    <SelectItem value="RO">RO - Rondônia</SelectItem>
                    <SelectItem value="RR">RR - Roraima</SelectItem>
                    <SelectItem value="SC">SC - Santa Catarina</SelectItem>
                    <SelectItem value="SP">SP - São Paulo</SelectItem>
                    <SelectItem value="SE">SE - Sergipe</SelectItem>
                    <SelectItem value="TO">TO - Tocantins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnh">CNH</Label>
                <Input
                  id="cnh"
                  value={formData.cnh || ''}
                  onChange={(e) => handleInputChange('cnh', e.target.value)}
                  placeholder="Número da CNH"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dt_expedicao_cnh">Data Expedição CNH</Label>
                <Input
                  id="dt_expedicao_cnh"
                  type="date"
                  value={formData.dt_expedicao_cnh || ''}
                  onChange={(e) => handleInputChange('dt_expedicao_cnh', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passaporte">Passaporte</Label>
                <Input
                  id="passaporte"
                  value={formData.passaporte || ''}
                  onChange={(e) => handleInputChange('passaporte', e.target.value)}
                  placeholder="Número do passaporte"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nit">NIT</Label>
                <Input
                  id="nit"
                  value={formData.nit || ''}
                  onChange={(e) => handleInputChange('nit', e.target.value)}
                  placeholder="Número de Identificação do Trabalhador"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctps">CTPS</Label>
                <Input
                  id="ctps"
                  value={formData.ctps || ''}
                  onChange={(e) => handleInputChange('ctps', e.target.value)}
                  placeholder="Carteira de Trabalho"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo_eleitor">Título de Eleitor</Label>
                <Input
                  id="titulo_eleitor"
                  value={formData.titulo_eleitor || ''}
                  onChange={(e) => handleInputChange('titulo_eleitor', e.target.value)}
                  placeholder="Número do título"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zona">Zona Eleitoral</Label>
                <Input
                  id="zona"
                  value={formData.zona || ''}
                  onChange={(e) => handleInputChange('zona', e.target.value)}
                  placeholder="Zona"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secao">Seção Eleitoral</Label>
                <Input
                  id="secao"
                  value={formData.secao || ''}
                  onChange={(e) => handleInputChange('secao', e.target.value)}
                  placeholder="Seção"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nsu">NSU</Label>
                <Input
                  id="nsu"
                  value={formData.nsu || ''}
                  onChange={(e) => handleInputChange('nsu', e.target.value)}
                  placeholder="NSU"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pis">PIS</Label>
                <Input
                  id="pis"
                  value={formData.pis || ''}
                  onChange={(e) => handleInputChange('pis', e.target.value)}
                  placeholder="Número do PIS"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Profissionais e Financeiros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informações Profissionais e Financeiras
            </CardTitle>
            <CardDescription>Dados de trabalho e renda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aposentado">Aposentado</Label>
                <Select 
                  value={formData.aposentado || ''} 
                  onValueChange={(value) => handleInputChange('aposentado', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_emprego">Tipo de Emprego</Label>
                <Input
                  id="tipo_emprego"
                  value={formData.tipo_emprego || ''}
                  onChange={(e) => handleInputChange('tipo_emprego', e.target.value)}
                  placeholder="Tipo de emprego"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cbo">CBO</Label>
                <Input
                  id="cbo"
                  value={formData.cbo || ''}
                  onChange={(e) => handleInputChange('cbo', e.target.value)}
                  placeholder="Código Brasileiro de Ocupações"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="poder_aquisitivo">Poder Aquisitivo</Label>
                <Input
                  id="poder_aquisitivo"
                  value={formData.poder_aquisitivo || ''}
                  onChange={(e) => handleInputChange('poder_aquisitivo', e.target.value)}
                  placeholder="Poder aquisitivo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="renda">Renda</Label>
                <Input
                  id="renda"
                  value={formData.renda || ''}
                  onChange={(e) => handleInputChange('renda', e.target.value)}
                  placeholder="Renda mensal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fx_poder_aquisitivo">Faixa Poder Aquisitivo</Label>
                <Input
                  id="fx_poder_aquisitivo"
                  value={formData.fx_poder_aquisitivo || ''}
                  onChange={(e) => handleInputChange('fx_poder_aquisitivo', e.target.value)}
                  placeholder="Faixa de poder aquisitivo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="csb8">CSB8</Label>
                <Input
                  id="csb8"
                  type="number"
                  value={formData.csb8 || ''}
                  onChange={(e) => handleInputChange('csb8', parseInt(e.target.value) || 0)}
                  placeholder="CSB8"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="csb8_faixa">CSB8 Faixa</Label>
                <Input
                  id="csb8_faixa"
                  value={formData.csb8_faixa || ''}
                  onChange={(e) => handleInputChange('csb8_faixa', e.target.value)}
                  placeholder="Faixa CSB8"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="csba">CSBA</Label>
                <Input
                  id="csba"
                  type="number"
                  value={formData.csba || ''}
                  onChange={(e) => handleInputChange('csba', parseInt(e.target.value) || 0)}
                  placeholder="CSBA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="csba_faixa">CSBA Faixa</Label>
                <Input
                  id="csba_faixa"
                  value={formData.csba_faixa || ''}
                  onChange={(e) => handleInputChange('csba_faixa', e.target.value)}
                  placeholder="Faixa CSBA"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Database className="h-5 w-5" />
              Metadados e Fotos
            </CardTitle>
            <CardDescription>Informações sobre a qualidade e fonte dos dados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foto">URL da Primeira Foto</Label>
                <Input
                  id="foto"
                  value={formData.foto || ''}
                  onChange={(e) => handleInputChange('foto', e.target.value)}
                  placeholder="/FOTOS/12345678901_CPF.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="foto2">URL da Segunda Foto</Label>
                <Input
                  id="foto2"
                  value={formData.foto2 || ''}
                  onChange={(e) => handleInputChange('foto2', e.target.value)}
                  placeholder="/FOTOS/12345678901_CPF2.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fonte_dados">Fonte dos Dados</Label>
                <Select 
                  value={formData.fonte_dados || ''} 
                  onValueChange={(value) => handleInputChange('fonte_dados', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cadastro_manual">Cadastro Manual</SelectItem>
                    <SelectItem value="api_externa">API Externa</SelectItem>
                    <SelectItem value="importacao">Importação</SelectItem>
                    <SelectItem value="web_scraping">Web Scraping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qualidade_dados">Qualidade dos Dados (0-100)</Label>
                <Input
                  id="qualidade_dados"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.qualidade_dados || 0}
                  onChange={(e) => handleInputChange('qualidade_dados', parseInt(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ultima_atualizacao">Última Atualização</Label>
                <Input
                  id="ultima_atualizacao"
                  type="datetime-local"
                  value={formData.ultima_atualizacao || ''}
                  onChange={(e) => handleInputChange('ultima_atualizacao', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default BaseCpfEditForm;