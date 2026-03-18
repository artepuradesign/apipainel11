import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateBaseAuxilioEmergencial } from '@/services/baseAuxilioEmergencialService';

interface AuxilioEmergencialFormProps {
  data: Partial<CreateBaseAuxilioEmergencial>;
  onChange: (field: string, value: string) => void;
}

const AuxilioEmergencialForm: React.FC<AuxilioEmergencialFormProps> = ({ data, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auxílio Emergencial</CardTitle>
        <CardDescription>
          Informações sobre auxílio emergencial recebido
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="uf">UF</Label>
          <Select value={data.uf || ''} onValueChange={(value) => onChange('uf', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
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
          <Label htmlFor="mes_disponibilizacao">Mês Disponibilização</Label>
          <Input
            id="mes_disponibilizacao"
            value={data.mes_disponibilizacao || ''}
            onChange={(e) => onChange('mes_disponibilizacao', e.target.value)}
            placeholder="Ex: 05/2020"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="enquadramento">Enquadramento</Label>
          <Input
            id="enquadramento"
            value={data.enquadramento || ''}
            onChange={(e) => onChange('enquadramento', e.target.value)}
            placeholder="Ex: EXTRACAD"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parcela">Parcela</Label>
          <Input
            id="parcela"
            value={data.parcela || ''}
            onChange={(e) => onChange('parcela', e.target.value)}
            placeholder="Ex: 2ª"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacao">Observação</Label>
          <Input
            id="observacao"
            value={data.observacao || ''}
            onChange={(e) => onChange('observacao', e.target.value)}
            placeholder="Ex: Pagamento bloqueado ou cancelado"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_beneficio">Valor Benefício</Label>
          <Input
            id="valor_beneficio"
            type="number"
            step="0.01"
            value={data.valor_beneficio || ''}
            onChange={(e) => onChange('valor_beneficio', e.target.value)}
            placeholder="Ex: 600.00"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AuxilioEmergencialForm;