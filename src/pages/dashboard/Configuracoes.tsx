
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import SystemSettings from '@/components/configuracoes/SystemSettings';
import FinancialSettings from '@/components/configuracoes/FinancialSettings';
import DatabaseSettings from '@/components/configuracoes/DatabaseSettings';
import ApiConnection from '@/components/configuracoes/ApiConnection';
import ApiManual from '@/components/configuracoes/ApiManual';
import SupportUserManagement from '@/components/configuracoes/SupportUserManagement';
import ReferralSystemManagement from '@/components/configuracoes/ReferralSystemManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Configuracoes = () => {
  const { isSupport } = useAuth();

  // Apenas usuários de suporte podem acessar as configurações do sistema
  if (!isSupport) {
    return <Navigate to="/dashboard/minha-conta" replace />;
  }

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Configurações do Sistema" 
        subtitle="Configurações administrativas e do sistema"
      />

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="database">Banco de Dados</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="management">Gerenciamento</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <FinancialSettings />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseSettings />
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <ApiConnection />
          <ApiManual />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <SupportUserManagement />
          <ReferralSystemManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
