import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/api';

interface ApiConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  baseUrl: string;
  apiKey: string;
  lastTestTime: Date | null;
  connectionError: string | null;
}

interface ApiTestResult {
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
}

export const useApiConnection = () => {
  const [connectionState, setConnectionState] = useState<ApiConnectionState>({
    isConnected: false,
    isLoading: false,
    baseUrl: getApiUrl(),
    apiKey: 'bG92YWJsZS5kZXY=',
    lastTestTime: null,
    connectionError: null
  });

  // Testar conexão com a API
  const testConnection = async (): Promise<ApiTestResult> => {
    setConnectionState(prev => ({ ...prev, isLoading: true, connectionError: null }));
    
    const startTime = Date.now();
    const baseUrl = getApiUrl();
    
    try {
      console.log('🔄 Testando conexão com a API...');
      
      const response = await fetch(`${baseUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors'
      });

      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Conexão com API estabelecida:', {
        status: response.status,
        responseTime: `${responseTime}ms`,
        data: data
      });

      setConnectionState(prev => ({
        ...prev,
        isConnected: true,
        isLoading: false,
        baseUrl,
        lastTestTime: new Date(),
        connectionError: null
      }));

      toast.success(`Conexão estabelecida! (${responseTime}ms)`);
      
      return {
        success: true,
        data,
        responseTime
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      console.error('❌ Erro na conexão com API:', {
        error: errorMessage,
        responseTime: `${responseTime}ms`,
        baseUrl
      });

      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        connectionError: errorMessage
      }));

      toast.error(`Erro na conexão: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        responseTime
      };
    }
  };

  // Fazer requisição para endpoint específico
  const makeApiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = getApiUrl();
    
    if (!connectionState.isConnected) {
      console.warn('🚫 API não conectada. Testando conexão primeiro...');
      const testResult = await testConnection();
      if (!testResult.success) {
        throw new Error('Não foi possível conectar à API');
      }
    }

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📡 Requisição para ${endpoint} bem-sucedida:`, data);
      
      return data;
    } catch (error) {
      console.error(`❌ Erro na requisição para ${endpoint}:`, error);
      throw error;
    }
  };

  // Testar conexão automaticamente ao carregar
  useEffect(() => {
    const initializeConnection = async () => {
      console.log('🔄 Inicializando conexão com a API...');
      await testConnection();
    };

    initializeConnection();
  }, []);

  return {
    ...connectionState,
    testConnection,
    makeApiRequest,
    // Métodos de conveniência
    isReady: connectionState.isConnected && !connectionState.isLoading,
    connectionStatus: connectionState.isConnected ? 'connected' : 
                    connectionState.isLoading ? 'connecting' : 
                    connectionState.connectionError ? 'error' : 'disconnected'
  };
};
