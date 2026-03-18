
import { makeAuthenticatedRequest, handleApiError } from './apiHelpers';
import { cookieUtils } from '@/utils/cookieUtils';
import type { AuthApiResponse } from '@/types/auth';

export const logout = async (token?: string): Promise<AuthApiResponse> => {
  try {
    console.log('🔄 [LOGOUT] Iniciando logout no servidor...');

    // Usar token do parâmetro ou do cookie
    const authToken = token || cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    
    if (authToken && authToken !== 'undefined') {
      console.log('🔄 [LOGOUT] Enviando requisição de logout para servidor...');
      
      const result = await makeAuthenticatedRequest('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
      });

      if (result.ok) {
        const data = await result.json();
        console.log('✅ [LOGOUT] Logout realizado com sucesso no servidor');
      } else {
        console.warn('⚠️ [LOGOUT] Erro no logout do servidor:', result.status);
      }
    } else {
      console.log('ℹ️ [LOGOUT] Nenhum token encontrado para logout no servidor');
    }
    
    return {
      success: true,
      message: 'Logout realizado com sucesso'
    };

  } catch (error) {
    console.error('❌ [LOGOUT] Erro no logout:', error);
    
    return {
      success: true, // Sempre retornar sucesso para limpar dados locais
      message: 'Logout realizado localmente'
    };
  }
};
