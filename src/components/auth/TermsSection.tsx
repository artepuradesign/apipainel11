
import React from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLocale } from '@/contexts/LocaleContext';

interface TermsSectionProps {
  acceptTerms: boolean;
  setAcceptTerms: (accept: boolean) => void;
}

const textByLocale = {
  'pt-BR': {
    prefix: 'Aceito os',
    terms: 'Termos de Uso',
    and: 'e',
    privacy: 'Política de Privacidade',
  },
  en: {
    prefix: 'I accept the',
    terms: 'Terms of Service',
    and: 'and',
    privacy: 'Privacy Policy',
  },
  es: {
    prefix: 'Acepto los',
    terms: 'Términos de Uso',
    and: 'y',
    privacy: 'Política de Privacidad',
  },
} as const;

const TermsSection: React.FC<TermsSectionProps> = ({ acceptTerms, setAcceptTerms }) => {
  const { locale } = useLocale();
  const t = textByLocale[locale];

  return (
    <div className="flex items-start space-x-2 py-2">
      <Checkbox
        id="terms"
        checked={acceptTerms}
        onCheckedChange={(checked) => {
          setAcceptTerms(checked as boolean);
        }}
        className="mt-0.5"
      />
      <Label
        htmlFor="terms"
        className="text-sm cursor-pointer leading-5"
      >
        {t.prefix}{' '}
        <Link to="/terms" target="_blank" className="text-primary hover:underline">{t.terms}</Link>{' '}
        {t.and}{' '}
        <Link to="/privacy" target="_blank" className="text-primary hover:underline">{t.privacy}</Link>
      </Label>
    </div>
  );
};

export default TermsSection;
