import React from 'react';
import EmptyState from '../EmptyState';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface HistoryItem {
  id: string;
  type?: string;
  description?: string;
  [key: string]: any;
}

interface PurchasesSectionProps {
  allHistory: Array<HistoryItem>;
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  loading?: boolean;
}

const textByLocale: Record<Locale, {
  purchaseContains: string;
  activationContains: string;
  fallbackDescription: string;
  emptyTitle: string;
  emptySubtitle: string;
  activationLabel: string;
  purchaseLabel: string;
  activationDefault: string;
  purchaseDefault: string;
}> = {
  'pt-BR': {
    purchaseContains: 'Compra do plano',
    activationContains: 'Ativação do plano',
    fallbackDescription: 'Transação de plano',
    emptyTitle: 'Nenhuma compra encontrada',
    emptySubtitle: 'Suas compras e ativações de planos aparecerão aqui',
    activationLabel: 'Ativação',
    purchaseLabel: 'Compra',
    activationDefault: 'Ativação do plano',
    purchaseDefault: 'Compra do plano',
  },
  en: {
    purchaseContains: 'Plan purchase',
    activationContains: 'Plan activation',
    fallbackDescription: 'Plan transaction',
    emptyTitle: 'No purchases found',
    emptySubtitle: 'Your plan purchases and activations will appear here',
    activationLabel: 'Activation',
    purchaseLabel: 'Purchase',
    activationDefault: 'Plan activation',
    purchaseDefault: 'Plan purchase',
  },
  es: {
    purchaseContains: 'Compra del plan',
    activationContains: 'Activación del plan',
    fallbackDescription: 'Transacción del plan',
    emptyTitle: 'No se encontraron compras',
    emptySubtitle: 'Tus compras y activaciones de planes aparecerán aquí',
    activationLabel: 'Activación',
    purchaseLabel: 'Compra',
    activationDefault: 'Activación del plan',
    purchaseDefault: 'Compra del plan',
  },
};

const PurchasesSection: React.FC<PurchasesSectionProps> = ({
  allHistory,
  formatBrazilianCurrency,
  formatDate,
  loading = false
}) => {
  const { locale } = useLocale();
  const text = textByLocale[locale];

  const purchaseItems = allHistory.filter(item =>
    'type' in item &&
    (item.type === 'plan_purchase' ||
      item.type === 'plan_activation' ||
      (item.description && (
        item.description.includes('Compra do plano') ||
        item.description.includes('Ativação do plano') ||
        item.description.includes('Plan purchase') ||
        item.description.includes('Plan activation') ||
        item.description.includes('Compra del plan') ||
        item.description.includes('Activación del plan')
      )))
  );

  return (
    <div>
      <div className="hidden md:block space-y-3 md:space-y-4">
        {purchaseItems.length > 0 ? (
          purchaseItems.map((item: any) => {
            const isActivation = item.type === 'plan_activation' ||
              item.description?.includes('Ativação') ||
              item.description?.includes('activation') ||
              item.description?.includes('Activación');
            const amount = Math.abs(Number(item.amount) || 0);
            const label = isActivation ? text.activationLabel : text.purchaseLabel;

            return (
              <div key={item.id} className="rounded-lg border border-border bg-card px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {item.description || (isActivation ? text.activationDefault : text.purchaseDefault)}
                      </span>
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(item.created_at)}</div>
                  </div>
                  <div className="text-sm font-semibold text-destructive">
                    -{formatBrazilianCurrency(amount)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title={text.emptyTitle}
            subtitle={text.emptySubtitle}
            loading={loading}
          />
        )}
      </div>

      <div className="md:hidden">
        {purchaseItems.length > 0 ? (
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {purchaseItems.map((item: any) => {
              const isActivation = item.type === 'plan_activation' || item.description?.includes('Ativação');
              const amount = Math.abs(Number(item.amount) || 0);
              const label = isActivation ? text.activationLabel : text.purchaseLabel;

              return (
                <div key={item.id} className="px-3 py-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium truncate">
                          {item.description || (isActivation ? text.activationDefault : text.purchaseDefault)}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">{label}</span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{formatDate(item.created_at)}</div>
                    </div>

                    <div className="text-xs font-semibold text-destructive">
                      -{formatBrazilianCurrency(amount)}
                    </div>
                  </div>
                </div>
              );
            })}
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

export default PurchasesSection;
