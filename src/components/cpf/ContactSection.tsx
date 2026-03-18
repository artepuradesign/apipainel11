import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from 'lucide-react';
import { formatCep, formatPhone } from '@/utils/formatters';
import { BaseCpf } from '@/services/baseCpfService';

interface ContactSectionProps {
  dadosBasicos: Partial<BaseCpf>;
  onInputChange: (field: string, value: string | number) => void;
  onCepChange: (cep: string) => Promise<void>;
  numeroRef: React.RefObject<HTMLInputElement>;
}

const ContactSection = ({ dadosBasicos, onInputChange, onCepChange, numeroRef }: ContactSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contato - Email
          </CardTitle>
          <CardDescription>
            Informações de contato por email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={dadosBasicos.email || ''}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha_email">Senha Email</Label>
              <Input
                id="senha_email"
                type="password"
                value={dadosBasicos.senha_email || ''}
                onChange={(e) => onInputChange('senha_email', e.target.value)}
                placeholder="Senha do email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_pessoal">Email Pessoal</Label>
              <Input
                id="email_pessoal"
                type="email"
                value={dadosBasicos.email_pessoal || ''}
                onChange={(e) => onInputChange('email_pessoal', e.target.value)}
                placeholder="email.pessoal@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_score">Email Score</Label>
              <Input
                id="email_score"
                value={dadosBasicos.email_score || ''}
                onChange={(e) => onInputChange('email_score', e.target.value)}
                placeholder="Score do email"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phone Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contato - Telefone
          </CardTitle>
          <CardDescription>
            Informações de contato telefônico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={dadosBasicos.telefone || ''}
                onChange={(e) => onInputChange('telefone', formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </CardTitle>
          <CardDescription>
            Endereço residencial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={dadosBasicos.cep || ''}
                onChange={(e) => onCepChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logradouro">Logradouro</Label>
              <Input
                id="logradouro"
                value={dadosBasicos.logradouro || ''}
                onChange={(e) => onInputChange('logradouro', e.target.value)}
                placeholder="Rua, Avenida, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                ref={numeroRef}
                value={dadosBasicos.numero || ''}
                onChange={(e) => onInputChange('numero', e.target.value)}
                placeholder="123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={dadosBasicos.complemento || ''}
                onChange={(e) => onInputChange('complemento', e.target.value)}
                placeholder="Apto, Bloco, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={dadosBasicos.bairro || ''}
                onChange={(e) => onInputChange('bairro', e.target.value)}
                placeholder="Nome do bairro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={dadosBasicos.cidade || ''}
                onChange={(e) => onInputChange('cidade', e.target.value)}
                placeholder="Nome da cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uf_endereco">UF</Label>
              <Input
                id="uf_endereco"
                value={dadosBasicos.uf_endereco || ''}
                onChange={(e) => onInputChange('uf_endereco', e.target.value)}
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactSection;