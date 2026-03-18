import React from 'react';
import EmptyState from '../EmptyState';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface CupomHistoryItem {
  id: string;
  codigo: string;
  descricao?: string;
  tipo: 'fixo' | 'percentual';
  valor_desconto: number;
  created_at: string;
}

interface CouponsSectionProps {
  cupomHistory: CupomHistoryItem[];
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  loading?: boolean;
}

const textByLocale: Record<Locale, {
  coupon: string;
  applied: string;
  fixed: string;
  percent: string;
  descriptionFallback: string;
  addedValue: string;
  credited: string;
  emptyTitle: string;
  emptySubtitle: string;
}> = {
  'pt-BR': {
    coupon: 'Cupom',
    applied: 'Aplicado',
    fixed: 'Fixo',
    percent: '%',
    descriptionFallback: 'Cupom aplicado',
    addedValue: 'Valor adicionado',
    credited: 'Creditado',
    emptyTitle: 'Nenhum cupom utilizado',
    emptySubtitle: 'Seus cupons aplicados aparecerão aqui',
  },
  en: {
    coupon: 'Coupon',
    applied: 'Applied',
    fixed: 'Fixed',
    percent: '%',
    descriptionFallback: 'Applied coupon',
    addedValue: 'Added amount',
    credited: 'Credited',
    emptyTitle: 'No coupon used',
    emptySubtitle: 'Your applied coupons will appear here',
  },
  es: {
    coupon: 'Cupón',
    applied: 'Aplicado',
    fixed: 'Fijo',
    percent: '%',
    descriptionFallback: 'Cupón aplicado',
    addedValue: 'Valor agregado',
    credited: 'Acreditado',
    emptyTitle: 'No hay cupones usados',
    emptySubtitle: 'Tus cupones aplicados aparecerán aquí',
  },
};

const CouponsSection: React.FC<CouponsSectionProps> = ({
  cupomHistory,
  formatBrazilianCurrency,
  formatDate,
  loading = false
}) => {
  const { locale } = useLocale();
  const text = textByLocale[locale];

  return (
    <div className="space-y-2">
      {cupomHistory.length > 0 ? (
        cupomHistory.map((cupom) => (
          <div key={cupom.id} className="rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{text.coupon} {cupom.codigo}</span>
                  <span className="text-xs text-muted-foreground">
                    {cupom.tipo === 'fixo' ? text.fixed : text.percent}
                  </span>
                  <span className="text-xs text-muted-foreground">{text.applied}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {cupom.descricao || text.descriptionFallback}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{formatDate(cupom.created_at)}</div>
              </div>
              <div className="text-sm font-semibold">{formatBrazilianCurrency(cupom.valor_desconto)}</div>
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
  );
};

export default CouponsSection;
