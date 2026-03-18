// Utilitário centralizado para acesso à API
// Busca a URL da API do backend PHP (api.php)
import { getApiUrl, API_CONFIG } from '@/config/api';

/**
 * Retorna a URL base da API (sem endpoint)
 * Busca do backend PHP
 */
export const getBaseApiUrl = (): string => {
  return 'https://api.apipainel.com.br';
};

/**
 * Retorna a URL completa da API com o endpoint
 * Exemplo: getFullApiUrl('/auth/login') => 'https://api.apipainel.com.br/auth/login'
 */
export const getFullApiUrl = (endpoint: string): string => {
  return getApiUrl(endpoint);
};

/**
 * Faz uma requisição genérica à API
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
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

  return response.json();
};
