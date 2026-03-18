import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLocale } from '@/contexts/LocaleContext';
import { resetPasswordWithToken } from '@/services/auth/passwordRecoveryService';

const textByLocale = {
  'pt-BR': {
    title: 'Atualizar senha',
    subtitle: 'Defina sua nova senha para voltar a acessar sua conta.',
    passwordLabel: 'Nova senha',
    passwordPlaceholder: 'Mínimo de 6 caracteres',
    confirmLabel: 'Confirmar nova senha',
    confirmPlaceholder: 'Repita a nova senha',
    submit: 'Atualizar senha',
    submitting: 'Atualizando...',
    backToLogin: 'Voltar ao login',
    missingToken: 'Link inválido ou expirado.',
    invalidPassword: 'A senha deve ter pelo menos 6 caracteres.',
    mismatch: 'As senhas não coincidem.',
    success: 'Senha atualizada com sucesso. Faça login novamente.',
    error: 'Não foi possível atualizar sua senha.',
  },
  en: {
    title: 'Update password',
    subtitle: 'Set your new password to access your account again.',
    passwordLabel: 'New password',
    passwordPlaceholder: 'At least 6 characters',
    confirmLabel: 'Confirm new password',
    confirmPlaceholder: 'Repeat the new password',
    submit: 'Update password',
    submitting: 'Updating...',
    backToLogin: 'Back to login',
    missingToken: 'Invalid or expired link.',
    invalidPassword: 'Password must be at least 6 characters.',
    mismatch: 'Passwords do not match.',
    success: 'Password updated successfully. Please sign in again.',
    error: 'Could not update your password.',
  },
  es: {
    title: 'Actualizar contraseña',
    subtitle: 'Define tu nueva contraseña para volver a acceder a tu cuenta.',
    passwordLabel: 'Nueva contraseña',
    passwordPlaceholder: 'Mínimo 6 caracteres',
    confirmLabel: 'Confirmar nueva contraseña',
    confirmPlaceholder: 'Repite la nueva contraseña',
    submit: 'Actualizar contraseña',
    submitting: 'Actualizando...',
    backToLogin: 'Volver al login',
    missingToken: 'Enlace inválido o vencido.',
    invalidPassword: 'La contraseña debe tener al menos 6 caracteres.',
    mismatch: 'Las contraseñas no coinciden.',
    success: 'Contraseña actualizada con éxito. Inicia sesión de nuevo.',
    error: 'No se pudo actualizar tu contraseña.',
  },
} as const;

const ResetPassword = () => {
  const { locale } = useLocale();
  const t = textByLocale[locale];
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token')?.trim() || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasToken = useMemo(() => token.length > 0, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!hasToken) {
      toast.error(t.missingToken);
      return;
    }

    if (password.trim().length < 6) {
      toast.error(t.invalidPassword);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t.mismatch);
      return;
    }

    setIsSubmitting(true);

    const result = await resetPasswordWithToken(token, password);

    if (result.success) {
      toast.success(result.message || t.success);
      navigate('/login', { replace: true });
      return;
    }

    toast.error(result.message || t.error);
    setIsSubmitting(false);
  };

  return (
    <PageLayout variant="auth" backgroundOpacity="strong" showGradients={false}>
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t.passwordLabel}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">{t.confirmLabel}</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={t.confirmPlaceholder}
                  autoComplete="new-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t.submitting : t.submit}
              </Button>

              <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/login')}>
                {t.backToLogin}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ResetPassword;
