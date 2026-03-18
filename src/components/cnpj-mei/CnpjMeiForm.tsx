import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from 'lucide-react';
import { CreateBaseCnpjMei } from '@/services/baseCnpjMeiService';

interface CnpjMeiFormProps {
  cnpjMeiData: Partial<CreateBaseCnpjMei>;
  onInputChange: (field: string, value: string | number) => void;
}

const CnpjMeiForm: React.FC<CnpjMeiFormProps> = ({ cnpjMeiData, onInputChange }) => {
  const handleInputChange = (field: string, value: string) => {
    // Para campos numéricos, converter para número se não estiver vazio
    if (field === 'capital_social') {
      const numericValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
      onInputChange(field, numericValue ? parseFloat(numericValue) : value);
    } else if (field === 'cnpj' || field === 'natureza_juridica' || field === 'qualificacao' || field === 'porte_empresa') {
      // Campos numéricos mantêm números
      onInputChange(field, value);
    } else {
      // Campos de texto convertem para maiúsculas
      onInputChange(field, value.toUpperCase());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
          <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
          CNPJ MEI
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Informações sobre CNPJ e MEI vinculados ao CPF
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={cnpjMeiData.cnpj || ''}
              onChange={(e) => handleInputChange('cnpj', e.target.value)}
              placeholder="Ex: 43880941000170"
              className="placeholder:text-sm"
              maxLength={20}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="razao_social">Razão Social</Label>
            <Input
              id="razao_social"
              value={cnpjMeiData.razao_social || ''}
              onChange={(e) => handleInputChange('razao_social', e.target.value)}
              placeholder="Ex: LEONARDO BARCELLOS SILVEIRA RIBEIRO DE GOUVEA 35210414841"
              className="placeholder:text-sm"
              maxLength={255}
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div>
            <Label htmlFor="natureza_juridica">Natureza Jurídica</Label>
            <Input
              id="natureza_juridica"
              value={cnpjMeiData.natureza_juridica || ''}
              onChange={(e) => handleInputChange('natureza_juridica', e.target.value)}
              placeholder="Ex: 2135"
              className="placeholder:text-sm"
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="qualificacao">Qualificação</Label>
            <Input
              id="qualificacao"
              value={cnpjMeiData.qualificacao || ''}
              onChange={(e) => handleInputChange('qualificacao', e.target.value)}
              placeholder="Ex: 50"
              className="placeholder:text-sm"
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="capital_social">Capital Social</Label>
            <Input
              id="capital_social"
              value={cnpjMeiData.capital_social || ''}
              onChange={(e) => handleInputChange('capital_social', e.target.value)}
              placeholder="Ex: 50000,00"
              className="placeholder:text-sm"
              type="text"
            />
          </div>

          <div>
            <Label htmlFor="porte_empresa">Porte Empresa</Label>
            <Input
              id="porte_empresa"
              value={cnpjMeiData.porte_empresa || ''}
              onChange={(e) => handleInputChange('porte_empresa', e.target.value)}
              placeholder="Ex: 01"
              className="placeholder:text-sm"
              maxLength={5}
            />
          </div>

          <div>
            <Label htmlFor="ente_federativo">Ente Federativo Responsável</Label>
            <Input
              id="ente_federativo"
              value={cnpjMeiData.ente_federativo || ''}
              onChange={(e) => handleInputChange('ente_federativo', e.target.value)}
              placeholder="Ex: SEM RESULTADO ou nome do ente"
              className="placeholder:text-sm"
              maxLength={100}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CnpjMeiForm;