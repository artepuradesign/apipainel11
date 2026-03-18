
import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Users, Crown, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { initializeNewAccount } from '@/utils/balanceUtils';

interface WalletInfoCardProps {
  userBalance: number;
  currentPlan: string;
  formatBrazilianCurrency: (value: number) => string;
  detailedBalance?: { saldo: number; saldo_plano: number; total: number };
  isLoading?: boolean;
}

const AnimatedValue: React.FC<{ 
  targetValue: number; 
  formatFunction: (value: number) => string;
  triggerReset?: number;
}> = ({ 
  targetValue, 
  formatFunction,
  triggerReset = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Limpar animação anterior se existir
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    // Sempre começar do zero quando triggerReset muda
    setDisplayValue(0);

    if (targetValue === 0) {
      return;
    }

    // Animação mais suave
    const duration = 1500; // 1.5 segundos
    const steps = 80;
    const increment = targetValue / steps;
    const stepDuration = duration / steps;

    let currentValue = 0;
    let step = 0;

    animationRef.current = setInterval(() => {
      step++;
      
      // Função de easing para animação mais natural
      const progress = step / steps;
      const easedProgress = 1 - Math.pow(1 - progress, 2); // quadratic ease-out
      currentValue = targetValue * easedProgress;

      if (step >= steps) {
        setDisplayValue(targetValue);
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
      } else {
        setDisplayValue(currentValue);
      }
    }, stepDuration);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [targetValue, triggerReset]);

  return <span>{formatFunction(displayValue)}</span>;
};

const WalletInfoCard: React.FC<WalletInfoCardProps> = ({
  userBalance,
  currentPlan,
  formatBrazilianCurrency,
  detailedBalance,
  isLoading = false
}) => {
  const { user } = useAuth();
  const [planBalance, setPlanBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('=== WALLETINFOCARD USEEFFECT ===');
      console.log('detailedBalance recebido:', detailedBalance);
      console.log('userBalance prop:', userBalance);
      loadBalances();
    }
  }, [user, userBalance, detailedBalance]);

  const loadBalances = async () => {
    if (!user) return;

    // Se temos detailedBalance da API, usar esses valores
    if (detailedBalance) {
      console.log('WalletInfoCard - Usando dados da API:', detailedBalance);
      setWalletBalance(detailedBalance.saldo);
      setPlanBalance(detailedBalance.saldo_plano);
      
      // Carregar total recebido da API
      await loadTotalReceivedFromAPI();
      return;
    }

    // Fallback para localStorage se não temos dados da API
    console.log('WalletInfoCard - Fallback para localStorage');
    initializeNewAccount(user.id);
    
    const walletKey = `wallet_balance_${user.id}`;
    const planKey = `plan_balance_${user.id}`;
    
    const walletValue = localStorage.getItem(walletKey);
    const planValue = localStorage.getItem(planKey);
    
    const walletBal = parseFloat(walletValue || "0.00");
    const planBal = parseFloat(planValue || "0.00");
    
    console.log('WalletInfoCard - Usando localStorage:', { 
      walletBal, 
      planBal
    });
    
    setWalletBalance(walletBal);
    setPlanBalance(planBal);
    
    // Calcular total recebido do localStorage como fallback
    calculateTotalReceivedFromLocalStorage();
  };

  const loadTotalReceivedFromAPI = async () => {
    try {
      console.log('🔄 [WALLET_INFO] Carregando total recebido da API...');
      
      // Importar dynamicamente o walletApiService
      const { walletApiService } = await import('@/services/walletApiService');
      const response = await walletApiService.getTransactionHistory(parseInt(user!.id), 100);
      
      if (response.success && response.data) {
        // Somar apenas valores efetivamente pagos (PIX, cartão, PayPal) - EXCLUIR cupons/bônus
        const paidDepositsTotal = response.data
          .filter((t: any) => {
            console.log('🔍 [WALLET_INFO] Analisando transação:', {
              id: t.id,
              type: t.type,
              amount: t.amount,
              payment_method: t.payment_method,
              description: t.description
            });
            
            // Incluir APENAS transações que representam dinheiro real pago:
            // 1. Recargas via métodos de pagamento externos (PIX, cartão, PayPal) - NUNCA wallet
            if (t.type === 'recarga' && 
                t.payment_method && 
                ['pix', 'credit', 'paypal', 'transfer', 'crypto'].includes(t.payment_method.toLowerCase())) {
              console.log('✅ [WALLET_INFO] Incluindo recarga paga:', t.description);
              return true;
            }
            
            // 2. EXCLUIR todos os bônus, indicações e cupons (não são valores pagos)
            if (t.type === 'bonus' || t.type === 'indicacao') {
              console.log('❌ [WALLET_INFO] Excluindo bônus/cupom:', t.description);
              return false;
            }
            
            // 3. EXCLUIR entradas que vieram de wallet ou cupons
            if (t.type === 'entrada' && (
              t.payment_method === 'wallet' || 
              t.payment_method === 'cupom' ||
              !t.payment_method
            )) {
              console.log('❌ [WALLET_INFO] Excluindo entrada via wallet/cupom:', t.description);
              return false;
            }
            
            // 4. Incluir apenas entradas que vieram de pagamento externo real
            if (t.type === 'entrada' && 
                t.payment_method && 
                ['pix', 'credit', 'paypal', 'transfer', 'crypto'].includes(t.payment_method.toLowerCase())) {
              console.log('✅ [WALLET_INFO] Incluindo entrada paga externa:', t.description);
              return true;
            }
            
            // 5. EXCLUIR qualquer coisa relacionada a bônus por descrição
            if (t.description && (
              t.description.includes('Bônus') ||
              t.description.includes('indicação') ||
              t.description.includes('boas-vindas') ||
              t.description.includes('Cupom') ||
              t.description.includes('cupom')
            )) {
              console.log('❌ [WALLET_INFO] Excluindo bônus/cupom por descrição:', t.description);
              return false;
            }
            
            console.log('❌ [WALLET_INFO] Excluindo transação (não é pagamento):', t.description);
            return false;
          })
          .reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);
        
        console.log('✅ [WALLET_INFO] Total recebido calculado da API (apenas valores pagos):', paidDepositsTotal);
        setTotalReceived(paidDepositsTotal);
      } else {
        console.warn('⚠️ [WALLET_INFO] Erro na API, usando fallback');
        calculateTotalReceivedFromLocalStorage();
      }
    } catch (error) {
      console.error('❌ [WALLET_INFO] Erro ao carregar total da API:', error);
      calculateTotalReceivedFromLocalStorage();
    }
  };

  const calculateTotalReceivedFromLocalStorage = () => {
    if (!user) return;
    
    const transactions = JSON.parse(localStorage.getItem(`balance_transactions_${user.id}`) || "[]");
    const payments = JSON.parse(localStorage.getItem(`payment_history_${user.id}`) || "[]");
    
    // Filtrar apenas recargas externas (não via saldo da carteira)
    const transactionTotal = transactions
      .filter((t: any) => 
        (t.type === 'recharge' || t.type === 'credit') && 
        t.description.includes('Recarga') &&
        !t.description.includes('saldo da carteira')
      )
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    // Filtrar apenas pagamentos externos (não via wallet/saldo)
    const paymentTotal = payments
      .filter((p: any) => 
        p.status === 'success' && 
        p.type === 'Recarga' &&
        p.method !== 'wallet' &&
        !p.description?.includes('saldo da carteira')
      )
      .reduce((sum: number, p: any) => sum + p.amount, 0);
    
    const total = transactionTotal + paymentTotal;
    console.log('WalletInfoCard - Total recebido do localStorage (apenas depósitos externos):', total);
    setTotalReceived(total);
  };

  const handleRefresh = async () => {
    if (isRefreshing || !user) return;
    
    setIsRefreshing(true);
    
    try {
      console.log('WalletInfoCard - Refresh manual iniciado');
      
      // Recarregar saldos
      loadBalances();
      
      // Forçar recontagem das indicações
      loadReferralStats();
      
      // Incrementar o trigger para forçar animação dos valores
      setRefreshTrigger(prev => prev + 1);
      
      // Disparar evento para forçar animação em todos os componentes
      window.dispatchEvent(new CustomEvent('balanceUpdated', {
        detail: { 
          shouldAnimate: true,
          timestamp: Date.now()
        }
      }));
      
      toast.success("Dados atualizados!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
      console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  const totalAvailableBalance = walletBalance + planBalance;
  
  console.log('WalletInfoCard - RENDER com valores:', {
    walletBalance,
    planBalance,
    totalReceived,
    totalAvailableBalance,
    userBalanceProp: userBalance
  });

  // Carregar dados de indicações da API
  const [referralStats, setReferralStats] = useState({ totalReferrals: 0, totalEarnings: 0 });
  
  const loadReferralStats = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 [WALLET_INFO] Carregando indicações usando a mesma lógica da página Indique...');
      
      // Usar a mesma lógica da página /dashboard/indique
      const transactionsResponse = await import('@/services/walletApiService').then(module => 
        module.walletApiService.getTransactionHistory(parseInt(user.id), 100)
      );
      
      let apiReferralEarnings: any[] = [];
      
      if (transactionsResponse.success && transactionsResponse.data) {
        // Extrair dados de indicação das transações (igual à página indique)
        apiReferralEarnings = transactionsResponse.data
          .filter((t: any) => t.type === 'indicacao')
          .map((t: any) => {
            // Tentar extrair nome de diferentes padrões na descrição
            let referredName = 'Usuário indicado';
            
            console.log('🔍 [WALLET_INFO] Processando transação de indicação:', t.description);
            if (t.description) {
              // Padrão 1: "- Nome se cadastrou"
              let match = t.description.match(/- (.*?) se cadastrou/);
              if (!match) {
                // Padrão 2: "Nome se cadastrou"
                match = t.description.match(/(.*?) se cadastrou/);
              }
              if (!match) {
                // Padrão 3: "Bônus de indicação - Nome"
                match = t.description.match(/Bônus de indicação - (.*?)$/);
              }
              if (!match) {
                // Padrão 4: "Indicação de Nome"
                match = t.description.match(/Indicação de (.*?)$/);
              }
              
              if (match && match[1]) {
                referredName = match[1].trim();
              }
            }
            
            return {
              id: t.id?.toString() || Date.now().toString(),
              referrer_id: user.id,
              referred_user_id: t.id,
              amount: parseFloat(t.amount) || 5.0,
              created_at: t.created_at || new Date().toISOString(),
              status: 'paid',
              referred_name: referredName
            };
          });
        
        console.log('✅ [WALLET_INFO] Indicações extraídas:', apiReferralEarnings.length);
        console.log('🔍 [WALLET_INFO] Dados das indicações:', apiReferralEarnings);
        
        const totalReferrals = apiReferralEarnings.length;
        const totalEarnings = apiReferralEarnings.reduce((sum: number, ref: any) => sum + ref.amount, 0);
        
        console.log('✅ [WALLET_INFO] Totais calculados:', { 
          totalReferrals, 
          totalEarnings
        });
        
        setReferralStats({ totalReferrals, totalEarnings });
      } else {
        console.log('ℹ️ [WALLET_INFO] Nenhuma indicação encontrada na API');
        setReferralStats({
          totalReferrals: 0,
          totalEarnings: 0
        });
      }
    } catch (error) {
      console.error('❌ [WALLET_INFO] Erro ao carregar indicações:', error);
      // Em caso de erro, mostrar zeros
      setReferralStats({
        totalReferrals: 0,
        totalEarnings: 0
      });
    }
  };
  
  // Carregar indicações junto com os saldos
  useEffect(() => {
    if (user) {
      loadReferralStats();
    }
  }, [user, refreshTrigger]); // Adicionar refreshTrigger como dependência

  // Auto-refresh ao detectar mudanças de saldo
  useEffect(() => {
    const handleBalanceUpdate = () => {
      console.log('🔄 [WALLET_INFO] Evento de atualização detectado, recarregando dados...');
      loadReferralStats();
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    return () => window.removeEventListener('balanceUpdated', handleBalanceUpdate);
  }, [user]);

  const totalReceivedForDisplay = totalReceived;

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      <CardHeader className="p-3 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-brand-purple flex-shrink-0" />
            <CardTitle className="text-gray-800 dark:text-gray-100 text-base sm:text-lg truncate">
              Informações da Carteira
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-brand-purple/10 rounded-full flex-shrink-0"
          >
            <RefreshCw 
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-purple ${isRefreshing ? 'animate-spin' : ''}`} 
            />
          </Button>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
          Saldo digital separado do saldo do plano
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6 pt-0">
        {/* Detalhamento dos Saldos em Grid 2 colunas */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="bg-blue-50/80 dark:bg-blue-900/30 rounded-lg p-2.5 sm:p-4 border border-blue-200/60 dark:border-blue-700/60">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 truncate">Carteira</p>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
              <AnimatedValue 
                targetValue={walletBalance} 
                formatFunction={formatBrazilianCurrency}
                triggerReset={refreshTrigger}
              />
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">Para recarga e upgrades</p>
          </div>

          <div className="bg-purple-50/80 dark:bg-purple-900/30 rounded-lg p-2.5 sm:p-4 border border-purple-200/60 dark:border-purple-700/60">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400 truncate">Plano</p>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
              <AnimatedValue 
                targetValue={planBalance} 
                formatFunction={formatBrazilianCurrency}
                triggerReset={refreshTrigger}
              />
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">Para consultas</p>
          </div>

          <div className="bg-green-50/80 dark:bg-green-900/30 rounded-lg p-2.5 sm:p-4 border border-green-200/60 dark:border-green-700/60">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 truncate">Recargas</p>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300">
              <AnimatedValue 
                targetValue={totalReceivedForDisplay} 
                formatFunction={formatBrazilianCurrency}
                triggerReset={refreshTrigger}
              />
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">PIX, cartão e Paypal</p>
          </div>

          <div className="bg-orange-50/80 dark:bg-orange-900/30 rounded-lg p-2.5 sm:p-4 border border-orange-200/60 dark:border-orange-700/60">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400 truncate">Indicações</p>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-orange-700 dark:text-orange-300">
              <AnimatedValue 
                targetValue={referralStats.totalEarnings} 
                formatFunction={formatBrazilianCurrency}
                triggerReset={refreshTrigger}
              />
            </p>
            <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 text-[10px] sm:text-xs px-1.5 py-0">
                {referralStats.totalReferrals} válidas
              </Badge>
            </div>
          </div>
        </div>

        {/* Informação sobre como funciona - oculto em mobile */}
        <div className="hidden sm:block bg-blue-50/60 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/40 dark:border-blue-700/40">
          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">💡 Como funciona:</p>
          <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <p>• <strong>Recarga:</strong> Valor vai para a Carteira Digital</p>
            <p>• <strong>Upgrade de plano:</strong> Debita da Carteira e adiciona ao Plano</p>
            <p>• <strong>Consultas:</strong> Usa primeiro o Saldo do Plano, depois a Carteira</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletInfoCard;
