import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, History } from 'lucide-react';
import { useHistoricoData } from '@/hooks/useHistoricoData';
import ConsultationsSection from '@/components/historico/sections/ConsultationsSection';
import { formatBrazilianCurrency, formatDate } from '@/utils/historicoUtils';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

const textByLocale: Record<Locale, { title: string; refreshAria: string }> = {
  'pt-BR': { title: 'Histórico · Consultas', refreshAria: 'Atualizar' },
  en: { title: 'History · Consultations', refreshAria: 'Refresh' },
  es: { title: 'Historial · Consultas', refreshAria: 'Actualizar' },
};

const HistoricoConsultas = () => {
  const { state, refresh } = useHistoricoData();
  const { locale } = useLocale();
  const text = textByLocale[locale];

  return (
    <div className="space-y-3 sm:space-y-6 relative z-10 px-1 sm:px-0">
      <DashboardTitleCard
        title={text.title}
        icon={<History className="h-4 w-4 sm:h-5 sm:w-5" />}
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
          <ConsultationsSection
            allHistory={state.allHistory}
            formatBrazilianCurrency={formatBrazilianCurrency}
            formatDate={formatDate}
            loading={state.loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricoConsultas;
