
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Globe, Network, Loader2, CheckCircle, XCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectionConfig {
  host: string;
  database: string;
  username: string;
  password: string;
}

interface ConnectionStatus {
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
}

type ServerType = 'intranet' | 'internet' | null;

const ApiConnection = () => {
  const [intranetConfig, setIntranetConfig] = useState<ConnectionConfig>({
    host: 'localhost',
    database: 'u617342185_api',
    username: 'u617342185_svrsr',
    password: ''
  });

  const [internetConfig, setInternetConfig] = useState<ConnectionConfig>({
    host: 'auth-db722.hstgr.io',
    database: 'u617342185_api',
    username: 'u617342185_svrsr',
    password: ''
  });

  const [intranetStatus, setIntranetStatus] = useState<ConnectionStatus>({
    status: 'idle',
    message: 'Aguardando teste'
  });

  const [internetStatus, setInternetStatus] = useState<ConnectionStatus>({
    status: 'idle',
    message: 'Aguardando teste'
  });

  const [currentServer, setCurrentServer] = useState<ServerType>('internet');
  const [saving, setSaving] = useState(false);

  // Simular teste de conexão
  const testConnection = async (config: ConnectionConfig, type: 'intranet' | 'internet') => {
    const setStatus = type === 'intranet' ? setIntranetStatus : setInternetStatus;
    
    setStatus({ status: 'testing', message: 'Testando conexão...' });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Validação básica dos campos
      if (!config.host || !config.database || !config.username || !config.password) {
        throw new Error('Todos os campos são obrigatórios');
      }

      // Simular teste baseado no host
      if (type === 'intranet' && config.host === 'localhost') {
        setStatus({ 
          status: 'success', 
          message: 'Servidor Local: Conexão com o banco de dados bem-sucedida!' 
        });
        toast.success(`Conexão ${type} estabelecida com sucesso!`);
      } else if (type === 'internet' && config.host === 'auth-db722.hstgr.io') {
        setStatus({ 
          status: 'success', 
          message: 'Servidor Internet: Conexão com o banco de dados bem-sucedida!' 
        });
        toast.success(`Conexão ${type} estabelecida com sucesso!`);
      } else {
        throw new Error('Host não reconhecido para este tipo de conexão');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Falha na conexão';
      setStatus({ status: 'error', message: errorMessage });
      toast.error(`Erro na conexão ${type}: ${errorMessage}`);
    }
  };

  const defineServer = (serverType: 'intranet' | 'internet') => {
    // Verificar se o servidor teve teste bem-sucedido
    const status = serverType === 'intranet' ? intranetStatus : internetStatus;
    
    if (status.status !== 'success') {
      toast.error('É necessário fazer um teste de conexão bem-sucedido antes de definir o servidor');
      return;
    }

    setCurrentServer(serverType);
    localStorage.setItem('current_server', serverType);
    toast.success(`Servidor ${serverType === 'internet' ? 'Internet' : 'Intranet'} definido como padrão!`);
  };

  const getCurrentServerConfig = () => {
    if (currentServer === 'intranet') {
      return { config: intranetConfig, type: 'Intranet (Local)' };
    } else if (currentServer === 'internet') {
      return { config: internetConfig, type: 'Internet (Hostinger)' };
    }
    return { config: null, type: 'Nenhum servidor definido' };
  };

  const handleConfigChange = (
    type: 'intranet' | 'internet', 
    field: keyof ConnectionConfig, 
    value: string
  ) => {
    if (type === 'intranet') {
      setIntranetConfig(prev => ({ ...prev, [field]: value }));
    } else {
      setInternetConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  const saveConfigurations = async () => {
    setSaving(true);
    try {
      localStorage.setItem('api_intranet_config', JSON.stringify(intranetConfig));
      localStorage.setItem('api_internet_config', JSON.stringify(internetConfig));
      localStorage.setItem('current_server', currentServer || '');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const loadSavedConfigurations = () => {
    try {
      const savedIntranet = localStorage.getItem('api_intranet_config');
      const savedInternet = localStorage.getItem('api_internet_config');
      const savedCurrentServer = localStorage.getItem('current_server') as ServerType;

      if (savedIntranet) {
        setIntranetConfig(JSON.parse(savedIntranet));
      }
      if (savedInternet) {
        setInternetConfig(JSON.parse(savedInternet));
      }
      if (savedCurrentServer) {
        setCurrentServer(savedCurrentServer);
      }

      toast.success('Configurações carregadas');
    } catch (error) {
      toast.error('Erro ao carregar configurações salvas');
    }
  };

  const getStatusIcon = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Network className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'testing':
        return <Badge variant="secondary">Testando</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Conectado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconectado</Badge>;
    }
  };

  React.useEffect(() => {
    loadSavedConfigurations();
  }, []);

  const { config: currentConfig, type: currentServerType } = getCurrentServerConfig();

  return (
    <div className="space-y-6">
      {/* Servidor Atual */}
      <Card className="border-2 border-brand-purple/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-purple" />
            Servidor Atual
            <Badge variant="default" className="bg-brand-purple">Ativo</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentConfig ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Servidor</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                  {currentServerType}
                </div>
              </div>
              <div>
                <Label>Host</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                  {currentConfig.host}
                </div>
              </div>
              <div>
                <Label>Banco de Dados</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                  {currentConfig.database}
                </div>
              </div>
              <div>
                <Label>Usuário</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                  {currentConfig.username}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum servidor foi definido como padrão
            </div>
          )}
        </CardContent>
      </Card>

      {/* Servidor Intranet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Servidor Intranet (Local)
            {getStatusBadge(intranetStatus.status)}
            {currentServer === 'intranet' && (
              <Badge variant="default" className="bg-brand-purple">Padrão</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="intranet-host">Host</Label>
              <Input
                id="intranet-host"
                value={intranetConfig.host}
                onChange={(e) => handleConfigChange('intranet', 'host', e.target.value)}
                placeholder="localhost"
              />
            </div>
            <div>
              <Label htmlFor="intranet-database">Banco de Dados</Label>
              <Input
                id="intranet-database"
                value={intranetConfig.database}
                onChange={(e) => handleConfigChange('intranet', 'database', e.target.value)}
                placeholder="u617342185_api"
              />
            </div>
            <div>
              <Label htmlFor="intranet-username">Usuário</Label>
              <Input
                id="intranet-username"
                value={intranetConfig.username}
                onChange={(e) => handleConfigChange('intranet', 'username', e.target.value)}
                placeholder="u617342185_svrsr"
              />
            </div>
            <div>
              <Label htmlFor="intranet-password">Senha</Label>
              <Input
                id="intranet-password"
                type="password"
                value={intranetConfig.password}
                onChange={(e) => handleConfigChange('intranet', 'password', e.target.value)}
                placeholder="Digite a senha"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(intranetStatus.status)}
              <span className="text-sm font-medium">Status:</span>
              <span className="text-sm">{intranetStatus.message}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => testConnection(intranetConfig, 'intranet')}
              disabled={intranetStatus.status === 'testing'}
              className="flex-1"
            >
              {intranetStatus.status === 'testing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando Conexão...
                </>
              ) : (
                <>
                  <Wifi className="mr-2 h-4 w-4" />
                  Testar Conexão
                </>
              )}
            </Button>
            
            <Button 
              variant={currentServer === 'intranet' ? 'default' : 'outline'}
              onClick={() => defineServer('intranet')}
              disabled={currentServer === 'intranet' || intranetStatus.status !== 'success'}
            >
              <Settings className="mr-2 h-4 w-4" />
              {currentServer === 'intranet' ? 'Servidor Atual' : 'Definir Servidor'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Servidor Internet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Servidor Internet (Hostinger)
            {getStatusBadge(internetStatus.status)}
            {currentServer === 'internet' && (
              <Badge variant="default" className="bg-brand-purple">Padrão</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="internet-host">Host</Label>
              <Input
                id="internet-host"
                value={internetConfig.host}
                onChange={(e) => handleConfigChange('internet', 'host', e.target.value)}
                placeholder="auth-db722.hstgr.io"
              />
            </div>
            <div>
              <Label htmlFor="internet-database">Banco de Dados</Label>
              <Input
                id="internet-database"
                value={internetConfig.database}
                onChange={(e) => handleConfigChange('internet', 'database', e.target.value)}
                placeholder="u617342185_api"
              />
            </div>
            <div>
              <Label htmlFor="internet-username">Usuário</Label>
              <Input
                id="internet-username"
                value={internetConfig.username}
                onChange={(e) => handleConfigChange('internet', 'username', e.target.value)}
                placeholder="u617342185_svrsr"
              />
            </div>
            <div>
              <Label htmlFor="internet-password">Senha</Label>
              <Input
                id="internet-password"
                type="password"
                value={internetConfig.password}
                onChange={(e) => handleConfigChange('internet', 'password', e.target.value)}
                placeholder="Digite a senha"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(internetStatus.status)}
              <span className="text-sm font-medium">Status:</span>
              <span className="text-sm">{internetStatus.message}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => testConnection(internetConfig, 'internet')}
              disabled={internetStatus.status === 'testing'}
              className="flex-1"
            >
              {internetStatus.status === 'testing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando Conexão...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Testar Conexão
                </>
              )}
            </Button>
            
            <Button 
              variant={currentServer === 'internet' ? 'default' : 'outline'}
              onClick={() => defineServer('internet')}
              disabled={currentServer === 'internet' || internetStatus.status !== 'success'}
            >
              <Settings className="mr-2 h-4 w-4" />
              {currentServer === 'internet' ? 'Servidor Atual' : 'Definir Servidor'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={saveConfigurations}
          disabled={saving}
          className="flex-1"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Configurações'
          )}
        </Button>
        
        <Button 
          variant="outline"
          onClick={loadSavedConfigurations}
          className="flex-1"
        >
          Carregar Configurações
        </Button>
      </div>
    </div>
  );
};

export default ApiConnection;
