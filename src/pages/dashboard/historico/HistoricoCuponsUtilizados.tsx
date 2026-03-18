import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Ticket } from 'lucide-react';
import { useHistoricoData } from '@/hooks/useHistoricoData';
import CouponsSection from '@/components/historico/sections/CouponsSection';
import { formatBrazilianCurrency, formatDate } from '@/utils/historicoUtils';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

const textByLocale: Record<Locale, { title: string; refreshAria: string }> = {
  'pt-BR': { title: 'Histórico · Cupons Utilizados', refreshAria: 'Atualizar' },
  en: { title: 'History · Used Coupons', refreshAria: 'Refresh' },
  es: { title: 'Historial · Cupones Usados', refreshAria: 'Actualizar' },
};

const HistoricoCuponsUtilizados = () => {
  const { state, refresh } = useHistoricoData();
  const { locale } = useLocale();
  const text = textByLocale[locale];

  return (
    <div className="space-y-3 sm:space-y-6 relative z-10 px-1 sm:px-0">
      <DashboardTitleCard
        title={text.title}
        icon={<Ticket className="h-4 w-4 sm:h-5 sm:w-5" />}
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
  );
};

export default HistoricoCuponsUtilizados;
