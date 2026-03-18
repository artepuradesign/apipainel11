
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingDown, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WithdrawalRequest {
  id: string;
  amount: number;
  pixKey: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestDate: string;
  completedDate?: string;
  referralEarnings: number;
}

const SaquePix = () => {
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState('');
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([
    {
      id: '1',
      amount: 150.00,
      pixKey: '***@email.com',
      status: 'completed',
      requestDate: '2024-01-15T10:30:00Z',
      completedDate: '2024-01-15T14:45:00Z',
      referralEarnings: 150.00
    },
    {
      id: '2', 
      amount: 75.50,
      pixKey: '***.***.***-**',
      status: 'processing',
      requestDate: '2024-01-20T16:20:00Z',
      referralEarnings: 75.50
    }
  ]);

  // Simulate referral earnings
  const referralBalance = 225.50;
  const minimumWithdrawal = 50.00;
  const maximumWithdrawal = 500.00;

  const handleWithdrawRequest = () => {
    const withdrawAmount = parseFloat(amount);
    
    if (!pixKey.trim()) {
      toast.error("Digite sua chave PIX");
      return;
    }
    
    if (!withdrawAmount || withdrawAmount < minimumWithdrawal) {
      toast.error(`Valor mínimo para saque é R$ ${minimumWithdrawal.toFixed(2)}`);
      return;
    }
    
    if (withdrawAmount > maximumWithdrawal) {
      toast.error(`Valor máximo para saque é R$ ${maximumWithdrawal.toFixed(2)}`);
      return;
    }
    
    if (withdrawAmount > referralBalance) {
      toast.error("Saldo insuficiente para saque");
      return;
    }

    const newWithdrawal: WithdrawalRequest = {
      id: Date.now().toString(),
      amount: withdrawAmount,
      pixKey: pixKey.substring(0, 3) + '*'.repeat(pixKey.length - 6) + pixKey.substring(pixKey.length - 3),
      status: 'pending',
      requestDate: new Date().toISOString(),
      referralEarnings: withdrawAmount
    };

    setWithdrawals(prev => [newWithdrawal, ...prev]);
    setPixKey('');
    setAmount('');
    
    toast.success("Solicitação de saque enviada! Processamento em até 2 dias úteis.");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'processing': return 'Processando';
      case 'failed': return 'Falhou';
      default: return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Saque PIX - Sistema de Indicação" 
        subtitle="Solicite o saque dos seus ganhos por indicação"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo Disponível</p>
                <p className="text-2xl font-bold text-green-600">R$ {referralBalance.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saque Mínimo</p>
                <p className="text-2xl font-bold">R$ {minimumWithdrawal.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saque Máximo</p>
                <p className="text-2xl font-bold">R$ {maximumWithdrawal.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Solicitar Saque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pix-key">Chave PIX</Label>
              <Input
                id="pix-key"
                placeholder="Digite sua chave PIX (CPF, email, telefone ou chave aleatória)"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor do Saque</Label>
              <Input
                id="amount"
                type="number"
                min={minimumWithdrawal}
                max={Math.min(maximumWithdrawal, referralBalance)}
                step="0.01"
                placeholder={`R$ ${minimumWithdrawal.toFixed(2)} - R$ ${maximumWithdrawal.toFixed(2)}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleWithdrawRequest}
            className="w-full bg-brand-purple hover:bg-brand-darkPurple"
            disabled={!pixKey || !amount || parseFloat(amount) < minimumWithdrawal}
          >
            Solicitar Saque
          </Button>
        </CardContent>
      </Card>

      <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Informações importantes:</strong>
          <br />
          • O processo de saque é automático e pode ser liberado em até 30 minutos
          • Em casos excepcionais, pode levar até 2 dias úteis
          • Valor mínimo: R$ {minimumWithdrawal.toFixed(2)} | Valor máximo: R$ {maximumWithdrawal.toFixed(2)}
          • Apenas ganhos do sistema de indicação podem ser sacados
        </AlertDescription>
      </Alert>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Histórico de Saques</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data da Solicitação</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Chave PIX</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Conclusão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    {new Date(withdrawal.requestDate).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">R$ {withdrawal.amount.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{withdrawal.pixKey}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(withdrawal.status)}
                      <Badge className={`ml-2 ${getStatusColor(withdrawal.status)} text-white`}>
                        {getStatusText(withdrawal.status)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {withdrawal.completedDate 
                      ? new Date(withdrawal.completedDate).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaquePix;
