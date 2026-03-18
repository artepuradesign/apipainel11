
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CreditCard, Shield, RefreshCw } from 'lucide-react';
import { useUserDataApi } from '@/hooks/useUserDataApi';
import { Button } from '@/components/ui/button';

interface BalancePlanProps {
  userData: {
    saldo: number;
    saldo_plano: number;
    tipoplano: string;
  };
}

const BalancePlan: React.FC<BalancePlanProps> = ({ userData: fallbackUserData }) => {
  const { balance, userData: apiUserData, isLoading, loadBalance } = useUserDataApi();
  const [displayData, setDisplayData] = useState(fallbackUserData);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Usar dados da API quando disponíveis, senão usar dados de fallback
  useEffect(() => {
    if (balance && apiUserData) {
      setDisplayData({
        saldo: balance.saldo,
        saldo_plano: balance.saldo_plano,
        tipoplano: apiUserData.tipoplano || fallbackUserData.tipoplano
      });
    }
  }, [balance, apiUserData, fallbackUserData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-brand-purple" />
            Saldo e Plano
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadBalance}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
          <Wallet className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Disponível</p>
            <p className="font-bold text-lg text-green-600">{formatCurrency(displayData.saldo)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
          <CreditCard className="h-8 w-8 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Saldo do Plano</p>
            <p className="font-bold text-lg text-blue-600">{formatCurrency(displayData.saldo_plano)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
          <Shield className="h-8 w-8 text-purple-600" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tipo de Plano</p>
            <p className="font-bold text-lg text-purple-600">{displayData.tipoplano}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalancePlan;
