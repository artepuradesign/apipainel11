import React from 'react';
import EmptyState from '../EmptyState';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  amount: number;
  created_at: string;
  status: 'pending' | 'paid';
  referred_name?: string;
}

interface ReferralsSectionProps {
  referralEarnings: ReferralEarning[];
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  loading?: boolean;
}

const textByLocale: Record<Locale, {
  detailedTitle: string;
  defaultUser: string;
  paid: string;
  pending: string;
  bonusNote: string;
  receivedBonus: string;
  emptyTitle: string;
  emptySubtitle: string;
}> = {
  'pt-BR': {
    detailedTitle: '🎁 Histórico Detalhado de Bônus',
    defaultUser: 'Usuário',
    paid: '✅ Pago',
    pending: '⏳ Pendente',
    bonusNote: '💝 Bônus de boas-vindas por indicação confirmada',
    receivedBonus: 'Bônus recebido',
    emptyTitle: 'Nenhum bônus por indicação encontrado',
    emptySubtitle: 'Seus ganhos por indicação aparecerão aqui quando você começar a indicar pessoas',
  },
  en: {
    detailedTitle: '🎁 Detailed Bonus History',
    defaultUser: 'User',
    paid: '✅ Paid',
    pending: '⏳ Pending',
    bonusNote: '💝 Welcome bonus for confirmed referral',
    receivedBonus: 'Bonus received',
    emptyTitle: 'No referral bonus found',
    emptySubtitle: 'Your referral earnings will appear here once you start inviting people',
  },
  es: {
    detailedTitle: '🎁 Historial Detallado de Bonos',
    defaultUser: 'Usuario',
    paid: '✅ Pagado',
    pending: '⏳ Pendiente',
    bonusNote: '💝 Bono de bienvenida por referido confirmado',
    receivedBonus: 'Bono recibido',
    emptyTitle: 'No se encontraron bonos por referidos',
    emptySubtitle: 'Tus ganancias por referidos aparecerán aquí cuando comiences a invitar personas',
  },
};

const ReferralsSection: React.FC<ReferralsSectionProps> = ({
  referralEarnings,
  formatBrazilianCurrency,
  formatDate,
  loading = false
}) => {
  const { locale } = useLocale();
  const text = textByLocale[locale];

  return (
    <div className="rounded-lg border border-border bg-card p-4 md:p-6">
      {referralEarnings.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-sm md:text-md font-semibold text-foreground border-b border-border pb-2">
            {text.detailedTitle}
          </h4>

          <div className="space-y-3">
            {referralEarnings.map((earning) => (
              <div key={earning.id} className="rounded-lg border border-border bg-card px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold truncate">
                        {earning.referred_name || `${text.defaultUser} ${earning.referred_user_id}`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {earning.status === 'paid' ? text.paid : text.pending}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(earning.created_at)}</div>
                    <div className="text-xs text-muted-foreground mt-1">{text.bonusNote}</div>
                    <div className="text-xs text-muted-foreground mt-1">ID: {earning.referred_user_id}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold">+ {formatBrazilianCurrency(earning.amount)}</div>
                    <p className="text-xs text-muted-foreground">{text.receivedBonus}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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

export default ReferralsSection;
