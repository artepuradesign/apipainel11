import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getWalletBalance, getPlanBalance, initializeNewAccount } from '@/utils/balanceUtils';
import { useAuth } from '@/contexts/AuthContext';

interface StaticBalanceProps {
  onRefresh?: () => void;
}

const StaticBalance: React.FC<StaticBalanceProps> = ({ onRefresh }) => {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useAuth();

  const formatBrazilianCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const calculateTotalAvailableBalance = () => {
    if (!user) {
      console.log('StaticBalance - Usuário não logado');
      return 0;
    }
    
    try {
      initializeNewAccount(user.id);
      
      const walletKey = `wallet_balance_${user.id}`;
      const planKey = `plan_balance_${user.id}`;
      
      // Forçar leitura direta do localStorage para garantir valores mais recentes
      const walletValue = localStorage.getItem(walletKey);
      const planValue = localStorage.getItem(planKey);
      
      const walletBalance = walletValue ? parseFloat(walletValue) : 0;
      const planBalance = planValue ? parseFloat(planValue) : 0;
      
      const validWallet = isNaN(walletBalance) ? 0 : walletBalance;
      const validPlan = isNaN(planBalance) ? 0 : planBalance;
      
      const totalAvailable = validWallet + validPlan;
      
      console.log('StaticBalance - Saldo calculado:', {
        walletBalance: validWallet,
        planBalance: validPlan,
        totalAvailable,
        timestamp: new Date().toISOString()
      });
      
      return totalAvailable;
    } catch (error) {
      console.error('Erro ao calcular saldo:', error);
      return 0;
    }
  };

  const animateBalanceCount = (targetValue: number) => {
    setIsAnimating(true);
    setDisplayBalance(0);
    
    const duration = 1500; // 1.5 segundos
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Função de easing para uma animação mais natural
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
      
      setDisplayBalance(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayBalance(targetValue);
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const updateBalance = (shouldAnimate = false) => {
    if (user) {
      const totalBalance = calculateTotalAvailableBalance();
      setCurrentBalance(totalBalance);
      
      console.log('StaticBalance - Atualizando saldo:', {
        totalBalance,
        shouldAnimate,
        timestamp: new Date().toISOString()
      });
      
      if (shouldAnimate) {
        animateBalanceCount(totalBalance);
      } else {
        setDisplayBalance(totalBalance);
      }
      
      // Disparar evento de atualização para outros componentes
      window.dispatchEvent(new Event('balanceUpdated'));
    }
  };

  useEffect(() => {
    console.log('StaticBalance - useEffect inicial, carregando saldo para user:', user?.id);
    updateBalance();
  }, [user]);

  useEffect(() => {
    // Evento específico para recargas de saldo
    const handleBalanceRecharge = (event?: CustomEvent) => {
      console.log('💰 StaticBalance - Recarga detectada:', {
        hasDetail: !!event?.detail,
        detail: event?.detail,
        timestamp: new Date().toISOString()
      });
      
      const shouldAnimate = event?.detail?.shouldAnimate || false;
      updateBalance(shouldAnimate);
    };

    // Evento específico para compras de planos
    const handlePlanPurchase = (event?: CustomEvent) => {
      console.log('💎 StaticBalance - Compra de plano detectada:', {
        hasDetail: !!event?.detail,
        detail: event?.detail,
        timestamp: new Date().toISOString()
      });
      
      const shouldAnimate = event?.detail?.shouldAnimate || false;
      updateBalance(shouldAnimate);
    };

    // Evento genérico para compatibilidade
    const handleBalanceUpdate = (event?: CustomEvent) => {
      console.log('StaticBalance - Evento balanceUpdated genérico recebido:', {
        hasDetail: !!event?.detail,
        detail: event?.detail,
        timestamp: new Date().toISOString()
      });
      
      const shouldAnimate = event?.detail?.shouldAnimate || false;
      updateBalance(shouldAnimate);
    };

    const handleStorageChange = (event: StorageEvent) => {
      // Só reagir a mudanças de saldo do usuário atual
      if (user && (
        event.key === `wallet_balance_${user.id}` || 
        event.key === `plan_balance_${user.id}`
      )) {
        console.log('StaticBalance - Storage change detectado para:', event.key);
        updateBalance();
      }
    };

    const handlePageLoad = () => {
      console.log('StaticBalance - Evento pageLoad recebido');
      updateBalance(true); // Animar quando a página carrega
    };

    // Adicionar todos os listeners
    window.addEventListener('balanceRechargeUpdated', handleBalanceRecharge as EventListener);
    window.addEventListener('planPurchaseUpdated', handlePlanPurchase as EventListener);
    window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pageLoad', handlePageLoad);
    
    // Cleanup
    return () => {
      window.removeEventListener('balanceRechargeUpdated', handleBalanceRecharge as EventListener);
      window.removeEventListener('planPurchaseUpdated', handlePlanPurchase as EventListener);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pageLoad', handlePageLoad);
    };
  }, [user]);

  const handleRefresh = async () => {
    if (isRefreshing || !user) return;
    
    setIsRefreshing(true);
    
    try {
      console.log('StaticBalance - Refresh manual iniciado');
      
      // Força recontagem animada a cada clique
      updateBalance(true);
      
      // Dispara evento para outros componentes recontarem também
      window.dispatchEvent(new CustomEvent('balanceUpdated', {
        detail: { 
          shouldAnimate: true,
          timestamp: Date.now()
        }
      }));
      
      if (onRefresh) {
        onRefresh();
      }
      
      toast.success("Saldo atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar saldo");
      console.error('Error refreshing balance:', error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  console.log('StaticBalance - RENDER atual:', {
    currentBalance,
    displayBalance,
    userId: user?.id,
    formattedBalance: formatBrazilianCurrency(displayBalance),
    timestamp: new Date().toISOString()
  });

  return (
    <div className="flex items-center gap-2">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-600 shadow-sm">
        <div className="text-lg font-bold text-brand-purple dark:text-brand-purple min-w-[120px] text-left">
          {formatBrazilianCurrency(displayBalance)}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing || isAnimating}
        className="h-8 w-8 p-0 hover:bg-brand-purple/10 rounded-full flex items-center justify-center"
      >
        <RefreshCw 
          className={`h-5 w-5 text-brand-purple transition-transform duration-300 ${isRefreshing ? 'animate-spin' : ''}`} 
        />
      </Button>
    </div>
  );
};

export default StaticBalance;
