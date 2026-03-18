import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const NotificationDebug: React.FC = () => {
  const { user, isSupport } = useAuth();

  const testNotificationCreation = async () => {
    try {
      const API_BASE_URL = 'https://api.artepuradesign.com.br';
      
      console.log('🔧 Testing notification creation...');
      
      const response = await fetch(`${API_BASE_URL}/notifications/welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || 1 // Use current user ID or 1 for test
        })
      });

      const data = await response.json();
      console.log('🔧 Notification creation response:', data);

      if (data.success) {
        toast.success('Notificação de teste criada!');
      } else {
        toast.error('Erro ao criar notificação: ' + data.message);
      }
    } catch (error) {
      console.error('🔧 Error creating test notification:', error);
      toast.error('Erro ao criar notificação de teste');
    }
  };

  const testNotificationFetch = async () => {
    try {
      const API_BASE_URL = 'https://api.artepuradesign.com.br';
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('session_token='))
        ?.split('=')[1];

      console.log('🔧 Testing notification fetch...');
      console.log('🔧 Using token:', token?.substring(0, 10) + '...');

      const response = await fetch(`${API_BASE_URL}/notifications?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      console.log('🔧 Notification fetch response:', data);

      if (data.success) {
        toast.success(`Encontradas ${data.data?.notifications?.length || 0} notificações`);
      } else {
        toast.error('Erro ao buscar notificações: ' + data.message);
      }
    } catch (error) {
      console.error('🔧 Error fetching notifications:', error);
      toast.error('Erro ao buscar notificações');
    }
  };

  const testPlanPurchaseNotification = async () => {
    try {
      const API_BASE_URL = 'https://api.artepuradesign.com.br';
      
      console.log('🔧 Testing plan purchase notification creation...');
      
      const response = await fetch(`${API_BASE_URL}/notifications/plan-purchase-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || 1,
          user_name: user?.full_name || 'Usuário Teste',
          plan_name: 'Rainha de Ouros',
          amount: 100,
          method: 'pix',
          transaction_id: 'TEST_' + Date.now()
        })
      });

      const data = await response.json();
      console.log('🔧 Plan purchase notification response:', data);

      if (data.success) {
        toast.success('Notificação de compra de plano criada!');
      } else {
        toast.error('Erro ao criar notificação: ' + data.message);
      }
    } catch (error) {
      console.error('🔧 Error creating plan purchase notification:', error);
      toast.error('Erro ao criar notificação de compra de plano');
    }
  };

  if (!user) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <p>🔧 Debug: Usuário não logado</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded bg-gray-50 space-y-2">
      <h3 className="font-bold">🔧 Debug de Notificações</h3>
      <div className="text-sm space-y-1">
        <p><strong>Usuário:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.user_role}</p>
        <p><strong>É Suporte:</strong> {isSupport ? 'Sim' : 'Não'}</p>
        <p><strong>ID:</strong> {user.id}</p>
      </div>
      <div className="space-x-2 space-y-2">
        <div className="flex space-x-2">
          <Button onClick={testNotificationCreation} size="sm">
            Criar Notificação Teste
          </Button>
          <Button onClick={testNotificationFetch} size="sm" variant="outline">
            Buscar Notificações
          </Button>
        </div>
        <div>
          <Button onClick={testPlanPurchaseNotification} size="sm" variant="secondary">
            Testar Notificação Plano
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDebug;