
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';

import ConsultationsSection from '@/components/historico/sections/ConsultationsSection';
import RechargesSection from '@/components/historico/sections/RechargesSection';
import ReferralsSection from '@/components/historico/sections/ReferralsSection';
import CouponsSection from '@/components/historico/sections/CouponsSection';
import PurchasesSection from '@/components/historico/sections/PurchasesSection';
import PixPaymentsSection from '@/components/dashboard/PixPaymentsSection';
import PdfOrdersHistorySection from '@/components/historico/sections/PdfOrdersHistorySection';
import { useAuth } from '@/contexts/AuthContext';
import { walletApiService } from '@/services/walletApiService';
import { cupomApiService } from '@/services/cupomApiService';
import { consultationApiService } from '@/services/consultationApiService';
import {
  formatBrazilianCurrency,
  formatDate,
  filterTransactions,
  getRechargeTransactions
} from '@/utils/historicoUtils';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface HistoricoState {
  allHistory: any[];
  transactions: any[];
  referralEarnings: any[];
  consultations: any[];
  cupomHistory: any[];
  loading: boolean;
  error: string | null;
}

const textByLocale: Record<Locale, {
  title: string;
  transactionsDefault: string;
  loadError: string;
  sections: {
    consultations: string;
    pix: string;
    recharges: string;
    pdf: string;
    purchases: string;
    referrals: string;
    coupons: string;
  };
}> = {
  'pt-BR': {
    title: 'Histórico Completo',
    transactionsDefault: 'Transação',
    loadError: 'Erro ao carregar dados',
    sections: {
      consultations: 'Consultas Realizadas',
      pix: 'Pagamentos PIX',
      recharges: 'Recargas e Depósitos',
      pdf: 'Pedidos PDF (RG + Personalizado)',
      purchases: 'Compras e Planos',
      referrals: 'Ganhos com Indicações',
      coupons: 'Cupons Utilizados',
    },
  },
  en: {
    title: 'Full History',
    transactionsDefault: 'Transaction',
    loadError: 'Error loading data',
    sections: {
      consultations: 'Completed Consultations',
      pix: 'PIX Payments',
      recharges: 'Top-ups and Deposits',
      pdf: 'PDF Orders (ID + Custom)',
      purchases: 'Purchases and Plans',
      referrals: 'Referral Earnings',
      coupons: 'Used Coupons',
    },
  },
  es: {
    title: 'Historial Completo',
    transactionsDefault: 'Transacción',
    loadError: 'Error al cargar datos',
    sections: {
      consultations: 'Consultas Realizadas',
      pix: 'Pagos PIX',
      recharges: 'Recargas y Depósitos',
      pdf: 'Pedidos PDF (RG + Personalizado)',
      purchases: 'Compras y Planes',
      referrals: 'Ganancias por Referidos',
      coupons: 'Cupones Usados',
    },
  },
};

const Historico = () => {
  const { user } = useAuth();
  const { locale } = useLocale();
  const text = textByLocale[locale];

  const [state, setState] = useState<HistoricoState>({
    allHistory: [],
    transactions: [],
    referralEarnings: [],
    consultations: [],
    cupomHistory: [],
    loading: false,
    error: null
  });

  const loadHistoryData = async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [transactionsResponse, cupomResponse, consultasResponse] = await Promise.allSettled([
        walletApiService.getTransactionHistory(parseInt(user.id), 100),
        cupomApiService.getCupomHistory(parseInt(user.id)),
        consultationApiService.getConsultationHistory(100, 0)
      ]);

      let allHistoryData: any[] = [];
      let apiTransactions: any[] = [];
      let apiReferrals: any[] = [];
      let apiCupons: any[] = [];
      let apiConsultations: any[] = [];

      if (transactionsResponse.status === 'fulfilled' && transactionsResponse.value.success) {
        const transactionData = transactionsResponse.value.data;

        apiTransactions = transactionData.map((t: any) => ({
          id: t.id?.toString() || Date.now().toString(),
          user_id: user.id,
          amount: parseFloat(t.amount) || 0,
          type: t.type || 'credit',
          description: t.description || text.transactionsDefault,
          created_at: t.created_at || new Date().toISOString(),
          balance_type: t.wallet_type === 'plan' ? 'plan' : 'wallet',
          payment_method: t.payment_method || '',
          status: t.status || 'completed',
          category: t.type === 'indicacao' || t.type === 'bonus' ||
            (t.description && (
              t.description.includes('Bônus') ||
              t.description.includes('indicação') ||
              t.description.includes('boas-vindas') ||
              t.description.includes('welcome')
            ))
            ? 'bonus' : 'normal',
          is_referral: t.type === 'indicacao' ||
            (t.description && (
              t.description.includes('Bônus') ||
              t.description.includes('indicação') ||
              t.description.includes('boas-vindas') ||
              t.description.includes('welcome')
            ))
        }));

        apiReferrals = transactionData
          .filter((t: any) => t.type === 'indicacao')
          .map((t: any) => {
            const match = t.description.match(/- (.*?) se cadastrou/);
            const referredName = match ? match[1] : `Usuário ${t.reference_id || 'N/A'}`;

            return {
              id: t.id?.toString() || Date.now().toString(),
              referrer_id: user.id,
              referred_user_id: t.reference_id || t.id,
              amount: parseFloat(t.amount) || 0,
              created_at: t.created_at || new Date().toISOString(),
              status: 'paid',
              referred_name: referredName
            };
          });

        const filteredForAll = apiTransactions.filter(t =>
          t.type !== 'consulta' && !(t.type === 'bonus' && t.description && t.description.includes('Cupom'))
        );
        allHistoryData = [...filteredForAll];
      }

      if (cupomResponse.status === 'fulfilled' && cupomResponse.value.success) {
        apiCupons = cupomResponse.value.data.map((cupom: any) => ({
          ...cupom,
          category: 'cupom'
        }));
        allHistoryData = [...allHistoryData, ...apiCupons];
      }

      if (consultasResponse.status === 'fulfilled' && consultasResponse.value.success) {
        const userConsultas = consultasResponse.value.data.filter((consulta: any) =>
          consulta.user_id === parseInt(user.id)
        );

        apiConsultations = userConsultas.map((consulta: any) => {
          const valorCobrado = parseFloat(consulta.cost || 0);
          const meta = consulta.metadata ? (typeof consulta.metadata === 'string' ? JSON.parse(consulta.metadata) : consulta.metadata) : {};

          return {
            id: `CPF-${consulta.id}`,
            type: 'consultation',
            module_type: consulta.module_type || meta?.module_type || 'cpf',
            document: consulta.document || 'CPF consultado',
            cost: valorCobrado,
            amount: -Math.abs(valorCobrado),
            saldo_usado: 'carteira',
            status: consulta.status || 'success',
            created_at: consulta.created_at,
            updated_at: consulta.created_at,
            category: 'consultation',
            source_table: 'consultas_history',
            balance_type: 'wallet',
            description: `Consulta CPF ${consulta.document ? consulta.document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : ''}`,
            result_data: consulta.result_data,
            metadata: {
              ...meta,
              module_title: meta?.module_title || consulta.module_type || 'CPF',
              page_route: meta?.page_route || null,
            }
          };
        });

        allHistoryData = [...allHistoryData, ...apiConsultations];
      }

      allHistoryData.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setState(prev => ({
        ...prev,
        transactions: apiTransactions,
        referralEarnings: apiReferrals,
        cupomHistory: apiCupons,
        consultations: apiConsultations,
        allHistory: allHistoryData,
        loading: false,
        error: null
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : text.loadError,
        loading: false
      }));

      loadLocalData();
    }
  };

  const loadLocalData = () => {
    if (!user) return;

    try {
      const localTransactions = JSON.parse(localStorage.getItem(`balance_transactions_${user.id}`) || '[]');
      setState(prev => ({
        ...prev,
        transactions: localTransactions,
        allHistory: localTransactions,
        referralEarnings: [],
        cupomHistory: [],
        consultations: []
      }));
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error);
    }
  };

  useEffect(() => {
    loadHistoryData();
  }, [user, locale]);

  const filteredTransactions = filterTransactions(state.transactions, '');
  const rechargeTransactions = getRechargeTransactions(filteredTransactions);

  return (
    <div className="space-y-3 sm:space-y-6 relative z-10 px-1 sm:px-0">
      <DashboardTitleCard
        title={text.title}
        icon={<History className="h-4 w-4 sm:h-5 sm:w-5" />}
        right={
          <>
            {state.error ? (
              <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
            ) : (
              <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={loadHistoryData}
              disabled={state.loading}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${state.loading ? 'animate-spin' : ''}`} />
            </Button>
          </>
        }
      />

      <div className="space-y-3 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <div className="bg-card border border-border rounded-lg px-4 py-2.5">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">{text.sections.consultations}</h2>
          </div>
          <Card>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <ConsultationsSection
                allHistory={state.allHistory}
                formatBrazilianCurrency={formatBrazilianCurrency}
                formatDate={formatDate}
                loading={state.loading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="bg-card border border-border rounded-lg px-4 py-2.5">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">{text.sections.pix}</h2>
          </div>
          <PixPaymentsSection />
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="bg-card border border-border rounded-lg px-4 py-2.5">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">{text.sections.recharges}</h2>
          </div>
          <Card>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <RechargesSection
                rechargeTransactions={rechargeTransactions}
                formatBrazilianCurrency={formatBrazilianCurrency}
                formatDate={formatDate}
                loading={state.loading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="bg-card border border-border rounded-lg px-4 py-2.5">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">{text.sections.pdf}</h2>
          </div>
          <Card>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <PdfOrdersHistorySection />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="bg-card border border-border rounded-lg px-4 py-2.5">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">{text.sections.purchases}</h2>
          </div>
          <Card>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <PurchasesSection
                allHistory={state.allHistory}
                formatBrazilianCurrency={formatBrazilianCurrency}
                formatDate={formatDate}
                loading={state.loading}
              />
            </CardContent>
          </Card>
        </div>

        {state.referralEarnings.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <div className="bg-card border border-border rounded-lg px-4 py-2.5">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">{text.sections.referrals}</h2>
            </div>
            <Card>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <ReferralsSection
                  referralEarnings={state.referralEarnings}
                  formatBrazilianCurrency={formatBrazilianCurrency}
                  formatDate={formatDate}
                  loading={state.loading}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {state.cupomHistory.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <div className="bg-card border border-border rounded-lg px-4 py-2.5">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">{text.sections.coupons}</h2>
            </div>
            <Card>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <CouponsSection
                  cupomHistory={state.cupomHistory}
                  formatBrazilianCurrency={formatBrazilianCurrency}
                  formatDate={formatDate}
                  loading={state.loading}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Historico;
