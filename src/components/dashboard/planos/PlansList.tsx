
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import EmptyState from '@/components/ui/empty-state';

interface PlansListProps {
  plans: any[];
  currentPlan: string;
  userBalance: number;
  onPlanActivation: (planName: string, useWallet: boolean) => void;
  getPlanPrice: (planName: string) => number;
}

const PlansList = ({ 
  plans, 
  currentPlan, 
  userBalance, 
  onPlanActivation, 
  getPlanPrice 
}: PlansListProps) => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Planos Disponíveis</CardTitle>
      </CardHeader>
      <CardContent>
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                <p className="text-lg font-bold mt-2">{plan.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4">
            <EmptyState 
              icon={AlertCircle}
              title="Nenhum plano configurado"
              description="Os planos serão exibidos quando configurados pela administração"
              className="justify-center"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlansList;
