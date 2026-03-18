export interface AdminActivity {
  id: number;
  type: string;
  description: string;
  user_name?: string;
  user_login?: string;
  module?: string;
  level?: string;
  user_id?: number;
  amount?: number;
  metadata?: any;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

import { cookieUtils } from '@/utils/cookieUtils';
import { getFullApiUrl } from '@/utils/apiHelper';

// Função auxiliar para fazer requisições à API
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
  const url = getFullApiUrl(endpoint);
  
  console.log('🌐 Admin Activity API Request:', options.method || 'GET', url);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Admin Activity API Response:', data);
    return data;
    
  } catch (error: any) {
    console.error('❌ Admin Activity API Request Error:', error);
    throw error;
  }
}

export const adminActivityApiService = {
  // Obter atividades recentes
  async getRecentActivities(limit: number = 20, type?: string): Promise<ApiResponse<AdminActivity[]>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (type) params.append('type', type);
    
    return apiRequest<AdminActivity[]>(`/dashboard-admin/activities?${params.toString()}`);
  },

  // Registrar nova atividade
  async logActivity(type: string, description: string, userId?: number, amount?: number, metadata?: any): Promise<ApiResponse<AdminActivity>> {
    return apiRequest<AdminActivity>('/dashboard-admin/activities', {
      method: 'POST',
      body: JSON.stringify({
        type: type,
        description: description,
        user_id: userId,
        amount: amount,
        metadata: metadata
      })
    });
  }
};