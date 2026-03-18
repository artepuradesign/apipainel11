
import React from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '@/contexts/LocaleContext';

interface LoginFooterProps {
  onNavigateToRegister: () => void;
}

const textByLocale = {
  'pt-BR': {
    noAccount: 'Não tem conta?',
    register: 'Cadastre-se',
    legalPrefix: 'Nossos',
    terms: 'Termos de Uso',
    privacy: 'Política de Privacidade',
    and: 'e',
  },
  en: {
    noAccount: "Don't have an account?",
    register: 'Sign up',
    legalPrefix: 'By continuing, you agree to our',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    and: 'and',
  },
  es: {
    noAccount: '¿No tienes cuenta?',
    register: 'Regístrate',
    legalPrefix: 'Al continuar, aceptas nuestros',
    terms: 'Términos de Uso',
    privacy: 'Política de Privacidad',
    and: 'y',
  },
} as const;

const LoginFooter: React.FC<LoginFooterProps> = ({ onNavigateToRegister }) => {
  const { locale } = useLocale();
  const t = textByLocale[locale];

  return (
    <div className="mt-5 text-center space-y-2">
      <p className="text-sm text-muted-foreground">
        {t.noAccount}{' '}
        <button
          onClick={onNavigateToRegister}
          className="text-primary hover:underline cursor-pointer transition-colors duration-200"
          type="button"
        >
          {t.register}
        </button>
      </p>

      <p className="text-xs text-muted-foreground">
        {t.legalPrefix}{' '}
        <Link to="/terms" className="text-primary hover:underline">
          {t.terms}
        </Link>{' '}
        {t.and}{' '}
        <Link to="/privacy" className="text-primary hover:underline">
          {t.privacy}
        </Link>
      </p>
    </div>
  );
};

export default LoginFooter;
