import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateBaseDividasAtivas } from '@/services/baseDividasAtivasService';

interface DividasAtivasFormProps {
  data: Partial<CreateBaseDividasAtivas>;
  onChange: (field: string, value: string) => void;
}

const DividasAtivasForm: React.FC<DividasAtivasFormProps> = ({ data, onChange }) => {
  const handleInputChange = (field: string, value: string) => {
    if (field === 'valor_consolidado') {
      onChange(field, value);
    } else {
      onChange(field, value.toUpperCase());
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="tipo_devedor">Tipo de Devedor</Label>
        <Input
          id="tipo_devedor"
          value={data.tipo_devedor || ''}
          onChange={(e) => handleInputChange('tipo_devedor', e.target.value)}
          placeholder="Ex: CORRESPONSAVEL"
          className="placeholder:text-sm"
          style={{ textTransform: 'uppercase' }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nome_devedor">Nome do Devedor</Label>
        <Input
          id="nome_devedor"
          value={data.nome_devedor || ''}
          onChange={(e) => handleInputChange('nome_devedor', e.target.value)}
          placeholder="Nome completo do devedor"
          className="placeholder:text-sm"
          style={{ textTransform: 'uppercase' }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="uf_devedor">UF do Devedor</Label>
        <Select value={data.uf_devedor || ''} onValueChange={(value) => onChange('uf_devedor', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            <SelectItem value="AC">AC</SelectItem>
            <SelectItem value="AL">AL</SelectItem>
            <SelectItem value="AP">AP</SelectItem>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="BA">BA</SelectItem>
            <SelectItem value="CE">CE</SelectItem>
            <SelectItem value="DF">DF</SelectItem>
            <SelectItem value="ES">ES</SelectItem>
            <SelectItem value="GO">GO</SelectItem>
            <SelectItem value="MA">MA</SelectItem>
            <SelectItem value="MT">MT</SelectItem>
            <SelectItem value="MS">MS</SelectItem>
            <SelectItem value="MG">MG</SelectItem>
            <SelectItem value="PA">PA</SelectItem>
            <SelectItem value="PB">PB</SelectItem>
            <SelectItem value="PR">PR</SelectItem>
            <SelectItem value="PE">PE</SelectItem>
            <SelectItem value="PI">PI</SelectItem>
            <SelectItem value="RJ">RJ</SelectItem>
            <SelectItem value="RN">RN</SelectItem>
            <SelectItem value="RS">RS</SelectItem>
            <SelectItem value="RO">RO</SelectItem>
            <SelectItem value="RR">RR</SelectItem>
            <SelectItem value="SC">SC</SelectItem>
            <SelectItem value="SP">SP</SelectItem>
            <SelectItem value="SE">SE</SelectItem>
            <SelectItem value="TO">TO</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numero_inscricao">Número de Inscrição</Label>
        <Input
          id="numero_inscricao"
          value={data.numero_inscricao || ''}
          onChange={(e) => onChange('numero_inscricao', e.target.value)}
          placeholder="Ex: 8042556055720"
          className="placeholder:text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo_situacao_inscricao">Tipo Situação Inscrição</Label>
        <Input
          id="tipo_situacao_inscricao"
          value={data.tipo_situacao_inscricao || ''}
          onChange={(e) => handleInputChange('tipo_situacao_inscricao', e.target.value)}
          placeholder="Ex: Em cobrança"
          className="placeholder:text-sm"
          style={{ textTransform: 'uppercase' }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="situacao_inscricao">Situação de Inscrição</Label>
        <Input
          id="situacao_inscricao"
          value={data.situacao_inscricao || ''}
          onChange={(e) => handleInputChange('situacao_inscricao', e.target.value)}
          placeholder="Ex: ATIVA EM COBRANCA"
          className="placeholder:text-sm"
          style={{ textTransform: 'uppercase' }}
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="receita_principal">Receita Principal</Label>
        <Input
          id="receita_principal"
          value={data.receita_principal || ''}
          onChange={(e) => handleInputChange('receita_principal', e.target.value)}
          placeholder="Ex: R D Ativa - Simples Nacional - MEI"
          className="placeholder:text-sm"
          style={{ textTransform: 'uppercase' }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="data_inscricao">Data de Inscrição</Label>
        <Input
          id="data_inscricao"
          type="text"
          value={data.data_inscricao || ''}
          onChange={(e) => onChange('data_inscricao', e.target.value)}
          placeholder="dd/mm/aaaa"
          className="placeholder:text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="indicador_ajuizado">Indicador Ajuizado</Label>
        <Select value={data.indicador_ajuizado || ''} onValueChange={(value) => onChange('indicador_ajuizado', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SIM">SIM</SelectItem>
            <SelectItem value="NAO">NÃO</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="valor_consolidado">Valor Consolidado</Label>
        <Input
          id="valor_consolidado"
          type="number"
          step="0.01"
          value={data.valor_consolidado || ''}
          onChange={(e) => onChange('valor_consolidado', e.target.value)}
          placeholder="Ex: 2664.80"
          className="placeholder:text-sm"
        />
      </div>
    </div>
  );
};

export default DividasAtivasForm;