
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { History, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const RecentRecharges: React.FC = () => {
  const { user } = useAuth();

  // Get recharge history from localStorage based on user ID
  const getRechargeHistory = () => {
    if (!user) return [];
    
    try {
      // Get from balance transactions (new system)
      const transactions = JSON.parse(localStorage.getItem(`balance_transactions_${user.id}`) || "[]");
      const rechargeTransactions = transactions
        .filter((item: any) => item.type === 'recharge' || (item.type === 'credit' && item.description.includes('Recarga')))
        .slice(0, 10)
        .map((item: any) => ({
          ...item,
          date: new Date(item.date || item.created_at).toLocaleDateString('pt-BR'),
          amount: item.amount,
          document: item.description
        }));

      return rechargeTransactions;
    } catch (error) {
      console.error('Erro ao carregar histórico de recargas:', error);
      return [];
    }
  };

  const rechargeHistory = getRechargeHistory();

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <History className="h-5 w-5 text-brand-purple" />
          <span>Últimas Recargas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rechargeHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {rechargeHistory.map((recharge, index) => (
              <div key={`${recharge.id || index}-${recharge.date}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {recharge.document}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {recharge.date}
                  </p>
                </div>
                <div className="text-sm font-semibold text-green-600 ml-2 flex-shrink-0">
                  + R$ {recharge.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma recarga ainda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentRecharges;
