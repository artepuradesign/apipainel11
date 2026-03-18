
// Configuração da API - integrada com api.php do backend
import { fetchApiConfig, API_CONFIG } from './api';

// Exportar a URL base que será carregada do backend
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const API_KEY = 'bG92YWJsZS5kZXY=';

// Garantir que a configuração seja carregada
fetchApiConfig().catch(console.error);

export const getAuthHeaders = () => {
  // Verificar token de autenticação apenas nos cookies
  let token;
  
  try {
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(c => c.trim().startsWith('session_token='));
    const apiSessionCookie = cookies.find(c => c.trim().startsWith('api_session_token='));
    
    if (sessionCookie) {
      token = sessionCookie.split('=')[1];
    } else if (apiSessionCookie) {
      token = apiSessionCookie.split('=')[1];
    }
    
    console.log('🔧 [API CONFIG] Token encontrado:', token ? 'SIM' : 'NÃO');
  } catch (error) {
    console.error('❌ [API CONFIG] Erro ao buscar token:', error);
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-Key': API_KEY
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔧 [API CONFIG] Header Authorization adicionado');
  } else {
    console.warn('⚠️ [API CONFIG] Nenhum token de autenticação encontrado');
  }
  
  return headers;
};

// Headers simplificados sem CORS
export const getSimpleHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

// Headers para debug
export const getDebugHeaders = () => {
  const headers = getAuthHeaders();
  console.log('🔧 [API CONFIG] Headers configurados:', headers);
  console.log('🔧 [API CONFIG] Base URL:', API_BASE_URL);
  console.log('🔧 [API CONFIG] API Key:', API_KEY);
  return headers;
};

// Função para testar conectividade básica
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 [API TEST] Testando conectividade básica com:', API_BASE_URL);
    
    // Primeiro teste: endpoint raiz
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: getSimpleHeaders()
    });
    
    console.log('📡 [API TEST] Resposta básica:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      url: response.url
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ [API TEST] Erro na conectividade básica:', error);
    return false;
  }
};

// Função para fazer requisição direta
export const makeDirectRequest = async (endpoint: string, data: any, method: string = 'POST'): Promise<any> => {
  try {
    console.log(`🚀 [API] Fazendo requisição ${method} para: ${API_BASE_URL}${endpoint}`);
    
    const requestOptions: RequestInit = {
      method: method,
      headers: getSimpleHeaders()
    };
    
    if (method !== 'GET' && data) {
      console.log('📤 [API] Dados a serem enviados:', { ...data, password: data.password ? '[HIDDEN]' : undefined });
      requestOptions.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    
    console.log('📡 [API] Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Erro HTTP:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ [API] Resposta JSON:', result);
    
    return result;
  } catch (error) {
    console.error('❌ [API] Erro na requisição direta:', error);
    throw error;
  }
};
