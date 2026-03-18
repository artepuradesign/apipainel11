import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard,
  Wallet,
  Crown,
  Receipt,
  TrendingUp,
  Activity,
  Loader2
} from 'lucide-react';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { toast } from "sonner";
import { adminUserApiService } from '@/services/adminUserApiService';
import type { User as UserType } from '@/types/user';

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      // Carregar dados do usuário
      const apiResponse = await adminUserApiService.getAllUsers();
      
      if (apiResponse.success && apiResponse.data) {
        const usersData = Array.isArray(apiResponse.data) ? apiResponse.data : ((apiResponse.data as any)?.users || []);
        const userData = usersData.find((u: any) => u.id?.toString() === userId);
        
        if (userData) {
          const formattedUser: UserType = {
            id: userData.id?.toString() || '',
            username: userData.login || userData.email?.split('@')[0] || '',
            name: userData.name || userData.full_name || '',
            email: userData.email || '',
            role: (userData.user_role === 'admin' || userData.user_role === 'suporte') ? 'suporte' : 'assinante',
            user_role: userData.user_role || 'assinante',
            plan: userData.plan || userData.tipoplano || 'Pré-Pago',
            balance: userData.balance || userData.saldo || 0,
            planBalance: userData.saldo_plano || 0,
            isActive: userData.status === 'ativo',
            createdAt: userData.created_at || new Date().toISOString(),
            lastLogin: userData.last_login || userData.ultimo_login || '',
            cpf: userData.cpf || '',
            phone: userData.telefone || '',
            address: userData.endereco || '',
            notes: '',
            pixKeys: [],
            subscription: userData.subscription
          };
          
          setUser(formattedUser);
          
          // TODO: Carregar transações do usuário
          // Por enquanto, deixar vazio
          setTransactions([]);
        } else {
          toast.error('Usuário não encontrado');
          navigate('/dashboard/gestao-usuarios');
        }
      }
    } catch (error) {
      console.error('❌ [USER_DETAILS] Erro ao carregar detalhes:', error);
      toast.error('Erro ao carregar detalhes do usuário');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeaderCard 
          title="Detalhes do Usuário" 
          subtitle="Carregando informações..."
        />
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeaderCard 
          title="Detalhes do Usuário" 
          subtitle="Usuário não encontrado"
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Usuário não encontrado ou erro ao carregar dados.</p>
            <Button onClick={() => navigate('/dashboard/gestao-usuarios')} className="mt-4">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleLabel = (userRole?: string) => {
    switch (userRole) {
      case 'admin': return 'Admin';
      case 'suporte': return 'Suporte';
      case 'assinante': return 'Assinante';
      default: return 'Assinante';
    }
  };

  const getRoleVariant = (userRole?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (userRole) {
      case 'admin': return 'destructive';
      case 'suporte': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/dashboard/gestao-usuarios')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <PageHeaderCard 
          title={`Detalhes: ${user.name}`} 
          subtitle="Informações completas do usuário"
        />
      </div>

      {/* Informações Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Saldo Carteira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(user.balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Disponível para uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Saldo do Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(user.planBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Créditos do plano
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Plano Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.plan}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Status: {user.isActive ? 'Ativo' : 'Inativo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Detalhes */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        {/* Tab: Informações Pessoais */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Nome:</span>
                    <span>{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Username:</span>
                    <span>{user.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={getRoleVariant(user.user_role)}>
                      {getRoleLabel(user.user_role)}
                    </Badge>
                    {!user.isActive && (
                      <Badge variant="destructive">Inativo</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {user.cpf && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">CPF:</span>
                      <span>{user.cpf}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Telefone:</span>
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Endereço:</span>
                      <span>{user.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Cadastro:</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Assinatura */}
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Detalhes da Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.subscription ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Plano:</span> {user.subscription.plan_name || user.plan}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Status:</span>{' '}
                        <Badge variant={user.subscription.status === 'active' ? 'default' : 'secondary'}>
                          {user.subscription.status}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Renovação automática:</span>{' '}
                        {user.subscription.auto_renew ? 'Sim' : 'Não'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Início:</span> {formatDate(user.subscription.starts_at)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Vencimento:</span> {formatDate(user.subscription.ends_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Usuário não possui assinatura ativa</p>
                  <p className="text-sm mt-2">Plano atual: {user.plan}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Transações */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Histórico de Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </div>
                      </div>
                      <div className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma transação registrada</p>
                  <p className="text-sm mt-2">Histórico vazio ou ainda não implementado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Atividade */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.lastLogin && (
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="font-medium">Último acesso</div>
                      <div className="text-sm text-muted-foreground">
                        Login no sistema
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(user.lastLogin)}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <div className="font-medium">Cadastro no sistema</div>
                    <div className="text-sm text-muted-foreground">
                      Conta criada
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </div>
                </div>
                
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Mais atividades serão exibidas aqui conforme forem implementadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetails;
