import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/utils/database/userService';
import { processReferralBonus } from '@/utils/referralSystem';

interface FormData {
  login: string;
  email: string;
  full_name: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  tipoplano: string;
  data_inicio: string;
  data_fim: string;
  saldo: number;
  user_role: 'assinante' | 'suporte';
  status: 'ativo' | 'inativo' | 'suspenso' | 'pendente';
  aceite_termos: boolean;
  saldo_atualizado: boolean;
  indicador_id: string;
  ultimo_login: string;
  created_at: string;
  updated_at: string;
}

export const useAccountSettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    login: '',
    email: '',
    full_name: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    tipoplano: '',
    data_inicio: '',
    data_fim: '',
    saldo: 0,
    user_role: 'assinante' as 'assinante' | 'suporte',
    status: 'ativo' as 'ativo' | 'inativo' | 'suspenso' | 'pendente',
    aceite_termos: false,
    saldo_atualizado: false,
    indicador_id: '',
    ultimo_login: '',
    created_at: '',
    updated_at: ''
  });

  const [loading, setLoading] = useState(false);
  const [cpfChanged, setCpfChanged] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [showPixManager, setShowPixManager] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (user?.id) {
      try {
        const userData = await userService.getUserById(parseInt(user.id));
        if (userData) {
          setFormData({
            login: userData.login || '',
            email: userData.email || '',
            full_name: userData.full_name || '',
            cpf: userData.cpf || '',
            data_nascimento: userData.data_nascimento || '',
            telefone: userData.telefone || '',
            cep: userData.cep || '',
            endereco: userData.endereco || '',
            numero: userData.numero || '',
            bairro: userData.bairro || '',
            cidade: userData.cidade || '',
            estado: userData.estado || '',
            tipoplano: userData.tipoplano || '',
            data_inicio: userData.data_inicio || '',
            data_fim: userData.data_fim || '',
            saldo: userData.saldo || 0,
            user_role: userData.user_role || 'assinante',
            status: userData.status || 'pendente',
            aceite_termos: userData.aceite_termos || false,
            saldo_atualizado: userData.saldo_atualizado || false,
            indicador_id: userData.indicador_id?.toString() || '',
            ultimo_login: userData.ultimo_login || '',
            created_at: userData.created_at || '',
            updated_at: userData.updated_at || ''
          });
          
          // Mostrar PIX manager se tiver CPF
          if (userData.cpf && userData.cpf.trim() !== '') {
            setShowPixManager(true);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setFormData({
          login: localStorage.getItem('user_login') || '',
          email: localStorage.getItem('user_email') || '',
          full_name: localStorage.getItem('user_name') || '',
          cpf: localStorage.getItem('user_cpf') || '',
          data_nascimento: localStorage.getItem('user_data_nascimento') || '',
          telefone: localStorage.getItem('user_telefone') || '',
          cep: localStorage.getItem('user_cep') || '',
          endereco: localStorage.getItem('user_endereco') || '',
          numero: localStorage.getItem('user_numero') || '',
          bairro: localStorage.getItem('user_bairro') || '',
          cidade: localStorage.getItem('user_cidade') || '',
          estado: localStorage.getItem('user_estado') || '',
          tipoplano: localStorage.getItem('user_plan') || '',
          data_inicio: localStorage.getItem('user_data_inicio') || '',
          data_fim: localStorage.getItem('user_data_fim') || '',
          saldo: parseFloat(localStorage.getItem('user_balance') || '0'),
          user_role: 'assinante',
          status: 'pendente',
          aceite_termos: true,
          saldo_atualizado: false,
          indicador_id: localStorage.getItem('user_indicador_id') || '',
          ultimo_login: '',
          created_at: '',
          updated_at: ''
        });
        
        const storedCpf = localStorage.getItem('user_cpf');
        if (storedCpf && storedCpf.trim() !== '') {
          setShowPixManager(true);
        }
      }
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'cpf') {
      setCpfChanged(true);
    }
  };

  const updateUserInDatabase = async () => {
    if (!user?.id) return false;

    try {
      const dataToSend = {
        ...formData,
        indicador_id: formData.indicador_id ? parseInt(formData.indicador_id) : undefined
      };

      const updateResult = await userService.updateUserData(parseInt(user.id), dataToSend);
      
      if (updateResult.success) {
        console.log('Dados atualizados no banco de dados');
        return true;
      } else {
        console.error('Erro ao atualizar no banco:', updateResult.message);
        return false;
      }
    } catch (error) {
      console.error('Erro ao comunicar com banco de dados:', error);
      return false;
    }
  };

  const updateUserInLocalStorage = () => {
    try {
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          localStorage.setItem(`user_${key}`, value.toString());
        } else if (typeof value === 'boolean') {
          localStorage.setItem(`user_${key}`, value ? 'true' : 'false');
        }
      });

      localStorage.setItem('user_name', formData.full_name);
      localStorage.setItem('user_email', formData.email);
      localStorage.setItem('user_plan', formData.tipoplano);
      localStorage.setItem('user_balance', formData.saldo.toString());

      console.log('Dados salvos no localStorage');
      return true;
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
      return false;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const wasAccountPending = formData.status === 'pendente';
      let accountActivated = false;
      
      // Verificar se tem CPF para ativar conta
      const hasCpf = formData.cpf && formData.cpf.trim() !== '';
      
      if (cpfChanged && hasCpf && user?.id) {
        const result = await userService.updateUserDocument(parseInt(user.id), 'cpf', formData.cpf);
        if (result.success) {
          toast.success('Perfil atualizado! Para ganhar o bônus, cadastre sua chave PIX.');
          setCpfChanged(false);
          accountActivated = true;
          
          setShowPixManager(true);
          
          if (wasAccountPending) {
            console.log('Processando bônus de indicação para usuário ativado:', user.id);
            
            try {
              const bonusResult = await processReferralBonus(user.id);
              
              if (bonusResult.success && bonusResult.bonusReceived > 0) {
                toast.success(bonusResult.message, {
                  action: {
                    label: '🎉',
                    onClick: () => toast.dismiss(),
                  },
                });
                
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('balanceUpdated', { 
                    detail: { userId: user.id, shouldAnimate: true }
                  }));
                }, 1000);
              }
            } catch (bonusError) {
              console.error('Erro ao processar bônus de indicação:', bonusError);
            }
          }
        } else {
          toast.error(result.message);
          setLoading(false);
          return;
        }
      }

      const dbSuccess = await updateUserInDatabase();
      const localSuccess = updateUserInLocalStorage();

      if (dbSuccess || localSuccess) {
        if (!cpfChanged || !accountActivated) {
          toast.success('Informações atualizadas com sucesso!');
        }
        
        if (formData.cpf && formData.cpf.trim() !== '') {
          setShowPixManager(true);
        }
        
        await loadUserData();
      } else {
        toast.error('Erro ao salvar as informações');
      }
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro interno ao salvar as informações');
    } finally {
      setLoading(false);
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatCep = (value: string) => {
      const numbers = value.replace(/\D/g, '');
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    };

    const formatted = formatCep(e.target.value);
    handleInputChange('cep', formatted);
    
    const cleanCep = formatted.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (data && !data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
          }));
          toast.success('Endereço preenchido automaticamente!');
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('Erro ao buscar CEP');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  return {
    formData,
    loading,
    loadingCep,
    showPixManager,
    handleInputChange,
    handleSave,
    handleCepChange,
    loadUserData
  };
};
