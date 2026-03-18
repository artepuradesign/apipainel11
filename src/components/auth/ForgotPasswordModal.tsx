import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocale } from '@/contexts/LocaleContext';
import { requestPasswordRecovery } from '@/services/auth/passwordRecoveryService';
import { toast } from 'sonner';

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail?: string;
}

const textByLocale = {
  'pt-BR': {
    title: 'Recuperar senha',
    description: 'Informe o e-mail cadastrado para receber as instruções de recuperação.',
    emailLabel: 'E-mail cadastrado',
    emailPlaceholder: 'Digite seu e-mail',
    readConfirmation: 'Confirmo que li o aviso e desejo receber o e-mail para atualização de senha.',
    cancel: 'Cancelar',
    submit: 'Enviar recuperação',
    sending: 'Enviando...',
    invalidEmail: 'Digite um e-mail válido.',
    confirmRequired: 'Você precisa confirmar a leitura para continuar.',
    success: 'Se o e-mail existir na base, enviaremos as instruções de recuperação.',
    error: 'Não foi possível enviar o e-mail de recuperação.',
  },
  en: {
    title: 'Recover password',
    description: 'Enter your registered email to receive recovery instructions.',
    emailLabel: 'Registered email',
    emailPlaceholder: 'Enter your email',
    readConfirmation: 'I confirm I read the notice and want to receive the password update email.',
    cancel: 'Cancel',
    submit: 'Send recovery',
    sending: 'Sending...',
    invalidEmail: 'Please enter a valid email.',
    confirmRequired: 'You must confirm reading before continuing.',
    success: 'If the email exists, recovery instructions will be sent.',
    error: 'Could not send the recovery email.',
  },
  es: {
    title: 'Recuperar contraseña',
    description: 'Ingresa el correo registrado para recibir instrucciones de recuperación.',
    emailLabel: 'Correo registrado',
    emailPlaceholder: 'Ingresa tu correo',
    readConfirmation: 'Confirmo que leí el aviso y deseo recibir el correo para actualizar la contraseña.',
    cancel: 'Cancelar',
    submit: 'Enviar recuperación',
    sending: 'Enviando...',
    invalidEmail: 'Ingresa un correo válido.',
    confirmRequired: 'Debes confirmar la lectura para continuar.',
    success: 'Si el correo existe, enviaremos instrucciones de recuperación.',
    error: 'No se pudo enviar el correo de recuperación.',
  },
} as const;

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ open, onOpenChange, initialEmail = '' }) => {
  const { locale } = useLocale();
  const t = textByLocale[locale];

  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readConfirmed, setReadConfirmed] = useState(false);

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReadConfirmed(false);
      setIsSubmitting(false);
    }

    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isEmailValid) {
      toast.error(t.invalidEmail);
      return;
    }

    if (!readConfirmed) {
      toast.error(t.confirmRequired);
      return;
    }

    setIsSubmitting(true);

    const result = await requestPasswordRecovery(email);

    if (result.success) {
      toast.success(result.message || t.success);
      handleClose(false);
      return;
    }

    toast.error(result.message || t.error);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{t.description}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-password-email">{t.emailLabel}</Label>
            <Input
              id="forgot-password-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.emailPlaceholder}
              autoComplete="email"
              required
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="read-confirmation"
              checked={readConfirmed}
              onCheckedChange={(checked) => setReadConfirmed(checked === true)}
            />
            <Label htmlFor="read-confirmation" className="text-sm leading-5 cursor-pointer">
              {t.readConfirmation}
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t.sending : t.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
