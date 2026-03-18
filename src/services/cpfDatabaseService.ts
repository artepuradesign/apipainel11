import { getFullApiUrl } from '@/utils/apiHelper';

export const cpfDatabaseService = {
  /**
   * Verifica se CPF existe no banco de dados
   * @param cpf CPF sem formatação (11 dígitos)
   * @returns {success: boolean, exists: boolean, data?: any, error?: string}
   */
  async checkCpfExists(cpf: string): Promise<{ success: boolean; exists: boolean; data?: any; error?: string }> {
    try {
      console.log('🔍 [CPF_DATABASE] Verificando CPF no banco:', cpf);
      
      const url = getFullApiUrl(`/n8n/check-cpf-database?cpf=${cpf}`);
      console.log('🌐 [CPF_DATABASE] URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📊 [CPF_DATABASE] Status:', response.status);
      
      const rawText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        const sample = rawText.trim().substring(0, 400);
        console.error('❌ [CPF_DATABASE] Resposta não JSON:', sample);
        return { success: false, exists: false, error: 'Resposta inválida do servidor' };
      }
      
      if (response.ok && data.success) {
        console.log(`✅ [CPF_DATABASE] CPF ${data.exists ? 'encontrado' : 'não encontrado'}`);
        return { 
          success: true, 
          exists: data.exists,
          data: data.data,
          error: undefined
        };
      } else {
        console.error('❌ [CPF_DATABASE] Erro:', data.error);
        return { success: false, exists: false, error: data.error || 'Erro desconhecido' };
      }
      
    } catch (error: any) {
      console.error('❌ [CPF_DATABASE] Exceção:', error);
      return { 
        success: false,
        exists: false, 
        error: error.message || 'Erro de conexão com o servidor' 
      };
    }
  },

  /**
   * Faz polling no banco de dados para verificar se CPF apareceu
   * @param cpf CPF sem formatação (11 dígitos)
   * @param maxAttempts Número máximo de tentativas (padrão: 6 = 30 segundos)
   * @param intervalMs Intervalo entre tentativas em ms (padrão: 5000 = 5 segundos)
   * @returns {success: boolean, exists: boolean, data?: any, error?: string}
   */
  async pollCpfDatabase(
    cpf: string, 
    maxAttempts: number = 6, 
    intervalMs: number = 5000
  ): Promise<{ success: boolean; exists: boolean; data?: any; attempts: number; error?: string }> {
    console.log(`🔄 [CPF_POLLING] Iniciando polling para CPF ${cpf}`);
    console.log(`⏱️ [CPF_POLLING] Máximo de ${maxAttempts} tentativas a cada ${intervalMs}ms`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔍 [CPF_POLLING] Tentativa ${attempt}/${maxAttempts}`);
      
      const result = await this.checkCpfExists(cpf);
      
      if (result.success && result.exists) {
        console.log(`✅ [CPF_POLLING] CPF encontrado na tentativa ${attempt}`);
        return {
          success: true,
          exists: true,
          data: result.data,
          attempts: attempt
        };
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏳ [CPF_POLLING] CPF não encontrado, aguardando ${intervalMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    console.log(`❌ [CPF_POLLING] CPF não encontrado após ${maxAttempts} tentativas`);
    return {
      success: true,
      exists: false,
      attempts: maxAttempts,
      error: 'CPF não encontrado no tempo limite'
    };
  }
};
