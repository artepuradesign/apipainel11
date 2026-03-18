import { getFullApiUrl } from '@/utils/apiHelper';

/**
 * Serviço para envio de CPF via Railway (cpf-telegram)
 * DEPRECADO: Use railwayCpfService.ts ao invés deste
 * Mantido por compatibilidade com código existente
 */
export const telegramConsultaService = {
  /**
   * Envia CPF para processamento via Railway
   * @param cpf CPF sem formatação (11 dígitos)
   * @param userName Nome do usuário (opcional, não usado pelo Railway)
   * @returns {success: boolean, status?: string, error?: string}
   */
  async consultarCpf(cpf: string, userName?: string): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      console.log('🚂 [RAILWAY_SERVICE] Enviando CPF para Railway:', cpf);
      
      // Endpoint que faz proxy para o Railway
      const url = getFullApiUrl('/n8n/telegram-send-cpf');
      console.log('🌐 [RAILWAY_SERVICE] URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ cpf }),
      });

      console.log('📊 [RAILWAY_SERVICE] Status:', response.status);
      
      // Ler sempre como texto e tentar interpretar como JSON
      const rawText = await response.text();
      console.log('📄 [RAILWAY_SERVICE] Resposta raw (primeiros 200 caracteres):', rawText.substring(0, 200));
      
      let data: any = null;
      
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        const sample = rawText.trim().substring(0, 400);
        console.error('❌ [RAILWAY_SERVICE] Resposta não JSON (amostra):', sample);
        
        if (sample.startsWith('<') || sample.includes('<!DOCTYPE')) {
          return { 
            success: false, 
            error: 'Servidor retornou HTML. Verifique a configuração do Railway.' 
          };
        }
        
        return { 
          success: false, 
          error: 'Resposta inválida do servidor (não retornou JSON)' 
        };
      }
      
      console.log('📊 [RAILWAY_SERVICE] Resposta parseada:', data);
      
      if (response.ok && (data.success || data.status === 'enviado')) {
        console.log('✅ [RAILWAY_SERVICE] CPF enviado com sucesso!');
        return { success: true, status: data.status || 'enviado' };
      } else {
        console.error('❌ [RAILWAY_SERVICE] Erro ao enviar CPF:', data.error);
        return { success: false, error: data.error || 'Erro desconhecido' };
      }
      
    } catch (error: any) {
      console.error('❌ [RAILWAY_SERVICE] Exceção:', error);
      return { 
        success: false, 
        error: error.message || 'Erro de conexão com o servidor' 
      };
    }
  },
};
