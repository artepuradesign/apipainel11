import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Layout, Search, Filter, Download, Eye, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiPanels } from '@/hooks/useApiPanels';
import { formatDate } from '@/utils/historicoUtils';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';

const AdminPaineisAtivos = () => {
  const { isSupport } = useAuth();
  const { panels, isLoading } = useApiPanels();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filtrar painéis ativos
  const activePanels = useMemo(() => {
    return panels.filter(panel => panel.is_active === true);
  }, [panels]);

  const filteredPanels = useMemo(() => {
    return activePanels.filter(panel => {
      const matchesSearch = searchTerm === '' || 
        panel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        panel.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        panel.id?.toString().includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && panel.is_active) ||
        (statusFilter === 'inactive' && !panel.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [activePanels, searchTerm, statusFilter]);

  // Calcular estatísticas dos painéis
  const panelStats = useMemo(() => {
    return {
      total: activePanels.length,
      publicPanels: activePanels.length, // Todos são considerados públicos por enquanto
      privatePanels: 0, // Nenhum privado por enquanto
      recentPanels: activePanels.filter(p => {
        const createdDate = new Date(p.created_at || '');
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate > weekAgo;
      }).length
    };
  }, [activePanels]);

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
        title="Painéis Ativos"
        subtitle="Gerenciamento e análise de todos os painéis ativos do sistema"
        extra={<Settings className="h-6 w-6" />}
      />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ativos</CardTitle>
            <Settings className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{panelStats.total}</div>
            <p className="text-xs text-muted-foreground">Painéis atualmente ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Públicos</CardTitle>
            <Layout className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{panelStats.publicPanels}</div>
            <p className="text-xs text-muted-foreground">Painéis públicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Privados</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{panelStats.privatePanels}</div>
            <p className="text-xs text-muted-foreground">Painéis privados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos (7 dias)</CardTitle>
            <Settings className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{panelStats.recentPanels}</div>
            <p className="text-xs text-muted-foreground">Criados recentemente</p>
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
                placeholder="Buscar por nome, descrição ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="w-full p-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
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

      {/* Tabela de Painéis */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Painéis Ativos ({filteredPanels.length})</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando painéis...</div>
          ) : filteredPanels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum painel ativo encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Visibilidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPanels.map((panel) => (
                    <TableRow key={panel.id}>
                      <TableCell className="font-mono text-sm">
                        #{panel.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {panel.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {panel.description || 'Sem descrição'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          Público
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          Ativo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(panel.created_at)}
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

export default AdminPaineisAtivos;