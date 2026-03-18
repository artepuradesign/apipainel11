
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User, Mail, Gift } from "lucide-react";
import { toast } from 'sonner';
import { makeDirectRequest } from '@/config/apiConfig';
import { externalReferralApiService } from '@/services/externalReferralApiService';
import { useBonusConfig } from '@/services/bonusConfigService';
import { useLocale } from '@/contexts/LocaleContext';

interface RegistrationFormProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isSubmitting: boolean;
  isFormComplete: boolean;
  referralId: string;
  setReferralId: (value: string) => void;
  onVerifyReferralId: (referrerId: number, referralCode: string) => void;
  referralValidation: any;
  isProcessingUrl?: boolean;
}

const textByLocale = {
  'pt-BR': {
    name: 'Nome Completo',
    namePlaceholder: 'Digite seu nome',
    email: 'Email',
    emailPlaceholder: 'seu@email.com',
    password: 'Senha',
    passwordPlaceholder: 'Crie uma senha',
    referralLabel: 'Código de Indicação (Opcional)',
    referralPlaceholder: 'Ex: USER123',
    validate: 'Validar',
    validating: '...',
    validated: '✓ OK',
    submit: 'Criar Conta',
    submitting: 'Processando...',
    referralEmpty: 'Por favor, digite um código de indicação',
    referralSuccess: 'Ótimo! Código de {name} aplicado com sucesso!',
    referralNotFound: 'Código de indicação não encontrado',
    referralError: 'Erro ao validar código. Tente novamente.',
    referralValidMessage: '✅ Código válido! Indicado por: {name} — Bônus: {bonus}',
    referralExpiredMessage: '⏰ Código expirado',
    referralInvalidMessage: '❌ {message}',
    fallbackReferrer: 'Usuário Indicador',
  },
  en: {
    name: 'Full Name',
    namePlaceholder: 'Enter your name',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    password: 'Password',
    passwordPlaceholder: 'Create a password',
    referralLabel: 'Referral Code (Optional)',
    referralPlaceholder: 'Ex: USER123',
    validate: 'Validate',
    validating: '...',
    validated: '✓ OK',
    submit: 'Create Account',
    submitting: 'Processing...',
    referralEmpty: 'Please enter a referral code',
    referralSuccess: 'Great! {name} code applied successfully!',
    referralNotFound: 'Referral code not found',
    referralError: 'Error validating code. Please try again.',
    referralValidMessage: '✅ Valid code! Referred by: {name} — Bonus: {bonus}',
    referralExpiredMessage: '⏰ Expired code',
    referralInvalidMessage: '❌ {message}',
    fallbackReferrer: 'Referrer User',
  },
  es: {
    name: 'Nombre Completo',
    namePlaceholder: 'Ingresa tu nombre',
    email: 'Correo',
    emailPlaceholder: 'tu@email.com',
    password: 'Contraseña',
    passwordPlaceholder: 'Crea una contraseña',
    referralLabel: 'Código de Referido (Opcional)',
    referralPlaceholder: 'Ej: USER123',
    validate: 'Validar',
    validating: '...',
    validated: '✓ OK',
    submit: 'Crear Cuenta',
    submitting: 'Procesando...',
    referralEmpty: 'Por favor, ingresa un código de referido',
    referralSuccess: '¡Genial! Código de {name} aplicado con éxito.',
    referralNotFound: 'Código de referido no encontrado',
    referralError: 'Error al validar el código. Inténtalo de nuevo.',
    referralValidMessage: '✅ Código válido. Referido por: {name} — Bono: {bonus}',
    referralExpiredMessage: '⏰ Código vencido',
    referralInvalidMessage: '❌ {message}',
    fallbackReferrer: 'Usuario Referente',
  },
} as const;

const localeToCurrency = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
} as const;

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  isSubmitting,
  isFormComplete,
  referralId,
  setReferralId,
  onVerifyReferralId,
  referralValidation,
  isProcessingUrl = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const { bonusAmount } = useBonusConfig();
  const { locale } = useLocale();
  const t = textByLocale[locale];

  const validateReferralCode = async () => {
    if (!referralId.trim()) {
      toast(t.referralEmpty);
      return;
    }

    if (hasVerified || referralValidation?.isValid || isProcessingUrl) {
      return;
    }

    setIsValidating(true);

    try {
      const externalValidation = await externalReferralApiService.validateReferralCode(referralId.trim());

      if (externalValidation.valid) {
        const referrerName = externalValidation.referrer_name || t.fallbackReferrer;
        setHasVerified(true);
        onVerifyReferralId(externalValidation.referrer_id!, referralId.trim());
        toast(t.referralSuccess.replace('{name}', referrerName));
        return;
      }

      const response = await makeDirectRequest('/auth/validate-referral', {
        code: referralId.trim(),
      }, 'POST');

      if (response.success && response.data) {
        const referrerName = response.data.referrer_name || response.data.referrerName || response.data.full_name || response.data.name || t.fallbackReferrer;
        setHasVerified(true);
        onVerifyReferralId(response.data.referrer_id, referralId.trim());
        toast(t.referralSuccess.replace('{name}', referrerName));
      } else {
        toast(response.message || t.referralNotFound);
        setHasVerified(false);
      }
    } catch {
      toast(t.referralError);
      setHasVerified(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (value: string) => {
    setReferralId(value.toUpperCase());
    setHasVerified(false);
  };

  const isCodeVerified = referralValidation?.isValid || hasVerified;
  const localizedBonus = bonusAmount.toLocaleString(localeToCurrency[locale], { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">{t.name}</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10 h-9"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">{t.email}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-9"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">{t.password}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-9"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referral-code" className="text-sm font-medium">{t.referralLabel}</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Gift className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="referral-code"
              type="text"
              value={referralId}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={t.referralPlaceholder}
              className="pl-10 uppercase h-9"
              disabled={isValidating || isCodeVerified || isProcessingUrl}
            />
          </div>
          <Button
            type="button"
            onClick={validateReferralCode}
            disabled={!referralId.trim() || isValidating || isCodeVerified || isProcessingUrl}
            variant={isCodeVerified ? 'default' : 'outline'}
            size="sm"
            className="whitespace-nowrap min-w-[80px] h-9"
          >
            {isValidating ? t.validating : isCodeVerified ? t.validated : t.validate}
          </Button>
        </div>

        {referralValidation && (
          <div className={`text-xs p-2 rounded ${
            referralValidation.isValid
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : referralValidation.isExpired
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {referralValidation.isValid
              ? t.referralValidMessage
                .replace('{name}', referralValidation.referrerName || t.fallbackReferrer)
                .replace('{bonus}', localizedBonus)
              : referralValidation.isExpired
                ? t.referralExpiredMessage
                : t.referralInvalidMessage.replace('{message}', referralValidation.message || t.referralNotFound)}
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold premium-button"
        disabled={isSubmitting || !isFormComplete}
      >
        {isSubmitting ? t.submitting : t.submit}
      </Button>
    </div>
  );
};

export default RegistrationForm;
