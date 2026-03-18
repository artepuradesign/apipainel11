import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const TestRecharge: React.FC = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestRecharge = async () => {
    if (!user || !amount) {
      toast.error('Por favor, insira um valor válido');
      return;
    }

    setLoading(true);
    
    try {
      // API call to create a test recharge
      const response = await fetch('https://api.apipainel.com.br/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token') || document.cookie.split(';').find(c => c.trim().startsWith('session_token='))?.split('=')[1]}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          payment_method: 'pix',
          description: 'Recarga de teste via sistema'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Recarga de teste processada com sucesso!');
        setAmount('');
      } else {
        toast.error(data.message || 'Erro ao processar recarga');
      }
    } catch (error) {
      console.error('Erro na recarga de teste:', error);
      toast.error('Erro interno no sistema');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Você precisa estar logado para usar esta função.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Teste de Recarga</CardTitle>
          <p className="text-sm text-muted-foreground">
            Use esta página para testar o sistema de notificações de recarga
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Valor da Recarga (R$)
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              max="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 10.00"
            />
          </div>
          
          <Button 
            onClick={handleTestRecharge} 
            disabled={loading || !amount}
            className="w-full"
          >
            {loading ? 'Processando...' : 'Fazer Recarga de Teste'}
          </Button>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Esta recarga será processada via PIX (teste)</p>
            <p>• Você receberá uma notificação de sucesso</p>
            <p>• Os suportes online também receberão uma notificação</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestRecharge;