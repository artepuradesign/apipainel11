import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, CreditCard, Building, Calendar, Phone } from 'lucide-react';
import { formatCpf, formatCnpj, formatPhone, formatDateOfBirth } from '@/utils/formatters';
import { useLocale } from '@/contexts/LocaleContext';

interface UserData {
  full_name: string;
  email: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  cpf?: string;
  cnpj?: string;
  data_nascimento?: string;
  telefone?: string;
}

interface BasicInfoFormProps {
  userData: UserData;
  onInputChange: (field: string, value: string) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ userData, onInputChange }) => {
  const { locale } = useLocale();

  const t = {
    'pt-BR': {
      title: 'Informações Básicas',
      fullName: 'Nome Completo *',
      fullNamePlaceholder: 'Digite seu nome completo',
      email: 'E-mail',
      emailPlaceholder: 'Digite seu e-mail',
      emailLocked: 'E-mail não pode ser alterado',
      personType: 'Tipo de Pessoa',
      selectType: 'Selecione o tipo',
      individual: 'Pessoa Física',
      company: 'Pessoa Jurídica',
      birthDate: 'Data de Nascimento',
      birthDateHint: 'Digite ou cole a data (DD/MM/AAAA)',
      phone: 'Telefone',
    },
    en: {
      title: 'Basic Information',
      fullName: 'Full Name *',
      fullNamePlaceholder: 'Enter your full name',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      emailLocked: 'Email cannot be changed',
      personType: 'Person Type',
      selectType: 'Select type',
      individual: 'Individual',
      company: 'Company',
      birthDate: 'Birth Date',
      birthDateHint: 'Type or paste date (DD/MM/YYYY)',
      phone: 'Phone',
    },
    es: {
      title: 'Información Básica',
      fullName: 'Nombre Completo *',
      fullNamePlaceholder: 'Ingresa tu nombre completo',
      email: 'Correo electrónico',
      emailPlaceholder: 'Ingresa tu correo',
      emailLocked: 'El correo no se puede cambiar',
      personType: 'Tipo de Persona',
      selectType: 'Selecciona el tipo',
      individual: 'Persona Física',
      company: 'Persona Jurídica',
      birthDate: 'Fecha de Nacimiento',
      birthDateHint: 'Escribe o pega la fecha (DD/MM/AAAA)',
      phone: 'Teléfono',
    },
  }[locale];

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    onInputChange('cpf', formatted);
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnpj(e.target.value);
    onInputChange('cnpj', formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onInputChange('telefone', formatted);
  };

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (value.length > 8 && !value.includes('/')) {
      if (value.includes('-') && value.length === 10) {
        const [year, month, day] = value.split('-');
        value = `${day}/${month}/${year}`;
      } else if (value.length === 8) {
        value = value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
      }
    } else {
      value = formatDateOfBirth(value);
    }

    onInputChange('data_nascimento', value);
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="full_name" className="text-sm">{t.fullName}</Label>
            <Input
              id="full_name"
              value={userData.full_name || ''}
              onChange={(e) => onInputChange('full_name', e.target.value)}
              placeholder={t.fullNamePlaceholder}
              className="text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-sm">{t.email}</Label>
            <Input
              id="email"
              type="email"
              value={userData.email || ''}
              readOnly
              className="bg-muted cursor-not-allowed text-sm sm:text-base"
              placeholder={t.emailPlaceholder}
            />
            <p className="text-xs text-muted-foreground">{t.emailLocked}</p>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="tipo_pessoa" className="text-sm">{t.personType}</Label>
            <Select
              value={userData.tipo_pessoa || 'fisica'}
              onValueChange={(value: 'fisica' | 'juridica') => onInputChange('tipo_pessoa', value)}
            >
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder={t.selectType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fisica">{t.individual}</SelectItem>
                <SelectItem value="juridica">{t.company}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {userData.tipo_pessoa === 'fisica' ? (
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="cpf" className="text-sm">CPF</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cpf"
                  value={userData.cpf || ''}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className="pl-10 text-sm sm:text-base"
                  maxLength={14}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="cnpj" className="text-sm">CNPJ</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cnpj"
                  value={userData.cnpj || ''}
                  onChange={handleCnpjChange}
                  placeholder="00.000.000/0000-00"
                  className="pl-10 text-sm sm:text-base"
                  maxLength={18}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="data_nascimento" className="text-sm">{t.birthDate}</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="data_nascimento"
                type="text"
                value={userData.data_nascimento || ''}
                onChange={handleDateOfBirthChange}
                placeholder="DD/MM/AAAA"
                className="pl-10 text-sm sm:text-base"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-muted-foreground">{t.birthDateHint}</p>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="telefone" className="text-sm">{t.phone}</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="telefone"
                value={userData.telefone || ''}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                className="pl-10 text-sm sm:text-base"
                maxLength={15}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoForm;
