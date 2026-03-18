
import React from 'react';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { Download, FileDown, Database, Import } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const PainelColeta = () => {
  const { user } = useAuth();
  const currentPlan = user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago";

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeaderCard 
        title="Painel de Coleta"
        subtitle="Coleta de Informações"
        currentPlan={currentPlan}
        isControlPanel={false}
      />

      {/* Ferramentas de Coleta */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Download de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Faça download de dados coletados em diferentes formatos
            </p>
            <Button className="w-full">
              <FileDown className="h-4 w-4 mr-2" />
              Iniciar Download
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Coleta de Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Colete informações diretamente da base de dados
            </p>
            <Button className="w-full" variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Acessar Base
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Import className="h-5 w-5 text-purple-600" />
              Importar Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Importe dados de arquivos externos
            </p>
            <Button className="w-full" variant="outline">
              <Import className="h-4 w-4 mr-2" />
              Importar Arquivo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PainelColeta;
