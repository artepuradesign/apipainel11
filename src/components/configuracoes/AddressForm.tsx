
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface AddressFormProps {
  formData: {
    cep: string;
    endereco: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    status: string;
  };
  onInputChange: (field: string, value: string) => void;
  onCepChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loadingCep: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  formData,
  onInputChange,
  onCepChange,
  loadingCep
}) => {
  const isPendingStatus = formData.status === 'pendente';

  return (
    <Card className="bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Endereço
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cep">
              CEP {isPendingStatus && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
              <Input
                id="cep"
                value={formData.cep}
                onChange={onCepChange}
                placeholder="00000-000"
                maxLength={9}
                className={`bg-white dark:bg-gray-900 dark:border-gray-600 ${isPendingStatus && !formData.cep ? 'border-red-300' : ''}`}
              />
              {loadingCep && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="endereco">
              Endereço {isPendingStatus && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => onInputChange('endereco', e.target.value)}
              placeholder="Rua, Avenida..."
              className={`bg-white dark:bg-gray-900 dark:border-gray-600 ${isPendingStatus && !formData.endereco ? 'border-red-300' : ''}`}
            />
          </div>
          <div>
            <Label htmlFor="numero">
              Número {isPendingStatus && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e) => onInputChange('numero', e.target.value)}
              placeholder="123"
              className={`bg-white dark:bg-gray-900 dark:border-gray-600 ${isPendingStatus && !formData.numero ? 'border-red-300' : ''}`}
            />
          </div>
          <div>
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              value={formData.bairro}
              onChange={(e) => onInputChange('bairro', e.target.value)}
              placeholder="Nome do bairro"
              className="bg-white dark:bg-gray-900 dark:border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={formData.cidade}
              onChange={(e) => onInputChange('cidade', e.target.value)}
              placeholder="Nome da cidade"
              className="bg-white dark:bg-gray-900 dark:border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              value={formData.estado}
              onChange={(e) => onInputChange('estado', e.target.value)}
              placeholder="UF"
              maxLength={2}
              className="bg-white dark:bg-gray-900 dark:border-gray-600"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressForm;
