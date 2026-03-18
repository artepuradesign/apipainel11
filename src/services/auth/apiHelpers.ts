
import { API_BASE_URL } from '@/config/apiConfig';

export const parseApiResponse = async (response: Response) => {
  const responseText = await response.text();
  console.log('📥 [API] Status da resposta:', response.status, response.statusText);
  console.log('📥 [API] Content-Type:', response.headers.get('content-type'));
  console.log('📥 [API] Texto completo da resposta:', responseText);
  console.log('📥 [API] Tamanho da resposta:', responseText.length, 'caracteres');

  // Verificar se a resposta está vazia
  if (!responseText || responseText.trim() === '') {
    console.error('❌ [API] Resposta vazia do servidor');
    throw new Error('Servidor retornou resposta vazia');
  }

  try {
    const parsed = JSON.parse(responseText);
    console.log('✅ [API] JSON parseado com sucesso:', parsed);
    return parsed;
  } catch (jsonError) {
    console.error('❌ [API] Erro ao parsear JSON:', jsonError);
    console.error('❌ [API] Resposta bruta completa:', responseText);
    console.error('❌ [API] Primeiros 100 chars:', responseText.substring(0, 100));
    console.error('❌ [API] Últimos 100 chars:', responseText.substring(responseText.length - 100));
    
    // Verificar se há HTML na resposta
    if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
      console.error('❌ [API] Resposta contém HTML - possível erro do servidor');
      throw new Error('Servidor retornou HTML ao invés de JSON - erro interno do servidor');
    }
    
    // Tentar extrair JSON válido se houver conteúdo misturado
    const jsonMatch = responseText.match(/\{[\s\S]*\}$/);
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ [API] JSON extraído com sucesso:', result);
        return result;
      } catch (extractError) {
        console.error('❌ [API] Falha ao extrair JSON:', extractError);
        throw new Error('Resposta inválida do servidor - JSON malformado');
      }
    } else {
      console.error('❌ [API] Nenhum JSON válido encontrado na resposta');
      throw new Error('Resposta não é JSON válido - formato inesperado do servidor');
    }
  }
};

export const handleApiError = (error: unknown): string => {
  let errorMessage = 'Erro interno do servidor';
  
  if (error instanceof Error) {
    if (error.message.includes('max_connections_per_hour') || error.message.includes('exceeded') || error.message.includes('1226')) {
      errorMessage = '⏱️ O servidor está processando muitas consultas no momento. Por favor, aguarde 2 minutos e tente novamente. Estamos trabalhando para melhorar a capacidade!';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de internet.';
    } else {
      errorMessage = error.message;
    }
  }
  
  return errorMessage;
};

export const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  console.log('📡 [API] Resposta recebida:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    url: response.url,
    headers: Object.fromEntries(response.headers.entries())
  });

  return response;
};
