import { API_BASE_URL, makeDirectRequest } from '@/config/apiConfig';

export interface SystemConfig {
  key: string;
  value: any;
  raw_value: string;
  description: string;
  data_type: 'string' | 'integer' | 'decimal' | 'boolean' | 'json';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface GroupedConfigs {
  [category: string]: SystemConfig[];
}

export interface UpdateConfigRequest {
  key: string;
  value: any;
  description?: string;
  data_type?: string;
}

export interface ReferralConfigUpdate {
  referral_system_enabled?: boolean;
  referral_bonus_enabled?: boolean;
  referral_commission_enabled?: boolean;
  referral_bonus_amount?: number;
  referral_commission_percentage?: number;
}

export const adminConfigService = {
  async getAllConfigs(): Promise<GroupedConfigs> {
    try {
      console.log('🔧 [ADMIN_CONFIG] Buscando todas as configurações...');
      
      const result = await makeDirectRequest('/admin/configs', {}, 'GET');
      
      if (result.success) {
        console.log('✅ [ADMIN_CONFIG] Configurações obtidas:', result.data);
        return result.data;
      } else {
        console.error('❌ [ADMIN_CONFIG] Erro ao buscar configurações:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ [ADMIN_CONFIG] Erro geral:', error);
      throw error;
    }
  },

  async updateConfig(config: UpdateConfigRequest): Promise<any> {
    try {
      console.log('🔧 [ADMIN_CONFIG] Atualizando configuração:', config);
      
      const result = await makeDirectRequest('/admin/configs/update', config, 'PUT');
      
      if (result.success) {
        console.log('✅ [ADMIN_CONFIG] Configuração atualizada:', result.data);
        return result.data;
      } else {
        console.error('❌ [ADMIN_CONFIG] Erro ao atualizar configuração:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ [ADMIN_CONFIG] Erro geral:', error);
      throw error;
    }
  },

  async toggleConfig(key: string): Promise<any> {
    try {
      console.log('🔧 [ADMIN_CONFIG] Alternando configuração:', key);
      
      const result = await makeDirectRequest('/admin/configs/toggle', { key }, 'POST');
      
      if (result.success) {
        console.log('✅ [ADMIN_CONFIG] Configuração alternada:', result.data);
        return result.data;
      } else {
        console.error('❌ [ADMIN_CONFIG] Erro ao alternar configuração:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ [ADMIN_CONFIG] Erro geral:', error);
      throw error;
    }
  },

  async getReferralConfigs(): Promise<any> {
    try {
      console.log('🔧 [ADMIN_CONFIG] Buscando configurações de indicação...');
      
      const result = await makeDirectRequest('/admin/configs/referral', {}, 'GET');
      
      if (result.success) {
        console.log('✅ [ADMIN_CONFIG] Configurações de indicação obtidas:', result.data);
        return result.data;
      } else {
        console.error('❌ [ADMIN_CONFIG] Erro ao buscar configurações de indicação:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ [ADMIN_CONFIG] Erro geral:', error);
      throw error;
    }
  },

  async updateReferralConfigs(configs: ReferralConfigUpdate): Promise<any> {
    try {
      console.log('🔧 [ADMIN_CONFIG] Atualizando configurações de indicação:', configs);
      
      const result = await makeDirectRequest('/admin/configs/referral', configs, 'PUT');
      
      if (result.success) {
        console.log('✅ [ADMIN_CONFIG] Configurações de indicação atualizadas:', result.data);
        return result.data;
      } else {
        console.error('❌ [ADMIN_CONFIG] Erro ao atualizar configurações de indicação:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ [ADMIN_CONFIG] Erro geral:', error);
      throw error;
    }
  },

  async deleteConfig(key: string): Promise<any> {
    try {
      console.log('🔧 [ADMIN_CONFIG] Removendo configuração:', key);
      
      const result = await makeDirectRequest('/admin/configs/delete', { key }, 'DELETE');
      
      if (result.success) {
        console.log('✅ [ADMIN_CONFIG] Configuração removida');
        return result.data;
      } else {
        console.error('❌ [ADMIN_CONFIG] Erro ao remover configuração:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ [ADMIN_CONFIG] Erro geral:', error);
      throw error;
    }
  }
};