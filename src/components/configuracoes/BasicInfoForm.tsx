
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Calendar, CreditCard } from 'lucide-react';

interface BasicInfoFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
  onCpfChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfoForm = ({ formData, onInputChange, onCpfChange, onPhoneChange }: BasicInfoFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="login">Login</Label>
            <Input
              id="login"
              value={formData.login}
              onChange={(e) => onInputChange('login', e.target.value)}
              placeholder="Digite seu login"
            />
          </div>
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="Digite seu e-mail"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="full_name">Nome Completo</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => onInputChange('full_name', e.target.value)}
            placeholder="Digite seu nome completo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cpf" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              CPF
            </Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={onCpfChange}
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>
          <div>
            <Label htmlFor="data_nascimento" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data de Nascimento
            </Label>
            <Input
              id="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => onInputChange('data_nascimento', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="telefone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Telefone
          </Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={onPhoneChange}
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoForm;
