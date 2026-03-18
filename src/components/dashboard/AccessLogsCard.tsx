
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useApiUserSessions } from '@/hooks/useApiUserSessions';
import { Alert, AlertDescription } from "@/components/ui/alert";

const AccessLogsCard: React.FC = () => {
  const { sessions, isLoading, error, refreshSessions } = useApiUserSessions();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPageDisplayName = (page: string) => {
    const pageNames: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/dashboard/historico': 'Histórico',
      '/dashboard/carteira': 'Carteira',
      '/planos-publicos': 'Planos',
      '/dashboard/configuracoes': 'Configurações',
      '/dashboard/consultar-cpf': 'Consultar CPF',
      '/dashboard/consultar-cnpj': 'Consultar CNPJ',
      '/dashboard/consultar-veiculo': 'Consultar Veículo',
      '/dashboard/busca-nome': 'Busca Nome',
      '/dashboard/busca-mae': 'Busca Mãe',
      '/dashboard/busca-pai': 'Busca Pai',
      '/dashboard/checker-lista': 'Checker Lista',
      '/dashboard/eventos': 'Eventos',
      '/dashboard/suporte': 'Suporte',
      '/dashboard/indique': 'Indicações',
      '/dashboard/personalizacao': 'Personalização',
      
      '/dashboard/historico-pagamentos': 'Histórico Pagamentos',
      '/dashboard/saque-pix': 'Saque PIX',
      '/dashboard/minha-conta': 'Minha Conta',
      '/dashboard/newsletter': 'Newsletter',
      '/login': 'Login',
      '/registration': 'Registro',
      '/': 'Página Inicial'
    };

    if (page?.startsWith('/dashboard/painel/')) {
      const painelId = page.split('/dashboard/painel/')[1];
      return `Painel: ${painelId}`;
    }

    return pageNames[page] || page;
  };


  return (
    <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Últimos Acessos
              {error ? (
                <WifiOff className="h-4 w-4 text-red-500" />
              ) : (
                <Wifi className="h-4 w-4 text-green-500" />
              )}
            </CardTitle>
            <CardDescription>
              {error ? 
                'Erro ao conectar com servidor - dados locais' : 
                'Histórico dos últimos acessos ao sistema'
              }
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshSessions}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500">Carregando logs via API...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.length > 0 ? (
              sessions.slice(0, 5).map((session) => {
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Monitor className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{session.device_type}</p>
                        <p className="text-xs text-gray-500">IP: {session.ip_address} • {session.browser}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(session.access_time)}
                      </p>
                      <p className="text-xs text-brand-purple dark:text-brand-purple font-medium">
                        {getPageDisplayName(session.page_accessed)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                Nenhum acesso registrado ainda.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessLogsCard;
