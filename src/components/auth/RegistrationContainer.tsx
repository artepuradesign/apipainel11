
import React from 'react';
import RegistrationCard from './RegistrationCard';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import TextLogo from '@/components/TextLogo';
import PageLayout from '@/components/layout/PageLayout';
import { useLocale } from '@/contexts/LocaleContext';

interface RegistrationContainerProps {
  onNavigateToLogin?: () => void;
}

const textByLocale = {
  'pt-BR': {
    hasAccount: 'Já tem uma conta?',
    login: 'Faça login',
  },
  en: {
    hasAccount: 'Already have an account?',
    login: 'Sign in',
  },
  es: {
    hasAccount: '¿Ya tienes una cuenta?',
    login: 'Inicia sesión',
  },
} as const;

const RegistrationContainer = ({ onNavigateToLogin }: RegistrationContainerProps) => {
  const { locale } = useLocale();
  const t = textByLocale[locale];

  const handleNavigateToLogin = (e: React.MouseEvent) => {
    e.preventDefault();

    if (onNavigateToLogin) {
      onNavigateToLogin();
    }
  };

  return (
    <PageLayout variant="auth" backgroundOpacity="strong" showGradients={false}>
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm relative z-10" data-aos="fade-up">
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/30 dark:bg-gray-800/95 dark:border-gray-700/50 relative">
            <div className="absolute top-4 right-4 z-10">
              <ThemeSwitcher />
            </div>

            <div className="mb-5">
              <TextLogo to="/" showFullOnMobile={true} />
            </div>

            <RegistrationCard />

            <div className="mt-5 text-center">
              <p className="text-sm text-muted-foreground">
                {t.hasAccount}{' '}
                <button
                  onClick={handleNavigateToLogin}
                  className="text-primary hover:underline cursor-pointer transition-colors duration-200"
                  type="button"
                >
                  {t.login}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default RegistrationContainer;
