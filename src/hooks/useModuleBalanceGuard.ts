import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useApiModules } from '@/hooks/useApiModules';
import { useModuleRecords } from '@/hooks/useModuleRecords';
import { toast } from 'sonner';

export const useModuleBalanceGuard = (moduleSlug: string) => {
  const navigate = useNavigate();
  const { totalAvailableBalance, isLoading: isBalanceLoading, hasLoadedOnce } = useUserBalance();
  const { 
    calculateDiscountedPrice, 
    hasActiveSubscription, 
    discountPercentage 
  } = useUserSubscription();
  const { modules } = useApiModules();
  const { hasRecordsInModule } = useModuleRecords();

  useEffect(() => {
    if (!moduleSlug || modules.length === 0) return;
    // Evitar falso-positivo de saldo insuficiente antes da 1ª leitura do saldo
    if (isBalanceLoading || !hasLoadedOnce) return;

    // Buscar o módulo pelo slug
    const module = modules.find(m => m.slug === moduleSlug);
    
    if (!module) {
      console.log('🚫 [MODULE_BALANCE_GUARD] Módulo não encontrado:', moduleSlug);
      toast.error('Módulo não encontrado');
      navigate('/dashboard', { replace: true });
      return;
    }

    // Verificar se módulo está ativo
    if (!module.is_active || module.operational_status !== 'on') {
      console.log('🚫 [MODULE_BALANCE_GUARD] Módulo inativo:', moduleSlug);
      toast.error(`Módulo ${module.title} indisponível no momento`);
      navigate('/dashboard', { replace: true });
      return;
    }

    // Calcular preço final (considerar painel 38 sem desconto)
    const originalPrice = parseFloat(module.price?.toString().replace(',', '.') || '0');
    const finalPrice = hasActiveSubscription && discountPercentage > 0 
      ? calculateDiscountedPrice(originalPrice, module.panel_id).discountedPrice 
      : originalPrice;

    // Verificar saldo suficiente - permitir acesso se já tiver registros no módulo
    const moduleRoute = `/dashboard/${moduleSlug}`;
    const userHasRecords = hasRecordsInModule(moduleRoute);

    if (totalAvailableBalance < finalPrice && !userHasRecords) {
      console.log('🚫 [MODULE_BALANCE_GUARD] Saldo insuficiente para módulo:', {
        moduleSlug,
        moduleName: module.title,
        requiredPrice: finalPrice,
        availableBalance: totalAvailableBalance,
        hasRecords: userHasRecords
      });
      
      const remaining = Math.max(finalPrice - totalAvailableBalance, 0.01);
      toast.error(
        `Saldo insuficiente para ${module.title}! Valor necessário: R$ ${finalPrice.toFixed(2)}`,
        {
          action: {
            label: "💰 Depositar",
            onClick: () => navigate(`/dashboard/adicionar-saldo?valor=${remaining.toFixed(2)}&fromModule=true`)
          }
        }
      );
      
      navigate('/dashboard', { replace: true });
      return;
    }

    // Usuário tem registros mas sem saldo - permitir acesso em modo leitura
    if (totalAvailableBalance < finalPrice && userHasRecords) {
      console.log('📖 [MODULE_BALANCE_GUARD] Acesso em modo leitura (com histórico, sem saldo):', {
        moduleSlug,
        moduleName: module.title,
      });
      toast.info(
        `Você pode visualizar seu histórico em ${module.title}, mas precisa de saldo para novas consultas.`,
        { duration: 4000 }
      );
      return;
    }

    console.log('✅ [MODULE_BALANCE_GUARD] Acesso autorizado ao módulo:', {
      moduleSlug,
      moduleName: module.title,
      finalPrice,
      availableBalance: totalAvailableBalance
    });

  }, [moduleSlug, modules, totalAvailableBalance, isBalanceLoading, hasLoadedOnce, hasActiveSubscription, discountPercentage, navigate, calculateDiscountedPrice, hasRecordsInModule]);

  // Retornar dados do módulo se válido
  const module = modules.find(m => m.slug === moduleSlug);
  const moduleRoute = `/dashboard/${moduleSlug}`;
  const userHasRecords = hasRecordsInModule(moduleRoute);
  
  const requiredPrice = module ? (
    hasActiveSubscription && discountPercentage > 0 
      ? calculateDiscountedPrice(parseFloat(module.price?.toString().replace(',', '.') || '0'), module.panel_id).discountedPrice 
      : parseFloat(module.price?.toString().replace(',', '.') || '0')
  ) : 0;

  const hasEnoughBalance = module ? totalAvailableBalance >= requiredPrice : false;

  return {
    module,
    isAuthorized: !!module && module.is_active && module.operational_status === 'on',
    hasValidBalance: hasEnoughBalance || userHasRecords,
    /** Usuário pode entrar mas só visualizar histórico (sem saldo, mas com registros) */
    isReadOnly: !hasEnoughBalance && userHasRecords,
    hasEnoughBalance,
    userHasRecords,
  };
};