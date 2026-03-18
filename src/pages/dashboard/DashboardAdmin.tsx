
import React, { useEffect } from 'react';
import UnifiedAdminStatsCards from '@/components/dashboard/UnifiedAdminStatsCards';
import AdminRecentTransactions from '@/components/dashboard/AdminRecentTransactions';
import OnlineUsersLeaderboard from '@/components/dashboard/OnlineUsersLeaderboard';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';

import { useAuth } from '@/contexts/AuthContext';
import { useApiDashboardAdmin } from '@/hooks/useApiDashboardAdmin';
import { useNotifications } from '@/hooks/useNotifications';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

const textByLocale: Record<Locale, { denied: string; noPermission: string; title: string; subtitle: string }> = {
  'pt-BR': {
    denied: 'Acesso Negado',
    noPermission: 'Você não tem permissão para acessar esta página.',
    title: 'Painel Administrativo',
    subtitle: 'Visão geral de caixa, transações e usuários online',
  },
  en: {
    denied: 'Access Denied',
    noPermission: 'You do not have permission to access this page.',
    title: 'Admin Dashboard',
    subtitle: 'Overview of cash flow, transactions and online users',
  },
  es: {
    denied: 'Acceso denegado',
    noPermission: 'No tienes permiso para acceder a esta página.',
    title: 'Panel Administrativo',
    subtitle: 'Resumen de caja, transacciones y usuarios en línea',
  },
};

const DashboardAdmin = () => {
  const { isSupport } = useAuth();
  const { locale } = useLocale();
  const t = textByLocale[locale];
  const { stats, transactions, isLoading, loadStats, loadTransactions, optimisticIncrementCash, optimisticIncrementRecharges, optimisticIncrementPlanSales } = useApiDashboardAdmin();
  const { notifications } = useNotifications(false); // Desabilitar auto-refresh aqui
  
  // Caixa central: recargas, compras de plano e compras de módulos geram saldo
  const recentTransactions = transactions
    .filter(t => ['recarga', 'plano', 'compra_modulo', 'entrada', 'consulta', 'compra_login'].includes(t.type))
    .slice(0, 15);

  // Carregar dados iniciais com proteção contra falta de token
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('📊 [DASHBOARD_ADMIN] Carregando dados iniciais...');
        await loadStats();
        await loadTransactions();
      } catch (error) {
        console.warn('⚠️ [DASHBOARD_ADMIN] Erro ao carregar dados:', error);
        // Não fazer nada - o componente já mostra estado vazio graciosamente
      }
    };
    
    loadData();
  }, [loadStats, loadTransactions]);

  // Saldo do caixa = soma de PIX + Cartão + PayPal (campos já calculados corretamente pelo backend)
  // Total de recargas = somente recargas via PIX/Cartão/PayPal (sem planos, sem cupom, sem consulta)
  const calculatedRecharges = transactions.filter(t => {
    const method = (t.payment_method || '').toLowerCase();
    const isPaymentMethod = ['pix', 'credit', 'paypal', 'cartao', 'card'].some(m => method.includes(m));
    return t.type === 'recarga' && isPaymentMethod && t.amount > 0;
  }).reduce((sum, t) => sum + t.amount, 0);

  // Total de indicações = contar todas as transações de indicação de todos os usuários
  const referralTransactions = transactions.filter(t => t.type === 'indicacao' && t.amount > 0);
  const calculatedReferrals = referralTransactions.length;
  const calculatedCommissions = referralTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Saldo em Caixa = soma de TODAS as entradas (recargas, planos, consultas, compra_modulo, compra_login, entrada)
  const calculatedCashBalance = transactions
    .filter(t => ['recarga', 'plano', 'compra_modulo', 'entrada', 'consulta', 'compra_login'].includes(t.type))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const adjustedStats = stats ? {
    ...stats,
    cash_balance: calculatedCashBalance || stats.cash_balance || ((stats.payment_pix || 0) + (stats.payment_card || 0) + (stats.payment_paypal || 0)),
    total_recharges: calculatedRecharges || stats.total_recharges,
    total_referrals: calculatedReferrals || stats.total_referrals,
    total_commissions: calculatedCommissions || stats.total_commissions
  } : null;

  // Eventos específicos e limpos para cada operação
  useEffect(() => {
    // APENAS para recargas - atualiza caixa e total de recargas
    const handleRechargeCompleted = (event: CustomEvent) => {
      console.log('💰 Evento rechargeCompleted recebido no Dashboard Admin:', event.detail);
      try {
        const amount = Number(event?.detail?.amount ?? 0);
        if (!isNaN(amount) && amount > 0) {
          console.log('💰 Aplicando atualização para RECARGA - Valor:', amount);
          optimisticIncrementCash(amount);
          optimisticIncrementRecharges(amount);
          // NÃO atualizar plan_sales aqui
        }
      } catch (e) {
        console.warn('Falha ao aplicar atualização otimista de recarga:', e);
      }
      setTimeout(() => loadStats(), 500);
    };

    // APENAS para compras de planos - atualiza caixa e vendas de planos
    const handlePlanPurchaseCompleted = (event: CustomEvent) => {
      console.log('🛒 Evento planPurchaseCompleted recebido no Dashboard Admin:', event.detail);
      try {
        const amount = Number(event?.detail?.amount ?? 0);
        if (!isNaN(amount) && amount > 0) {
          console.log('🛒 Aplicando atualização para COMPRA DE PLANO - Valor:', amount);
          optimisticIncrementCash(amount);
          optimisticIncrementPlanSales(amount);
          // NÃO atualizar total_recharges aqui
        }
      } catch (e) {
        console.warn('Falha ao aplicar atualização otimista de compra de plano:', e);
      }
      
      // Forçar refresh de notificações
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('forceNotificationRefresh', {
          detail: { reason: 'plan_purchase_sync' }
        }));
      }, 100);
      
      setTimeout(() => loadStats(), 300);
    };

    window.addEventListener('rechargeCompleted', handleRechargeCompleted as EventListener);
    window.addEventListener('planPurchaseCompleted', handlePlanPurchaseCompleted as EventListener);
    
    return () => {
      window.removeEventListener('rechargeCompleted', handleRechargeCompleted as EventListener);
      window.removeEventListener('planPurchaseCompleted', handlePlanPurchaseCompleted as EventListener);
    };
  }, [loadStats, optimisticIncrementCash, optimisticIncrementRecharges, optimisticIncrementPlanSales]);

  if (!isSupport) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.denied}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t.noPermission}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative z-10">
      <PageHeaderCard
        title={t.title}
        subtitle={t.subtitle}
      />

      {/* Stats Cards Unificados - 3 linhas de 4 cards */}
      <UnifiedAdminStatsCards dashboardStats={adjustedStats} />

      {/* Layout Desktop: Transações (esquerda) + Usuários Online (direita) - Mesmo tamanho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Área Verde: Transações do Caixa Central - 50% da largura */}
        <div>
          <AdminRecentTransactions recentTransactions={recentTransactions} />
        </div>
        
        {/* Área Vermelha: Usuários Online - 50% da largura */}
        <div>
          <OnlineUsersLeaderboard />
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
