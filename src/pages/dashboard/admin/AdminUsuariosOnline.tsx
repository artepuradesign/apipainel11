import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCheck, Users, Clock, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiOnlineUsers } from '@/hooks/useApiOnlineUsers';
import { formatDate } from '@/utils/historicoUtils';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';

const AdminUsuariosOnline = () => {
  const { isSupport } = useAuth();
  const { onlineUsers, totalOnline, isLoading, lastUpdate, refreshOnlineUsers } = useApiOnlineUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    return onlineUsers.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id?.toString().includes(searchTerm);

      const matchesPlan = planFilter === 'all' || user.plan?.toLowerCase().includes(planFilter.toLowerCase());

      return matchesSearch && matchesPlan;
    });
  }, [onlineUsers, searchTerm, planFilter]);

  // Calcular estatísticas dos usuários online
  const onlineStats = useMemo(() => {
    const planCounts = onlineUsers.reduce((acc, user) => {
      const plan = user.plan || 'Sem Plano';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageBalance = onlineUsers.length > 0 
      ? onlineUsers.reduce((sum, user) => sum + (user.balance || 0), 0) / onlineUsers.length 
      : 0;

    return {
      total: onlineUsers.length,
      planCounts,
      averageBalance,
      recentLogins: onlineUsers.filter(user => {
        const lastLogin = new Date(user.last_login || '');
        const minutesAgo = new Date();
        minutesAgo.setMinutes(minutesAgo.getMinutes() - 5);
        return lastLogin > minutesAgo;
      }).length
    };
  }, [onlineUsers]);

  if (!isSupport) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Acesso Negado</h2>
          <p className="text-gray-600 dark:text-gray-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Usuários Online"
        subtitle="Monitoramento de usuários atualmente ativos no sistema"
        extra={<UserCheck className="h-6 w-6" />}
      />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Online</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOnline}</div>
            <p className="text-xs text-muted-foreground">Ativos nos últimos 5 min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Detalhado</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineStats.total}</div>
            <p className="text-xs text-muted-foreground">Usuários online detalhados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins Recentes</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineStats.recentLogins}</div>
            <p className="text-xs text-muted-foreground">Últimos 5 minutos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Médio</CardTitle>
            <UserCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {onlineStats.averageBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Saldo médio dos online</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email, login ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="w-full p-2 border rounded-md"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="all">Todos os planos</option>
              {Object.keys(onlineStats.planCounts).map(plan => (
                <option key={plan} value={plan}>
                  {plan} ({onlineStats.planCounts[plan]})
                </option>
              ))}
            </select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setPlanFilter('all');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários Online */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Usuários Online ({filteredUsers.length})</CardTitle>
              {lastUpdate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Última atualização: {formatDate(lastUpdate)}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshOnlineUsers}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando usuários...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário online encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">
                        #{user.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {user.login}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.plan || 'Sem Plano'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        R$ {(user.balance || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.last_login)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Online
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          title="Ver detalhes do usuário"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsuariosOnline;