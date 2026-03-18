
import React from 'react';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { DollarSign, CreditCard, Receipt, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const PainelBancos = () => {
  const { user } = useAuth();
  const currentPlan = user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago";

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeaderCard 
        title="Painel Bancos Digitais"
        subtitle="Pagamentos PIX, Comprovante e Extrato"
        currentPlan={currentPlan}
        isControlPanel={false}
      />

      {/* Serviços Bancários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Pagamentos PIX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Realize pagamentos via PIX de forma rápida e segura
            </p>
            <Button className="w-full">
              <DollarSign className="h-4 w-4 mr-2" />
              Fazer PIX
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Comprovantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gere e baixe comprovantes de pagamento
            </p>
            <Button className="w-full" variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              Ver Comprovantes
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Extrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Acesse seu extrato bancário completo
            </p>
            <Button className="w-full" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Ver Extrato
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PainelBancos;
