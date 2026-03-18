import React from 'react';
import PersonalizationSettings from '@/components/configuracoes/PersonalizationSettings';
import { ModuleTemplateProvider } from '@/contexts/ModuleTemplateContext';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { Settings } from 'lucide-react';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

const textByLocale: Record<Locale, { title: string; subtitle: string }> = {
  'pt-BR': {
    title: 'Personalização',
    subtitle: 'Configure painéis, módulos e planos do sistema',
  },
  en: {
    title: 'Customization',
    subtitle: 'Configure system panels, modules, and plans',
  },
  es: {
    title: 'Personalización',
    subtitle: 'Configura paneles, módulos y planes del sistema',
  },
};

const Personalizacao = () => {
  const { locale } = useLocale();
  const text = textByLocale[locale];

  return (
    <ModuleTemplateProvider>
      <div className="space-y-4 sm:space-y-6">
        <DashboardTitleCard
          title={text.title}
          subtitle={text.subtitle}
          icon={<Settings className="h-4 w-4 sm:h-5 sm:w-5" />}
          backTo="/dashboard/admin"
        />

        <PersonalizationSettings />
      </div>
    </ModuleTemplateProvider>
  );
};

export default Personalizacao;
