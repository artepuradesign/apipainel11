import { getFullApiUrl } from '@/utils/apiHelper';

export const telegramChatService = {
  /**
   * Envia mensagem para o grupo do Telegram
   * @param message Mensagem a ser enviada
   * @returns {success: boolean, error?: string}
   */
  async sendMessage(message: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📤 [TELEGRAM_CHAT] Enviando mensagem:', message);
      
      const url = getFullApiUrl('/n8n/telegram-send-message');
      console.log('🌐 [TELEGRAM_CHAT] URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      console.log('📊 [TELEGRAM_CHAT] Status:', response.status);
      
      const rawText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        const sample = rawText.trim().substring(0, 400);
        console.error('❌ [TELEGRAM_CHAT] Resposta não JSON:', sample);
        if (sample.startsWith('<')) {
          return { success: false, error: 'Servidor retornou HTML. Provável sessão do Telegram não configurada. Acesse https://api.apipainel.com.br/n8n/setup e conclua o login.' };
        }
        return { success: false, error: 'Resposta inválida do servidor (não JSON)' };
      }
      
      if (response.ok && data.success) {
        console.log('✅ [TELEGRAM_CHAT] Mensagem enviada com sucesso!');
        return { success: true };
      } else {
        console.error('❌ [TELEGRAM_CHAT] Erro:', data.error);
        return { success: false, error: data.error || 'Erro desconhecido' };
      }
      
    } catch (error: any) {
      console.error('❌ [TELEGRAM_CHAT] Exceção:', error);
      return { 
        success: false, 
        error: error.message || 'Erro de conexão com o servidor' 
      };
    }
  },

  /**
   * Busca mensagens recentes do grupo
   * @returns {success: boolean, messages?: array, error?: string}
   */
  async getMessages(): Promise<{ success: boolean; messages?: any[]; error?: string }> {
    try {
      console.log('📥 [TELEGRAM_CHAT] Buscando mensagens...');
      
      const url = getFullApiUrl('/n8n/telegram-get-messages');
      console.log('🌐 [TELEGRAM_CHAT] URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📊 [TELEGRAM_CHAT] Status:', response.status);
      
      const rawText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error('❌ [TELEGRAM_CHAT] Resposta não JSON:', rawText.substring(0, 400));
        throw new Error('Resposta inválida do servidor');
      }
      
      if (response.ok && data.success) {
        console.log('✅ [TELEGRAM_CHAT] Mensagens carregadas:', data.messages?.length || 0);
        return { success: true, messages: data.messages || [] };
      } else {
        console.error('❌ [TELEGRAM_CHAT] Erro:', data.error);
        return { success: false, error: data.error || 'Erro desconhecido', messages: [] };
      }
      
    } catch (error: any) {
      console.error('❌ [TELEGRAM_CHAT] Exceção:', error);
      return { 
        success: false, 
        error: error.message || 'Erro de conexão com o servidor',
        messages: []
      };
    }
  },
};
