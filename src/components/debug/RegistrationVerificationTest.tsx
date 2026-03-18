import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/apiConfig';

interface VerificationResult {
  user_id: number;
  timestamp: string;
  tables: {
    users: {
      exists: boolean;
      data?: any;
    };
    user_wallets: {
      count: number;
      data: any[];
    };
    wallet_transactions: {
      count: number;
      data: any[];
    };
    indicacoes: {
      count: number;
      data: any[];
    };
  };
  analysis: {
    user_created: boolean;
    senhas_configuradas: boolean;
    wallets_created: boolean;
    has_referral: boolean;
    bonus_processed: boolean;
    saldo_atualizado: boolean;
  };
}

export const RegistrationVerificationTest: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const verifyRegistration = async () => {
    if (!userId.trim()) {
      toast.error('Digite um ID de usuário para verificar');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 [VERIFY] Verificando usuário ID:', userId);
      
      const response = await fetch(`${API_BASE_URL}/referral-system/verify-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: parseInt(userId) })
      });

      const result = await response.json();
      console.log('📊 [VERIFY] Resultado da verificação:', result);

      if (result.success) {
        setVerificationResult(result.data);
        toast.success('Verificação completa!');
      } else {
        toast.error('Erro na verificação: ' + result.message);
      }
    } catch (error) {
      console.error('❌ [VERIFY] Erro na verificação:', error);
      toast.error('Erro de comunicação com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const testReferralSystem = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 [TEST] Testando sistema de indicação...');
      
      // Teste completo do sistema
      const testPayload = {
        email: `teste_${Date.now()}@exemplo.com`,
        password: 'senha123',
        full_name: 'Usuário Teste',
        user_role: 'assinante',
        aceite_termos: true,
        referralCode: 'TESTCODE123' // código de teste
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      const result = await response.json();
      console.log('🧪 [TEST] Resultado do teste:', result);

      if (result.success && result.data?.user) {
        const newUserId = result.data.user.id;
        setUserId(newUserId.toString());
        
        // Verificar automaticamente após 3 segundos
        setTimeout(() => {
          setUserId(newUserId.toString());
          verifyRegistration();
        }, 3000);
        
        toast.success(`Usuário de teste criado! ID: ${newUserId}`);
      } else {
        toast.error('Erro no teste: ' + (result.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('❌ [TEST] Erro no teste:', error);
      toast.error('Erro de comunicação com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Teste de Verificação do Sistema de Indicação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Digite o ID do usuário para verificar"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && verifyRegistration()}
              type="number"
            />
            <Button 
              onClick={verifyRegistration}
              disabled={isLoading || !userId.trim()}
              variant="outline"
            >
              {isLoading ? 'Verificando...' : '🔍 Verificar'}
            </Button>
          </div>

          <Button 
            onClick={testReferralSystem}
            disabled={isLoading}
            variant="secondary"
            className="w-full"
          >
            {isLoading ? 'Testando...' : '🧪 Criar Usuário de Teste Completo'}
          </Button>
        </CardContent>
      </Card>

      {verificationResult && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 Análise Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 border rounded ${verificationResult.analysis.user_created ? 'bg-green-50' : 'bg-red-50'}`}>
                  <h4 className="font-semibold">Usuário Criado</h4>
                  <p>{verificationResult.analysis.user_created ? '✅ Sim' : '❌ Não'}</p>
                </div>
                <div className={`p-3 border rounded ${verificationResult.analysis.senhas_configuradas ? 'bg-green-50' : 'bg-red-50'}`}>
                  <h4 className="font-semibold">Senhas Configuradas</h4>
                  <p>{verificationResult.analysis.senhas_configuradas ? '✅ Sim' : '❌ Não'}</p>
                </div>
                <div className={`p-3 border rounded ${verificationResult.analysis.wallets_created ? 'bg-green-50' : 'bg-red-50'}`}>
                  <h4 className="font-semibold">Carteiras Criadas</h4>
                  <p>{verificationResult.analysis.wallets_created ? '✅ Sim' : '❌ Não'}</p>
                </div>
                <div className={`p-3 border rounded ${verificationResult.analysis.has_referral ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <h4 className="font-semibold">Tem Indicação</h4>
                  <p>{verificationResult.analysis.has_referral ? '✅ Sim' : '⚠️ Não'}</p>
                </div>
                <div className={`p-3 border rounded ${verificationResult.analysis.bonus_processed ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <h4 className="font-semibold">Bônus Processado</h4>
                  <p>{verificationResult.analysis.bonus_processed ? '✅ Sim' : '⚠️ Não'}</p>
                </div>
                <div className={`p-3 border rounded ${verificationResult.analysis.saldo_atualizado ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <h4 className="font-semibold">Saldo Atualizado</h4>
                  <p>{verificationResult.analysis.saldo_atualizado ? '✅ Sim' : '⚠️ Não'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>👤 Dados do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              {verificationResult.tables.users.data ? (
                <div className="text-sm space-y-2">
                  <p><strong>ID:</strong> {verificationResult.tables.users.data.id}</p>
                  <p><strong>Senha4:</strong> {verificationResult.tables.users.data.senha4}</p>
                  <p><strong>Senha6:</strong> {verificationResult.tables.users.data.senha6}</p>
                  <p><strong>Senha8:</strong> {verificationResult.tables.users.data.senha8}</p>
                  <p><strong>Saldo Plano:</strong> R$ {verificationResult.tables.users.data.saldo_plano}</p>
                  <p><strong>Código Indicação:</strong> {verificationResult.tables.users.data.codigo_indicacao}</p>
                  <p><strong>Indicador ID:</strong> {verificationResult.tables.users.data.indicador_id || 'Nenhum'}</p>
                </div>
              ) : (
                <p className="text-red-600">❌ Usuário não encontrado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💰 Carteiras ({verificationResult.tables.user_wallets.count})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {verificationResult.tables.user_wallets.data.map((wallet, index) => (
                  <div key={index} className="p-2 border rounded text-sm">
                    <p><strong>Tipo:</strong> {wallet.wallet_type}</p>
                    <p><strong>Saldo:</strong> R$ {wallet.current_balance}</p>
                    <p><strong>Disponível:</strong> R$ {wallet.available_balance}</p>
                    <p><strong>Status:</strong> {wallet.status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📝 Transações ({verificationResult.tables.wallet_transactions.count})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {verificationResult.tables.wallet_transactions.data.map((transaction, index) => (
                  <div key={index} className="p-2 border rounded text-sm">
                    <p><strong>Tipo:</strong> {transaction.type}</p>
                    <p><strong>Valor:</strong> R$ {transaction.amount}</p>
                    <p><strong>Saldo após:</strong> R$ {transaction.balance_after}</p>
                    <p><strong>Descrição:</strong> {transaction.description}</p>
                    <p><strong>Status:</strong> {transaction.status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {verificationResult.tables.indicacoes.count > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>🎁 Indicações ({verificationResult.tables.indicacoes.count})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {verificationResult.tables.indicacoes.data.map((indicacao, index) => (
                    <div key={index} className="p-2 border rounded text-sm">
                      <p><strong>Indicador:</strong> {indicacao.referrer_id}</p>
                      <p><strong>Indicado:</strong> {indicacao.referred_id}</p>
                      <p><strong>Código:</strong> {indicacao.codigo}</p>
                      <p><strong>Bônus Indicador:</strong> R$ {indicacao.comissao}</p>
                      <p><strong>Status:</strong> {indicacao.status}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default RegistrationVerificationTest;