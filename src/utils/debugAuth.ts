import { cookieUtils } from './cookieUtils';

export const debugAuth = {
  // Testar token diretamente na API
  async testTokenDirectly() {
    console.log('🧪 [DEBUG_AUTH] Testando token diretamente...');
    
    const sessionToken = cookieUtils.get('session_token');
    const apiSessionToken = cookieUtils.get('api_session_token');
    const finalToken = sessionToken || apiSessionToken;
    
    if (!finalToken) {
      console.error('❌ [DEBUG_AUTH] Nenhum token disponível');
      return false;
    }
    
    console.log('🔑 [DEBUG_AUTH] Token a ser testado:', finalToken.substring(0, 25) + '...');
    
    try {
      const response = await fetch('https://api.apipainel.com.br/wallet/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${finalToken}`
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('📊 [DEBUG_AUTH] Status da resposta:', response.status);
      console.log('📋 [DEBUG_AUTH] Headers da resposta:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('📄 [DEBUG_AUTH] Resposta completa:', responseText);
      
      if (response.ok) {
        console.log('✅ [DEBUG_AUTH] Token válido!');
        return true;
      } else {
        console.error('❌ [DEBUG_AUTH] Token inválido:', response.status, responseText);
        return false;
      }
      
    } catch (error) {
      console.error('❌ [DEBUG_AUTH] Erro ao testar token:', error);
      return false;
    }
  },
  
  // Simular novo login para obter token válido
  async simulateLogin() {
    console.log('🔄 [DEBUG_AUTH] Simulando login para obter novo token...');
    
    const authUser = cookieUtils.get('auth_user');
    if (!authUser) {
      console.error('❌ [DEBUG_AUTH] Dados do usuário não encontrados');
      return false;
    }
    
    let userData;
    try {
      userData = JSON.parse(authUser);
    } catch (e) {
      console.error('❌ [DEBUG_AUTH] Erro ao parse dos dados do usuário');
      return false;
    }
    
    try {
      const response = await fetch('https://api.apipainel.com.br/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email,
          password: 'senha_temp' // Você precisará fornecer a senha real
        }),
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('📊 [DEBUG_AUTH] Status do login:', response.status);
      
      const responseText = await response.text();
      console.log('📄 [DEBUG_AUTH] Resposta do login:', responseText);
      
      return response.ok;
      
    } catch (error) {
      console.error('❌ [DEBUG_AUTH] Erro ao simular login:', error);
      return false;
    }
  }
};

// Disponibilizar globalmente para debug
(window as any).debugAuth = debugAuth;