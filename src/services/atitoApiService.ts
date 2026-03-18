// Serviço para integração com a API Atito
export const atitoApiService = {
  async consultarCpf(cpf: string): Promise<{ success: boolean; output?: string; error?: string }> {
    try {
      console.log('🔍 [ATITO_API] Consultando CPF na API externa:', cpf);
      
      const response = await fetch('https://api.atito.com.br/consulta/pesquisar.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ cpf })
      });

      const data = await response.json();
      
      console.log('📥 [ATITO_API] Resposta da API:', data);
      
      if (data.success) {
        console.log('✅ [ATITO_API] Consulta feita com sucesso! Link:', data.output);
        return {
          success: true,
          output: data.output
        };
      } else {
        console.log('❌ [ATITO_API] Erro na consulta:', data.error);
        return {
          success: false,
          error: data.error
        };
      }
    } catch (error) {
      console.error('❌ [ATITO_API] Erro ao consultar API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao consultar API'
      };
    }
  }
};
