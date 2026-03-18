import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CreditCard } from 'lucide-react';
import { useHistoricoData } from '@/hooks/useHistoricoData';
import PixPaymentsSection from '@/components/dashboard/PixPaymentsSection';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

const textByLocale: Record<Locale, { title: string; refreshAria: string }> = {
  'pt-BR': { title: 'Histórico · Pagamentos PIX', refreshAria: 'Atualizar' },
  en: { title: 'History · PIX Payments', refreshAria: 'Refresh' },
  es: { title: 'Historial · Pagos PIX', refreshAria: 'Actualizar' },
};

const HistoricoPagamentosPix = () => {
  const { state, refresh } = useHistoricoData();
  const { locale } = useLocale();
  const text = textByLocale[locale];

  return (
    <div className="space-y-3 sm:space-y-6 relative z-10 px-1 sm:px-0">
      <DashboardTitleCard
        title={text.title}
        icon={<CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/historico"
        right={
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={state.loading}
            className="h-8 w-8 p-0"
            aria-label={text.refreshAria}
          >
            <RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
          </Button>
        }
      />

      <PixPaymentsSection />
    </div>
  );
};

export default HistoricoPagamentosPix;
