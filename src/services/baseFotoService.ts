import { apiRequest, fetchApiConfig } from '@/config/api';
import { cookieUtils } from '@/utils/cookieUtils';

export interface BaseFoto {
  id?: number;
  cpf_id: number;
  nome?: string;
  photo: string;
  created_at?: string;
  updated_at?: string;
}

export interface BaseFotoCreatePayload {
  cpf_id: number;
  nome?: string;
  photo: string;
}

export interface BaseFotoUpdatePayload {
  nome?: string;
  photo?: string;
}

export const baseFotoService = {
  async create(data: BaseFotoCreatePayload) {
    try {
      await fetchApiConfig();
      const token = cookieUtils.get('auth_token') || cookieUtils.get('session_token');

      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const result = await apiRequest<any>('/base-foto/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!result.success) {
        throw new Error(result.error || 'Erro ao cadastrar foto');
      }

      return result;
    } catch (error) {
      console.error('Erro no baseFotoService.create:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  async update(id: number, data: BaseFotoUpdatePayload) {
    try {
      await fetchApiConfig();
      const token = cookieUtils.get('auth_token') || cookieUtils.get('session_token');

      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const result = await apiRequest<any>(`/base-foto/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar foto');
      }

      return result;
    } catch (error) {
      console.error('Erro no baseFotoService.update:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  async delete(id: number) {
    try {
      await fetchApiConfig();
      const token = cookieUtils.get('auth_token') || cookieUtils.get('session_token');

      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const result = await apiRequest<any>(`/base-foto/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!result.success) {
        throw new Error(result.error || 'Erro ao excluir foto');
      }

      return result;
    } catch (error) {
      console.error('Erro no baseFotoService.delete:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  async getByCpfId(cpfId: number) {
    try {
      await fetchApiConfig();
      const token = cookieUtils.get('auth_token') || cookieUtils.get('session_token');

      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const result = await apiRequest<any>(`/base-foto/by-cpf-id?cpf_id=${cpfId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar fotos');
      }

      return {
        success: true,
        data: result.data?.fotos || [],
        message: result.message
      };
    } catch (error) {
      console.error('Erro no baseFotoService.getByCpfId:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: []
      };
    }
  }
};
