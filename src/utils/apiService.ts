
// API Service for external API integration
// Uses centralized connection pool from src/config/api.ts
import { apiRequest as centralApiRequest, getApiUrl } from '@/config/api';

export interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  duration_days: number;
  max_consultations: number;
  max_api_calls: number;
  features: string[];
  modules_included: string[];
  badge?: string;
  is_popular: boolean;
  is_active: boolean;
  category: string;
  sort_order: number;
  theme?: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    cardTheme: string;
    gradient: string;
  };
  cardSuit?: string;
  cardType?: string;
  discountPercentage?: number;
  priceFormatted?: string;
  created_at: string;
  updated_at: string;
}

export interface Panel {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  background_color: string;
  category: string;
  template?: string;
  is_active: boolean;
  is_premium: boolean;
  required_plan?: string;
  sort_order: number;
  settings: any;
  modules_count?: number;
  active_modules_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: number;
  panel_id: number;
  name: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  operational_status: 'on' | 'off' | 'maintenance';
  is_active: boolean;
  is_premium: boolean;
  required_plan?: string;
  sort_order: number;
  price?: number;
  cost_price?: number;
  priceFormatted?: string;
  path?: string;
  api_endpoint?: string;
  api_method?: string;
  settings: any;
  created_at: string;
  updated_at: string;
  panel_name?: string;
  panel_slug?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Generic API service class
class ApiService<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(): Promise<ApiResponse<T[]>> {
    try {
      console.log(`🌐 [API_SERVICE] GET /${this.endpoint} (usando pool de conexões)`);
      
      const data = await centralApiRequest<any>(`/${this.endpoint}`, {
        method: 'GET'
      });
      
      console.log(`✅ [API_SERVICE] Dados recebidos:`, data);
      
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error) {
      console.error(`❌ [API_SERVICE] Error fetching ${this.endpoint}:`, error);
      
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Erro de conexão: Não foi possível conectar com a API. Verifique se a API está online.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getActive(): Promise<ApiResponse<T[]>> {
    try {
      console.log(`🌐 [API_SERVICE] GET /${this.endpoint}/active (usando pool de conexões)`);
      
      const data = await centralApiRequest<any>(`/${this.endpoint}/active`, {
        method: 'GET'
      });
      
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error) {
      console.error(`❌ [API_SERVICE] Error fetching ${this.endpoint}/active:`, error);
      
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Erro de conexão: Não foi possível conectar com a API. Verifique se a API está online.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getById(id: number): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 [API_SERVICE] GET /${this.endpoint}/${id} (usando pool de conexões)`);
      
      const data = await centralApiRequest<any>(`/${this.endpoint}/${id}`, {
        method: 'GET'
      });
      
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error) {
      console.error(`❌ [API_SERVICE] Error fetching ${this.endpoint}/${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async create(item: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 [API_SERVICE] POST /${this.endpoint} (usando pool de conexões)`, item);
      
      const data = await centralApiRequest<any>(`/${this.endpoint}`, {
        method: 'POST',
        body: JSON.stringify(item)
      });
      
      if (data && data.success === false) {
        return {
          success: false,
          error: data.error || data.message || 'Erro ao criar registro'
        };
      }
      
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error) {
      console.error(`❌ [API_SERVICE] Error creating ${this.endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async update(id: number, item: Partial<T>): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 [API_SERVICE] PUT /${this.endpoint}/${id} (usando pool de conexões)`, item);
      
      const data = await centralApiRequest<any>(`/${this.endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item)
      });
      
      if (data && data.success === false) {
        return {
          success: false,
          error: data.error || data.message || 'Erro ao atualizar registro'
        };
      }
      
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error) {
      console.error(`❌ [API_SERVICE] Error updating ${this.endpoint}/${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      console.log(`🌐 [API_SERVICE] DELETE /${this.endpoint}/${id} (usando pool de conexões)`);
      
      const data = await centralApiRequest<any>(`/${this.endpoint}/${id}`, {
        method: 'DELETE'
      });
      
      // Verificar se a API retornou sucesso real
      if (data && data.success === false) {
        return {
          success: false,
          error: data.error || data.message || 'Erro ao excluir registro',
          data: data.data,
          code: data.code,
        } as any;
      }
      
      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error(`❌ [API_SERVICE] Error deleting ${this.endpoint}/${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Module-specific API service with additional methods
class ModuleApiService extends ApiService<Module> {
  async getByPanel(panelId: number): Promise<ApiResponse<Module[]>> {
    try {
      console.log(`🌐 [API_SERVICE] GET /${this.endpoint}/panel/${panelId} (usando pool de conexões)`);
      
      const data = await centralApiRequest<any>(`/${this.endpoint}/panel/${panelId}`, {
        method: 'GET'
      });
      
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error) {
      console.error(`❌ [API_SERVICE] Error fetching ${this.endpoint} by panel:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async toggleStatus(id: number): Promise<ApiResponse<Module>> {
    try {
      console.log(`🌐 [API_SERVICE] PUT /${this.endpoint}/${id}/toggle-status (usando pool de conexões)`);
      
      const data = await centralApiRequest<any>(`/${this.endpoint}/${id}/toggle-status`, {
        method: 'PUT'
      });
      
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error) {
      console.error(`❌ [API_SERVICE] Error toggling status for ${this.endpoint}/${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Export specific service instances
export const planService = new ApiService<Plan>('plans');
export const panelService = new ApiService<Panel>('panels');
export const moduleService = new ModuleApiService('modules');
