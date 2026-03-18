import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AllHistorySection from './sections/AllHistorySection';
import ConsultationsSection from './sections/ConsultationsSection';
import RechargesSection from './sections/RechargesSection';
import ReferralsSection from './sections/ReferralsSection';
import CouponsSection from './sections/CouponsSection';
import PurchasesSection from './sections/PurchasesSection';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit' | 'bonus' | 'referral_bonus' | 'plan_purchase' | 'plan_activation' | 'recharge' | 'plan_credit' | 'recarga' | 'consultation';
  description: string;
  created_at: string;
  balance_type?: 'wallet' | 'plan';
  category?: string;
  is_referral?: boolean;
  status?: string;
  payment_method?: string;
  plan_name?: string;
  module_type?: string;
  document?: string;
  cost?: number;
  original_price?: number;
  discount_percent?: number;
  saldo_usado?: 'plano' | 'carteira' | 'misto' | string;
  result_data?: any;
}

interface CupomHistoryItem {
  id: string;
  codigo: string;
  descricao?: string;
  tipo: 'fixo' | 'percentual';
  valor_desconto: number;
  created_at: string;
  category: 'cupom';
}

interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  amount: number;
  created_at: string;
  status: 'pending' | 'paid';
  referred_name?: string;
}

interface ConsultaHistorico {
  id: string;
  tipo: string;
  documento: string;
  resultado: string;
  data: string;
  custo: number;
}

interface HistoricoTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  allHistory: Array<Transaction | CupomHistoryItem | (ReferralEarning & { type: 'referral_bonus'; description: string; balance_type: 'wallet' })>;
  filteredTransactions: Transaction[];
  referralEarnings: ReferralEarning[];
  rechargeTransactions: Transaction[];
  consultations: ConsultaHistorico[];
  cupomHistory: CupomHistoryItem[];
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  clearTransactions: () => void;
  clearReferrals: () => void;
  clearRecharges: () => void;
  clearConsultations: () => void;
  clearCupons: () => void;
  clearAllHistory: () => void;
  loading?: boolean;
}

const HistoricoTabs: React.FC<HistoricoTabsProps> = ({
  activeTab,
  setActiveTab,
  allHistory,
  filteredTransactions,
  referralEarnings,
  rechargeTransactions,
  consultations,
  cupomHistory,
  formatBrazilianCurrency,
  formatDate,
  clearTransactions,
  clearReferrals,
  clearRecharges,
  clearConsultations,
  clearCupons,
  clearAllHistory,
  loading = false
}) => {
  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="consultations">Consultas</TabsTrigger>
            <TabsTrigger value="recharges">Recargas</TabsTrigger>
            <TabsTrigger value="referrals">Indicações</TabsTrigger>
            <TabsTrigger value="cupons">Cupons</TabsTrigger>
            <TabsTrigger value="compras">Compras</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <AllHistorySection
              allHistory={allHistory}
              formatBrazilianCurrency={formatBrazilianCurrency}
              formatDate={formatDate}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="consultations">
            <ConsultationsSection
              allHistory={allHistory}
              formatBrazilianCurrency={formatBrazilianCurrency}
              formatDate={formatDate}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="recharges">
            <RechargesSection
              rechargeTransactions={rechargeTransactions}
              formatBrazilianCurrency={formatBrazilianCurrency}
              formatDate={formatDate}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralsSection
              referralEarnings={referralEarnings}
              formatBrazilianCurrency={formatBrazilianCurrency}
              formatDate={formatDate}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="cupons">
            <CouponsSection
              cupomHistory={cupomHistory}
              formatBrazilianCurrency={formatBrazilianCurrency}
              formatDate={formatDate}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="compras">
            <PurchasesSection
              allHistory={allHistory}
              formatBrazilianCurrency={formatBrazilianCurrency}
              formatDate={formatDate}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HistoricoTabs;