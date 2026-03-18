import { API_BASE_URL } from '@/config/apiConfig';
import { toast } from 'sonner';
import { bonusConfigService } from './bonusConfigService';

interface ReferralBonusResponse {
  success: boolean;
  bonus_processed: boolean;
  transactions_created: {
    referrer_transaction_id?: number;
    referred_transaction_id?: number;
  };
  bonus_amount: number;
  referrer_bonus: number;
  referred_bonus: number;
  wallet_balances: {
    referrer_plan_balance: number;
    referred_plan_balance: number;
  };
  indicacao_id: number;
  message?: string;
}

export interface RegistrationWithReferralData {
  email: string;
  password: string;
  full_name: string;
  user_role: string;
  aceite_termos: boolean;
  referralCode?: string;
}

export interface RegistrationResponse {
  success: boolean;
  user?: {
    id: number;
    email: string;
    full_name: string;
    user_role: string;
    saldo_plano: number;
    codigo_indicacao: string;
  };
  token?: string;
  session_token?: string;
  referral_bonus?: ReferralBonusResponse;
  message?: string;
  error?: string;
}

class ReferralRegistrationService {
  
  /**
   * Realiza cadastro completo com processamento automático de indicação
   */
  async registerWithReferral(data: RegistrationWithReferralData): Promise<RegistrationResponse> {
    try {
      console.log('🚀 [REFERRAL_REGISTRATION] Iniciando cadastro com indicação...', {
        email: data.email,
        hasReferral: !!data.referralCode,
        referralCode: data.referralCode
      });

      const registrationPayload = {
        email: data.email.trim(),
        password: data.password,
        full_name: data.full_name.trim(),
        user_role: data.user_role,
        aceite_termos: data.aceite_termos,
        ...(data.referralCode && {
          referralCode: data.referralCode.trim()
        })
      };

      console.log('📤 [REFERRAL_REGISTRATION] Enviando payload:', {
        ...registrationPayload,
        password: '[HIDDEN]'
      });

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(registrationPayload)
      });

      console.log('📡 [REFERRAL_REGISTRATION] Resposta status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        console.error('❌ [REFERRAL_REGISTRATION] Erro no cadastro:', errorData);
        
        return {
          success: false,
          error: errorData.message || `Erro HTTP ${response.status}`,
          message: this.getErrorMessage(errorData.message || response.statusText)
        };
      }

      const result = await response.json();
      console.log('✅ [REFERRAL_REGISTRATION] Resposta recebida:', {
        success: result.success,
        hasUser: !!result.data?.user,
        hasReferralBonus: !!result.data?.referral_bonus,
        userId: result.data?.user?.id
      });

      if (!result.success) {
        return {
          success: false,
          error: result.message || result.error || 'Erro no cadastro',
          message: this.getErrorMessage(result.message || result.error || 'Erro no cadastro')
        };
      }

      // Cadastro realizado com sucesso
      const registrationResponse: RegistrationResponse = {
        success: true,
        user: result.data.user,
        token: result.data.token,
        session_token: result.data.session_token,
        message: result.message || 'Cadastro realizado com sucesso'
      };

      // O bônus já foi processado durante o registro (RegistrationService)
      if (data.referralCode && result.data.referral_bonus) {
        console.log('🎁 [REFERRAL_REGISTRATION] Bônus já processado no registro');
        registrationResponse.referral_bonus = result.data.referral_bonus;
        
        // Mostrar notificações de bônus
        this.showBonusNotifications(result.data.referral_bonus);
      }

      return registrationResponse;

    } catch (error: any) {
      console.error('❌ [REFERRAL_REGISTRATION] Erro geral:', error);
      
      return {
        success: false,
        error: error.message || 'Erro interno',
        message: this.getErrorMessage(error.message || 'Erro interno do servidor')
      };
    }
  }

  /**
   * Processa bônus de indicação automaticamente após cadastro
   */
  private async processAutomaticReferralBonus(userId: number, referralCode: string): Promise<ReferralBonusResponse> {
    console.log('🎁 [REFERRAL_BONUS] Processando bônus automático...', { userId, referralCode });

      console.log('🎁 [REFERRAL_BONUS] Chamando endpoint de bônus:', `${API_BASE_URL}/referral-system/process-registration-bonus`);
      
      const response = await fetch(`${API_BASE_URL}/referral-system/process-registration-bonus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        referral_code: referralCode
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      throw new Error(errorData.message || `Erro HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ [REFERRAL_BONUS] Resposta do bônus:', result);

    if (!result.success) {
      throw new Error(result.message || 'Erro ao processar bônus');
    }

    return result.data;
  }

  /**
   * Mostra notificações de bônus ao usuário
   */
  private async showBonusNotifications(bonusData: ReferralBonusResponse) {
    // Obter valor dinâmico do arquivo bonus.php
    const bonusAmount = await bonusConfigService.getBonusAmount();
    
    if (bonusData.referred_bonus > 0) {
      toast.success(
        `🎉 Bônus de boas-vindas! Você recebeu R$ ${bonusAmount.toFixed(2)} no seu saldo do plano!`,
        { 
          duration: 8000,
          description: 'Use este saldo para consultas e serviços da plataforma.'
        }
      );
    }

    if (bonusData.referrer_bonus > 0) {
      setTimeout(() => {
        toast.info(
          `💝 Seu indicador também recebeu R$ ${bonusAmount.toFixed(2)} por ter indicado você!`,
          { 
            duration: 6000,
            description: 'Ambos se beneficiam do nosso programa de indicações.'
          }
        );
      }, 2500);
    }

    // Log para acompanhamento
    console.log('✅ [REFERRAL_NOTIFICATIONS] Notificações exibidas:', {
      referred_bonus: bonusData.referred_bonus,
      referrer_bonus: bonusData.referrer_bonus,
      transactions_created: bonusData.transactions_created
    });
  }

  /**
   * Transforma mensagens de erro do servidor em mensagens amigáveis
   */
  private getErrorMessage(serverMessage: string): string {
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
    
    if (lowerMessage.includes('username') && (lowerMessage.includes('existe') || lowerMessage.includes('already') || lowerMessage.includes('duplicate'))) {
      return 'Este email já está em uso. Por favor, use outro email.';
    }
    
    if (lowerMessage.includes('código') && lowerMessage.includes('indicação')) {
      return 'O código de indicação informado não é válido.';
    }
    
    if (lowerMessage.includes('senha') && lowerMessage.includes('fraca')) {
      return 'Sua senha precisa ser mais forte. Use pelo menos 8 caracteres com letras e números.';
    }
    
    if (lowerMessage.includes('connection') || lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return 'Problema de conexão. Verifique sua internet e tente novamente.';
    }
    
    return serverMessage || 'Não foi possível completar seu cadastro. Verifique seus dados e tente novamente.';
  }

  /**
   * Verifica se todas as tabelas foram atualizadas corretamente após cadastro
   */
  async verifyRegistrationCompleteness(userId: number): Promise<void> {
    try {
      console.log('🔍 [VERIFICATION] Verificando completude do cadastro...', userId);
      
      console.log('🔍 [VERIFICATION] Chamando endpoint de verificação:', `${API_BASE_URL}/referral-system/verify-data`);
      
      const response = await fetch(`${API_BASE_URL}/referral-system/verify-data`, {
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
          
          // Log detalhado
          console.log('📊 [VERIFICATION] Análise completa:', {
            user_created: analysis.user_created,
            user_profiles_created: analysis.user_profiles_created,
            user_settings_created: analysis.user_settings_created,
            wallets_created: analysis.wallets_created,
            has_referral: analysis.has_referral,
            bonus_processed: analysis.bonus_processed,
            transactions_created: analysis.transactions_created
          });
          
          // Notificação de status
          if (analysis.bonus_processed && analysis.transactions_created) {
            console.log('✅ [VERIFICATION] Sistema de indicação funcionando perfeitamente!');
          } else if (analysis.user_created && analysis.wallets_created) {
            console.log('✅ [VERIFICATION] Usuário criado, verificando indicação...');
          }
        }
      }
    } catch (error) {
      console.error('❌ [VERIFICATION] Erro ao verificar dados:', error);
    }
  }
}

export const referralRegistrationService = new ReferralRegistrationService();