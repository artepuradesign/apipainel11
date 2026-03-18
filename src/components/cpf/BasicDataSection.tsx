import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from 'lucide-react';
import { formatCpf, formatDateOfBirth } from '@/utils/formatters';
import { BaseCpf } from '@/services/baseCpfService';

interface BasicDataSectionProps {
  dadosBasicos: Partial<BaseCpf>;
  onInputChange: (field: string, value: string | number) => void;
}

const SITUACAO_CPF_OPTIONS = [
  'Regular',
  'Suspensa',
  'Cancelada por Multiplicidade',
  'Nula',
  'Cancelada de Ofício',
  'Pendente de Regularização',
  'Cancelada a Pedido',
  'Titular Falecido'
];

const ESTADOS_BRASILEIROS = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

const BasicDataSection = ({ dadosBasicos, onInputChange }: BasicDataSectionProps) => {
  // Ajuste fino: no mobile, aumentamos um pouco a fonte apenas desta seção.
  // No desktop, mantemos o padrão global do componente Input (md:text-sm).
  const mobileBiggerInputClass = "text-[19px] md:text-sm";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Dados Básicos
        </CardTitle>
        <CardDescription>
          Informações fundamentais do CPF
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              className={mobileBiggerInputClass}
              value={dadosBasicos.cpf || ''}
              onChange={(e) => onInputChange('cpf', formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref">Referência</Label>
            <Input
              id="ref"
              className={mobileBiggerInputClass}
              value={dadosBasicos.ref || ''}
              onChange={(e) => onInputChange('ref', e.target.value)}
              placeholder="Referência do cadastro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              className={mobileBiggerInputClass}
              value={dadosBasicos.nome || ''}
              onChange={(e) => onInputChange('nome', e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input
              id="data_nascimento"
              className={mobileBiggerInputClass}
              value={dadosBasicos.data_nascimento || ''}
              onChange={(e) => onInputChange('data_nascimento', formatDateOfBirth(e.target.value))}
              placeholder="DD/MM/AAAA"
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sexo">Sexo</Label>
            <Select
              value={dadosBasicos.sexo || ''}
              onValueChange={(value) => onInputChange('sexo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="situacao_cpf">Situação CPF</Label>
            <Select
              value={dadosBasicos.situacao_cpf || ''}
              onValueChange={(value) => onInputChange('situacao_cpf', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a situação" />
              </SelectTrigger>
              <SelectContent>
                {SITUACAO_CPF_OPTIONS.map((situacao) => (
                  <SelectItem key={situacao} value={situacao}>
                    {situacao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cor">Cor/Raça</Label>
            <Select
              value={dadosBasicos.cor || ''}
              onValueChange={(value) => {
                console.log('🔍 [COR_CHANGE] Selecionando cor:', value);
                onInputChange('cor', value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cor/raça" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="BRANCA">BRANCA</SelectItem>
                <SelectItem value="PRETA">PRETA</SelectItem>
                <SelectItem value="PARDA">PARDA</SelectItem>
                <SelectItem value="AMARELA">AMARELA</SelectItem>
                <SelectItem value="INDÍGENA">INDÍGENA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mae">Nome da Mãe</Label>
            <Input
              id="mae"
              className={mobileBiggerInputClass}
              value={dadosBasicos.mae || ''}
              onChange={(e) => onInputChange('mae', e.target.value)}
              placeholder="Nome completo da mãe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pai">Nome do Pai</Label>
            <Input
              id="pai"
              className={mobileBiggerInputClass}
              value={dadosBasicos.pai || ''}
              onChange={(e) => onInputChange('pai', e.target.value)}
              placeholder="Nome completo do pai"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="naturalidade">Naturalidade</Label>
            <Input
              id="naturalidade"
              className={mobileBiggerInputClass}
              value={dadosBasicos.naturalidade || ''}
              onChange={(e) => onInputChange('naturalidade', e.target.value)}
              placeholder="Cidade de nascimento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uf_naturalidade">UF Naturalidade</Label>
            <Select
              value={dadosBasicos.uf_naturalidade || ''}
              onValueChange={(value) => onInputChange('uf_naturalidade', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_BRASILEIROS.map((estado) => (
                  <SelectItem key={estado.sigla} value={estado.sigla}>
                    {estado.sigla} - {estado.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado_civil">Estado Civil</Label>
            <Select
              value={dadosBasicos.estado_civil || ''}
              onValueChange={(value) => {
                console.log('🔍 [ESTADO_CIVIL_CHANGE] Selecionando estado civil:', value);
                onInputChange('estado_civil', value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado civil" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="SOLTEIRO">SOLTEIRO</SelectItem>
                <SelectItem value="CASADO">CASADO</SelectItem>
                <SelectItem value="DIVORCIADO">DIVORCIADO</SelectItem>
                <SelectItem value="VIÚVO">VIÚVO</SelectItem>
                <SelectItem value="UNIÃO ESTÁVEL">UNIÃO ESTÁVEL</SelectItem>
                <SelectItem value="SEPARADO">SEPARADO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="escolaridade">Escolaridade</Label>
            <Select
              value={dadosBasicos.escolaridade || ''}
              onValueChange={(value) => {
                console.log('🔍 [ESCOLARIDADE_CHANGE] Selecionando escolaridade:', value);
                onInputChange('escolaridade', value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolaridade" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="FUNDAMENTAL INCOMPLETO">FUNDAMENTAL INCOMPLETO</SelectItem>
                <SelectItem value="FUNDAMENTAL COMPLETO">FUNDAMENTAL COMPLETO</SelectItem>
                <SelectItem value="MÉDIO INCOMPLETO">MÉDIO INCOMPLETO</SelectItem>
                <SelectItem value="MÉDIO COMPLETO">MÉDIO COMPLETO</SelectItem>
                <SelectItem value="SUPERIOR INCOMPLETO">SUPERIOR INCOMPLETO</SelectItem>
                <SelectItem value="SUPERIOR COMPLETO">SUPERIOR COMPLETO</SelectItem>
                <SelectItem value="PÓS-GRADUAÇÃO">PÓS-GRADUAÇÃO</SelectItem>
                <SelectItem value="MESTRADO">MESTRADO</SelectItem>
                <SelectItem value="DOUTORADO">DOUTORADO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_obito">Data de Óbito</Label>
            <Input
              id="data_obito"
              className={mobileBiggerInputClass}
              value={dadosBasicos.data_obito || ''}
              onChange={(e) => onInputChange('data_obito', formatDateOfBirth(e.target.value))}
              placeholder="DD/MM/AAAA"
              maxLength={10}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicDataSection;