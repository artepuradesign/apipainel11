
import React from 'react';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { Heart, Gift, Award, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const PainelBeneficios = () => {
  const { user } = useAuth();
  const currentPlan = user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago";

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeaderCard 
        title="Painel de Benéfícios"
        subtitle="Consultas de Benefícios"
        currentPlan={currentPlan}
        isControlPanel={false}
      />

      {/* Consultas de Benefícios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Benefícios Sociais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Consulte benefícios sociais disponíveis
            </p>
            <Button className="w-full">
              <Heart className="h-4 w-4 mr-2" />
              Consultar Benefícios
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-600" />
              Programas de Incentivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Programas governamentais e incentivos
            </p>
            <Button className="w-full" variant="outline">
              <Gift className="h-4 w-4 mr-2" />
              Ver Programas
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Auxílios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Consulte auxílios e ajudas governamentais
            </p>
            <Button className="w-full" variant="outline">
              <Award className="h-4 w-4 mr-2" />
              Consultar Auxílios
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PainelBeneficios;
