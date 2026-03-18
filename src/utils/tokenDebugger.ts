// Debug utility para verificar tokens
import { cookieUtils } from './cookieUtils';

export const tokenDebugger = {
  logAllTokens: () => {
    console.group('🔍 [TOKEN DEBUG] Estado atual dos tokens');
    
    const sessionToken = cookieUtils.get('session_token');
    const apiSessionToken = cookieUtils.get('api_session_token');
    const authUser = cookieUtils.get('auth_user');
    const currentUserId = cookieUtils.get('current_user_id');
    
    console.log('session_token:', sessionToken ? `${sessionToken.substring(0, 15)}...` : 'AUSENTE');
    console.log('api_session_token:', apiSessionToken ? `${apiSessionToken.substring(0, 15)}...` : 'AUSENTE');
    console.log('auth_user:', authUser ? 'PRESENTE' : 'AUSENTE');
    console.log('current_user_id:', currentUserId || 'AUSENTE');
    
    // Verificar localStorage também
    const lsSessionToken = localStorage.getItem('session_token');
    console.log('localStorage.session_token:', lsSessionToken ? `${lsSessionToken.substring(0, 15)}...` : 'AUSENTE');
    
    console.groupEnd();
    
    return {
      hasSessionToken: !!sessionToken,
      hasApiSessionToken: !!apiSessionToken,
      hasAuthUser: !!authUser,
      hasUserId: !!currentUserId,
      primaryToken: sessionToken || apiSessionToken,
      isAuthenticated: !!(sessionToken || apiSessionToken) && !!authUser
    };
  },
  
  testTokenValidity: async () => {
    const tokens = tokenDebugger.logAllTokens();
    
    if (!tokens.primaryToken) {
      console.error('❌ Nenhum token disponível para teste');
      return false;
    }
    
    try {
      console.log('🧪 Testando token com API...');
      
      const response = await fetch('https://api.apipainel.com.br/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${tokens.primaryToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('📡 Resposta do teste:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token válido! Dados:', data);
        return true;
      } else {
        console.error('❌ Token inválido, status:', response.status);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erro ao testar token:', error);
      return false;
    }
  },
  
  clearAllTokens: () => {
    console.log('🧹 Limpando todos os tokens...');
    
    cookieUtils.remove('session_token');
    cookieUtils.remove('api_session_token');
    cookieUtils.remove('auth_user');
    cookieUtils.remove('current_user_id');
    
    localStorage.removeItem('session_token');
    localStorage.removeItem('api_session_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('current_user_id');
    
    console.log('✅ Tokens limpos');
  }
};

// Disponibilizar globalmente para debug
(window as any).tokenDebugger = tokenDebugger;