import { API_BASE_URL } from '@/config/apiConfig';
import { handleApiError, parseApiResponse } from './apiHelpers';

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
}

export const requestPasswordRecovery = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    const responseData = await parseApiResponse(response);

    if (!response.ok || !responseData?.success) {
      return {
        success: false,
        message: responseData?.message || 'Não foi possível processar sua solicitação.',
        error: responseData?.error,
      };
    }

    return {
      success: true,
      message: responseData.message || 'Se o e-mail existir, enviaremos as instruções de recuperação.',
    };
  } catch (error) {
    const message = handleApiError(error);

    return {
      success: false,
      message,
      error: message,
    };
  }
};

export const resetPasswordWithToken = async (token: string, newPassword: string): Promise<ForgotPasswordResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        token,
        new_password: newPassword,
      }),
    });

    const responseData = await parseApiResponse(response);

    if (!response.ok || !responseData?.success) {
      return {
        success: false,
        message: responseData?.message || 'Não foi possível redefinir a senha.',
        error: responseData?.error,
      };
    }

    return {
      success: true,
      message: responseData.message || 'Senha redefinida com sucesso.',
    };
  } catch (error) {
    const message = handleApiError(error);

    return {
      success: false,
      message,
      error: message,
    };
  }
};
