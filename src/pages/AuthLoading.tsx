import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cookieUtils } from '@/utils/cookieUtils';
import { authApiService } from '@/services/authApiService';
import { toast } from 'sonner';
import LoadingScreen from '@/components/layout/LoadingScreen';

const AuthLoading: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading } = useAuth();

  console.log('🎬 [AUTH_LOADING] Componente montado!');
  console.log('📋 [AUTH_LOADING] Parâmetros da URL:', Object.fromEntries(searchParams.entries()));

  useEffect(() => {
    const processAutoLogin = async () => {
      try {
        console.log('🔄 [AUTH_LOADING] Iniciando processamento...');

        // Verificar parâmetros da URL
        const token = searchParams.get('token');
        const userRole = searchParams.get('role');
        const userName = searchParams.get('name');
        const action = searchParams.get('action');
        const redirectTo = searchParams.get('redirect');

        console.log('📋 [AUTH_LOADING] Parâmetros:', { 
          hasToken: !!token, 
          role: userRole, 
          name: userName,
          action: action,
          redirectTo: redirectTo
        });

        // Se for login já realizado, apenas redirecionar após delay
        if (action === 'login' && redirectTo) {
          console.log('🎯 [AUTH_LOADING] Login já realizado, redirecionando para:', redirectTo);
          setTimeout(() => {
            navigate(redirectTo, { replace: true });
          }, 2000); // 2 segundos de loading
          return;
        }

        if (action === 'no-token') {
          console.log('⚠️ [AUTH_LOADING] Cadastro sem token, redirecionando para login...');
          toast.error('Faça login para acessar sua conta');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
          return;
        }

        if (token) {
          console.log('🎯 [AUTH_LOADING] Processando token para login automático...');

          // Salvar token nos cookies primeiro
          cookieUtils.set('session_token', token, 30);
          cookieUtils.set('api_session_token', token, 30);

          // Para preview do Lovable, também salvar no localStorage
          const isLovablePreview = window.location.hostname.includes('lovable') || window.location.hostname.includes('preview');
          if (isLovablePreview) {
            localStorage.setItem('session_token', token);
          }

          try {
            console.log('🔄 [AUTH_LOADING] Obtendo dados do usuário com token...');
            
            const currentUserResult = await authApiService.getCurrentUser(token);
            
            if (currentUserResult.success && currentUserResult.data?.user) {
              const user = currentUserResult.data.user;
              
              console.log('✅ [AUTH_LOADING] Usuário autenticado com sucesso:', {
                userId: user.id,
                email: user.email,
                role: user.user_role
              });

              // Determinar redirecionamento baseado no papel
              const redirectTo = user.user_role === 'suporte' ? '/dashboard/admin' : '/dashboard';
              
              console.log('🎯 [AUTH_LOADING] Redirecionando para:', redirectTo);
              
              setTimeout(() => {
                navigate(redirectTo, { replace: true });
              }, 2000); // 2 segundos para mostrar o loading

            } else {
              console.error('❌ [AUTH_LOADING] Falha ao obter dados do usuário:', currentUserResult);
              toast.error('Erro na autenticação. Faça login novamente.');
              setTimeout(() => {
                navigate('/login', { replace: true });
              }, 2000);
            }
          } catch (apiError) {
            console.error('❌ [AUTH_LOADING] Erro na API:', apiError);
            toast.error('Erro de conexão. Tente novamente.');
            setTimeout(() => {
              navigate('/login', { replace: true });
            }, 2000);
          }

        } else {
          console.warn('⚠️ [AUTH_LOADING] Nenhum token encontrado');
          toast.error('Dados de autenticação não encontrados');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        }

      } catch (error) {
        console.error('❌ [AUTH_LOADING] Erro geral:', error);
        toast.error('Erro interno. Redirecionando...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };

    // Sempre executar após um pequeno delay para mostrar o loading
    const timer = setTimeout(() => {
      processAutoLogin();
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <LoadingScreen 
      message="Processando autenticação..." 
      variant="auth" 
    />
  );
};

export default AuthLoading;