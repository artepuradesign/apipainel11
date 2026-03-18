
// Utility functions for secure cookie management
export const cookieUtils = {
  set: (name: string, value: string, days?: number) => {
    try {
      // Configurações especiais para preview do Lovable
      const isLovablePreview = window.location.hostname.includes('lovable') || window.location.hostname.includes('preview');
      
      let cookieString = `${name}=${encodeURIComponent(value)}; path=/`;
      
      // Se days não for fornecido, criar cookie de SESSÃO (expira ao fechar navegador)
      if (days !== undefined) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${expires.toUTCString()}`;
        console.log(`🍪 Cookie definido: ${name} (válido até: ${expires.toLocaleDateString()})`);
      } else {
        console.log(`🍪 Cookie de SESSÃO definido: ${name} (expira ao fechar navegador)`);
      }
      
      // Para preview do Lovable, usar SameSite=None com Secure para iframe
      if (isLovablePreview && window.location.protocol === 'https:') {
        cookieString += '; samesite=none; secure';
      } else {
        // Configuração padrão para outros ambientes
        cookieString += '; samesite=lax';
        if (window.location.protocol === 'https:') {
          cookieString += '; secure';
        }
      }
      
      document.cookie = cookieString;
    } catch (error) {
      console.error(`❌ Erro ao definir cookie ${name}:`, error);
    }
  },

  get: (name: string): string | null => {
    try {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
          return value;
        }
      }
      return null;
    } catch (error) {
      console.error(`❌ Erro ao obter cookie ${name}:`, error);
      return null;
    }
  },

  remove: (name: string) => {
    try {
      const isLovablePreview = window.location.hostname.includes('lovable') || window.location.hostname.includes('preview');
      
      let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      
      if (isLovablePreview && window.location.protocol === 'https:') {
        cookieString += '; samesite=none; secure';
      } else {
        cookieString += '; samesite=lax';
        if (window.location.protocol === 'https:') {
          cookieString += '; secure';
        }
      }
      
      document.cookie = cookieString;
      
      console.log(`🗑️ Cookie removido: ${name}`);
    } catch (error) {
      console.error(`❌ Erro ao remover cookie ${name}:`, error);
    }
  },

  // Verificar se existem cookies de autenticação
  checkAuthCookies: () => {
    const authUser = cookieUtils.get('auth_user');
    const sessionToken = cookieUtils.get('session_token');
    const userId = cookieUtils.get('current_user_id');
    
    console.log('🔍 Verificando cookies de autenticação:', {
      authUser: authUser ? 'presente' : 'ausente',
      sessionToken: sessionToken ? 'presente' : 'ausente',
      userId: userId ? 'presente' : 'ausente'
    });
    
    return {
      hasAuth: !!authUser,
      hasSession: !!sessionToken,
      hasUserId: !!userId,
      isAuthenticated: !!(authUser && sessionToken && userId)
    };
  }
};
