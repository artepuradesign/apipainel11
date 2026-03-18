
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApiService } from '@/services/authApiService';
import { cookieUtils } from '@/utils/cookieUtils';
import { toast } from 'sonner';

interface UserData {
  id: number;
  login: string;
  email: string;
  full_name: string;
  cpf?: string;
  cnpj?: string;
  data_nascimento?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  user_role: string;
  status: string;
  saldo: number;
  saldo_plano: number;
  tipoplano: string;
  codigo_indicacao?: string;
  aceite_termos: boolean;
  email_verificado: boolean;
  telefone_verificado: boolean;
  ultimo_login?: string;
  created_at: string;
  updated_at?: string;
  data_inicio?: string;
  data_fim?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  subscription_status?: string;
}

export const useMinhaContaData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔍 [MINHA_CONTA] Carregando dados do usuário...');
      
      try {
        setLoading(true);
        
        // SEMPRE usar dados do contexto primeiro
        if (user) {
          console.log('✅ [MINHA_CONTA] Usando dados do contexto:', user.id);
          
          const contextUserData: UserData = {
            id: parseInt(user.id),
            login: user.login,
            email: user.email,
            full_name: user.full_name,
            cpf: user.cpf,
            cnpj: user.cnpj,
            data_nascimento: user.data_nascimento,
            telefone: user.telefone,
            cep: user.cep,
            endereco: user.endereco,
            numero: user.numero,
            bairro: user.bairro,
            cidade: user.cidade,
            estado: user.estado,
            tipo_pessoa: user.tipo_pessoa || 'fisica',
            user_role: user.user_role,
            status: user.status,
            saldo: user.saldo || 0,
            saldo_plano: user.saldo_plano || 0,
            tipoplano: user.tipoplano || 'Pré-Pago',
            codigo_indicacao: user.codigo_indicacao,
            aceite_termos: user.aceite_termos || false,
            email_verificado: user.email_verificado || false,
            telefone_verificado: user.telefone_verificado || false,
            ultimo_login: user.ultimo_login,
            data_inicio: (user as any).data_inicio,
            data_fim: (user as any).data_fim,
            subscription_start_date: (user as any).subscription_start_date,
            subscription_end_date: (user as any).subscription_end_date,
            subscription_status: (user as any).subscription_status,
            created_at: user.created_at,
            updated_at: user.updated_at
          };
          
          setUserData(contextUserData);
          
          // Tentar buscar dados atualizados da API em background (sem bloquear a UI)
          const sessionToken = cookieUtils.get('session_token');
          
          if (sessionToken && sessionToken !== 'authenticated') {
            console.log('🔄 [MINHA_CONTA] Buscando dados atualizados em background...');
            
            try {
              const apiResult = await authApiService.getCurrentUser(sessionToken);
              
              if (apiResult.success && apiResult.data?.user) {
                const apiUser = apiResult.data.user;
                console.log('✅ [MINHA_CONTA] Dados atualizados da API recebidos');
                
                const apiUserData: UserData = {
                  id: apiUser.id,
                  login: apiUser.login,
                  email: apiUser.email,
                  full_name: apiUser.full_name,
                  cpf: apiUser.cpf,
                  cnpj: apiUser.cnpj,
                  data_nascimento: apiUser.data_nascimento,
                  telefone: apiUser.telefone,
                  cep: apiUser.cep,
                  endereco: apiUser.endereco,
                  numero: apiUser.numero,
                  bairro: apiUser.bairro,
                  cidade: apiUser.cidade,
                  estado: apiUser.estado,
                  tipo_pessoa: apiUser.tipo_pessoa || 'fisica',
                  user_role: apiUser.user_role,
                  status: apiUser.status,
                  saldo: apiUser.saldo || 0,
                  saldo_plano: apiUser.saldo_plano || 0,
                  tipoplano: apiUser.tipoplano || 'Pré-Pago',
                  codigo_indicacao: apiUser.codigo_indicacao,
                  aceite_termos: apiUser.aceite_termos || false,
                  email_verificado: apiUser.email_verificado || false,
                  telefone_verificado: apiUser.telefone_verificado || false,
                  ultimo_login: apiUser.ultimo_login,
                  data_inicio: (apiUser as any).data_inicio,
                  data_fim: (apiUser as any).data_fim,
                  subscription_start_date: (apiUser as any).subscription_start_date,
                  subscription_end_date: (apiUser as any).subscription_end_date,
                  subscription_status: (apiUser as any).subscription_status,
                  created_at: apiUser.created_at,
                  updated_at: apiUser.updated_at
                };
                
                setUserData(apiUserData);
              } else {
                console.log('⚠️ [MINHA_CONTA] API não retornou dados, mantendo dados do contexto');
              }
            } catch (apiError) {
              console.warn('⚠️ [MINHA_CONTA] Erro na API, mantendo dados do contexto:', apiError);
              // Não mostrar erro para o usuário, dados do contexto já estão sendo usados
            }
          }
        } else {
          console.log('❌ [MINHA_CONTA] Usuário não encontrado no contexto');
          toast.error('Dados do usuário não encontrados');
        }
        
      } catch (error) {
        console.error('❌ [MINHA_CONTA] Erro geral:', error);
        toast.error('Erro ao carregar dados do perfil');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleInputChange = (field: keyof UserData, value: string) => {
    if (!userData) return;
    
    setUserData(prev => ({
      ...prev!,
      [field]: value
    }));
  };


  const handleSave = async () => {
    if (!userData) return;

    try {
      setSaving(true);
      const sessionToken = cookieUtils.get('session_token');
      
      console.log('🔍 [DEBUG] Session token:', sessionToken ? 'Present' : 'Missing');
      
      if (!sessionToken || sessionToken === 'authenticated') {
        console.log('❌ [DEBUG] Invalid session token');
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }
      
      console.log('💾 [MINHA_CONTA] Salvando dados do usuário...');
      
      const requestData = {
        full_name: userData.full_name,
        cpf: userData.cpf,
        cnpj: userData.cnpj,
        data_nascimento: userData.data_nascimento,
        telefone: userData.telefone,
        tipo_pessoa: userData.tipo_pessoa
      };
      
      console.log('🔍 [DEBUG] Request data:', requestData);
      
      const response = await fetch('https://api.apipainel.com.br/auth/update-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('🔍 [DEBUG] Response status:', response.status);
      console.log('🔍 [DEBUG] Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 [DEBUG] Response data:', result);
        if (result.success) {
          toast.success('Perfil atualizado com sucesso!');
          console.log('✅ [MINHA_CONTA] Perfil atualizado');
        } else {
          console.log('❌ [DEBUG] API returned success=false:', result.message);
          toast.error(result.message || 'Erro ao atualizar perfil');
        }
      } else {
        const errorData = await response.text();
        console.error('❌ [MINHA_CONTA] HTTP Error - Status:', response.status);
        console.error('❌ [MINHA_CONTA] Error response body:', errorData);
        
        // Try to parse error data as JSON if possible
        try {
          const jsonError = JSON.parse(errorData);
          console.error('❌ [MINHA_CONTA] Parsed error:', jsonError);
          toast.error(jsonError.message || `Erro ${response.status}: ${response.statusText}`);
        } catch {
          if (response.status === 404) {
            toast.error('Endpoint não encontrado. Entre em contato com o suporte.');
          } else if (response.status === 401) {
            toast.error('Sessão expirada. Faça login novamente.');
          } else {
            toast.error(`Erro ${response.status}: ${response.statusText}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ [MINHA_CONTA] Network/Parse error:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Erro de conexão: Verifique sua internet');
      } else {
        toast.error('Erro ao atualizar perfil: ' + (error instanceof Error ? error.message : String(error)));
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    userData,
    loading,
    saving,
    handleInputChange,
    handleSave
  };
};
