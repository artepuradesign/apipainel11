import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Mail, User } from 'lucide-react';
import { baseSenhaCpfService, BaseSenhaCpf } from '@/services/baseSenhaCpfService';
import { baseSenhaEmailService, BaseSenhaEmail } from '@/services/baseSenhaEmailService';

interface SenhasSectionProps {
  cpfId: number;
}

const SenhasSection: React.FC<SenhasSectionProps> = ({ cpfId }) => {
  const [senhasCpf, setSenhasCpf] = useState<BaseSenhaCpf[]>([]);
  const [senhasEmail, setSenhasEmail] = useState<BaseSenhaEmail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSenhas();
  }, [cpfId]);

  const loadSenhas = async () => {
    setLoading(true);
    try {
      const [cpfResponse, emailResponse] = await Promise.all([
        baseSenhaCpfService.getByCpfId(cpfId),
        baseSenhaEmailService.getByCpfId(cpfId)
      ]);
      setSenhasCpf(cpfResponse.success && cpfResponse.data ? cpfResponse.data : []);
      setSenhasEmail(emailResponse.success && emailResponse.data ? emailResponse.data : []);
    } catch (error) {
      console.error('Erro ao carregar senhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label: string, value: any) => {
    const displayValue = value || '-';
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <p className="text-sm font-mono">{displayValue}</p>
      </div>
    );
  };

  const renderSenhasCpf = () => {
    if (senhasCpf.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          <Key className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm">Nenhuma senha de CPF encontrada</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {senhasCpf.map((senha) => (
          <div key={senha.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-destructive/5">
            {renderField('CPF', senha.cpf || '-')}
            {renderField('Senha', senha.senha || '••••••••')}
          </div>
        ))}
      </div>
    );
  };

  const renderSenhasEmail = () => {
    if (senhasEmail.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm">Nenhuma senha de email encontrada</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {senhasEmail.map((senha) => (
          <div key={senha.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-destructive/5">
            {renderField('Email', senha.email || '-')}
            {renderField('Senha', senha.senha || '••••••••')}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Key className="h-5 w-5" />
            Senhas Vazadas
          </CardTitle>
          <CardDescription>Carregando senhas vazadas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSenhas = senhasCpf.length + senhasEmail.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
          <Key className="h-5 w-5" />
          Senhas Vazadas
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          {totalSenhas === 0 ? (
            <span className="text-green-600 dark:text-green-400">✓ Nenhuma senha vazada encontrada</span>
          ) : (
            <span className="text-destructive">⚠ {totalSenhas} senha(s) vazada(s) encontrada(s)</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cpf" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cpf" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Senhas de CPF ({senhasCpf.length})
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Senhas de Email ({senhasEmail.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="cpf" className="mt-4">
            {renderSenhasCpf()}
          </TabsContent>
          <TabsContent value="email" className="mt-4">
            {renderSenhasEmail()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SenhasSection;
