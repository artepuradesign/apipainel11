import { API_BASE_URL } from '@/config/apiConfig';

export interface RegistrationVerificationResponse {
  success: boolean;
  user_id: number;
  analysis: {
    // Tabelas principais
    user_created: boolean;
    user_profiles_created: boolean;
    user_settings_created: boolean;
    user_wallets_created: boolean;
    
    // Sistema de logs
    system_logs_created: boolean;
    
    // Sistema de indicação
    has_referral: boolean;
    referral_valid: boolean;
    indicacao_record_created: boolean;
    
    // Transações e saldos
    wallet_transactions_created: boolean;
    bonus_transactions_created: boolean;
    saldo_atualizado: boolean;
    
    // Auditoria
    user_audit_created: boolean;
    
    // Status geral
    registration_complete: boolean;
    referral_system_working: boolean;
  };
  details: {
    user_data?: any;
    wallets?: any[];
    transactions?: any[];
    indicacao?: any;
    referral_transactions?: any[];
  };
  message?: string;
}

class RegistrationVerificationService {
  
  /**
   * Verifica se todas as tabelas foram atualizadas corretamente após o cadastro
   */
  async verifyRegistration(userId: number): Promise<RegistrationVerificationResponse> {
    try {
      console.log('🔍 [REG_VERIFICATION] Verificando cadastro completo...', { userId });
      
      const response = await fetch(`${API_BASE_URL}/referral-system/verify-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Falha na verificação');
      }

      console.log('✅ [REG_VERIFICATION] Verificação concluída:', result.data);
      
      return result.data;
      
    } catch (error: any) {
      console.error('❌ [REG_VERIFICATION] Erro na verificação:', error);
      
      // Retornar estrutura padrão em caso de erro
      return {
        success: false,
        user_id: userId,
        analysis: {
          user_created: false,
          user_profiles_created: false,
          user_settings_created: false,
          user_wallets_created: false,
          system_logs_created: false,
          has_referral: false,
          referral_valid: false,
          indicacao_record_created: false,
          wallet_transactions_created: false,
          bonus_transactions_created: false,
          saldo_atualizado: false,
          user_audit_created: false,
          registration_complete: false,
          referral_system_working: false
        },
        details: {},
        message: error.message || 'Erro na verificação do cadastro'
      };
    }
  }

  /**
   * Gera relatório de status das tabelas principais
   */
  generateStatusReport(verification: RegistrationVerificationResponse): string {
    const { analysis } = verification;
    const statusItems = [];

    if (analysis.user_created) {
      statusItems.push('✅ Usuário criado na tabela users');
    } else {
      statusItems.push('❌ Usuário não encontrado na tabela users');
    }

    if (analysis.user_profiles_created) {
      statusItems.push('✅ Perfil criado na tabela user_profiles');
    } else {
      statusItems.push('❌ Perfil não criado na tabela user_profiles');
    }

    if (analysis.user_settings_created) {
      statusItems.push('✅ Configurações criadas na tabela user_settings');
    } else {
      statusItems.push('❌ Configurações não criadas na tabela user_settings');
    }

    if (analysis.user_wallets_created) {
      statusItems.push('✅ Carteiras criadas na tabela user_wallets');
    } else {
      statusItems.push('❌ Carteiras não criadas na tabela user_wallets');
    }

    if (analysis.system_logs_created) {
      statusItems.push('✅ Logs criados na tabela system_logs');
    } else {
      statusItems.push('❌ Logs não criados na tabela system_logs');
    }

    if (analysis.has_referral) {
      if (analysis.indicacao_record_created) {
        statusItems.push('✅ Indicação registrada na tabela indicacoes');
      } else {
        statusItems.push('❌ Indicação não registrada na tabela indicacoes');
      }

      if (analysis.bonus_transactions_created) {
        statusItems.push('✅ Transações de bônus criadas na tabela wallet_transactions');
      } else {
        statusItems.push('❌ Transações de bônus não criadas na tabela wallet_transactions');
      }

      if (analysis.saldo_atualizado) {
        statusItems.push('✅ Saldos atualizados nas carteiras');
      } else {
        statusItems.push('❌ Saldos não atualizados nas carteiras');
      }
    } else {
      statusItems.push('ℹ️ Cadastro sem código de indicação');
    }

    if (analysis.user_audit_created) {
      statusItems.push('✅ Auditoria criada na tabela user_audit');
    } else {
      statusItems.push('❌ Auditoria não criada na tabela user_audit');
    }

    // Status geral
    if (analysis.registration_complete) {
      statusItems.push('🎉 CADASTRO COMPLETO - Todas as tabelas atualizadas');
    } else {
      statusItems.push('⚠️ CADASTRO INCOMPLETO - Algumas tabelas faltando');
    }

    if (analysis.has_referral && analysis.referral_system_working) {
      statusItems.push('🎁 SISTEMA DE INDICAÇÃO FUNCIONANDO');
    } else if (analysis.has_referral && !analysis.referral_system_working) {
      statusItems.push('❌ SISTEMA DE INDICAÇÃO COM PROBLEMAS');
    }

    return statusItems.join('\n');
  }

  /**
   * Verifica especificamente se o sistema de indicação está funcionando
   */
  async verifyReferralSystem(userId: number, referralCode?: string): Promise<boolean> {
    try {
      if (!referralCode) {
        console.log('ℹ️ [REFERRAL_CHECK] Sem código de indicação para verificar');
        return true; // Não é erro, só não tem indicação
      }

      console.log('🔍 [REFERRAL_CHECK] Verificando sistema de indicação...', { userId, referralCode });
      
      const verification = await this.verifyRegistration(userId);
      
      const isWorking = verification.analysis.has_referral && 
                       verification.analysis.referral_valid &&
                       verification.analysis.indicacao_record_created &&
                       verification.analysis.bonus_transactions_created &&
                       verification.analysis.saldo_atualizado;

      if (isWorking) {
        console.log('✅ [REFERRAL_CHECK] Sistema de indicação funcionando perfeitamente');
      } else {
        console.warn('⚠️ [REFERRAL_CHECK] Sistema de indicação com problemas:', {
          has_referral: verification.analysis.has_referral,
          referral_valid: verification.analysis.referral_valid,
          indicacao_created: verification.analysis.indicacao_record_created,
          transactions_created: verification.analysis.bonus_transactions_created,
          saldo_updated: verification.analysis.saldo_atualizado
        });
      }
      
      return isWorking;
      
    } catch (error) {
      console.error('❌ [REFERRAL_CHECK] Erro ao verificar sistema de indicação:', error);
      return false;
    }
  }

  /**
   * Lista todas as transações de um usuário para debug
   */
  async getUserTransactions(userId: number): Promise<any[]> {
    try {
      console.log('💰 [TRANSACTIONS] Buscando transações do usuário...', userId);
      
      const response = await fetch(`${API_BASE_URL}/referral-system/transactions?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ [TRANSACTIONS] Transações encontradas:', result.data.length);
        return result.data;
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ [TRANSACTIONS] Erro ao buscar transações:', error);
      return [];
    }
  }

  /**
   * Busca saldo atual das carteiras do usuário
   */
  async getUserWalletBalance(userId: number): Promise<any> {
    try {
      console.log('💳 [WALLET_BALANCE] Buscando saldo das carteiras...', userId);
      
      const response = await fetch(`${API_BASE_URL}/referral-system/balance?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ [WALLET_BALANCE] Saldos encontrados:', result.data);
        return result.data;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ [WALLET_BALANCE] Erro ao buscar saldos:', error);
      return null;
    }
  }
}

export const registrationVerificationService = new RegistrationVerificationService();