
import React from 'react';
import LoadingScreen from '@/components/layout/LoadingScreen';
import { useLocale } from '@/contexts/LocaleContext';

interface LoginLoadingScreenProps {
  message?: string;
  variant?: 'auth' | 'dashboard' | 'default';
}

const defaultMessageByLocale = {
  'pt-BR': 'Verificando sessão',
  en: 'Checking session',
  es: 'Verificando sesión',
} as const;

const LoginLoadingScreen: React.FC<LoginLoadingScreenProps> = ({
  message,
  variant = 'auth',
}) => {
  const { locale } = useLocale();

  return (
    <LoadingScreen
      message={message || defaultMessageByLocale[locale]}
      variant={variant}
    />
  );
};

export default LoginLoadingScreen;
