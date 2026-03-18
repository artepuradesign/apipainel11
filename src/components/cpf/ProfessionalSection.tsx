import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase } from 'lucide-react';
import { BaseCpf } from '@/services/baseCpfService';

interface ProfessionalSectionProps {
  dadosBasicos: Partial<BaseCpf>;
  onInputChange: (field: string, value: string | number) => void;
}

const ProfessionalSection = ({ dadosBasicos, onInputChange }: ProfessionalSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Dados Profissionais
        </CardTitle>
        <CardDescription>
          Informações sobre trabalho e profissão
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="aposentado">Aposentado</Label>
            <Select
              value={dadosBasicos.aposentado || ''}
              onValueChange={(value) => onInputChange('aposentado', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIM">Sim</SelectItem>
                <SelectItem value="NAO">Não</SelectItem>
                <SelectItem value="DESCONHECIDO">Desconhecido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_emprego">Tipo de Emprego</Label>
            <Select
              value={dadosBasicos.tipo_emprego || ''}
              onValueChange={(value) => onInputChange('tipo_emprego', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLT">CLT</SelectItem>
                <SelectItem value="AUTONOMO">Autônomo</SelectItem>
                <SelectItem value="FUNCIONARIO_PUBLICO">Funcionário Público</SelectItem>
                <SelectItem value="EMPRESARIO">Empresário</SelectItem>
                <SelectItem value="APOSENTADO">Aposentado</SelectItem>
                <SelectItem value="DESEMPREGADO">Desempregado</SelectItem>
                <SelectItem value="ESTUDANTE">Estudante</SelectItem>
                <SelectItem value="OUTROS">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cbo">CBO</Label>
            <Input
              id="cbo"
              value={dadosBasicos.cbo || ''}
              onChange={(e) => onInputChange('cbo', e.target.value)}
              placeholder="Classificação Brasileira de Ocupações"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalSection;