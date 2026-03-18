import { API_BASE_URL } from '@/config/apiConfig';
import { cookieUtils } from '@/utils/cookieUtils';
import { bonusConfigService } from '@/services/bonusConfigService';

export interface ReferralStats {
  total_indicados: number;
  indicados_ativos: number;
  total_bonus: number;
  bonus_este_mes: number;
}

export interface ReferralData {
  id: number;
  indicado_id: number;
  codigo: string;
  status: string;
  bonus_indicador: number;
  bonus_indicado: number;
  first_login_bonus_processed: boolean;
  first_login_at: string | null;
  created_at: string;
  indicado_nome: string;
  indicado_email: string;
  indicado_cadastro: string;
}

export interface ReferralApiResponse {
  referrals: ReferralData[];
  stats: ReferralStats;
}

class ReferralApiService {
  private getAuthHeaders() {
    const token = cookieUtils.get('session_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async getUserReferrals(): Promise<ReferralApiResponse> {
    try {
      console.log('🔍 [REFERRAL_API] Buscando dados de indicação da API externa...');
      
      // Obter valor dinâmico do bônus da API
      const dynamicBonusAmount = await bonusConfigService.getBonusAmount();
      
      const response = await fetch(`${API_BASE_URL}/auth/referrals`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      console.log('📡 [REFERRAL_API] Resposta status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ [REFERRAL_API] Dados recebidos da API externa:', result);

      if (result.success && result.data) {
        // Transformar dados da API externa para o formato esperado
        const transformedData = {
          referrals: (result.data.referrals || []).map((ref: any) => ({
            id: ref.id,
            indicado_id: ref.referred_id || ref.indicado_id,
            codigo: ref.codigo,
            status: ref.status,
            bonus_indicador: ref.comissao || ref.bonus_indicador || dynamicBonusAmount,
            bonus_indicado: dynamicBonusAmount,
            first_login_bonus_processed: ref.first_login_bonus_processed || false,
            first_login_at: ref.first_login_at,
            created_at: ref.created_at,
            indicado_nome: ref.full_name || ref.indicado_nome || ref.email || ref.indicado_email || 'Usuário indicado',
            indicado_email: ref.email || ref.indicado_email || '',
            indicado_cadastro: ref.created_at
          })),
          stats: {
            total_indicados: result.data.stats?.total_indicados || result.data.referrals?.length || 0,
            indicados_ativos: result.data.stats?.indicados_ativos || result.data.referrals?.filter((r: any) => r.first_login_bonus_processed).length || 0,
            total_bonus: result.data.stats?.total_bonus || result.data.referrals?.reduce((sum: number, r: any) => sum + (r.first_login_bonus_processed ? (r.comissao || dynamicBonusAmount) : 0), 0) || 0,
            bonus_este_mes: result.data.stats?.bonus_este_mes || 0
          }
        };
        
        console.log('🔄 [REFERRAL_API] Dados transformados:', transformedData);
        return transformedData;
      } else {
        throw new Error(result.message || 'Erro ao buscar dados de indicação');
      }
    } catch (error) {
      console.error('❌ [REFERRAL_API] Erro ao buscar indicações:', error);
      
      // Tentar buscar dados do localStorage como fallback
      try {
        const fallbackBonusAmount = await bonusConfigService.getBonusAmount();
        const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        const indicacoesData = JSON.parse(localStorage.getItem('indicacoes_data') || '[]');
        const usersData = JSON.parse(localStorage.getItem('system_users') || '[]');
        
        if (currentUser.id) {
          const userReferrals = indicacoesData
            .filter((indicacao: any) => 
              indicacao.indicador_id === currentUser.id.toString() || indicacao.indicador_id === currentUser.id
            )
            .map((indicacao: any) => {
              const referredUser = usersData.find((user: any) => 
                user.id.toString() === indicacao.indicado_id.toString()
              );
              
              return {
                id: indicacao.id,
                indicado_id: indicacao.indicado_id,
                codigo: indicacao.codigo,
                status: indicacao.status,
                bonus_indicador: parseFloat(indicacao.bonus_indicador || fallbackBonusAmount),
                bonus_indicado: parseFloat(indicacao.bonus_indicado || fallbackBonusAmount),
                first_login_bonus_processed: indicacao.first_login_bonus_processed || false,
                first_login_at: indicacao.first_login_at,
                created_at: indicacao.created_at,
                indicado_nome: referredUser?.full_name || referredUser?.email || 'Usuário indicado',
                indicado_email: referredUser?.email || '',
                indicado_cadastro: indicacao.created_at
              };
            });
          
          const stats = {
            total_indicados: userReferrals.length,
            indicados_ativos: userReferrals.filter(r => r.first_login_bonus_processed).length,
            total_bonus: userReferrals.reduce((sum: number, r: any) => sum + (r.first_login_bonus_processed ? r.bonus_indicador : 0), 0),
            bonus_este_mes: 0
          };
          
          console.log('📁 [REFERRAL_API] Usando dados do localStorage como fallback:', { userReferrals, stats });
          
          return {
            referrals: userReferrals,
            stats
          };
        }
      } catch (fallbackError) {
        console.error('❌ [REFERRAL_API] Erro no fallback localStorage:', fallbackError);
      }
      
      // Retornar dados vazios em caso de erro total
      return {
        referrals: [],
        stats: {
          total_indicados: 0,
          indicados_ativos: 0,
          total_bonus: 0,
          bonus_este_mes: 0
        }
      };
    }
  }

  async getReferralConfig(): Promise<any> {
    try {
      console.log('🔍 [REFERRAL_API] Buscando configurações de indicação...');
      
      // Tentar primeiro o endpoint específico
      let response = await fetch(`${API_BASE_URL}/system/referral-config`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      // Se falhar, tentar endpoint alternativo
      if (!response.ok && response.status === 404) {
        console.log('📡 [REFERRAL_API] Tentando endpoint alternativo de configuração...');
        response = await fetch(`${API_BASE_URL}/system-config`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error('Falha ao buscar configurações da API');
      }
    } catch (error) {
      console.error('❌ [REFERRAL_API] Erro ao buscar config:', error);
      
      throw error;
    }
  }
}

export const referralApiService = new ReferralApiService();