import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRegistrationVerification } from '@/hooks/useRegistrationVerification';
import { toast } from 'sonner';

const ReferralSystemTest = () => {
  const [userId, setUserId] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { verifyRegistration, getUserTransactions, getVerificationSummary } = useRegistrationVerification();

  const handleFullVerification = async () => {
    if (!userId.trim()) {
      toast.error('Por favor, digite um ID de usuário');
      return;
    }

    setIsLoading(true);
    try {
      const verification = await verifyRegistration(Number(userId));
      const transactions = await getUserTransactions(Number(userId));
      const summary = await getVerificationSummary(Number(userId));

      setTestResults({ verification, transactions, summary });
      toast.success('Verificação completa!');
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Teste do Sistema de Indicação</CardTitle>
          <CardDescription>Verificar se todas as tabelas foram atualizadas corretamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            placeholder="ID do usuário"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Button onClick={handleFullVerification} disabled={isLoading || !userId.trim()}>
            {isLoading ? 'Verificando...' : 'Verificar Sistema'}
          </Button>
        </CardContent>
      </Card>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p>Cadastro Completo</p>
                <Badge variant={testResults.verification?.analysis?.registration_complete ? "default" : "destructive"}>
                  {testResults.verification?.analysis?.registration_complete ? '✅ Sim' : '❌ Não'}
                </Badge>
              </div>
              <div className="text-center">
                <p>Sistema de Indicação</p>
                <Badge variant={testResults.verification?.analysis?.referral_system_working ? "default" : "destructive"}>
                  {testResults.verification?.analysis?.referral_system_working ? '✅ OK' : '❌ Erro'}
                </Badge>
              </div>
              <div className="text-center">
                <p>Transações</p>
                <Badge variant="outline">{testResults.transactions?.length || 0}</Badge>
              </div>
              <div className="text-center">
                <p>Bônus Processado</p>
                <Badge variant={testResults.verification?.analysis?.bonus_transactions_created ? "default" : "secondary"}>
                  {testResults.verification?.analysis?.bonus_transactions_created ? '🎁 Sim' : '📝 Não'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralSystemTest;