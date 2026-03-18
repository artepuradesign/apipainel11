/**
 * Serviço para enviar CPF para processamento via Atito
 * O sistema Atito processa o CPF através de:
 * 1. PHP recebe o CPF via POST
 * 2. Executa script Node.js que interage com Telegram Bot
 * 3. Bot busca dados e envia para webhook n8n
 * 4. n8n armazena os dados no banco de dados
 */

export const atitoConsultaCpfService = {
  /**
   * Envia CPF para processamento via Atito
   * @param cpf CPF sem formatação (11 dígitos)
   * @returns {success: boolean, message?: string, error?: string}
   */
  async enviarCpf(cpf: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('🌐 [ATITO] Enviando CPF para processamento (POST):', cpf);
      
      const url = `https://api.apipainel.com.br/agentedeia/index.php?cpf=${encodeURIComponent(cpf)}`;
      console.log('🔗 [ATITO] URL completa:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'text/html,application/json;q=0.9,*/*;q=0.8'
        }
      });

      console.log('📊 [ATITO] Status da resposta:', response.status);
      
      if (response.ok) {
        try {
          const rawText = await response.text();
          console.log('📄 [ATITO] Resposta raw (primeiros 200 chars):', rawText.substring(0, 200));
        } catch (readError) {
          console.warn('⚠️ [ATITO] Não foi possível ler corpo da resposta (ok mas sem corpo legível):', readError);
        }
        
        console.log('✅ [ATITO] Requisição enviada com sucesso (não dependemos do corpo da resposta)');
        return {
          success: true,
          message: 'CPF enviado para processamento via Atito'
        };
      }
      
      console.error('❌ [ATITO] Falha na requisição HTTP:', response.status);
      return {
        success: false,
        error: `Falha ao enviar CPF (HTTP ${response.status})`
      };
      
    } catch (error: any) {
      console.error('❌ [ATITO] Exceção:', error);
      return { 
        success: false, 
        error: error.message || 'Erro de conexão com o servidor Atito' 
      };
    }
  }
};
