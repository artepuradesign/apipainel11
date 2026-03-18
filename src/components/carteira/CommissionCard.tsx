import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, GiftIcon, Coins, TrendingUp, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getReferralStats } from '@/utils/referralSystem';
import { getBalanceTransactions } from '@/utils/balanceUtils';
import { useReferralConfig } from '@/hooks/useReferralConfig';

const CommissionCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { config } = useReferralConfig();
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalBonusEarned: 0,
    totalCommissionsEarned: 0
  });

  useEffect(() => {
    if (user) {
      const stats = getReferralStats(user.id);
      setReferralStats(stats);
    }
  }, [user]);

  // Obter comissões pendentes e coletadas das transações reais
  const getCommissionTransactions = () => {
    if (!user) return { pending: [], collected: [] };
    
    const transactions = getBalanceTransactions(user.id);
    const commissionTransactions = transactions.filter((t: any) => 
      t.description.includes('Comissão') && t.type === 'credit' && t.balance_type === 'wallet'
    );
    
    // Simular algumas comissões como "pendentes" para demonstração
    // Na vida real, isso viria de um sistema de comissões mais complexo
    const collected = commissionTransactions.map((t: any) => ({
      id: t.id,
      amount: t.amount,
      description: t.description,
      date: new Date(t.date).toLocaleDateString('pt-BR'),
      collected: true
    }));
    
    return { pending: [], collected };
  };

  const { pending: pendingCommissions, collected: collectedCommissions } = getCommissionTransactions();
  const totalPending = pendingCommissions.reduce((sum: number, comm: any) => sum + comm.amount, 0);
  const totalCollected = referralStats.totalCommissionsEarned;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Sistema de Indicações - Novo Modelo
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Bônus de Cadastro
              </span>
            </div>
            <p className="text-xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(referralStats.totalBonusEarned)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              No saldo do plano (não sacável)
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Comissões de Recarga
              </span>
            </div>
            <p className="text-xl font-bold text-blue-800 dark:text-blue-200">
              {formatCurrency(totalCollected)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Na carteira digital (sacável)
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Indicações Ativas
              </span>
            </div>
            <p className="text-xl font-bold text-purple-800 dark:text-purple-200">
              {referralStats.completedReferrals}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Gerando {config.referral_commission_percentage}% por recarga
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">💡 Novo Sistema Simplificado</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-800 dark:text-blue-200">🎁 Bônus de Cadastro</h5>
                <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• {formatCurrency(config.referral_bonus_amount)} para você</li>
                  <li>• {formatCurrency(config.referral_bonus_amount)} para o indicado</li>
                  <li>• Vai direto para o saldo do plano</li>
                  <li>• Não pode ser sacado (apenas usado)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-green-800 dark:text-green-200">💰 Comissão de Recarga</h5>
                <ul className="text-green-700 dark:text-green-300 space-y-1">
                  <li>• {config.referral_commission_percentage}% de cada recarga</li>
                  <li>• Vai para sua carteira digital</li>
                  <li>• Pode ser sacado via PIX</li>
                  <li>• Vitalício para indicações ativas</li>
                </ul>
              </div>
            </div>
          </div>

          {collectedCommissions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">💸 Comissões Recebidas</h4>
              {collectedCommissions.slice(0, 5).map((commission: any) => (
                <div key={commission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">{commission.description}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{commission.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                    {formatCurrency(commission.amount)} ✓
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {referralStats.totalReferrals === 0 && (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                Nenhuma indicação ainda
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Comece a indicar amigos e ganhe {formatCurrency(config.referral_bonus_amount)} + {config.referral_commission_percentage}% de comissão vitalícia!
              </p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/dashboard/indique')}
              >
                Começar a Indicar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommissionCard;