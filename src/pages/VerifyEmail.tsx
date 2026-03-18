
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, Clock, RefreshCw, X } from 'lucide-react';
import { toast } from "sonner";
import TextLogo from '@/components/TextLogo';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get email from registration data
    const registrationData = localStorage.getItem('pending_registration');
    if (registrationData) {
      const data = JSON.parse(registrationData);
      setEmail(data.email);
    } else {
      // If no registration data, redirect to registration
      navigate('/registro');
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleResendEmail = async () => {
    setIsResending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Email de verificação reenviado com sucesso!');
      
      // Reset timer
      setTimeLeft(60);
      setCanResend(false);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      toast.error('Erro ao reenviar email. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyClick = () => {
    // Simulate email verification
    const registrationData = localStorage.getItem('pending_registration');
    if (registrationData) {
      const data = JSON.parse(registrationData);
      
      // Create user object for localStorage
      const userData = {
        id: Date.now().toString(),
        email: data.email,
        created_at: new Date().toISOString()
      };
      
      const profileData = {
        id: userData.id,
        full_name: data.name,
        avatar_url: null,
        user_role: 'assinante' as const,
        referral_id: data.referralId
      };
      
      // Store in localStorage
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('auth_profile', JSON.stringify(profileData));
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
      
      // Remove pending registration
      localStorage.removeItem('pending_registration');
      
      toast.success('Email verificado com sucesso! Bem-vindo ao Painel!');
      
      // Redirect to main dashboard page instead of adicionar-saldo
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 dark:opacity-85 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-cyan-300 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 dark:opacity-85 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 dark:bg-pink-300 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 dark:opacity-85 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-pink-300 dark:bg-emerald-300 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-25 dark:opacity-75 animate-blob animation-delay-6000"></div>
        <div className="absolute bottom-1/3 left-1/2 w-70 h-70 bg-yellow-300 dark:bg-orange-300 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 dark:opacity-70 animate-blob animation-delay-3000"></div>
        {/* Colors from plan cards for thematic consistency */}
        <div className="absolute top-20 left-3/4 w-60 h-60 bg-brand-tone1/20 dark:bg-brand-tone1/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-40 dark:opacity-60 animate-blob animation-delay-7000"></div>
        <div className="absolute bottom-40 left-1/4 w-70 h-70 bg-brand-tone2/15 dark:bg-brand-tone2/35 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-35 dark:opacity-65 animate-blob animation-delay-8000"></div>
      </div>

      {/* Theme Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-md relative z-10" data-aos="fade-up">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50">
          <CardHeader className="text-center pb-2">
            <div className="mb-4">
              <TextLogo />
            </div>
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Verifique seu email</CardTitle>
            <CardDescription className="text-center">
              Enviamos um link de verificação para:
              <br />
              <span className="font-semibold text-brand-purple">{email}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Não recebeu o email?</p>
                  <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• Verifique sua caixa de spam</li>
                    <li>• Aguarde alguns minutos</li>
                    <li>• Verifique se o email está correto</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={!canResend || isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Reenviando...
                  </>
                ) : canResend ? (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Reenviar Email
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Reenviar em {timeLeft}s
                  </>
                )}
              </Button>

              {/* Simulate verification button for demo purposes */}
              <Button
                onClick={handleVerifyClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Simular Verificação (Demo)
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email incorreto?{" "}
                <button 
                  onClick={() => navigate('/registro')}
                  className="text-brand-purple hover:underline"
                >
                  Voltar ao cadastro
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
