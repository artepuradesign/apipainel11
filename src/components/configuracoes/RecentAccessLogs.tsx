
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessLogs, AccessLog } from '@/hooks/useAccessLogs';
import { Button } from '@/components/ui/button';

const RecentAccessLogs = () => {
  const { user } = useAuth();
  const { accessLogs, loading, error, refreshLogs } = useAccessLogs();

  useEffect(() => {
    if (user) {
      // Os logs são carregados automaticamente pelo hook
      console.log('📍 Usuario logado, logs serão carregados automaticamente');
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionDisplayName = (action: string, description: string) => {
    const actionNames: { [key: string]: string } = {
      'login_success': 'Login realizado',
      'logout': 'Logout realizado',
      'page_access': 'Acesso à página',
      'profile_update': 'Perfil atualizado',
      'wallet_recharge': 'Recarga de carteira',
      'plan_purchase': 'Compra de plano',
      'consultation_cpf': 'Consulta CPF',  
      'consultation_cnpj': 'Consulta CNPJ',
      'consultation_vehicle': 'Consulta Veículo',
      'dashboard_access': 'Acesso ao Dashboard',
      'referral_bonus_received': 'Bônus de indicação recebido'
    };

    return actionNames[action] || description || action;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'auth': 'text-green-600 dark:text-green-400',
      'navigation': 'text-blue-600 dark:text-blue-400', 
      'financial': 'text-yellow-600 dark:text-yellow-400',
      'consultation': 'text-purple-600 dark:text-purple-400',
      'referral': 'text-orange-600 dark:text-orange-400',
      'general': 'text-gray-600 dark:text-gray-400'
    };

    return colors[category] || colors['general'];
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Meus Últimos Acessos
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshLogs}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Carregando logs de acesso...
              </div>
            </div>
          ) : accessLogs.length > 0 ? (
            accessLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Monitor className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {getActionDisplayName(log.action, log.description)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {log.device} • {log.browser} • IP: {log.ip}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(log.timestamp)}
                  </p>
                  <p className={`text-xs font-medium ${getCategoryColor(log.category)}`}>
                    {log.page || 'Sistema'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              Nenhum acesso registrado ainda.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAccessLogs;
