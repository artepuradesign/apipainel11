
import { makeAuthenticatedRequest, handleApiError } from './apiHelpers';
import { cookieUtils } from '@/utils/cookieUtils';
import type { AuthApiResponse } from '@/types/auth';

export const getCurrentUser = async (token?: string): Promise<AuthApiResponse> => {
  try {
    console.log('🔄 [GET_USER] Validando usuário APENAS via servidor');

    // Usar token do parâmetro ou buscar nos cookies
    const authToken = token || cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    
    if (!authToken) {
      console.log('❌ [GET_USER] Token de sessão não encontrado');
      return {
        success: false,
        error: 'Token de sessão não encontrado',
        message: 'Sessão inválida - faça login novamente'
      };
    }

    console.log('🔄 [GET_USER] Fazendo requisição para o servidor...');
    
    const result = await makeAuthenticatedRequest('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
    });

    if (!result.ok) {
      console.error('❌ [GET_USER] Resposta HTTP inválida:', result.status, result.statusText);
      
      // Limpar tokens inválidos
      if (result.status === 401 || result.status === 403) {
        console.log('🧹 [GET_USER] Token inválido, limpando cookies');
        cookieUtils.remove('session_token');
        cookieUtils.remove('api_session_token');
        cookieUtils.remove('current_user_id');
        
        return {
          success: false,
          error: 'Sessão expirada',
          message: 'Sua sessão expirou. Faça login novamente.'
        };
      }
      
      return {
        success: false,
        error: `Erro HTTP ${result.status}`,
        message: 'Erro na comunicação com o servidor'
      };
    }

    const data = await result.json();
    console.log('📋 [GET_USER] Resposta do servidor recebida');

    if (data.success && data.data && data.data.user) {
      console.log('✅ [GET_USER] Usuário validado com sucesso no servidor');
      return {
        success: true,
        data: data.data,
        message: data.message || 'Usuário validado com sucesso'
      };
    } else {
      console.error('❌ [GET_USER] Resposta inválida do servidor:', data.message || data.error);
      
      // Se o servidor retornou erro, limpar sessão local
      cookieUtils.remove('session_token');
      cookieUtils.remove('api_session_token');
      cookieUtils.remove('current_user_id');
      
      return {
        success: false,
        error: data.message || data.error || 'Resposta inválida do servidor',
        message: 'Erro na validação da sessão'
      };
    }

  } catch (error) {
    console.error('❌ [GET_USER] Erro na comunicação:', error);
    
    const errorMessage = handleApiError(error);
    
    // Se for erro de rede/conexão, não limpar a sessão imediatamente
    // mas se for erro de autenticação, limpar
    if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('unauthorized')) {
      cookieUtils.remove('session_token');
      cookieUtils.remove('api_session_token');
      cookieUtils.remove('current_user_id');
    }
    
    return {
      success: false,
      error: errorMessage,
      message: 'Erro na validação da sessão'
    };
  }
};
