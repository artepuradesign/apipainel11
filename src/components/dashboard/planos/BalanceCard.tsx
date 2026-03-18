
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BalanceCardProps {
  userBalance: number;
  planBalance: number;
}

const BalanceCard = ({ userBalance, planBalance }: BalanceCardProps) => {
  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300">Saldo Disponível</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Total disponível para uso
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-2xl text-blue-600 dark:text-blue-400">
              R$ {(userBalance + planBalance).toFixed(2)}
            </div>
            <div className="text-xs text-blue-500 dark:text-blue-300 mt-1">
              <div>Carteira: R$ {userBalance.toFixed(2)}</div>
              <div>Plano: R$ {planBalance.toFixed(2)}</div>
            </div>
            <Link to="/dashboard/adicionar-saldo">
              <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                Adicionar Saldo
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
