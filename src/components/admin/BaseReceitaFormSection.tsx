import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from 'lucide-react';
import { BaseReceita } from '@/services/baseReceitaService';
import { formatDateOfBirth } from '@/utils/formatters';

interface BaseReceitaFormSectionProps {
  data: Partial<BaseReceita>;
  onChange: (field: string, value: string) => void;
  mode: 'create' | 'edit' | 'view';
}

const SITUACAO_CADASTRAL_OPTIONS = [
  'REGULAR',
  'SUSPENSA',
  'CANCELADA',
  'PENDENTE',
  'NULA',
  'BAIXADA'
];

const BaseReceitaFormSection: React.FC<BaseReceitaFormSectionProps> = ({ 
  data, 
  onChange, 
  mode 
}) => {
  const isReadonly = mode === 'view';

  // Removido preenchimento automático da data - deve ser manual

  const handleDataInscricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatDateOfBirth(e.target.value);
    onChange('data_inscricao', formattedValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Receita Federal
        </CardTitle>
        <CardDescription>
          Dados oficiais da Receita Federal do Brasil (Opcionais)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="situacao_cadastral">Situação Cadastral</Label>
            {isReadonly ? (
              <Input
                value={data.situacao_cadastral || ''}
                readOnly
                className="bg-muted"
              />
            ) : (
              <Select 
                value={data.situacao_cadastral || ''} 
                onValueChange={(value) => onChange('situacao_cadastral', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar situação" />
                </SelectTrigger>
                <SelectContent>
                  {SITUACAO_CADASTRAL_OPTIONS.map((situacao) => (
                    <SelectItem key={situacao} value={situacao}>
                      {situacao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label htmlFor="data_inscricao">Data de Inscrição</Label>
            <Input
              id="data_inscricao"
              value={data.data_inscricao || ''}
              onChange={handleDataInscricaoChange}
              placeholder="DD/MM/AAAA"
              readOnly={isReadonly}
              className={isReadonly ? "bg-muted" : "placeholder:text-sm"}
            />
          </div>

          <div>
            <Label htmlFor="digito_verificador">Dígito Verificador</Label>
            <Input
              id="digito_verificador"
              value={data.digito_verificador || ''}
              onChange={(e) => onChange('digito_verificador', e.target.value)}
              placeholder="00"
              maxLength={2}
              readOnly={isReadonly}
              className={isReadonly ? "bg-muted" : "placeholder:text-sm"}
            />
          </div>

          <div>
            <Label htmlFor="data_emissao">Data de Emissão</Label>
            <Input
              id="data_emissao"
              type="datetime-local"
              value={data.data_emissao || ''}
              onChange={(e) => onChange('data_emissao', e.target.value)}
              readOnly={isReadonly}
              className={isReadonly ? "bg-muted" : ""}
            />
          </div>

          <div>
            <Label htmlFor="codigo_controle">Código de Controle</Label>
            <Input
              id="codigo_controle"
              value={data.codigo_controle || ''}
              onChange={(e) => onChange('codigo_controle', e.target.value)}
              placeholder="0000.0000.0000.0000"
              maxLength={19}
              readOnly={isReadonly}
              className={isReadonly ? "bg-muted" : "placeholder:text-sm"}
            />
          </div>

          <div>
            <Label htmlFor="qr_link">QR Receita</Label>
            <Input
              id="qr_link"
              value={data.qr_link || ''}
              onChange={(e) => onChange('qr_link', e.target.value)}
              placeholder="https://..."
              type="url"
              readOnly={isReadonly}
              className={isReadonly ? "bg-muted" : "placeholder:text-sm"}
            />
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default BaseReceitaFormSection;