import { API_BASE_URL } from '@/config/apiConfig';
import { handleApiError, parseApiResponse } from './apiHelpers';
import { cookieUtils } from '@/utils/cookieUtils';
import type { LoginData, AuthApiResponse } from '@/types/auth';

export const login = async (data: LoginData): Promise<AuthApiResponse> => {
  try {
    console.log('🔄 [LOGIN] Iniciando login via API externa');

    const requestBody = {
      email: data.email,
      password: data.password
    };

    console.log('📤 [LOGIN] Enviando dados para login:', {
      email: requestBody.email,
      password: '[HIDDEN]',
      url: `${API_BASE_URL}/auth/login`
    });

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    // Log adicional para debug
    console.log('🌐 [LOGIN] URL completa:', `${API_BASE_URL}/auth/login`);

    console.log('📡 [LOGIN] Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Debug completo da resposta
    const responseText = await response.text();
    console.log('📋 [LOGIN] Response text completo:', responseText);
    console.log('📋 [LOGIN] Response text length:', responseText.length);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('📊 [LOGIN] Dados da resposta parseados:', responseData);
    } catch (parseError) {
      console.error('❌ [LOGIN] Erro ao parsear JSON:', parseError);
      console.error('📋 [LOGIN] Texto da resposta que causou erro:', responseText);
      return {
        success: false,
        error: 'Resposta não é JSON válido: ' + responseText.substring(0, 200),
        message: 'Erro de comunicação com o servidor'
      };
    }

    if (response.ok && responseData.success) {
      console.log('✅ [LOGIN] Login realizado com sucesso');
      
      if (responseData.data?.session_token || responseData.data?.token) {
        const token = responseData.data.session_token || responseData.data.token;
        console.log('🔑 [LOGIN] Token recebido:', token.substring(0, 10) + '...');
        // CRÍTICO: Cookies de SESSÃO (sem days = expira ao fechar navegador)
        cookieUtils.set('api_session_token', token);
        cookieUtils.set('session_token', token);
      }
      
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || 'Login realizado com sucesso'
      };
    } else {
      console.error('❌ [LOGIN] Erro no login:', responseData);
      return {
        success: false,
        error: responseData.message || 'Credenciais inválidas',
        message: responseData.message || 'Email ou senha incorretos',
        statusCode: responseData.status_code || undefined
      };
    }

  } catch (error) {
    console.error('❌ [LOGIN] Erro geral:', error);
    
    const errorMessage = handleApiError(error);
    
    return {
      success: false,
      error: errorMessage,
      message: errorMessage
    };
  }
};