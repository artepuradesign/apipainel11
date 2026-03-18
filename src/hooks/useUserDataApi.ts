import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userApiService, UserData, UserBalance } from '@/services/userApiService';
import { toast } from 'sonner';

export const useUserDataApi = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balance, setBalance] = useState<UserBalance>({
    saldo: 0,
    saldo_plano: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados completos do usuário
  const loadUserData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [USER_DATA_API] Carregando dados do usuário:', user.id);

      const response = await userApiService.getUserData();

      if (response.success && response.data) {
        setUserData(response.data);
        console.log('✅ [USER_DATA_API] Dados do usuário carregados:', response.data);
      } else {
        console.warn('⚠️ [USER_DATA_API] Erro ao buscar dados:', response.error);
        setError(response.error || 'Erro ao carregar dados do usuário');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [USER_DATA_API] Erro na API:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Carregar saldo do usuário
  const loadBalance = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [USER_DATA_API] Carregando saldo do usuário:', user.id);

      const response = await userApiService.getUserBalance();

      if (response.success && response.data) {
        setBalance(response.data);
        console.log('✅ [USER_DATA_API] Saldo carregado:', response.data);
      } else {
        console.warn('⚠️ [USER_DATA_API] Erro ao buscar saldo:', response.error);
        setError(response.error || 'Erro ao carregar saldo');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [USER_DATA_API] Erro na API de saldo:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Atualizar dados do usuário
  const updateUserData = async (newData: Partial<UserData>): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📝 [USER_DATA_API] Atualizando dados do usuário:', newData);

      const response = await userApiService.updateUserData(newData);

      if (response.success && response.data) {
        setUserData(response.data);
        toast.success('Dados atualizados com sucesso!');
        console.log('✅ [USER_DATA_API] Dados atualizados:', response.data);
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao atualizar dados';
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [USER_DATA_API] Erro ao atualizar:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Transferir saldo entre carteiras
  const transferBalance = async (amount: number, from: 'main' | 'plan', to: 'main' | 'plan'): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    if (amount <= 0) {
      toast.error('Valor deve ser maior que zero');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 [USER_DATA_API] Transferindo R$ ${amount} de ${from} para ${to}`);

      const response = await userApiService.transferBalance(amount, from, to);

      if (response.success && response.data) {
        setBalance(response.data);
        toast.success(`Transferência de R$ ${amount.toFixed(2)} realizada com sucesso!`);
        
        // Disparar evento de atualização
        window.dispatchEvent(new CustomEvent('balanceUpdated', {
          detail: { 
            shouldAnimate: true, 
            transferAmount: amount,
            from: from,
            to: to,
            userId: user.id
          }
        }));
        
        console.log('✅ [USER_DATA_API] Transferência realizada:', response.data);
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao transferir saldo';
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [USER_DATA_API] Erro na transferência:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Comprar plano
  const purchasePlan = async (planId: number, planPrice: number, paymentMethod: string = 'saldo'): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    // Validar saldo se pagamento for via saldo
    if (paymentMethod === 'saldo') {
      const validationResponse = await userApiService.validateSufficientBalance(planPrice, 'main');
      
      if (!validationResponse.success || !validationResponse.data?.sufficient) {
        toast.error('Saldo insuficiente para comprar este plano');
        return false;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🛒 [USER_DATA_API] Comprando plano ${planId} por R$ ${planPrice}`);

      const response = await userApiService.purchasePlan(planId, planPrice, paymentMethod);

      if (response.success && response.data) {
        // Recarregar dados do usuário e saldo
        await Promise.all([loadUserData(), loadBalance()]);
        
        toast.success(`Plano adquirido com sucesso!`);
        
        // Disparar evento de compra de plano
        window.dispatchEvent(new CustomEvent('planPurchased', {
          detail: { 
            planId: planId,
            price: planPrice,
            paymentMethod: paymentMethod,
            userId: user.id
          }
        }));
        
        console.log('✅ [USER_DATA_API] Plano adquirido:', response.data);
        return true;
      } else {
        const errorMsg = response.error || 'Erro ao adquirir plano';
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [USER_DATA_API] Erro na compra do plano:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados automaticamente quando usuário está disponível
  useEffect(() => {
    if (user?.id) {
      Promise.all([loadUserData(), loadBalance()]);
    }
  }, [user?.id, loadUserData, loadBalance]);

  // Escutar eventos de atualização específicos
  useEffect(() => {
    // Evento para recargas (afeta saldo principal)
    const handleBalanceRecharge = () => {
      console.log('🔄 [USER_DATA_API] Evento balanceRechargeUpdated recebido - recarregando saldo');
      loadBalance();
    };

    // Evento para compras de planos (afeta saldo de planos)
    const handlePlanPurchase = () => {
      console.log('🔄 [USER_DATA_API] Evento planPurchaseUpdated recebido - recarregando saldo');
      loadBalance();
    };

    // Evento genérico para atualizações de dados do usuário
    const handleUserDataUpdate = () => {
      console.log('🔄 [USER_DATA_API] Evento userDataUpdated recebido - recarregando dados');
      loadUserData();
    };

    // Manter compatibilidade com evento genérico balanceUpdated
    const handleBalanceUpdate = () => {
      console.log('🔄 [USER_DATA_API] Evento balanceUpdated genérico recebido - recarregando saldo');
      loadBalance();
    };

    window.addEventListener('balanceRechargeUpdated', handleBalanceRecharge);
    window.addEventListener('planPurchaseUpdated', handlePlanPurchase);
    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    window.addEventListener('userDataUpdated', handleUserDataUpdate);

    return () => {
      window.removeEventListener('balanceRechargeUpdated', handleBalanceRecharge);
      window.removeEventListener('planPurchaseUpdated', handlePlanPurchase);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
    };
  }, [loadBalance, loadUserData]);

  return {
    userData,
    balance,
    isLoading,
    error,
    loadUserData,
    loadBalance,
    updateUserData,
    transferBalance,
    purchasePlan,
    // Compatibilidade com hooks antigos
    totalAvailableBalance: balance.total,
    mainBalance: balance.saldo,
    planBalance: balance.saldo_plano,
    // Funções utilitárias
    hasMainBalance: (amount: number) => balance.saldo >= amount,
    hasPlanBalance: (amount: number) => balance.saldo_plano >= amount,
    hasTotalBalance: (amount: number) => balance.total >= amount
  };
};