
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale } from '@/contexts/LocaleContext';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  formData: LoginFormData;
  setFormData: (data: LoginFormData) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onForgotPassword: () => void;
}

const textByLocale = {
  'pt-BR': {
    email: 'Email',
    emailPlaceholder: 'Digite seu email',
    password: 'Senha',
    passwordPlaceholder: 'Digite sua senha',
    remember: 'Lembrar senha',
    forgot: 'Esqueci minha senha',
    emptyFields: 'Por favor, preencha todos os campos',
    submitting: 'Entrando...',
    submit: 'Entrar',
  },
  en: {
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    remember: 'Remember me',
    forgot: 'Forgot password',
    emptyFields: 'Please fill in all fields',
    submitting: 'Signing in...',
    submit: 'Sign in',
  },
  es: {
    email: 'Correo',
    emailPlaceholder: 'Ingresa tu correo',
    password: 'Contraseña',
    passwordPlaceholder: 'Ingresa tu contraseña',
    remember: 'Recordar contraseña',
    forgot: 'Olvidé mi contraseña',
    emptyFields: 'Por favor, completa todos los campos',
    submitting: 'Ingresando...',
    submit: 'Ingresar',
  },
} as const;

const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  isSubmitting,
  onSubmit,
  onForgotPassword,
}) => {
  const { locale } = useLocale();
  const t = textByLocale[locale];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error(t.emptyFields);
      return;
    }

    await onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="email">{t.email}</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder={t.emailPlaceholder}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="pl-10 h-9"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t.password}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t.passwordPlaceholder}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <Label htmlFor="remember" className="text-sm">
            {t.remember}
          </Label>
        </div>

        <button
          type="button"
          className="text-sm text-primary hover:underline"
          onClick={onForgotPassword}
        >
          {t.forgot}
        </button>
      </div>

      <Button
        type="submit"
        className="w-full h-9"
        disabled={isSubmitting}
      >
        {isSubmitting ? t.submitting : t.submit}
      </Button>
    </form>
  );
};

export default LoginForm;
