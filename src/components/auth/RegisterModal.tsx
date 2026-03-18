import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Lock, User, Mail, Loader2, Package } from 'lucide-react';
import { referralRegistrationService } from '@/services/referralRegistrationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin
}) => {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidName, setIsValidName] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);

  // Validations
  useEffect(() => {
    setIsValidName(formData.name.trim().length >= 2);
  }, [formData.name]);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(formData.email));
  }, [formData.email]);

  useEffect(() => {
    setIsValidPassword(formData.password.length >= 6);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidName) {
      toast.error('Por favor, insira seu nome completo');
      return;
    }

    if (!isValidEmail) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    if (!isValidPassword) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!acceptTerms) {
      toast.error('Você deve aceitar os termos de uso');
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationPayload = {
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.name.trim(),
        user_role: 'assinante' as const,
        aceite_termos: true
      };

      console.log('🚀 [REGISTER_MODAL] Registrando usuário...');
      
      const registrationResult = await referralRegistrationService.registerWithReferral(registrationPayload);

      if (!registrationResult.success) {
        console.error('❌ [REGISTER_MODAL] Falha no registro:', registrationResult);
        const errorMessage = registrationResult.message || registrationResult.error || 'Erro no cadastro';
        toast.error(errorMessage);
        return;
      }

      console.log('✅ [REGISTER_MODAL] Registro bem-sucedido, fazendo login...');
      
      // Auto login após registro
      const loginResult = await signIn(formData.email, formData.password);
      
      if (loginResult.success) {
        toast.success('Conta criada e login realizado com sucesso!');
        onClose();
        // Reset form
        setFormData({ name: '', email: '', password: '' });
        setAcceptTerms(false);
      } else {
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        onSwitchToLogin();
      }
      
    } catch (error: any) {
      console.error('❌ [REGISTER_MODAL] Erro no registro:', error);
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '' });
    setAcceptTerms(false);
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* Logo completa igual ao rodapé */}
          <div className="flex justify-center mb-4 md:mb-2">
            <div className="flex items-center">
              <Package className="text-brand-purple mr-2 dark:text-purple-400" size={32} />
              <span className="text-2xl md:text-xl font-bold text-brand-purple dark:text-purple-400">API</span>
              <span className="text-2xl md:text-xl font-bold text-gray-700 dark:text-white">painel</span>
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            Criar sua conta
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="register-name">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="register-name"
                type="text"
                placeholder="Digite seu nome"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="pl-10 h-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="register-email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="pl-10 h-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="register-password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Crie uma senha"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="pl-10 pr-10 h-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="accept-terms" 
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked === true)}
            />
            <Label htmlFor="accept-terms" className="text-sm leading-5">
              Aceito os{' '}
              <a href="/terms" target="_blank" className="text-brand-purple hover:text-brand-darkPurple">
                termos de uso
              </a>{' '}
              e{' '}
              <a href="/privacy" target="_blank" className="text-brand-purple hover:text-brand-darkPurple">
                política de privacidade
              </a>
            </Label>
          </div>

          <Button 
            type="submit" 
            className={`w-full h-10 ${
              isValidName && isValidEmail && isValidPassword && acceptTerms
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-brand-purple hover:bg-brand-darkPurple'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>
        </form>

        <div className="text-center mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-brand-purple hover:text-brand-darkPurple font-medium"
            >
              Fazer login
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;