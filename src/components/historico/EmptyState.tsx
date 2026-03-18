import React from 'react';
import { Wallet, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  loading?: boolean;
}

const textByLocale: Record<Locale, { loading: string }> = {
  'pt-BR': { loading: 'Carregando dados…' },
  en: { loading: 'Loading data…' },
  es: { loading: 'Cargando datos…' },
};

const EmptyState: React.FC<EmptyStateProps> = ({ title, subtitle, loading = false }) => {
  const { locale } = useLocale();

  return (
    <div className="py-10 w-full">
      <div className="w-full">
        <Card className="border-border bg-card">
          <CardContent className="p-6 text-center">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <p className="text-sm">{textByLocale[locale].loading}</p>
              </div>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
                  <Wallet className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmptyState;
