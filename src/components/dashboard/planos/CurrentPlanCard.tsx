
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CurrentPlanCardProps {
  currentPlan: string;
  planBalance: number;
  plans: any[];
}

const CurrentPlanCard = ({ currentPlan, planBalance, plans }: CurrentPlanCardProps) => {
  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-green-800 dark:text-green-300">Plano Atual</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{currentPlan}</p>
            {planBalance > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Saldo do Plano: R$ {planBalance.toFixed(2)}
              </p>
            )}
          </div>
          {plans.length > 0 && currentPlan !== plans[plans.length - 1]?.name && (
            <Button className="bg-brand-purple hover:bg-brand-darkPurple">
              Fazer Upgrade
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentPlanCard;
