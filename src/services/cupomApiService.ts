import { getApiUrl, apiRequest } from '@/config/api';

export interface Cupom {
  id: number;
  codigo: string;
  descricao?: string;
  tipo: 'fixo' | 'percentual';
  valor: number;
  destino_saldo?: 'plano' | 'carteira';
  status: 'ativo' | 'inativo';
  uso_limite?: number;
  uso_atual: number;
  valido_ate?: string;
  user_ids?: number[] | null; // null = todos os usuários
  created_at: string;
  updated_at: string;
}

export interface CupomValidacao {
  id: number;
  codigo: string;
  descricao?: string;
  tipo: 'fixo' | 'percentual';
  valor: number;
  isValid: boolean;
  valor_desconto: number;
  tipo_desconto: 'fixo' | 'percentual';
}

export interface CupomUso {
  cupom_id: number;
  codigo: string;
  valor_desconto: number;
  tipo: 'fixo' | 'percentual';
  saldo_adicionado: number;
}

class CupomApiService {
  // Método auxiliar para obter headers com autenticação
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Adicionar token de autenticação se disponível
    try {
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(c => c.trim().startsWith('session_token='));
      const apiSessionCookie = cookies.find(c => c.trim().startsWith('api_session_token='));
      
      if (sessionCookie) {
        const token = sessionCookie.split('=')[1];
        headers['Authorization'] = `Bearer ${token}`;
      } else if (apiSessionCookie) {
        const token = apiSessionCookie.split('=')[1];
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('⚠️ [CUPOM API] Erro ao buscar token:', error);
    }
    
    return headers;
  }

  // Listar cupons disponíveis para usuários
  async getCuponsDisponiveis(): Promise<{ success: boolean; data?: Cupom[]; error?: string }> {
    try {
      console.log('🎫 [CUPOM API] Buscando cupons disponíveis...');
      const result = await apiRequest<any>('/cupons', {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (result.success) {
        console.log('✅ [CUPOM API] Cupons carregados:', result.data?.length || 0);
        return { success: true, data: result.data || [] };
      } else {
        console.error('❌ [CUPOM API] Erro na resposta:', result.message || result.error);
        return { success: false, error: result.message || result.error || 'Erro desconhecido' };
      }
    } catch (error) {
      console.error('❌ [CUPOM API] Erro na requisição:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro de conexão com a API' };
    }
  }

  // Listar todos os cupons (admin)
  async getAllCupons(): Promise<{ success: boolean; data?: Cupom[]; error?: string }> {
    try {
      console.log('🎫 [CUPOM API] Buscando todos os cupons (admin)...');
      const result = await apiRequest<any>('/cupons?admin=true', {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (result.success) {
        console.log('✅ [CUPOM API] Todos os cupons carregados:', result.data?.length || 0);
        // Processar user_ids de string JSON para array
        const processedData = result.data?.map((cupom: any) => ({
          ...cupom,
          user_ids: cupom.user_ids ? JSON.parse(cupom.user_ids) : null
        })) || [];
        return { success: true, data: processedData };
      } else {
        console.error('❌ [CUPOM API] Erro na resposta (admin):', result.message || result.error);
        return { success: false, error: result.message || result.error || 'Erro desconhecido' };
      }
    } catch (error) {
      console.error('❌ [CUPOM API] Erro na requisição:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro de conexão com a API' };
    }
  }

  // Validar cupom
  async validateCupom(codigo: string, userId?: number): Promise<{ success: boolean; data?: CupomValidacao; error?: string }> {
    try {
      console.log('🔍 [CUPOM API] Validando cupom:', codigo);
      const result = await apiRequest<any>('/validate-cupom', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          codigo: codigo.trim().toUpperCase(),
          user_id: userId
        })
      });
      
      if (result.success) {
        console.log('✅ [CUPOM API] Cupom válido:', result.data);
        return { success: true, data: result.data };
      } else {
        console.error('❌ [CUPOM API] Cupom inválido:', result.message);
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('❌ [CUPOM API] Erro na validação:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }

  // Usar cupom
  async useCupom(codigo: string, userId: number, valorRecarga?: number, walletType: 'main' | 'plan' = 'main'): Promise<{ success: boolean; data?: CupomUso; error?: string }> {
    try {
      console.log('🎯 [CUPOM API] Usando cupom:', codigo, 'para usuário:', userId);
      const result = await apiRequest<any>('/use-cupom', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          codigo: codigo.trim().toUpperCase(),
          user_id: userId,
          valor_recarga: valorRecarga || 0
        })
      });
      
      if (result.success) {
        console.log('✅ [CUPOM API] Cupom usado com sucesso:', result.data);
        return { success: true, data: result.data };
      } else {
        console.error('❌ [CUPOM API] Erro ao usar cupom:', result.message);
        return { success: false, error: result.message || result.error };
      }
    } catch (error) {
      console.error('❌ [CUPOM API] Erro na requisição:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }

  // Criar cupom (admin)
  async createCupom(cupomData: Partial<Cupom>): Promise<{ success: boolean; data?: { id: number; codigo: string }; error?: string }> {
    try {
      console.log('➕ [CUPOM API] Criando cupom:', cupomData);
      const result = await apiRequest<any>('/cupons', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(cupomData)
      });
      
      if (result.success) {
        console.log('✅ [CUPOM API] Cupom criado:', result.data);
        return { success: true, data: result.data };
      } else {
        console.error('❌ [CUPOM API] Erro ao criar cupom:', result.message || result.error);
        return { success: false, error: result.message || result.error };
      }
    } catch (error) {
      console.error('❌ [CUPOM API] Erro na requisição:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }

  // Atualizar cupom (admin)
  async updateCupom(cupomData: Partial<Cupom> & { id: number }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('✏️ [CUPOM API] Atualizando cupom:', cupomData.id);
      const result = await apiRequest<any>('/cupons', {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(cupomData)
      });
      
      if (result.success) {
        console.log('✅ [CUPOM API] Cupom atualizado');
        return { success: true };
      } else {
        console.error('❌ [CUPOM API] Erro ao atualizar cupom:', result.message || result.error);
        return { success: false, error: result.message || result.error };
      }
    } catch (error) {
      console.error('❌ [CUPOM API] Erro na requisição:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }

  // Deletar cupom (admin)
  async deleteCupom(cupomId: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ [CUPOM API] Deletando cupom:', cupomId);
      const result = await apiRequest<any>(`/cupons?id=${cupomId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      if (result.success) {
        console.log('✅ [CUPOM API] Cupom deletado');
        return { success: true };
      } else {
        console.error('❌ [CUPOM API] Erro ao deletar cupom:', result.message || result.error);
        return { success: false, error: result.message || result.error };
      }
    } catch (error) {
      console.error('❌ [CUPOM API] Erro na requisição:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }

  // Obter histórico de cupons (usuário)
  async getCupomHistory(userId: number): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      console.log('📜 [CUPOM API] Buscando histórico de cupons para usuário:', userId);
      const result = await apiRequest<any>(`/cupom-historico?user_id=${userId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (result.success) {
        console.log('✅ [CUPOM API] Histórico de cupons carregado:', result.data?.length || 0);
        return { success: true, data: result.data || [] };
      } else {
        console.error('❌ [CUPOM API] Erro ao carregar histórico:', result.message || result.error);
        return { success: false, error: result.message || result.error };
      }
    } catch (error) {
      console.error('❌ [CUPOM API] Erro na requisição de histórico:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }

  // Obter histórico completo de cupons (admin)
  async getCupomHistoryAdmin(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      console.log('📜 [CUPOM API] Buscando histórico completo de cupons (admin)...');
      const result = await apiRequest<any>('/cupom-historico-admin', {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (result.success) {
        console.log('✅ [CUPOM API] Histórico admin de cupons carregado:', result.data?.length || 0);
        return { success: true, data: result.data || [] };
      } else {
        console.error('❌ [CUPOM API] Erro ao carregar histórico admin:', result.message || result.error);
        return { success: false, error: result.message || result.error };
      }
    } catch (error) {
      console.error('❌ [CUPOM API] Erro na requisição de histórico admin:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }

  // Método para testar a conectividade completa da API
  async testApiConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('🔍 [CUPOM API] Testando conectividade completa da API...');
      
      // Teste: Endpoint cupons
      console.log('🔍 [CUPOM API] Testando endpoint cupons');
      const result = await apiRequest<any>('/cupons?admin=true', {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (result.success) {
        console.log('✅ [CUPOM API] API funcionando corretamente');
        return { 
          success: true, 
          data: { 
            endpoint_accessible: true,
            cupons_count: result.data?.length || 0
          } 
        };
      }
      
      return { success: false, error: 'Endpoint não retornou dados válidos' };
    } catch (error) {
      console.error('❌ [CUPOM API] Erro ao testar conectividade:', error);
      return { success: false, error: 'Erro de conectividade geral' };
    }
  }
}

export const cupomApiService = new CupomApiService();