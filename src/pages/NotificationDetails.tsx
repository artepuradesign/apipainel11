import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, CreditCard, Hash, CheckCircle, AlertCircle, ArrowLeft, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationDetail {
  id: number;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

interface TransactionDetail {
  id: string;
  user_name: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
}

const NotificationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { notifications, markAsRead, isLoading: notificationsLoading } = useNotifications(true, 30000);
  const [notification, setNotification] = useState<NotificationDetail | null>(null);
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotificationDetails = async () => {
      if (!id || notificationsLoading) return;

      try {
        setIsLoading(true);
        setError(null);

        // Buscar notificação na lista já carregada
        const foundNotification = notifications.find(n => n.id === parseInt(id));
        
        if (!foundNotification) {
          setError('Notificação não encontrada');
          return;
        }

        setNotification(foundNotification);

        // Se for uma notificação de recarga, extrair detalhes da transação
        if (foundNotification.type.includes('recharge')) {
          const transactionId = extractTransactionId(foundNotification.message);
          if (transactionId) {
            const transactionDetails = extractTransactionDetails(foundNotification.message, transactionId);
            setTransaction(transactionDetails);
          }
        }

        // Marcar notificação como lida se ainda não foi
        if (!foundNotification.is_read) {
          await markAsRead(foundNotification.id);
        }
        
      } catch (err) {
        console.error('Erro ao carregar notificação:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotificationDetails();
  }, [id, notifications, notificationsLoading, markAsRead]);

  const extractTransactionId = (message: string): string | null => {
    const match = message.match(/ID da transação:\s*([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const extractTransactionDetails = (message: string, transactionId: string): TransactionDetail => {
    // Extrair dados da mensagem
    const userNameMatch = message.match(/Usuário\s+(.+?)\s+realizou/);
    const amountMatch = message.match(/R\$ ([\d.,]+)/);
    const methodMatch = message.match(/via (\w+)/);

    const userName = userNameMatch ? userNameMatch[1].trim() : 'Usuário';
    const amountStr = amountMatch ? amountMatch[1].replace(/\./g, '').replace(',', '.') : '0';
    const amount = Number.isNaN(parseFloat(amountStr)) ? 0 : parseFloat(amountStr);
    const method = methodMatch ? methodMatch[1] : 'Desconhecido';

    return {
      id: transactionId,
      user_name: userName,
      amount: amount,
      method: method,
      status: 'completed',
      created_at: notification?.created_at || new Date().toISOString()
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading || notificationsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando detalhes da notificação...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Erro ao carregar notificação</h2>
            <p className="text-muted-foreground mb-4">{error || 'Notificação não encontrada'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Layout em colunas responsivas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notificação - Primeira coluna */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowLeft 
                    className="h-5 w-5 text-primary cursor-pointer hover:text-primary/80" 
                    onClick={() => window.history.back()} 
                  />
                  Notificação
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-xl flex-shrink-0 ${
                  !notification.is_read 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {getPriorityIcon(notification.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge 
                      variant={getPriorityColor(notification.priority) as "default" | "destructive" | "outline" | "secondary"} 
                      className="text-xs px-2 py-1"
                    >
                      {notification.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      <Tag className="h-3 w-3 mr-1" />
                      {notification.type.replace('_', ' ')}
                    </Badge>
                    {!notification.is_read && (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-xs text-primary font-medium">Nova</span>
                      </div>
                    )}
                  </div>
                  <h1 className="text-lg font-bold text-foreground mb-4 leading-tight">
                    {notification.title}
                  </h1>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {notification.message}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações - Segunda coluna */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Recebida</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {new Date(notification.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Status</p>
                  <Badge 
                    variant={notification.is_read ? "secondary" : "default"} 
                    className="text-xs mt-1"
                  >
                    {notification.is_read ? "✓ Lida" : "● Não lida"}
                  </Badge>
                  {notification.read_at && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {new Date(notification.read_at).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Categoria</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {notification.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transação - Terceira coluna */}
        <div className="lg:col-span-1">
          {transaction ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Transação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">ID</p>
                    <p className="text-xs text-muted-foreground font-mono break-all">{transaction.id}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Usuário</p>
                    <p className="text-xs text-muted-foreground">{transaction.user_name}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Valor</p>
                    <p className="text-base font-bold text-green-600">
                      R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Badge className="bg-green-500/10 text-green-700 border-green-500/20 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Concluída via {transaction.method}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Transação
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma transação associada a esta notificação
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;