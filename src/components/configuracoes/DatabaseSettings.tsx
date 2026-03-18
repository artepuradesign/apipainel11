
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Database, CheckCircle, XCircle, RefreshCw, Play } from "lucide-react";
import { getDatabaseConfig, saveDatabaseConfig, isDatabaseConfigured, DatabaseConfig } from '@/utils/database/config';
import { getMySQLConnection, resetMySQLConnection } from '@/utils/database/mysqlSimulator';
import { getMigrationsList, getExecutedMigrations } from '@/utils/database/migrations';

const DatabaseSettings = () => {
  const [config, setConfig] = useState<DatabaseConfig>(getDatabaseConfig());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [migrations, setMigrations] = useState<{ all: string[], executed: string[] }>({
    all: [],
    executed: []
  });

  useEffect(() => {
    checkConnection();
    loadMigrations();
  }, []);

  const checkConnection = () => {
    setIsConnected(isDatabaseConfigured());
  };

  const loadMigrations = () => {
    const allMigrations = getMigrationsList();
    const executedMigrations = getExecutedMigrations();
    setMigrations({ all: allMigrations, executed: executedMigrations });
  };

  const handleConfigChange = (field: keyof DatabaseConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: field === 'port' ? Number(value) : value
    }));
  };

  const testConnection = async () => {
    setIsConnecting(true);
    
    try {
      // Salvar configuração
      saveDatabaseConfig(config);
      
      // Reset da conexão anterior
      resetMySQLConnection();
      
      // Criar nova conexão
      const mysql = getMySQLConnection(config);
      const connected = await mysql.connect();
      
      if (connected) {
        setIsConnected(true);
        loadMigrations();
        toast.success("Conexão estabelecida com sucesso!");
      } else {
        setIsConnected(false);
        toast.error("Falha ao conectar com o banco de dados");
      }
    } catch (error: any) {
      console.error('Erro na conexão:', error);
      setIsConnected(false);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const runMigrations = async () => {
    if (!isConnected) {
      toast.error("É necessário estar conectado ao banco para executar migrations");
      return;
    }

    try {
      const mysql = getMySQLConnection(config);
      await mysql.runMigrations();
      loadMigrations();
      toast.success("Migrations executadas com sucesso!");
    } catch (error: any) {
      console.error('Erro nas migrations:', error);
      toast.error(`Erro ao executar migrations: ${error.message}`);
    }
  };

  const pendingMigrations = migrations.all.filter(m => !migrations.executed.includes(m));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuração do Banco MySQL
          </CardTitle>
          <CardDescription>
            Configure a conexão com seu banco de dados MySQL local
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                value={config.host}
                onChange={(e) => handleConfigChange('host', e.target.value)}
                placeholder="localhost"
              />
            </div>
            <div>
              <Label htmlFor="port">Porta</Label>
              <Input
                id="port"
                type="number"
                value={config.port}
                onChange={(e) => handleConfigChange('port', e.target.value)}
                placeholder="3306"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="database">Nome do Banco</Label>
            <Input
              id="database"
              value={config.database}
              onChange={(e) => handleConfigChange('database', e.target.value)}
              placeholder="apipainel_db"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user">Usuário</Label>
              <Input
                id="user"
                value={config.user}
                onChange={(e) => handleConfigChange('user', e.target.value)}
                placeholder="root"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={config.password}
                onChange={(e) => handleConfigChange('password', e.target.value)}
                placeholder="senha do mysql"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600">Conectado</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-600">Desconectado</span>
                </>
              )}
            </div>
            <Button 
              onClick={testConnection} 
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              {isConnecting && <RefreshCw className="h-4 w-4 animate-spin" />}
              {isConnecting ? 'Conectando...' : 'Testar Conexão'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Migrations do Banco
          </CardTitle>
          <CardDescription>
            Gerencie as migrations para criar e atualizar a estrutura do banco
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Total de migrations: <Badge variant="outline">{migrations.all.length}</Badge>
              </p>
              <p className="text-sm text-gray-600">
                Executadas: <Badge variant="default">{migrations.executed.length}</Badge>
              </p>
              <p className="text-sm text-gray-600">
                Pendentes: <Badge variant="destructive">{pendingMigrations.length}</Badge>
              </p>
            </div>
            <Button 
              onClick={runMigrations} 
              disabled={!isConnected || pendingMigrations.length === 0}
              variant={pendingMigrations.length > 0 ? "default" : "outline"}
            >
              {pendingMigrations.length > 0 ? `Executar ${pendingMigrations.length} Migrations` : 'Todas Executadas'}
            </Button>
          </div>

          {pendingMigrations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800 font-medium">Migrations Pendentes:</p>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                {pendingMigrations.map(migration => (
                  <li key={migration} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    {migration}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {migrations.executed.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800 font-medium">Migrations Executadas:</p>
              <ul className="text-sm text-green-700 mt-1 space-y-1">
                {migrations.executed.map(migration => (
                  <li key={migration} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {migration}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSettings;
