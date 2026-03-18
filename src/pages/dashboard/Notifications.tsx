import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Clock, AlertCircle, CheckCircle, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, deleteNotification, isLoading, fetchNotifications } = useNotifications(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
      toast.success('Notificação excluída');
    } catch (error) {
      toast.error('Erro ao excluir notificação');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      'user_recharge_success': 'Recarga',
      'admin_recharge_alert': 'Alerta',
      'plan_purchase': 'Plano',
      'system_notification': 'Sistema',
      'welcome': 'Boas-vindas'
    };
    return typeLabels[type] || type;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'read') return notification.is_read;
    if (filter === 'unread') return !notification.is_read;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Bell className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                Notificações
              </CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas em dia'}
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
              <Badge variant={unreadCount > 0 ? "destructive" : "secondary"} className="text-center md:text-left">
                {notifications.length} total
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchNotifications}
                disabled={isLoading}
                className="h-8 w-8 p-0 mx-auto md:mx-0"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
          <div className="grid grid-cols-3 md:flex gap-2">
            {(['all', 'unread', 'read'] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="px-2 md:px-4 text-xs md:text-sm"
              >
                {filterType === 'all' && 'Todas'}
                {filterType === 'unread' && 'Não Lidas'}
                {filterType === 'read' && 'Lidas'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Card key={notification.id} className={`transition-all hover:shadow-md ${!notification.is_read ? 'border-l-4 border-l-primary' : ''}`}>
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className={`${getPriorityColor(notification.priority)} text-xs`}>
                        {getTypeLabel(notification.type)}
                      </Badge>
                      <Badge variant={notification.is_read ? "secondary" : "default"} className="text-xs">
                        {notification.is_read ? 'Lida' : 'Nova'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 md:line-clamp-1">
                      {notification.title}
                    </h3>
                    
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-3 md:line-clamp-2">
                      {notification.message}
                    </p>
                    
                    {notification.action_url && (
                      <div className="mt-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs text-primary"
                          onClick={() => window.open(notification.action_url, '_blank')}
                        >
                          Ver detalhes
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex md:flex-col gap-2 md:gap-1 w-full md:w-auto justify-end">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'Você não tem notificações ainda' 
                    : `Nenhuma notificação ${filter === 'read' ? 'lida' : 'não lida'} encontrada`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notifications;