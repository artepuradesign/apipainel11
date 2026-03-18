
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import PageLayout from '@/components/layout/PageLayout';
import LoginForm from '@/components/auth/LoginForm';
import LoginLoadingScreen from '@/components/auth/LoginLoadingScreen';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginFooter from '@/components/auth/LoginFooter';
import SuspendedAccountAlert from '@/components/auth/SuspendedAccountAlert';
import InactiveAccountAlert from '@/components/auth/InactiveAccountAlert';
import PendingAccountAlert from '@/components/auth/PendingAccountAlert';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import { useLocale } from '@/contexts/LocaleContext';

const textByLocale = {
  'pt-BR': {
    invalidCredentials: 'Email ou senha incorretos',
    fillFields: 'Preencha email e senha',
    errorLogin: 'Erro ao fazer login. Tente novamente.',
  },
  en: {
    invalidCredentials: 'Invalid email or password',
    fillFields: 'Fill in email and password',
    errorLogin: 'Error signing in. Please try again.',
  },
  es: {
    invalidCredentials: 'Correo o contraseña incorrectos',
    fillFields: 'Completa correo y contraseña',
    errorLogin: 'Error al iniciar sesión. Inténtalo de nuevo.',
  },
} as const;

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuspendedAlert, setShowSuspendedAlert] = useState(false);
  const [showInactiveAlert, setShowInactiveAlert] = useState(false);
  const [showPendingAlert, setShowPendingAlert] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();
  const { locale } = useLocale();
  const t = textByLocale[locale];

  useEffect(() => {
    if (!loading && user) {
      const redirectTo = user.user_role === 'suporte' ? '/dashboard/admin' : '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && !user) {
      const savedEmail = localStorage.getItem('saved_email');

      if (savedEmail) {
        setFormData((prev) => ({ ...prev, email: savedEmail }));
        setRememberMe(true);
      }
    }
  }, [loading, user]);

  if (loading) {
    return <LoginLoadingScreen />;
  }

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error(t.fillFields);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('saved_email', formData.email);
        } else {
          localStorage.removeItem('saved_email');
        }

        if (result.redirectTo) {
          navigate(result.redirectTo, { replace: true });
        }
      } else if (result.statusCode === 'account_suspended') {
        setShowSuspendedAlert(true);
      } else if (result.statusCode === 'account_inactive') {
        setShowInactiveAlert(true);
      } else if (result.statusCode === 'account_pending') {
        setShowPendingAlert(true);
      } else {
        toast.error(result.message || t.invalidCredentials);
      }
    } catch {
      toast.error(t.errorLogin);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout variant="auth" backgroundOpacity="strong" showGradients={false}>
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm relative z-10" data-aos="fade-up">
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/30 dark:bg-gray-800/95 dark:border-gray-700/50 relative">
            <LoginHeader />

            <LoginForm
              formData={formData}
              setFormData={setFormData}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onForgotPassword={() => setShowForgotPasswordModal(true)}
            />

            <LoginFooter onNavigateToRegister={() => navigate('/registration')} />
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        open={showForgotPasswordModal}
        onOpenChange={setShowForgotPasswordModal}
        initialEmail={formData.email}
      />

      <SuspendedAccountAlert isOpen={showSuspendedAlert} onClose={() => setShowSuspendedAlert(false)} />
      <InactiveAccountAlert isOpen={showInactiveAlert} onClose={() => setShowInactiveAlert(false)} />
      <PendingAccountAlert isOpen={showPendingAlert} onClose={() => setShowPendingAlert(false)} />
    </PageLayout>
  );
};

export default Login;
