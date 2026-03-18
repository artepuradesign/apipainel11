import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Clock, 
  User, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Reply,
  Star,
  Headphones
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

interface SupportTicket {
  id: number;
  ticket_number: string;
  user_id: number;
  subject: string;
  description: string;
  category: 'tecnico' | 'financeiro' | 'consultas' | 'geral';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';
  assigned_to?: number;
  resolution?: string;
  satisfaction_rating?: number;
  satisfaction_comment?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  user_name?: string;
  user_email?: string;
}

const textByLocale: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    title: 'Gerenciar Chamados',
    subtitle: 'Visualize e responda aos chamados dos usuários',
    loading: 'Carregando chamados...',
    open: 'Abertos',
    inProgress: 'Em Andamento',
    resolved: 'Resolvidos',
    urgent: 'Urgentes',
    filters: 'Filtros',
    tickets: 'Chamados',
    noneFound: 'Nenhum chamado encontrado',
  },
  en: {
    title: 'Manage Tickets',
    subtitle: 'View and respond to user support tickets',
    loading: 'Loading tickets...',
    open: 'Open',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    urgent: 'Urgent',
    filters: 'Filters',
    tickets: 'Tickets',
    noneFound: 'No tickets found',
  },
  es: {
    title: 'Gestionar Tickets',
    subtitle: 'Visualiza y responde a los tickets de los usuarios',
    loading: 'Cargando tickets...',
    open: 'Abiertos',
    inProgress: 'En Progreso',
    resolved: 'Resueltos',
    urgent: 'Urgentes',
    filters: 'Filtros',
    tickets: 'Tickets',
    noneFound: 'No se encontraron tickets',
  },
};

const dateFnsLocaleByLocale: Record<Locale, any> = {
  'pt-BR': ptBR,
  en: enUS,
  es,
};

const GerenciarChamados = () => {
  const { user } = useAuth();
  const { locale } = useLocale();
  const t = textByLocale[locale];
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolution, setResolution] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      
      const mockTickets: SupportTicket[] = [
        {
          id: 1,
          ticket_number: 'TK202501091001',
          user_id: 123,
          subject: 'Problema com consulta CPF',
          description: 'Não consigo realizar consultas de CPF. O sistema retorna erro 500.',
          category: 'tecnico',
          priority: 'alta',
          status: 'aberto',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          user_name: 'João Silva',
          user_email: 'joao@email.com'
        },
        {
          id: 2,
          ticket_number: 'TK202501091002',
          user_id: 124,
          subject: 'Recarga não creditada',
          description: 'Fiz uma recarga via PIX há 30 minutos mas o valor não foi creditado na minha carteira.',
          category: 'financeiro',
          priority: 'urgente',
          status: 'em_andamento',
          assigned_to: parseInt(user?.id || '0'),
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          user_name: 'Maria Santos',
          user_email: 'maria@email.com'
        },
        {
          id: 3,
          ticket_number: 'TK202501091003',
          user_id: 125,
          subject: 'Dúvidas sobre planos',
          description: 'Gostaria de saber qual plano é mais adequado para meu perfil de uso.',
          category: 'geral',
          priority: 'baixa',
          status: 'resolvido',
          resolution: 'Cliente orientado sobre os benefícios de cada plano. Recomendado Plano Intermediário.',
          satisfaction_rating: 5,
          satisfaction_comment: 'Excelente atendimento!',
          resolved_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          user_name: 'Carlos Oliveira',
          user_email: 'carlos@email.com'
        }
      ];

      setTickets(mockTickets);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
      toast.error('Erro ao carregar chamados');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  };

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: newStatus as any, updated_at: new Date().toISOString() }
            : ticket
        )
      );
      
      toast.success('Status atualizado com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleRespond = async () => {
    if (!selectedTicket || !resolution.trim()) {
      toast.error('Preencha a resposta');
      return;
    }

    try {
      setIsResponding(true);

      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === selectedTicket.id
            ? {
                ...ticket,
                status: 'resolvido',
                resolution: resolution,
                resolved_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            : ticket
        )
      );

      setSelectedTicket(null);
      setResolution('');
      toast.success('Resposta enviada com sucesso');
    } catch (error) {
      toast.error('Erro ao enviar resposta');
    } finally {
      setIsResponding(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'bg-red-500 text-white';
      case 'alta': return 'bg-orange-500 text-white';
      case 'media': return 'bg-yellow-500 text-white';
      case 'baixa': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return 'bg-blue-500 text-white';
      case 'em_andamento': return 'bg-yellow-500 text-white';
      case 'resolvido': return 'bg-green-500 text-white';
      case 'fechado': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tecnico': return <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'financeiro': return <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'consultas': return <Search className="h-3 w-3 sm:h-4 sm:w-4" />;
      default: return <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <DashboardTitleCard
          title={t.title}
          subtitle={t.subtitle}
          icon={<Headphones className="h-4 w-4 sm:h-5 sm:w-5" />}
          backTo="/dashboard/admin"
        />
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm">{t.loading}</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardTitleCard
        title={t.title}
        subtitle={t.subtitle}
        icon={<Headphones className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/admin"
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'aberto').length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{tickets.filter(t => t.status === 'em_andamento').length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'resolvido').length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.resolved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{tickets.filter(t => t.priority === 'urgente').length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.urgent}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.filters}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="text-xs sm:text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por assunto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="aberto">Abertos</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="resolvido">Resolvidos</SelectItem>
                  <SelectItem value="fechado">Fechados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium mb-2 block">Prioridade</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={loadTickets} variant="outline" className="w-full" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Chamados */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">{t.tickets} ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">{t.noneFound}</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-blue-600">
                          {ticket.ticket_number}
                        </span>
                        <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                        <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold mb-1 text-sm sm:text-base truncate">{ticket.subject}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{ticket.user_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(ticket.created_at), {
                            addSuffix: true,
                            locale: dateFnsLocaleByLocale[locale]
                          })}
                        </div>
                        {ticket.satisfaction_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {ticket.satisfaction_rating}/5
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-start">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">Chamado {ticket.ticket_number}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs sm:text-sm font-medium">Usuário</label>
                                <p className="text-xs sm:text-sm">{ticket.user_name} ({ticket.user_email})</p>
                              </div>
                              <div>
                                <label className="text-xs sm:text-sm font-medium">Data de Abertura</label>
                                <p className="text-xs sm:text-sm">{new Date(ticket.created_at).toLocaleString('pt-BR')}</p>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-xs sm:text-sm font-medium">Assunto</label>
                              <p className="text-xs sm:text-sm">{ticket.subject}</p>
                            </div>
                            
                            <div>
                              <label className="text-xs sm:text-sm font-medium">Descrição</label>
                              <p className="text-xs sm:text-sm whitespace-pre-wrap">{ticket.description}</p>
                            </div>
                            
                            {ticket.resolution && (
                              <div>
                                <label className="text-xs sm:text-sm font-medium">Resolução</label>
                                <p className="text-xs sm:text-sm whitespace-pre-wrap bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                                  {ticket.resolution}
                                </p>
                              </div>
                            )}

                            {ticket.status !== 'resolvido' && ticket.status !== 'fechado' && (
                              <div className="space-y-3 pt-4 border-t">
                                <label className="text-xs sm:text-sm font-medium">Responder</label>
                                <Textarea
                                  placeholder="Digite sua resposta..."
                                  value={resolution}
                                  onChange={(e) => setResolution(e.target.value)}
                                  rows={4}
                                  className="text-sm"
                                />
                                <Button
                                  onClick={handleRespond}
                                  disabled={isResponding || !resolution.trim()}
                                  className="w-full sm:w-auto"
                                  size="sm"
                                >
                                  <Reply className="h-4 w-4 mr-2" />
                                  {isResponding ? 'Enviando...' : 'Enviar Resposta'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GerenciarChamados;
