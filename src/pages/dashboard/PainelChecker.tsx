
import React from 'react';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { BarChart, TrendingUp, Activity, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const PainelChecker = () => {
  const { user } = useAuth();
  const currentPlan = user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago";

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeaderCard 
        title="Painel de Consulta com Checker"
        subtitle="Consultas com Checker"
        currentPlan={currentPlan}
        isControlPanel={false}
      />

      {/* Ferramentas de Checker */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              Análise de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Analise dados com gráficos e relatórios detalhados
            </p>
            <Button className="w-full">
              <BarChart className="h-4 w-4 mr-2" />
              Analisar Dados
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Tendências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Visualize tendências e padrões nos dados
            </p>
            <Button className="w-full" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Ver Tendências
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Monitoramento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Monitore atividades em tempo real
            </p>
            <Button className="w-full" variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Monitorar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PainelChecker;
