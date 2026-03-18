
import { API_BASE_URL, testApiConnection } from '@/config/apiConfig';
import { handleApiError, parseApiResponse } from './apiHelpers';
import type { RegisterData, AuthApiResponse } from '@/types/auth';

export const register = async (data: RegisterData): Promise<AuthApiResponse> => {
  try {
    console.log('🔄 [REGISTER] Iniciando processo de registro...');
    console.log('🌐 [REGISTER] URL da API:', API_BASE_URL);
    console.log('📤 [REGISTER] Dados recebidos:', {
      email: data.email,
      full_name: data.full_name,
      user_role: data.user_role,
      aceite_termos: data.aceite_termos,
      indicador_id: data.indicador_id,
      codigo_indicacao_usado: data.codigo_indicacao_usado,
      password: '[HIDDEN]'
    });
    
    // Testar conectividade
    console.log('🔍 [REGISTER] Testando conectividade...');
    const isConnected = await testApiConnection();
    if (!isConnected) {
      console.error('❌ [REGISTER] Falha de conectividade com servidor');
      return {
        success: false,
        error: 'Servidor indisponível no momento',
        message: 'Não foi possível conectar ao servidor. Tente novamente em instantes.'
      };
    }

    console.log('✅ [REGISTER] Conectividade confirmada');

    // Preparar dados - usar email como login
    const cleanData = {
      email: data.email?.trim() || '',
      password: data.password || '',
      full_name: data.full_name?.trim() || '',
      user_role: data.user_role || 'assinante',
      aceite_termos: Boolean(data.aceite_termos),
      ...(data.indicador_id && { indicador_id: Number(data.indicador_id) }),
      ...(data.codigo_indicacao_usado && { codigo_indicacao_usado: String(data.codigo_indicacao_usado) })
    };

    console.log('📤 [REGISTER] Dados preparados para envio:', {
      ...cleanData,
      password: '[HIDDEN]'
    });

    // Validação dos dados
    const validationErrors = [];
    
    if (!cleanData.email) validationErrors.push('Email é obrigatório');
    if (!cleanData.password) validationErrors.push('Senha é obrigatória');
    if (!cleanData.full_name) validationErrors.push('Nome completo é obrigatório');
    if (!cleanData.user_role) validationErrors.push('Tipo de usuário é obrigatório');
    if (typeof cleanData.aceite_termos !== 'boolean') validationErrors.push('Aceite de termos deve ser verdadeiro ou falso');
    
    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cleanData.email && !emailRegex.test(cleanData.email)) {
      validationErrors.push('Email deve ter formato válido');
    }
    
    // Validação de senha
    if (cleanData.password && cleanData.password.length < 6) {
      validationErrors.push('Senha deve ter pelo menos 6 caracteres');
    }
    
    if (validationErrors.length > 0) {
      console.error('❌ [REGISTER] Dados inválidos:', validationErrors);
      return {
        success: false,
        error: 'Dados inválidos fornecidos',
        message: validationErrors.join('; ')
      };
    }

    console.log('✅ [REGISTER] Validação dos dados aprovada');

    // Fazer requisição
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      console.log('🌐 [REGISTER] Enviando requisição POST para /auth/register');
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(cleanData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📥 [REGISTER] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const responseData = await parseApiResponse(response);

      if (!response.ok) {
        console.error('❌ [REGISTER] Erro HTTP:', {
          status: response.status,
          statusText: response.statusText,
          responseData: responseData
        });
        
        let errorMessage = 'Erro no servidor';
        
        if (responseData && responseData.message) {
          errorMessage = responseData.message;
        } else if (response.status === 400) {
          errorMessage = 'Dados inválidos fornecidos';
        } else if (response.status === 409) {
          errorMessage = 'Email já cadastrado';
        } else if (response.status === 422) {
          errorMessage = 'Dados de validação inválidos';
        } else if (response.status === 500) {
          errorMessage = 'Erro interno do servidor';
        }
        
        return {
          success: false,
          error: `${errorMessage} (${response.status})`,
          message: errorMessage
        };
      }

      if (responseData && responseData.success) {
        console.log('✅ [REGISTER] Registro processado com sucesso');
        return {
          success: true,
          data: responseData.data,
          message: responseData.message || 'Usuário registrado com sucesso'
        };
      } else {
        console.error('❌ [REGISTER] Falha no registro:', {
          message: responseData?.message,
          error: responseData?.error
        });
        return {
          success: false,
          error: responseData?.message || responseData?.error || 'Erro no cadastro',
          message: responseData?.message || 'Erro no cadastro'
        };
      }

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ [REGISTER] Timeout na requisição');
        return {
          success: false,
          error: 'Tempo limite excedido',
          message: 'A requisição demorou muito para responder. Tente novamente.'
        };
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    console.error('❌ [REGISTER] Erro no processo de registro:', error);
    
    const errorMessage = handleApiError(error);
    
    return {
      success: false,
      error: errorMessage,
      message: errorMessage
    };
  }
};
