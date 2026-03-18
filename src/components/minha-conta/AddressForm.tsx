import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface UserData {
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

interface AddressFormProps {
  userData: UserData;
  onInputChange: (field: string, value: string) => void;
  onCepChange: (cep: string) => void;
  loadingCep: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ 
  userData, 
  onInputChange, 
  onCepChange, 
  loadingCep 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-brand-purple" />
          Endereço
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={userData.cep || ''}
              onChange={(e) => onCepChange(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              disabled={loadingCep}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={userData.endereco || ''}
              onChange={(e) => onInputChange('endereco', e.target.value)}
              placeholder="Rua, Avenida, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input
              id="numero"
              value={userData.numero || ''}
              onChange={(e) => onInputChange('numero', e.target.value)}
              placeholder="123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              value={userData.bairro || ''}
              onChange={(e) => onInputChange('bairro', e.target.value)}
              placeholder="Centro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={userData.cidade || ''}
              onChange={(e) => onInputChange('cidade', e.target.value)}
              placeholder="São Paulo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">UF</Label>
            <Input
              id="estado"
              value={userData.estado || ''}
              onChange={(e) => onInputChange('estado', e.target.value.toUpperCase())}
              placeholder="SP"
              maxLength={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressForm;