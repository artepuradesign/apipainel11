// Importar configuração centralizada da API (busca do api.php)
import { getFullApiUrl } from '@/utils/apiHelper';

// Função genérica para fazer requisições à API
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = getFullApiUrl(endpoint);
  
  console.log(`🌐 [API] ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  console.log(`📊 [API] Response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ [API] HTTP Error ${response.status}:`, errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const text = await response.text();
  
  // Verificar se a resposta contém HTML (erro PHP)
  if (text.includes('<br />') || text.includes('<b>') || text.includes('Fatal error')) {
    console.error('❌ [API] Resposta contém HTML/erro PHP:', text);
    throw new Error('API retornou erro PHP. Verifique os logs do servidor.');
  }
  
  try {
    return JSON.parse(text);
  } catch (jsonError) {
    console.error('❌ [API] Erro ao fazer parse do JSON:', text);
    throw new Error('Resposta da API não é um JSON válido');
  }
};

export interface NewsletterSubscription {
  email: string;
  name?: string;
  source?: string;
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
  data?: any;
}

class NewsletterService {
  private readonly baseEndpoint = '/newsletter';

  /**
   * Inscreve um email na newsletter
   */
  async subscribe(data: NewsletterSubscription): Promise<NewsletterResponse> {
    console.log('📧 [NEWSLETTER] Inscrevendo email:', data.email);
    
    try {
      const payload = {
        email: data.email.toLowerCase().trim(),
        name: data.name?.trim() || null,
        source: data.source || 'footer_newsletter',
        ip_address: await this.getUserIP(),
        user_agent: navigator.userAgent
      };

      console.log('📤 [NEWSLETTER] Enviando dados:', payload);

      const response = await apiRequest(`${this.baseEndpoint}/subscribe`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      console.log('✅ [NEWSLETTER] Inscrição realizada com sucesso');
      return response;
    } catch (error) {
      console.error('❌ [NEWSLETTER] Erro ao inscrever email:', error);
      throw error;
    }
  }

  /**
   * Cancela inscrição na newsletter
   */
  async unsubscribe(email: string): Promise<NewsletterResponse> {
    console.log('📧 [NEWSLETTER] Cancelando inscrição:', email);
    
    try {
      const response = await apiRequest(`${this.baseEndpoint}/unsubscribe`, {
        method: 'POST',
        body: JSON.stringify({ 
          email: email.toLowerCase().trim() 
        })
      });

      console.log('✅ [NEWSLETTER] Inscrição cancelada com sucesso');
      return response;
    } catch (error) {
      console.error('❌ [NEWSLETTER] Erro ao cancelar inscrição:', error);
      throw error;
    }
  }

  /**
   * Verifica se um email já está inscrito
   */
  async checkSubscription(email: string): Promise<{ subscribed: boolean; status?: string }> {
    try {
      const response = await apiRequest(`${this.baseEndpoint}/check/${encodeURIComponent(email)}`, {
        method: 'GET'
      });

      return response;
    } catch (error) {
      console.error('❌ [NEWSLETTER] Erro ao verificar inscrição:', error);
      return { subscribed: false };
    }
  }

  /**
   * Lista todas as inscrições (apenas para admin)
   */
  async listSubscriptions(page: number = 1, limit: number = 50): Promise<NewsletterResponse> {
    try {
      const response = await apiRequest(`${this.baseEndpoint}/list?page=${page}&limit=${limit}`, {
        method: 'GET'
      });

      return response;
    } catch (error) {
      console.error('❌ [NEWSLETTER] Erro ao listar inscrições:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas da newsletter
   */
  async getStats(): Promise<{ total: number; active: number; unsubscribed: number }> {
    try {
      const response = await apiRequest(`${this.baseEndpoint}/stats`, {
        method: 'GET'
      });

      return response.data || { total: 0, active: 0, unsubscribed: 0 };
    } catch (error) {
      console.error('❌ [NEWSLETTER] Erro ao obter estatísticas:', error);
      return { total: 0, active: 0, unsubscribed: 0 };
    }
  }

  /**
   * Obtém o IP do usuário para analytics
   */
  private async getUserIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || null;
    } catch (error) {
      console.warn('⚠️ [NEWSLETTER] Não foi possível obter IP do usuário:', error);
      return null;
    }
  }

  /**
   * Valida se o email está em formato válido
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }
}

export const newsletterService = new NewsletterService();
export default newsletterService;