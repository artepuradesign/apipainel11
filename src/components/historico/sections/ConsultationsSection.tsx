import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { FileText, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface HistoryItem {
  id: string;
  type?: string;
  module_type?: string;
  document?: string;
  cost?: number;
  amount?: number;
  status?: string;
  created_at: string;
  result_data?: any;
  metadata?: any;
  [key: string]: any;
}

interface ConsultationsSectionProps {
  allHistory: Array<HistoryItem>;
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  loading?: boolean;
}

const textByLocale: Record<Locale, {
  noData: string;
  missingRoute: string;
  loadedFromHistory: string;
  loading: string;
  empty: string;
  statusDone: string;
  statusPending: string;
}> = {
  'pt-BR': {
    noData: 'Dados da consulta não disponíveis',
    missingRoute: 'Não foi possível identificar o módulo desta consulta (page_route ausente)',
    loadedFromHistory: 'Consulta carregada do histórico (sem cobrança)',
    loading: 'Carregando consultas...',
    empty: 'Nenhuma consulta registrada',
    statusDone: 'Concluída',
    statusPending: 'Pendente',
  },
  en: {
    noData: 'Consultation data not available',
    missingRoute: 'Could not identify this consultation module (missing page_route)',
    loadedFromHistory: 'Consultation loaded from history (no charge)',
    loading: 'Loading consultations...',
    empty: 'No consultations recorded',
    statusDone: 'Completed',
    statusPending: 'Pending',
  },
  es: {
    noData: 'Datos de consulta no disponibles',
    missingRoute: 'No se pudo identificar el módulo de esta consulta (falta page_route)',
    loadedFromHistory: 'Consulta cargada desde el historial (sin cobro)',
    loading: 'Cargando consultas...',
    empty: 'No hay consultas registradas',
    statusDone: 'Completada',
    statusPending: 'Pendiente',
  },
};

const localeCode: Record<Locale, string> = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
};

const ConsultationsSection: React.FC<ConsultationsSectionProps> = ({
  allHistory,
  loading = false
}) => {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const text = textByLocale[locale];

  const consultationItems = allHistory.filter(item =>
    'type' in item && (item.type === 'consultation' || item.type === 'Consulta CPF')
  );

  const handleConsultationClick = (consultation: any) => {
    if (!consultation.result_data) {
      toast.error(text.noData);
      return;
    }

    const pageRoute = consultation?.metadata?.page_route;
    if (!pageRoute) {
      toast.error(text.missingRoute);
      return;
    }

    navigate(pageRoute, {
      state: {
        fromHistory: true,
        consultationData: consultation.result_data,
        cpf: consultation.document,
        noCharge: true
      }
    });

    toast.success(text.loadedFromHistory, { duration: 2000 });
  };

  const formatCPF = (cpf: string) => {
    if (!cpf || cpf === 'CPF consultado') return 'N/A';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  };

  const formatFullDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString(localeCode[locale], {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateString; }
  };

  const getModuleLabel = (consultation: HistoryItem): string => {
    return (
      consultation.metadata?.module_title ||
      consultation.module_type ||
      'CPF'
    ).toString().toUpperCase();
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">{text.loading}</p>
      </div>
    );
  }

  if (consultationItems.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{text.empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {consultationItems.map((consultation) => {
        const consultationValue = consultation.cost || consultation.amount || 0;
        const numericValue = typeof consultationValue === 'string'
          ? parseFloat(String(consultationValue).replace(',', '.'))
          : Math.abs(Number(consultationValue)) || 0;
        const statusIsDone = consultation.status === 'success' || consultation.status === 'completed';
        const moduleLabel = getModuleLabel(consultation);

        return (
          <div
            key={consultation.id}
            onClick={() => handleConsultationClick(consultation)}
            className="border rounded-lg p-3 bg-card border-l-4 border-l-emerald-500 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium font-mono">
                  {formatCPF(consultation.document || '')}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {formatFullDate(consultation.created_at)}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  >
                    {moduleLabel}
                  </Badge>
                  <Badge
                    variant={statusIsDone ? 'default' : 'secondary'}
                    className="text-[10px] px-1.5 py-0 h-4"
                  >
                    {statusIsDone ? text.statusDone : text.statusPending}
                  </Badge>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="text-xs font-semibold px-2 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 flex-shrink-0"
              >
                -R$ {numericValue.toFixed(2).replace('.', ',')}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConsultationsSection;
