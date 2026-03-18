import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Grid3X3, Package, Search, Filter, Download, Eye, Edit, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiModules } from '@/hooks/useApiModules';
import { formatDate, formatBrazilianCurrency } from '@/utils/historicoUtils';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';

const AdminModulos = () => {
  const { isSupport } = useAuth();
  const { modules, isLoading } = useApiModules();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredModules = useMemo(() => {
    return modules.filter(module => {
      const matchesSearch = searchTerm === '' || 
        module.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.id?.toString().includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && module.is_active) ||
        (statusFilter === 'inactive' && !module.is_active) ||
        (statusFilter === 'on' && module.operational_status === 'on') ||
        (statusFilter === 'off' && module.operational_status === 'off');

      return matchesSearch && matchesStatus;
    });
  }, [modules, searchTerm, statusFilter]);

  // Calcular estatísticas dos módulos
  const moduleStats = useMemo(() => {
    const activeModules = modules.filter(m => m.is_active);
    const operationalModules = modules.filter(m => m.operational_status === 'on');
    const totalValue = modules.reduce((sum, m) => sum + (parseFloat(m.price?.toString() || '0') || 0), 0);

    return {
      total: modules.length,
      active: activeModules.length,
      operational: operationalModules.length,
      totalValue,
      averagePrice: modules.length > 0 ? totalValue / modules.length : 0
    };
  }, [modules]);

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
        title="Módulos do Sistema"
        subtitle="Gerenciamento e análise de todos os módulos disponíveis"
        extra={<Grid3X3 className="h-6 w-6" />}
      />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Módulos</CardTitle>
            <Grid3X3 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moduleStats.total}</div>
            <p className="text-xs text-muted-foreground">Módulos no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moduleStats.active}</div>
            <p className="text-xs text-muted-foreground">Módulos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operacionais</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moduleStats.operational}</div>
            <p className="text-xs text-muted-foreground">Status operacional ON</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBrazilianCurrency(moduleStats.averagePrice)}</div>
            <p className="text-xs text-muted-foreground">Preço médio dos módulos</p>
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
                placeholder="Buscar por nome, descrição, slug ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="w-full p-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os módulos</option>
              <option value="active">Apenas ativos</option>
              <option value="inactive">Apenas inativos</option>
              <option value="on">Status ON</option>
              <option value="off">Status OFF</option>
            </select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Módulos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Módulos ({filteredModules.length})</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando módulos...</div>
          ) : filteredModules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum módulo encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Operacional</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-mono text-sm">
                        #{module.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {module.title}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {module.slug}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatBrazilianCurrency(parseFloat(module.price?.toString() || '0') || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={module.is_active ? 'default' : 'secondary'}>
                          {module.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={module.operational_status === 'on' ? 'default' : 'destructive'}>
                          {module.operational_status?.toUpperCase() || 'OFF'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(module.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
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

export default AdminModulos;