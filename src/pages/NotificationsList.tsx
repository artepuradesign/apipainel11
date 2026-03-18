import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Clock, CheckCircle, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import NotificationFilters from '@/components/notifications/NotificationFilters';
import NotificationList from '@/components/notifications/NotificationList';

const NotificationsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, deleteNotification, isLoading, fetchNotifications } = useNotifications(false); // Desabilitar auto-refresh para evitar conflito
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Carregar notificações apenas uma vez ao entrar na página
  useEffect(() => {
    console.log('📱 [NOTIFICATIONS_PAGE] Carregando notificações...');
    console.log('📱 [NOTIFICATIONS_PAGE] User:', user);
    console.log('📱 [NOTIFICATIONS_PAGE] Current location:', window.location.pathname);
    fetchNotifications();
  }, []);
  
  // Escutar evento de logout do interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      console.log('📱 [NOTIFICATIONS_PAGE] Logout detectado, redirecionando...');
      navigate('/login', { replace: true });
    };
    
    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, [navigate]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    navigate(`/notifications/${notification.id}`);
  };

  const handleDeleteNotification = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      toast.success('Notificação excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      toast.error('Erro ao excluir notificação');
    }
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

  const getTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      'user_recharge_success': 'Recarga Realizada',
      'admin_recharge_alert': 'Alerta de Recarga',
      'plan_purchase': 'Compra de Plano',
      'system_notification': 'Sistema',
      'welcome': 'Boas-vindas'
    };
    return typeLabels[type] || type;
  };

  const filteredNotifications = notifications.filter(notification => {
    const statusMatch = filter === 'all' || 
      (filter === 'read' && notification.is_read) || 
      (filter === 'unread' && !notification.is_read);
    
    const typeMatch = typeFilter === 'all' || notification.type === typeFilter;
    
    return statusMatch && typeMatch;
  });

  const uniqueTypes = Array.from(new Set(notifications.map(n => n.type)));

  if (isLoading && notifications.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando notificações...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificações
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas as notificações estão em dia'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
                {unreadCount > 0 ? `${unreadCount} não lidas` : 'Em dia'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchNotifications}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Link to="/notifications/help">
                <Button variant="ghost" size="sm" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Ajuda</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>


      {/* Lista de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {filteredNotifications.length > 0 
              ? `${filteredNotifications.length} notificação${filteredNotifications.length > 1 ? 'ões' : ''}`
              : 'Notificações'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationList
            filteredNotifications={filteredNotifications}
            filter={filter}
            onNotificationClick={handleNotificationClick}
            onDeleteNotification={handleDeleteNotification}
            getPriorityColor={getPriorityColor}
            getPriorityIcon={getPriorityIcon}
            getTypeLabel={getTypeLabel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsList;