import { useState } from 'react';
import { toast } from "sonner";
import { referralRegistrationService } from '@/services/referralRegistrationService';
import { useRegistrationVerification } from '@/hooks/useRegistrationVerification';

interface ReferralBonusData {
  indicacao_id?: number;
  bonus_amount?: number;
  referrer_bonus?: number;
  transaction_id?: string;
  indicated_transaction_id?: string;
  balance_after?: number;
  indicated_balance_after?: number;
}

interface RegistrationApiResponse {
  user: any;
  token?: string;
  session_token?: string;
  expires_in?: number;
  session_id?: number;
  auto_login?: boolean;
  referral_bonus?: ReferralBonusData;
}

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  userType: 'assinante' | 'suporte';
  acceptTerms: boolean;
  verifiedReferralId: number | null;
  verifiedReferralCode: string;
  referralValidation?: {
    referrerName?: string;
    isValid: boolean;
    message?: string;
  };
  setCookie: (name: string, value: string, days: number) => void;
  navigate: (path: string) => void;
}

export const useRegistrationSubmit = (data: RegistrationData) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { verifyReferralSystem, getVerificationSummary } = useRegistrationVerification();

  const getErrorMessage = (serverMessage: string): string => {
    console.log('🔍 [ERROR] Analisando erro do servidor:', { serverMessage });
    
    if (!serverMessage) {
      return 'Erro desconhecido no servidor. Tente novamente.';
    }
    
    const lowerMessage = serverMessage.toLowerCase();
    
    // Tratar erros específicos do banco de dados (SQLSTATE)
    if (lowerMessage.includes('sqlstate') && lowerMessage.includes('duplicate entry')) {
      if (lowerMessage.includes('username')) {
        return 'Este email já está cadastrado. Faça login ou use outro email.';
      }
      if (lowerMessage.includes('email')) {
        return 'Este email já está cadastrado. Faça login ou use outro email.';
      }
      return 'Já existe uma conta com essas informações. Tente fazer login.';
    }
    
    // Tratar erros de violação de integridade
    if (lowerMessage.includes('integrity constraint violation')) {
      return 'Este email já está cadastrado. Faça login ou use outro email.';
    }
    
    if (lowerMessage.includes('email') && (lowerMessage.includes('existe') || lowerMessage.includes('already') || lowerMessage.includes('duplicate'))) {
      return 'Este email já está cadastrado. Que tal tentar fazer login ou usar outro email?';
    }
    
    if (lowerMessage.includes('username') || lowerMessage.includes('login')) {
      if (lowerMessage.includes('existe') || lowerMessage.includes('already') || lowerMessage.includes('duplicate')) {
        return 'Este email já está em uso. Por favor, use outro email.';
      }
    }
    
    if (lowerMessage.includes('senha') && lowerMessage.includes('fraca')) {
      return 'Sua senha precisa ser mais forte. Use pelo menos 8 caracteres com letras e números.';
    }
    
    if (lowerMessage.includes('password') && lowerMessage.includes('weak')) {
      return 'Sua senha precisa ser mais forte. Use pelo menos 8 caracteres com letras e números.';
    }
    
    if (lowerMessage.includes('email') && lowerMessage.includes('inválido')) {
      return 'Por favor, digite um email válido.';
    }
    
    if (lowerMessage.includes('termos')) {
      return 'Você precisa aceitar os termos e condições para continuar.';
    }
    
    if (lowerMessage.includes('código') && lowerMessage.includes('indicação')) {
      return 'O código de indicação informado não é válido.';
    }
    
    if (lowerMessage.includes('connection') || lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return 'Problema de conexão. Verifique sua internet e tente novamente.';
    }
    
    return serverMessage || 'Não foi possível completar seu cadastro. Verifique seus dados e tente novamente.';
  };

  // Função para verificar se todas as tabelas foram atualizadas
  const verifyRegistrationData = async (userId: number) => {
    try {
      console.log('🔍 [VERIFICATION] Verificando dados do registro para usuário:', userId);
      
      const response = await fetch('/api/referral-system/verify-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ [VERIFICATION] Resultado da verificação:', result);
        
        if (result.success) {
          const analysis = result.data.analysis;
          console.log('📊 [VERIFICATION] Análise:', {
            user_created: analysis.user_created,
            senhas_configuradas: analysis.senhas_configuradas,
            wallets_created: analysis.wallets_created,
            has_referral: analysis.has_referral,
            bonus_processed: analysis.bonus_processed,
            saldo_atualizado: analysis.saldo_atualizado
          });
          
          // Mostrar notificação com status
          if (analysis.bonus_processed && analysis.saldo_atualizado) {
            toast.success('🎉 Todas as tabelas foram atualizadas corretamente!');
          } else if (analysis.user_created && analysis.wallets_created) {
            toast.info('✅ Usuário criado com sucesso, processando indicação...');
          }
        }
      }
    } catch (error) {
      console.error('❌ [VERIFICATION] Erro ao verificar dados:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [REGISTRO] Iniciando processo de cadastro...');
    
    const validationErrors = [];
    
    if (!data.acceptTerms) {
      validationErrors.push("Você deve aceitar os termos e condições para continuar.");
    }

    if (!data.name?.trim()) {
      validationErrors.push("Nome é obrigatório.");
    }

    if (!data.email?.trim()) {
      validationErrors.push("Email é obrigatório.");
    }

    if (!data.password?.trim()) {
      validationErrors.push("Senha é obrigatória.");
    }

    if (data.password && data.password.length < 6) {
      validationErrors.push("Senha deve ter pelo menos 6 caracteres.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email.trim())) {
      validationErrors.push("Por favor, digite um email válido.");
    }

    if (validationErrors.length > 0) {
      console.error('❌ [REGISTRO] Erros de validação:', validationErrors);
      toast.error(validationErrors[0]);
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationPayload = {
        email: data.email.trim(),
        password: data.password,
        full_name: data.name.trim(),
        user_role: data.userType,
        aceite_termos: true,
        ...(data.verifiedReferralCode && {
          referralCode: data.verifiedReferralCode
        })
      };

      console.log('🌐 [REGISTRO] Enviando requisição para API com sistema de indicação...');
      console.log('📊 [REGISTRO] Payload:', {
        ...registrationPayload,
        password: '[HIDDEN]'
      });
      
      // Usar o novo serviço integrado que processa indicação automaticamente
      const registrationResult = await referralRegistrationService.registerWithReferral(registrationPayload);

      console.log('📊 [REGISTRO] Resultado da API:', {
        success: registrationResult.success,
        hasUser: !!registrationResult.user,
        hasReferralBonus: !!registrationResult.referral_bonus
      });

      if (!registrationResult.success) {
        console.error('❌ [REGISTRO] Falha no registro:', registrationResult);
        const errorToShow = registrationResult.message || registrationResult.error || 'Erro desconhecido';
        const friendlyMessage = getErrorMessage(errorToShow);
        toast.error(friendlyMessage);
        setIsSubmitting(false);
        return;
      }

      console.log('✅ [REGISTRO] Registro bem-sucedido!');
      
      if (registrationResult.user) {
        const userData = registrationResult.user;
        const token = registrationResult.token || registrationResult.session_token;
        
        console.log('👤 [REGISTRO] Processando dados do usuário:', {
          userId: userData.id,
          email: userData.email,
          role: userData.user_role,
          hasToken: !!token,
          hasReferral: !!data.verifiedReferralId,
          saldoPlano: userData.saldo_plano,
          bonusProcessed: !!registrationResult.referral_bonus
        });
        
        // Verificar completude do cadastro silenciosamente (apenas logs)
        if (userData.id) {
          console.log('🔍 [REGISTRO] Verificando completude do cadastro...');
          
          // Verificação básica silenciosa
          await referralRegistrationService.verifyRegistrationCompleteness(userData.id);
          
          // Verificação do sistema de indicação se houver código (silenciosa)
          if (data.verifiedReferralCode) {
            console.log('🎁 [REGISTRO] Verificando sistema de indicação...');
            // Não chamar verifyReferralSystem para evitar toasts de erro
            const summary = await getVerificationSummary(userData.id, data.verifiedReferralCode);
            console.log('📋 [REGISTRO] Resumo da verificação:', summary);
          }
        }
        
        // Mostrar notificação de sucesso simples
        console.log('✅ [REGISTRO] Preparando notificação de sucesso...');
        
        // Verificar se há dados de bônus na resposta
        const hasBonus = registrationResult.referral_bonus || userData.saldo_plano > 0;
        
        if (hasBonus && data.verifiedReferralCode) {
          console.log('🎁 [REGISTRO] Detectado bônus ou saldo, mostrando mensagem especial');
          toast.success('🎉 Cadastro realizado com sucesso! Bônus de indicação processado - faça login para continuar.');
        } else {
          console.log('✅ [REGISTRO] Mostrando mensagem padrão de sucesso');
          toast.success('🎉 Cadastro realizado com sucesso! Faça login para continuar.');
        }
        
        // Sempre redirecionar para login
        data.navigate('/login');
        
      } else {
        console.error('❌ [REGISTRO] Dados do usuário não encontrados na resposta');
        toast.success('🎉 Cadastro realizado com sucesso! Faça login para continuar.');
        data.navigate('/login');
      }

    } catch (error: any) {
      console.error('❌ [REGISTRO] Erro geral no registro:', error);
      const errorMessage = getErrorMessage(error.message || 'Erro interno');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
