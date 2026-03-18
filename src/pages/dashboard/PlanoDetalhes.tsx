
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Users, Calendar, Clock, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/config/api';
import { differenceInDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlanDetail {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  max_consultations: number;
  is_active: boolean;
  features: string[];
  discountPercentage?: number;
}

interface Subscriber {
  user_id: number;
  full_name: string;
  email: string;
  login: string;
  status: string;
  start_date: string;
  end_date: string;
}

const PlanoDetalhes = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (planId) {
      loadPlanDetails(Number(planId));
    }
  }, [planId]);

  const loadPlanDetails = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<any>(`/plans/${id}/details`);
      
      if (response?.success && response.data?.plan) {
        setPlan(response.data.plan);
        setSubscribers(response.data.subscribers || []);
      } else {
        setError(response?.error || 'Erro na API: endpoint /plans/{id}/details não retornou os dados esperados. Verifique se o servidor foi atualizado.');
      }
    } catch (err) {
      console.error('Erro ao carregar plano:', err);
      setError('Erro de conexão com a API. Verifique se o servidor está online.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRemainingDays = (endDate: string) => {
    try {
      const end = parseISO(endDate);
      const today = new Date();
      const days = differenceInDays(end, today);
      return days;
    } catch {
      return 0;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const activeSubscribers = subscribers.filter(s => s.status === 'active');

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <DashboardTitleCard
          title="Detalhes do Plano"
          subtitle="Carregando..."
          icon={<Crown className="h-4 w-4 sm:h-5 sm:w-5" />}
          backTo="/dashboard/personalizacao"
        />
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Carregando detalhes do plano...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <DashboardTitleCard
          title="Detalhes do Plano"
          subtitle="Erro ao carregar"
          icon={<Crown className="h-4 w-4 sm:h-5 sm:w-5" />}
          backTo="/dashboard/personalizacao"
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-muted-foreground">{error || 'Plano não encontrado'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardTitleCard
        title={plan.name}
        subtitle="Detalhes do plano e assinantes"
        icon={<Crown className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/personalizacao"
      />

      {/* Detalhes do Plano */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-primary" />
              Informações do Plano
            </CardTitle>
            <Badge variant={plan.is_active ? "default" : "secondary"}>
              {plan.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Preço</p>
              <p className="text-2xl font-bold text-primary">R$ {Number(plan.price).toFixed(2)}</p>
              {plan.discountPercentage && plan.discountPercentage > 0 && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {plan.discountPercentage}% OFF
                </Badge>
              )}
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Duração</p>
              <p className="text-2xl font-bold">{plan.duration_days}</p>
              <p className="text-xs text-muted-foreground">dias</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Consultas</p>
              <p className="text-2xl font-bold">{plan.max_consultations || '∞'}</p>
              <p className="text-xs text-muted-foreground">máximo</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Assinantes Ativos</p>
              <p className="text-2xl font-bold text-primary">{activeSubscribers.length}</p>
              <p className="text-xs text-muted-foreground">usuários</p>
            </div>
          </div>

          {plan.description && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Assinantes */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Assinantes do Plano
            <div className="flex items-center justify-center w-7 h-7 bg-primary text-primary-foreground rounded-full text-sm font-bold">
              {activeSubscribers.length}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSubscribers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Users className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">Nenhum assinante ativo neste plano</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Início
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Término
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Dias Restantes
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSubscribers.map((sub, idx) => {
                    const remaining = getRemainingDays(sub.end_date);
                    return (
                      <TableRow key={`${sub.user_id}-${idx}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{sub.full_name || 'Sem nome'}</p>
                            <p className="text-xs text-muted-foreground">{sub.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{sub.login || '-'}</TableCell>
                        <TableCell className="text-center text-sm">{formatDate(sub.start_date)}</TableCell>
                        <TableCell className="text-center text-sm">{formatDate(sub.end_date)}</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={remaining > 7 ? "default" : remaining > 0 ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {remaining > 0 ? `${remaining} dias` : 'Expirado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            Ativo
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanoDetalhes;
