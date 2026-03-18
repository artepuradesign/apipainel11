
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { pixKeyService, PixKey } from '@/utils/database/pixKeyService';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/utils/database/userService';
import { processReferralBonus } from '@/utils/referralSystem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PixKeyForm from './PixKeyForm';
import PixKeysList from './PixKeysList';

const PixKeysManager = () => {
  const { user } = useAuth();
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);
  const [newKey, setNewKey] = useState('');
  const [keyType, setKeyType] = useState<'cpf' | 'cnpj' | 'email' | 'telefone'>('email');
  const [userCpf, setUserCpf] = useState('');
  const [userCnpj, setUserCnpj] = useState('');
  const [tipoPessoa, setTipoPessoa] = useState<'fisica' | 'juridica'>('fisica');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPixKeys();
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (user?.id) {
      try {
        const userData = await userService.getUserById(parseInt(user.id));
        if (userData) {
          setUserCpf(userData.cpf || '');
          setUserCnpj(userData.cnpj || '');
          setTipoPessoa(userData.tipo_pessoa || 'fisica');
          
          // Ajustar o tipo de chave padrão baseado no tipo de pessoa
          if (userData.tipo_pessoa === 'juridica') {
            setKeyType('email');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }
  };

  const loadPixKeys = async () => {
    if (user?.id) {
      try {
        const keys = await pixKeyService.getPixKeysByUserId(parseInt(user.id));
        setPixKeys(keys);
      } catch (error) {
        console.error('Erro ao carregar chaves PIX:', error);
      }
    }
  };

  const activateUserAccount = async () => {
    if (!user?.id) return;

    try {
      const userData = await userService.getUserById(parseInt(user.id));
      if (userData?.status === 'pendente') {
        const result = await userService.updateUserData(parseInt(user.id), {
          ...userData,
          status: 'ativo'
        });

        if (result.success) {
          console.log('Conta ativada após cadastro de PIX');
          
          try {
            const bonusResult = await processReferralBonus(user.id);
            
            if (bonusResult.success && bonusResult.bonusReceived > 0) {
              toast.success('🎉 Conta ativada! ' + bonusResult.message, {
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
            } else {
              toast.success('🎉 Conta ativada com sucesso!');
            }
          } catch (bonusError) {
            console.error('Erro ao processar bônus de indicação:', bonusError);
            toast.success('🎉 Conta ativada com sucesso!');
          }

          localStorage.setItem('user_status', 'ativo');
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Erro ao ativar conta:', error);
    }
  };

  const handleAddPixKey = async () => {
    if (!user?.id) return;
    
    const hasDocument = (tipoPessoa === 'fisica' && userCpf) || (tipoPessoa === 'juridica' && userCnpj);
    
    if (!hasDocument) {
      const documentType = tipoPessoa === 'fisica' ? 'CPF' : 'CNPJ';
      toast.error(`Você precisa ter um ${documentType} cadastrado para adicionar chaves PIX`);
      return;
    }

    if (!newKey.trim()) {
      toast.error('Digite uma chave PIX válida');
      return;
    }

    setLoading(true);
    try {
      const result = await pixKeyService.addPixKey(
        parseInt(user.id),
        newKey.trim(),
        keyType,
        userCpf,
        userCnpj
      );

      if (result.success) {
        toast.success(result.message);
        setNewKey('');
        loadPixKeys();
        
        // Ativar conta apenas quando cadastrar a PRIMEIRA chave PIX
        if (pixKeys.length === 0) {
          await activateUserAccount();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao adicionar chave PIX:', error);
      toast.error('Erro interno ao adicionar chave PIX');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (keyId: number) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const result = await pixKeyService.setPrimaryPixKey(keyId, parseInt(user.id));
      
      if (result.success) {
        toast.success(result.message);
        loadPixKeys();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao definir chave principal:', error);
      toast.error('Erro interno ao definir chave principal');
    } finally {
      setLoading(false);
    }
  };

  const hasDocument = (tipoPessoa === 'fisica' && userCpf) || (tipoPessoa === 'juridica' && userCnpj);

  if (!hasDocument) {
    const documentType = tipoPessoa === 'fisica' ? 'CPF' : 'CNPJ';
    
    return (
      <Card className="bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Chaves PIX para Saque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {documentType} necessário
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Você precisa cadastrar seu {documentType} nas informações básicas antes de adicionar chaves PIX
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Chaves PIX para Saque ({pixKeys.length}/3)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <PixKeyForm
          newKey={newKey}
          keyType={keyType}
          userCpf={userCpf}
          userCnpj={userCnpj}
          tipoPessoa={tipoPessoa}
          loading={loading}
          pixKeysCount={pixKeys.length}
          onNewKeyChange={setNewKey}
          onKeyTypeChange={setKeyType}
          onAddPixKey={handleAddPixKey}
        />

        <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Após cadastrar uma chave PIX, ela não pode ser removida pelo usuário. 
            Para alterações ou remoções, entre em contato com o suporte.
          </AlertDescription>
        </Alert>

        <PixKeysList
          pixKeys={pixKeys}
          loading={loading}
          onSetPrimary={handleSetPrimary}
        />

        {pixKeys.length >= 3 && (
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Limite máximo de 3 chaves PIX atingido. Entre em contato com o suporte para alterações.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PixKeysManager;
