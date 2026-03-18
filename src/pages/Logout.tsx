import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cookieUtils } from '@/utils/cookieUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

const Logout = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      console.log('🔄 [LOGOUT] Iniciando processo de logout...');
      
      try {
        // Fazer logout completo
        await signOut();
        
        // Limpar TODOS os cookies e tokens
        cookieUtils.remove('session_token');
        cookieUtils.remove('api_session_token');
        cookieUtils.remove('auth_user');
        cookieUtils.remove('current_user_id');
        
        // Limpar localStorage
        localStorage.removeItem('auth_user');
        localStorage.removeItem('session_token');
        localStorage.removeItem('api_session_token');
        localStorage.removeItem('current_user_id');
        localStorage.removeItem('token_last_validation');
        
        console.log('✅ [LOGOUT] Logout completo, redirecionando...');
        
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
        
      } catch (error) {
        console.error('❌ [LOGOUT] Erro no logout:', error);
        // Mesmo com erro, redirecionar
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };

    performLogout();
  }, [signOut, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Sessão Encerrada</CardTitle>
          <CardDescription className="text-base">
            Sua sessão foi encerrada. Você será redirecionado para a página de login.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Aguarde...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logout;
