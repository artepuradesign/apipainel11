import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { cookieUtils } from '@/utils/cookieUtils';
import { useLocale } from '@/contexts/LocaleContext';

const PasswordChangeForm = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { locale } = useLocale();

  const t = {
    'pt-BR': {
      title: 'Alterar Senha',
      currentPassword: 'Senha Atual *',
      newPassword: 'Nova Senha *',
      currentPlaceholder: 'Digite sua senha atual',
      newPlaceholder: 'Mínimo 6 caracteres',
      loading: 'Alterando...',
      submit: 'Alterar Senha',
      required: 'Todos os campos são obrigatórios',
      minLength: 'A nova senha deve ter pelo menos 6 caracteres',
      different: 'A nova senha deve ser diferente da senha atual',
      sessionExpired: 'Sessão expirada. Faça login novamente.',
      success: 'Senha alterada com sucesso! Redirecionando...',
      genericError: 'Erro ao alterar senha',
      wrongCurrent: 'Senha atual incorreta',
      serviceNotFound: 'Serviço não encontrado. Entre em contato com o suporte.',
      serverError: 'Erro interno do servidor. Entre em contato com o suporte.',
      connectionError: 'Erro de conexão: Verifique sua internet',
    },
    en: {
      title: 'Change Password',
      currentPassword: 'Current Password *',
      newPassword: 'New Password *',
      currentPlaceholder: 'Enter your current password',
      newPlaceholder: 'Minimum 6 characters',
      loading: 'Changing...',
      submit: 'Change Password',
      required: 'All fields are required',
      minLength: 'The new password must be at least 6 characters',
      different: 'The new password must be different from current password',
      sessionExpired: 'Session expired. Please log in again.',
      success: 'Password changed successfully! Redirecting...',
      genericError: 'Error changing password',
      wrongCurrent: 'Current password is incorrect',
      serviceNotFound: 'Service not found. Please contact support.',
      serverError: 'Internal server error. Please contact support.',
      connectionError: 'Connection error: Check your internet',
    },
    es: {
      title: 'Cambiar Contraseña',
      currentPassword: 'Contraseña Actual *',
      newPassword: 'Nueva Contraseña *',
      currentPlaceholder: 'Ingresa tu contraseña actual',
      newPlaceholder: 'Mínimo 6 caracteres',
      loading: 'Cambiando...',
      submit: 'Cambiar Contraseña',
      required: 'Todos los campos son obligatorios',
      minLength: 'La nueva contraseña debe tener al menos 6 caracteres',
      different: 'La nueva contraseña debe ser diferente a la actual',
      sessionExpired: 'Sesión expirada. Inicia sesión nuevamente.',
      success: '¡Contraseña cambiada con éxito! Redirigiendo...',
      genericError: 'Error al cambiar contraseña',
      wrongCurrent: 'La contraseña actual es incorrecta',
      serviceNotFound: 'Servicio no encontrado. Contacta al soporte.',
      serverError: 'Error interno del servidor. Contacta al soporte.',
      connectionError: 'Error de conexión: verifica tu internet',
    },
  }[locale];

  const [showPasswords, setShowPasswords] = useState({ current: false, new: false });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = (field: 'current' | 'new') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error(t.required);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t.minLength);
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error(t.different);
      return;
    }

    setLoading(true);
    try {
      const sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');

      if (!sessionToken || sessionToken === 'authenticated') {
        toast.error(t.sessionExpired);
        return;
      }

      const response = await fetch('https://api.apipainel.com.br/auth/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(t.success);
          await signOut();
          cookieUtils.remove('api_session_token');
          sessionStorage.clear();
          navigate('/login', { replace: true });
          return;
        }
        toast.error(result.message || t.genericError);
        return;
      }

      if (response.status === 401) {
        toast.error(t.wrongCurrent);
      } else if (response.status === 404) {
        toast.error(t.serviceNotFound);
      } else if (response.status === 500) {
        toast.error(t.serverError);
      } else {
        toast.error(`${t.genericError}: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error(t.connectionError);
      } else {
        toast.error(t.genericError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Key className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="current_password" className="text-sm">{t.currentPassword}</Label>
            <div className="relative">
              <Input
                id="current_password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                placeholder={t.currentPlaceholder}
                className="pr-10 text-sm sm:text-base"
              />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => togglePasswordVisibility('current')}>
                {showPasswords.current ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="new_password" className="text-sm">{t.newPassword}</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder={t.newPlaceholder}
                className="pr-10 text-sm sm:text-base"
              />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => togglePasswordVisibility('new')}>
                {showPasswords.new ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
            className="w-full bg-brand-purple hover:bg-brand-darkPurple text-sm sm:text-base"
          >
            {loading ? t.loading : t.submit}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordChangeForm;
