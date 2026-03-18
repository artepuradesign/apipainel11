import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest, fetchApiConfig } from '@/config/api';

export interface Module {
  id: number;
  panel_id: number;
  title: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  cost_price: number;
  icon: string;
  color: string;
  path: string;
  category: string;
  operational_status: string;
  is_active: boolean;
  is_premium: boolean;
  api_endpoint: string;
  api_method: string;
  sort_order: number;
  usage_count: number;
  success_rate: number;
  settings: string;
  created_at: string;
  updated_at: string;
  panel_name?: string;
  panel_slug?: string;
  priceFormatted?: string;
}

/**
 * Serviço para gerenciar módulos do sistema
 */
export const moduleService = {
  /**
   * Busca um módulo específico por ID na lista de módulos
   */
  async getModuleById(moduleId: number): Promise<{ success: boolean; data?: Module; error?: string }> {
    try {
      await fetchApiConfig();
      const sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
      
      if (!sessionToken) {
        return { success: false, error: 'Token de autenticação não encontrado' };
      }

      // Primeiro buscar todos os módulos
      const data = await apiRequest<any>('/modules', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      
      if (data.success && data.data && Array.isArray(data.data)) {
        // Procurar o módulo específico na lista
        const module = data.data.find((mod: Module) => mod.id === moduleId);
        
        if (module) {
          return { success: true, data: module };
        } else {
          return { success: false, error: `Módulo ${moduleId} não encontrado` };
        }
      } else {
        return { success: false, error: data.error || 'Erro ao carregar módulos' };
      }
    } catch (error) {
      console.error('Erro ao buscar módulo por ID:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  /**
   * Lista todos os módulos ativos
   */
  async getAllModules(): Promise<{ success: boolean; data?: Module[]; error?: string }> {
    try {
      await fetchApiConfig();
      const sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
      
      if (!sessionToken) {
        return { success: false, error: 'Token de autenticação não encontrado' };
      }

      const data = await apiRequest<any>('/modules', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      
      if (data.success && data.data) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error || 'Erro ao carregar módulos' };
      }
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }
};

/**
 * Função utilitária para obter o preço de um módulo específico por ID
 */
export const getModulePriceById = async (moduleId: number): Promise<number> => {
  try {
    console.log(`🔍 Buscando preço do módulo ${moduleId}...`);
    const result = await moduleService.getModuleById(moduleId);
    
    if (result.success && result.data) {
      console.log(`✅ Preço encontrado para módulo ${moduleId}:`, result.data.price);
      return result.data.price;
    } else {
      console.warn(`❌ Erro ao obter preço do módulo ${moduleId}:`, result.error);
      return 0;
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar preço do módulo ${moduleId}:`, error);
    return 0;
  }
};