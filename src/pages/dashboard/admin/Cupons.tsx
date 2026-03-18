import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Ticket, 
  Plus, 
  RefreshCw, 
  Search, 
  Edit2, 
  Trash2, 
  Calendar,
  Users,
  TrendingUp,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { cupomApiService, Cupom } from '@/services/cupomApiService';
import CupomFormModal from '@/components/cupons/admin/CupomFormModal';
import DeleteConfirmDialog from '@/components/cupons/admin/DeleteConfirmDialog';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface HistoricoCupom {
  id: number;
  cupom_id: number;
  user_id: number;
  user_email?: string;
  codigo: string;
  descricao: string;
  tipo: string;
  valor_original: number;
  valor_desconto: number;
  used_at: string;
  created_at: string;
}

const textByLocale: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    title: 'Gerenciar Cupons',
    subtitle: 'Crie e gerencie cupons de desconto',
    newCoupon: 'Novo Cupom',
    loading: 'Carregando...',
    statsTotal: 'Total Cupons',
    statsActive: 'Ativos',
    statsExpired: 'Expirados',
    statsUses: 'Total Usos',
    listTitle: 'Lista de Cupons',
    listSubtitle: 'Crie e gerencie cupons de desconto e bônus',
    historyTitle: 'Histórico de Uso',
  },
  en: {
    title: 'Manage Coupons',
    subtitle: 'Create and manage discount coupons',
    newCoupon: 'New Coupon',
    loading: 'Loading...',
    statsTotal: 'Total Coupons',
    statsActive: 'Active',
    statsExpired: 'Expired',
    statsUses: 'Total Uses',
    listTitle: 'Coupons List',
    listSubtitle: 'Create and manage discount and bonus coupons',
    historyTitle: 'Usage History',
  },
  es: {
    title: 'Gestionar Cupones',
    subtitle: 'Crea y gestiona cupones de descuento',
    newCoupon: 'Nuevo Cupón',
    loading: 'Cargando...',
    statsTotal: 'Total Cupones',
    statsActive: 'Activos',
    statsExpired: 'Expirados',
    statsUses: 'Usos Totales',
    listTitle: 'Lista de Cupones',
    listSubtitle: 'Crea y gestiona cupones de descuento y bonos',
    historyTitle: 'Historial de Uso',
  },
};

const AdminCupons = () => {
  const { locale } = useLocale();
  const t = textByLocale[locale];
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [filteredCupons, setFilteredCupons] = useState<Cupom[]>([]);
  const [historico, setHistorico] = useState<HistoricoCupom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativo' | 'inativo'>('all');
  
  // Modais
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCupom, setSelectedCupom] = useState<Cupom | null>(null);

  const formatBrazilianCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadCupons = async () => {
    setIsLoading(true);
    try {
      const response = await cupomApiService.getAllCupons();
      
      if (response.success && response.data) {
        const cuponsNormalizados = response.data.map(cupom => ({
          ...cupom,
          valor: typeof cupom.valor === 'string' ? parseFloat(cupom.valor) : cupom.valor,
          uso_atual: typeof cupom.uso_atual === 'string' ? parseInt(cupom.uso_atual) : cupom.uso_atual,
          uso_limite: cupom.uso_limite && typeof cupom.uso_limite === 'string' ? parseInt(cupom.uso_limite) : cupom.uso_limite
        }));
        
        setCupons(cuponsNormalizados);
        setFilteredCupons(cuponsNormalizados);
      } else {
        toast.error(response.error || 'Erro ao carregar cupons');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistorico = async () => {
    try {
      const response = await cupomApiService.getCupomHistoryAdmin();
      
      if (response.success && response.data) {
        setHistorico(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  useEffect(() => {
    loadCupons();
    loadHistorico();
  }, []);

  useEffect(() => {
    let filtered = cupons;

    if (searchTerm) {
      filtered = filtered.filter(cupom =>
        cupom.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cupom.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(cupom => cupom.status === filterStatus);
    }

    setFilteredCupons(filtered);
  }, [cupons, searchTerm, filterStatus]);

  const handleCreateCupom = () => {
    setSelectedCupom(null);
    setShowFormModal(true);
  };

  const handleEditCupom = (cupom: Cupom) => {
    setSelectedCupom(cupom);
    setShowFormModal(true);
  };

  const handleDeleteCupom = (cupom: Cupom) => {
    setSelectedCupom(cupom);
    setShowDeleteDialog(true);
  };

  const handleToggleStatus = async (cupom: Cupom) => {
    try {
      const newStatus = cupom.status === 'ativo' ? 'inativo' : 'ativo';
      const response = await cupomApiService.updateCupom({
        ...cupom,
        status: newStatus
      });

      if (response.success) {
        toast.success(`Cupom ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso`);
        loadCupons();
      } else {
        toast.error(response.error || 'Erro ao alterar status do cupom');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  const confirmDelete = async () => {
    if (!selectedCupom) return;

    try {
      const response = await cupomApiService.deleteCupom(selectedCupom.id);
      
      if (response.success) {
        toast.success('Cupom deletado com sucesso');
        loadCupons();
      } else {
        toast.error(response.error || 'Erro ao deletar cupom');
      }
    } finally {
      setShowDeleteDialog(false);
      setSelectedCupom(null);
    }
  };

  const handleFormSave = () => {
    setShowFormModal(false);
    const wasEditing = !!selectedCupom;
    setSelectedCupom(null);
    toast.success(wasEditing ? 'Cupom atualizado com sucesso' : 'Cupom criado com sucesso');
    loadCupons();
  };

  const getStatusBadge = (cupom: Cupom) => {
    if (cupom.status === 'inativo') {
      return <Badge variant="secondary" className="text-xs">Inativo</Badge>;
    }
    if (cupom.valido_ate && new Date(cupom.valido_ate) < new Date()) {
      return <Badge variant="destructive" className="text-xs">Expirado</Badge>;
    }
    if (cupom.uso_limite && cupom.uso_atual >= cupom.uso_limite) {
      return <Badge variant="destructive" className="text-xs">Esgotado</Badge>;
    }
    return <Badge variant="default" className="text-xs">Ativo</Badge>;
  };

  const calculateStats = () => {
    const total = cupons.length;
    const ativos = cupons.filter(c => c.status === 'ativo').length;
    const expirados = cupons.filter(c => 
      c.valido_ate && new Date(c.valido_ate) < new Date()
    ).length;
    const totalUsos = cupons.reduce((acc, c) => acc + c.uso_atual, 0);

    return { total, ativos, expirados, totalUsos };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <DashboardTitleCard
           title={t.title}
           subtitle={t.subtitle}
          icon={<Ticket className="h-4 w-4 sm:h-5 sm:w-5" />}
          backTo="/dashboard/admin"
        />
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2"><RefreshCw className="w-8 h-8 animate-spin text-primary" /><span className="text-sm text-muted-foreground">{t.loading}</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardTitleCard
        title={t.title}
        subtitle={t.subtitle}
        icon={<Ticket className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/admin"
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={loadCupons}
              disabled={isLoading}
              className="h-9 w-9"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={handleCreateCupom} size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
               {t.newCoupon}
            </Button>
            <Button onClick={handleCreateCupom} size="icon" className="sm:hidden h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{t.statsTotal}</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{t.statsActive}</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{stats.ativos}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{t.statsExpired}</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{stats.expirados}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{t.statsUses}</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1">{stats.totalUsos}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciamento de Cupons */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Ticket className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.listTitle}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t.listSubtitle}
          </p>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {/* Busca e Filtros */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className="text-xs sm:text-sm"
              >
                Todos ({cupons.length})
              </Button>
              <Button
                variant={filterStatus === 'ativo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('ativo')}
                className="text-xs sm:text-sm"
              >
                Ativos ({cupons.filter(c => c.status === 'ativo').length})
              </Button>
              <Button
                variant={filterStatus === 'inativo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inativo')}
                className="text-xs sm:text-sm"
              >
                Inativos ({cupons.filter(c => c.status === 'inativo').length})
              </Button>
            </div>
          </div>

          {/* Lista de Cupons - Cards Responsivos */}
          {filteredCupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ticket className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium text-sm">Nenhum cupom encontrado</p>
              <p className="text-xs mt-1">
                {searchTerm || filterStatus !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie seu primeiro cupom clicando no botão acima'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCupons.map((cupom) => (
                <div key={cupom.id} className="border rounded-lg p-3 sm:p-4 space-y-2 bg-card border-l-4 border-l-blue-500">
                  {/* Linha 1: Código, Status, Ações */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">
                        {cupom.codigo}
                      </Badge>
                      {getStatusBadge(cupom)}
                      <Badge variant={cupom.tipo === 'fixo' ? 'default' : 'secondary'} className="text-xs">
                        {cupom.tipo === 'fixo' ? 'Fixo' : '%'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCupom(cupom)} className="h-8 w-8 p-0" title="Editar">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(cupom)} className="h-8 w-8 p-0" title={cupom.status === 'ativo' ? 'Desativar' : 'Ativar'}>
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCupom(cupom)} className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Deletar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Linha 2: Descrição + Valor */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-muted-foreground flex-1 min-w-0 truncate pr-3">
                      {cupom.descricao || '-'}
                    </p>
                    <span className="font-bold text-sm sm:text-base text-primary flex-shrink-0">
                      {cupom.tipo === 'fixo' ? formatBrazilianCurrency(cupom.valor) : `${cupom.valor}%`}
                    </span>
                  </div>

                  {/* Linha 3: Usos + Validade */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <span>📊 {cupom.uso_atual}{cupom.uso_limite ? `/${cupom.uso_limite}` : ''} usos</span>
                    <span>📅 {cupom.valido_ate ? formatDate(cupom.valido_ate) : 'Sem limite'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Uso */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.historyTitle}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Últimos cupons utilizados pelos usuários
          </p>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {historico.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum cupom utilizado ainda
              </div>
            ) : (
              historico.slice(0, 20).map((item: any) => (
                <div key={item.id} className="border rounded-lg p-3 sm:p-4 space-y-3 bg-card border-l-4 border-l-purple-500">
                  {/* Linha 1: Código, Data */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{item.codigo}</Badge>
                      <Badge variant={item.tipo === 'fixo' ? 'default' : 'secondary'} className="text-xs">
                        {item.tipo === 'fixo' ? 'Fixo' : '%'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(item.used_at)}</span>
                  </div>

                  {/* Linha 2: Usuário + Valor */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="font-semibold text-sm">{item.user_name || item.user_email || `Usuário #${item.user_id}`}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                        {item.user_email && <p className="text-xs text-muted-foreground">📧 {item.user_email}</p>}
                        {item.user_login && <p className="text-xs text-muted-foreground">👤 @{item.user_login}</p>}
                        {item.user_cpf && <p className="text-xs text-muted-foreground">🪪 CPF: {item.user_cpf}</p>}
                        {item.user_telefone && <p className="text-xs text-muted-foreground">📱 Tel: {item.user_telefone}</p>}
                        {item.user_id && <p className="text-xs text-muted-foreground">🔑 ID: {item.user_id}</p>}
                        {item.user_status && <p className="text-xs text-muted-foreground">📌 Status: <span className="font-medium">{item.user_status}</span></p>}
                        {item.user_plano && <p className="text-xs text-muted-foreground">📋 Plano: <span className="font-medium">{item.user_plano}</span></p>}
                        {item.user_codigo_indicacao && <p className="text-xs text-muted-foreground">🎫 Cód: <span className="font-mono">{item.user_codigo_indicacao}</span></p>}
                        {item.user_saldo !== undefined && item.user_saldo !== null && <p className="text-xs text-muted-foreground">💰 Saldo: <span className="font-mono font-semibold">{formatBrazilianCurrency(item.user_saldo)}</span></p>}
                        {item.user_saldo_plano !== undefined && item.user_saldo_plano !== null && <p className="text-xs text-muted-foreground">💎 Plano: <span className="font-mono font-semibold">{formatBrazilianCurrency(item.user_saldo_plano)}</span></p>}
                        {item.user_created_at && <p className="text-xs text-muted-foreground">📅 Cadastro: {formatDate(item.user_created_at)}</p>}
                      </div>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="font-bold text-lg text-green-600">{formatBrazilianCurrency(item.valor_desconto)}</p>
                      {item.valor_original > 0 && (
                        <p className="text-[10px] text-muted-foreground">Original: {item.tipo === 'fixo' ? formatBrazilianCurrency(item.valor_original) : `${item.valor_original}%`}</p>
                      )}
                    </div>
                  </div>

                  {/* Linha 3: Descrição */}
                  {item.descricao && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">{item.descricao}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          {historico.length > 0 ? (
            <div className="hidden md:block space-y-3">
              {historico.map((item: any) => (
                <div key={item.id} className="border rounded-lg p-3 sm:p-4 space-y-3 bg-card border-l-4 border-l-purple-500">
                  {/* Linha 1: Código, Tipo, Data */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{item.codigo}</Badge>
                      <Badge variant={item.tipo === 'fixo' ? 'default' : 'secondary'} className="text-xs">
                        {item.tipo === 'fixo' ? 'Fixo' : '%'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(item.used_at)}</span>
                  </div>

                  {/* Linha 2: Usuário + Valor */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="font-semibold text-sm sm:text-base">{item.user_name || item.user_email || `Usuário #${item.user_id}`}</p>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-0.5">
                        {item.user_email && <p className="text-xs text-muted-foreground">📧 {item.user_email}</p>}
                        {item.user_login && <p className="text-xs text-muted-foreground">👤 @{item.user_login}</p>}
                        {item.user_cpf && <p className="text-xs text-muted-foreground">🪪 CPF: {item.user_cpf}</p>}
                        {item.user_telefone && <p className="text-xs text-muted-foreground">📱 Tel: {item.user_telefone}</p>}
                        {item.user_id && <p className="text-xs text-muted-foreground">🔑 ID: {item.user_id}</p>}
                        {item.user_status && <p className="text-xs text-muted-foreground">📌 Status: <span className="font-medium">{item.user_status}</span></p>}
                        {item.user_plano && <p className="text-xs text-muted-foreground">📋 Plano: <span className="font-medium">{item.user_plano}</span></p>}
                        {item.user_codigo_indicacao && <p className="text-xs text-muted-foreground">🎫 Cód: <span className="font-mono">{item.user_codigo_indicacao}</span></p>}
                        {item.user_saldo !== undefined && item.user_saldo !== null && <p className="text-xs text-muted-foreground">💰 Saldo: <span className="font-mono font-semibold">{formatBrazilianCurrency(item.user_saldo)}</span></p>}
                        {item.user_saldo_plano !== undefined && item.user_saldo_plano !== null && <p className="text-xs text-muted-foreground">💎 Plano: <span className="font-mono font-semibold">{formatBrazilianCurrency(item.user_saldo_plano)}</span></p>}
                        {item.user_created_at && <p className="text-xs text-muted-foreground">📅 Cadastro: {formatDate(item.user_created_at)}</p>}
                      </div>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="font-bold text-lg text-green-600">{formatBrazilianCurrency(item.valor_desconto)}</p>
                      {item.valor_original > 0 && (
                        <p className="text-[10px] text-muted-foreground">Original: {item.tipo === 'fixo' ? formatBrazilianCurrency(item.valor_original) : `${item.valor_original}%`}</p>
                      )}
                    </div>
                  </div>

                  {/* Linha 3: Descrição */}
                  {item.descricao && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">{item.descricao}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="hidden md:block text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhum cupom utilizado ainda</p>
              <p className="text-sm mt-2">
                Quando usuários utilizarem cupons, o histórico aparecerá aqui
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <CupomFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        cupom={selectedCupom}
        onSave={handleFormSave}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        cupomCodigo={selectedCupom?.codigo || ''}
      />
    </div>
  );
};

export default AdminCupons;
