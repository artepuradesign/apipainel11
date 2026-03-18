import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from 'lucide-react';
import { formatDateOfBirth } from '@/utils/formatters';
import { BaseCpf } from '@/services/baseCpfService';

interface DocumentsSectionProps {
  dadosBasicos: Partial<BaseCpf>;
  onInputChange: (field: string, value: string | number) => void;
}

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

const DocumentsSection = ({ dadosBasicos, onInputChange }: DocumentsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos
        </CardTitle>
        <CardDescription>
          Informações sobre documentos pessoais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="rg">RG</Label>
            <Input
              id="rg"
              value={dadosBasicos.rg || ''}
              onChange={(e) => onInputChange('rg', e.target.value.toUpperCase())}
              placeholder="Número do RG"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgao_emissor">Órgão Emissor</Label>
            <Input
              id="orgao_emissor"
              value={dadosBasicos.orgao_emissor || ''}
              onChange={(e) => onInputChange('orgao_emissor', e.target.value.toUpperCase())}
              placeholder="Ex: SSP"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uf_emissao">UF Emissão</Label>
            <Select
              value={dadosBasicos.uf_emissao || ''}
              onValueChange={(value) => onInputChange('uf_emissao', value)}
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
            <Label htmlFor="cnh">CNH</Label>
            <Input
              id="cnh"
              value={dadosBasicos.cnh || ''}
              onChange={(e) => onInputChange('cnh', e.target.value.toUpperCase())}
              placeholder="Número da CNH"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dt_expedicao_cnh">Data Expedição CNH</Label>
            <Input
              id="dt_expedicao_cnh"
              value={dadosBasicos.dt_expedicao_cnh || ''}
              onChange={(e) => onInputChange('dt_expedicao_cnh', formatDateOfBirth(e.target.value))}
              placeholder="DD/MM/AAAA"
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passaporte">Passaporte</Label>
            <Input
              id="passaporte"
              value={dadosBasicos.passaporte || ''}
              onChange={(e) => onInputChange('passaporte', e.target.value.toUpperCase())}
              placeholder="Número do passaporte"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cns">CNS</Label>
            <Input
              id="cns"
              value={dadosBasicos.cns || ''}
              onChange={(e) => onInputChange('cns', e.target.value.toUpperCase())}
              placeholder="Cartão Nacional de Saúde"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nit">NIT</Label>
            <Input
              id="nit"
              value={dadosBasicos.nit || ''}
              onChange={(e) => onInputChange('nit', e.target.value.toUpperCase())}
              placeholder="Número de Identificação do Trabalhador"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctps">CTPS</Label>
            <Input
              id="ctps"
              value={dadosBasicos.ctps || ''}
              onChange={(e) => onInputChange('ctps', e.target.value.toUpperCase())}
              placeholder="Carteira de Trabalho"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo_eleitor">Título de Eleitor</Label>
            <Input
              id="titulo_eleitor"
              value={dadosBasicos.titulo_eleitor || ''}
              onChange={(e) => onInputChange('titulo_eleitor', e.target.value.toUpperCase())}
              placeholder="Número do título"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zona">Zona Eleitoral</Label>
            <Input
              id="zona"
              value={dadosBasicos.zona || ''}
              onChange={(e) => onInputChange('zona', e.target.value.toUpperCase())}
              placeholder="Zona"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secao">Seção Eleitoral</Label>
            <Input
              id="secao"
              value={dadosBasicos.secao || ''}
              onChange={(e) => onInputChange('secao', e.target.value.toUpperCase())}
              placeholder="Seção"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nsu">NSU</Label>
            <Input
              id="nsu"
              value={dadosBasicos.nsu || ''}
              onChange={(e) => onInputChange('nsu', e.target.value.toUpperCase())}
              placeholder="Número Sequencial Único"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pis">PIS</Label>
            <Input
              id="pis"
              value={dadosBasicos.pis || ''}
              onChange={(e) => onInputChange('pis', e.target.value.toUpperCase())}
              placeholder="PIS/PASEP"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsSection;