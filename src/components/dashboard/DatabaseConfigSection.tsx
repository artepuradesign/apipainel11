
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw, CheckCircle, Users, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  databaseConfig: {
    host: string;
    user: string;
    password: string;
    database: string;
    port: string;
  };
  onChange: (field: string, value: string) => void;
  onChangeDatabase: () => void;
  onSetAsDefault: () => void;
  onListUsers: () => void;
  isTesting: boolean;
  isConnected: boolean;
  isUsingRealDatabase: boolean;
  mysqlUsers: any[];
  loadingUsers: boolean;
}

const DatabaseConfigSection: React.FC<Props> = ({
  databaseConfig,
  onChange,
  onChangeDatabase,
  onSetAsDefault,
  onListUsers,
  isTesting,
  isConnected,
  isUsingRealDatabase,
  mysqlUsers,
  loadingUsers,
}) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Database className="h-5 w-5" />
          Configurações do Banco de Dados MySQL
        </CardTitle>
        <CardDescription>
          Configure a conexão com seu banco de dados MySQL e migre do sistema simulado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="db-host">Host</Label>
            <Input
              id="db-host"
              value={databaseConfig.host}
              onChange={(e) => onChange('host', e.target.value)}
              placeholder="localhost"
            />
          </div>
          <div>
            <Label htmlFor="db-port">Porta</Label>
            <Input
              id="db-port"
              value={databaseConfig.port}
              onChange={(e) => onChange('port', e.target.value)}
              placeholder="3306"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="db-name">Nome do Banco de Dados</Label>
          <Input
            id="db-name"
            value={databaseConfig.database}
            onChange={(e) => onChange('database', e.target.value)}
            placeholder="apipainel_db"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="db-user">Usuário</Label>
            <Input
              id="db-user"
              value={databaseConfig.user}
              onChange={(e) => onChange('user', e.target.value)}
              placeholder="root"
            />
          </div>
          <div>
            <Label htmlFor="db-password">Senha</Label>
            <Input
              id="db-password"
              type="password"
              value={databaseConfig.password}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder="Digite a senha do MySQL"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600 font-medium">MySQL Conectado</span>
                <Badge className={isUsingRealDatabase ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  {isUsingRealDatabase ? 'Usando MySQL' : 'Dados Simulados'}
                </Badge>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-600 font-medium">Desconectado</span>
                <Badge className="bg-red-100 text-red-800">Dados Simulados</Badge>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={onChangeDatabase}
            disabled={isTesting}
            className="flex items-center gap-2 w-full bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            {isTesting ? "Testando..." : "Testar Conexão MySQL"}
          </Button>

          {isConnected && !isUsingRealDatabase && (
            <Button
              onClick={onSetAsDefault}
              className="flex items-center gap-2 w-full bg-green-600 hover:bg-green-700"
            >
              <Database className="h-4 w-4" />
              Definir MySQL como Base de Dados Padrão
            </Button>
          )}

          {isConnected && isUsingRealDatabase && (
            <Button
              onClick={onListUsers}
              disabled={loadingUsers}
              variant="outline"
              className="flex items-center gap-2 w-full"
            >
              <Users className="h-4 w-4" />
              {loadingUsers ? "Carregando..." : "Listar Usuários do MySQL"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>

    {isConnected && isUsingRealDatabase && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários Cadastrados no MySQL
          </CardTitle>
          <CardDescription>
            Lista de todos os usuários cadastrados no banco de dados MySQL
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Carregando usuários...</p>
            </div>
          ) : mysqlUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Não há usuários cadastrados
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Cadastre um novo usuário para começar a usar o sistema
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Cadastrar Novo Usuário
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Total: <Badge variant="outline">{mysqlUsers.length} usuários</Badge>
                </span>
              </div>
              <div className="grid gap-3">
                {mysqlUsers.map((user, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Login:</span> {user.login}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {user.email}
                      </div>
                      <div>
                        <span className="font-medium">Nome:</span> {user.full_name}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge className={`ml-1 ${user.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )}
  </div>
);

export default DatabaseConfigSection;
