
import React from 'react';
import { History, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ModernRecentRecharges: React.FC = () => {
  const { user } = useAuth();

  const getRechargeHistory = () => {
    if (!user) return [];
    
    try {
      // Get from balance transactions (new system)
      const transactions = JSON.parse(localStorage.getItem(`balance_transactions_${user.id}`) || "[]");
      const rechargeTransactions = transactions
        .filter((item: any) => item.type === 'recharge' || (item.type === 'credit' && item.description.includes('Recarga')))
        .slice(0, 6)
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

  if (rechargeHistory.length === 0) {
    return (
      <div className="dashboard-card rounded-3xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-brand-purple/20 to-brand-purple/10 rounded-full flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-brand-purple" />
        </div>
        <h3 className="text-xl font-semibold dashboard-text-primary mb-2">
          Primeira recarga?
        </h3>
        <p className="dashboard-text-muted">
          Suas recargas aparecerão aqui para facilitar futuras transações
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-card rounded-3xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-purple/10 to-brand-purple/5 p-6 dashboard-border border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-purple/20 rounded-xl flex items-center justify-center">
            <History className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <h3 className="text-xl font-bold dashboard-text-primary">
              Últimas Recargas
            </h3>
            <p className="text-sm dashboard-text-muted">
              Histórico das suas {rechargeHistory.length} últimas transações
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {rechargeHistory.map((recharge, index) => (
            <div 
              key={`${recharge.id || index}-${recharge.date}`}
              className="group flex items-center justify-between p-4 dashboard-card rounded-2xl hover:border-brand-purple/50 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                
                <div>
                  <div className="font-semibold dashboard-text-primary">
                    {recharge.document}
                  </div>
                  <div className="flex items-center space-x-2 text-sm dashboard-text-muted">
                    <Calendar className="w-3 h-3" />
                    <span>{recharge.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  + R$ {recharge.amount.toFixed(2)}
                </div>
                <div className="text-xs dashboard-text-muted">
                  Crédito
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {rechargeHistory.length >= 6 && (
          <div className="mt-6 text-center">
            <button className="text-sm text-brand-purple hover:text-brand-darkPurple font-medium transition-colors duration-200">
              Ver todas as recargas →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernRecentRecharges;
