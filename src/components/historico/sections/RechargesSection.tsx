import React from 'react';
import EmptyState from '../EmptyState';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit' | 'bonus' | 'referral_bonus' | 'plan_purchase' | 'plan_activation' | 'recharge' | 'plan_credit' | 'recarga' | 'consultation';
  description: string;
  created_at: string;
  balance_type?: 'wallet' | 'plan';
  status?: string;
  payment_method?: string;
}

interface RechargesSectionProps {
  rechargeTransactions: Transaction[];
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  loading?: boolean;
}

const textByLocale: Record<Locale, {
  methodBoleto: string;
  methodCard: string;
  methodDebit: string;
  methodTopup: string;
  emptyTitle: string;
  emptySubtitle: string;
}> = {
  'pt-BR': {
    methodBoleto: 'Boleto',
    methodCard: 'Cartão',
    methodDebit: 'Débito',
    methodTopup: 'Recarga',
    emptyTitle: 'Nenhuma recarga encontrada',
    emptySubtitle: 'Suas recargas aparecerão aqui',
  },
  en: {
    methodBoleto: 'Bank slip',
    methodCard: 'Card',
    methodDebit: 'Debit',
    methodTopup: 'Top-up',
    emptyTitle: 'No top-ups found',
    emptySubtitle: 'Your top-ups will appear here',
  },
  es: {
    methodBoleto: 'Boleto',
    methodCard: 'Tarjeta',
    methodDebit: 'Débito',
    methodTopup: 'Recarga',
    emptyTitle: 'No se encontraron recargas',
    emptySubtitle: 'Tus recargas aparecerán aquí',
  },
};

const RechargesSection: React.FC<RechargesSectionProps> = ({
  rechargeTransactions,
  formatBrazilianCurrency,
  formatDate,
  loading = false
}) => {
  const { locale } = useLocale();
  const text = textByLocale[locale];

  const getMethodShort = (method?: string) => {
    switch ((method || '').toLowerCase()) {
      case 'pix':
        return 'PIX';
      case 'boleto':
        return text.methodBoleto;
      case 'credit_card':
        return text.methodCard;
      case 'debit_card':
        return text.methodDebit;
      default:
        return text.methodTopup;
    }
  };

  return (
    <div>
      <div className="hidden md:block space-y-3 md:space-y-4">
        {rechargeTransactions.length > 0 ? (
          rechargeTransactions.map((transaction) => (
            <div key={transaction.id} className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{transaction.description || text.methodTopup}</span>
                    <span className="text-xs text-muted-foreground">{getMethodShort(transaction.payment_method)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{formatDate(transaction.created_at)}</div>
                </div>
                <div className="text-sm font-semibold">{formatBrazilianCurrency(transaction.amount)}</div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title={text.emptyTitle}
            subtitle={text.emptySubtitle}
            loading={loading}
          />
        )}
      </div>

      <div className="md:hidden">
        {rechargeTransactions.length > 0 ? (
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {rechargeTransactions.map((t) => (
              <div key={t.id} className="px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium truncate">
                        {t.description || text.methodTopup}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {getMethodShort(t.payment_method)}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatDate(t.created_at)}
                    </div>
                  </div>
                  <div className="text-xs font-semibold">{formatBrazilianCurrency(t.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={text.emptyTitle}
            subtitle={text.emptySubtitle}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default RechargesSection;
