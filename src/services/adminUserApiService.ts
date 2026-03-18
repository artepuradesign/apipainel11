import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';

export interface AdminUserData {
  id: number;
  email: string;
  full_name: string;
  user_role: 'assinante' | 'suporte' | 'admin';
  saldo: number;
  saldo_plano: number;
  status: string;
  tipoplano: string;
  cpf?: string;
  cnpj?: string;
  data_nascimento?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  aceite_termos?: boolean;
  email_verificado?: boolean;
  telefone_verificado?: boolean;
  ultimo_login?: string;
  created_at?: string;
  updated_at?: string;
  subscription?: {
    id: number;
    plan_id: number;
    status: 'active' | 'cancelled' | 'expired' | 'suspended';
    starts_at: string;
    ends_at: string;
    auto_renew: boolean;
    plan_name?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    
    if (!sessionToken) {
      return {
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.'
      };
    }

    const url = getFullApiUrl(endpoint);
    console.log('🌐 [ADMIN_USER_API] Fazendo requisição para (via api.php):', url);

    const response = await window.fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
    });

    console.log('📊 [ADMIN_USER_API] Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [ADMIN_USER_API] Response Error:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [ADMIN_USER_API] Response Data:', data);

    return data;
  } catch (error) {
    console.error('❌ [ADMIN_USER_API] Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export const adminUserApiService = {
  // Obter todos os usuários com suas assinaturas (para administradores)
  async getAllUsers(): Promise<ApiResponse<AdminUserData[]>> {
    console.log('👥 [ADMIN_USER_API] Buscando todos os usuários');
    return apiRequest<AdminUserData[]>('/dashboard-admin/users');
  },

  // Criar novo usuário
  async createUser(userData: Partial<AdminUserData>): Promise<ApiResponse<AdminUserData>> {
    console.log('➕ [ADMIN_USER_API] Criando novo usuário:', userData);
    return apiRequest<AdminUserData>('/dashboard-admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Atualizar usuário existente
  async updateUser(userId: number, userData: Partial<AdminUserData>): Promise<ApiResponse<AdminUserData>> {
    console.log('✏️ [ADMIN_USER_API] Atualizando usuário:', userId, userData);
    return apiRequest<AdminUserData>(`/dashboard-admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Deletar usuário
  async deleteUser(userId: number): Promise<ApiResponse<void>> {
    console.log('🗑️ [ADMIN_USER_API] Deletando usuário:', userId);
    return apiRequest<void>(`/dashboard-admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Ativar/Desativar usuário
  async toggleUserStatus(userId: number, isActive: boolean): Promise<ApiResponse<AdminUserData>> {
    console.log(`🔄 [ADMIN_USER_API] ${isActive ? 'Ativando' : 'Desativando'} usuário:`, userId);
    
    try {
      // Try PATCH method first
      const result = await apiRequest<AdminUserData>(`/dashboard-admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: isActive ? 'ativo' : 'inativo' 
        }),
      });
      
      // If PATCH fails, try PUT as fallback
      if (!result.success && result.error?.includes('Failed to fetch')) {
        console.log('🔄 [ADMIN_USER_API] PATCH failed, trying PUT fallback...');
        return apiRequest<AdminUserData>(`/dashboard-admin/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify({ 
            status: isActive ? 'ativo' : 'inativo' 
          }),
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ [ADMIN_USER_API] Toggle status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar status'
      };
    }
  },

  // Resetar senha do usuário
  async resetUserPassword(userId: number, newPassword: string = '123456'): Promise<ApiResponse<void>> {
    console.log('🔑 [ADMIN_USER_API] Resetando senha do usuário:', userId);
    return apiRequest<void>(`/dashboard-admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ 
        new_password: newPassword 
      }),
    });
  },

  // Obter estatísticas dos usuários
  async getUsersStats(): Promise<ApiResponse<{
    total: number;
    assinantes: number;
    suporte: number;
    ativos: number;
    assinaturasAtivas: number;
  }>> {
    console.log('📊 [ADMIN_USER_API] Buscando estatísticas dos usuários');
    return apiRequest<any>('/admin/users/stats');
  }
};
