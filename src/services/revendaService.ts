import { API_BASE_URL } from '@/config/apiConfig';
import { cookieUtils } from '@/utils/cookieUtils';

export interface RevendaStatus {
  id: number;
  user_id: number;
  is_active: boolean;
  commission_percentage: number;
  created_at: string;
  updated_at: string;
}

class RevendaService {
  private getAuthHeaders() {
    const token = cookieUtils.get('session_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async getRevendaStatus(userId: string | number): Promise<RevendaStatus | null> {
    try {
      console.log('📊 [REVENDA] Buscando status da revenda para user:', userId);
      
      const response = await fetch(`${API_BASE_URL}/revendas/status/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ [REVENDA] Status encontrado:', result.data);
        return {
          id: result.data.id,
          user_id: result.data.user_id,
          is_active: result.data.is_active === 1 || result.data.is_active === true,
          commission_percentage: parseFloat(result.data.commission_percentage) || 10.0,
          created_at: result.data.created_at,
          updated_at: result.data.updated_at
        };
      }
      
      console.log('ℹ️ [REVENDA] Nenhum status encontrado para o usuário');
      return null;
    } catch (error) {
      console.error('❌ [REVENDA] Erro ao buscar status:', error);
      return null;
    }
  }

  async toggleRevendaStatus(userId: string | number, isActive: boolean): Promise<RevendaStatus> {
    try {
      console.log(`🔄 [REVENDA] ${isActive ? 'Ativando' : 'Desativando'} revenda para user:`, userId);
      
      const response = await fetch(`${API_BASE_URL}/revendas/toggle`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          user_id: parseInt(userId.toString()),
          is_active: isActive
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar status');
      }
      
      console.log('✅ [REVENDA] Status atualizado:', result.data);
      
      return {
        id: result.data.id,
        user_id: result.data.user_id,
        is_active: result.data.is_active === 1 || result.data.is_active === true,
        commission_percentage: parseFloat(result.data.commission_percentage) || 10.0,
        created_at: result.data.created_at,
        updated_at: result.data.updated_at
      };
    } catch (error) {
      console.error('❌ [REVENDA] Erro ao atualizar status:', error);
      throw error;
    }
  }

  async isResellerActive(userId: string | number): Promise<boolean> {
    const status = await this.getRevendaStatus(userId);
    return status?.is_active || false;
  }
}

export const revendaService = new RevendaService();
