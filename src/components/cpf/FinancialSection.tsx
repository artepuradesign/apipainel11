import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from 'lucide-react';
import { BaseCpf } from '@/services/baseCpfService';

interface FinancialSectionProps {
  dadosBasicos: Partial<BaseCpf>;
  onInputChange: (field: string, value: string | number) => void;
}

const FinancialSection = ({ dadosBasicos, onInputChange }: FinancialSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Dados Financeiros
        </CardTitle>
        <CardDescription>
          Informações sobre renda e poder aquisitivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="poder_aquisitivo">Poder Aquisitivo</Label>
            <Select
              value={dadosBasicos.poder_aquisitivo || ''}
              onValueChange={(value) => onInputChange('poder_aquisitivo', value.toUpperCase())}
            >
              <SelectTrigger>
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Classe A</SelectItem>
                <SelectItem value="B">Classe B</SelectItem>
                <SelectItem value="C">Classe C</SelectItem>
                <SelectItem value="D">Classe D</SelectItem>
                <SelectItem value="E">Classe E</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="renda">Renda</Label>
            <Input
              id="renda"
              value={dadosBasicos.renda || ''}
              onChange={(e) => onInputChange('renda', e.target.value.toUpperCase())}
              placeholder="Faixa de renda"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fx_poder_aquisitivo">Faixa Poder Aquisitivo</Label>
            <Input
              id="fx_poder_aquisitivo"
              value={dadosBasicos.fx_poder_aquisitivo || ''}
              onChange={(e) => onInputChange('fx_poder_aquisitivo', e.target.value.toUpperCase())}
              placeholder="Faixa detalhada"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="csb8">CSB8</Label>
            <Input
              id="csb8"
              type="number"
              value={dadosBasicos.csb8 || ''}
              onChange={(e) => onInputChange('csb8', e.target.value ? Number(e.target.value) : '')}
              placeholder="Score CSB8"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="csba">CSBA</Label>
            <Input
              id="csba"
              type="number"
              value={dadosBasicos.csba || ''}
              onChange={(e) => onInputChange('csba', e.target.value ? Number(e.target.value) : '')}
              placeholder="Score CSBA"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSection;