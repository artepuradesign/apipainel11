
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Clock, User, DollarSign, TrendingUp } from 'lucide-react';
import { adminActivityApiService, AdminActivity } from '@/services/adminActivityApiService';

const AdminActivityComponent: React.FC = () => {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const result = await adminActivityApiService.getRecentActivities(20);
      
      if (result.success && result.data) {
        setActivities(result.data);
      } else {
        console.warn('Erro ao carregar atividades:', result.error);
        setActivities([]);
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadActivities();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadActivities, 30000);
    
    // Escutar eventos de nova recarga
    const handleRechargeCompleted = (event: CustomEvent) => {
      const { userId, amount, method, userName } = event.detail;
      const newActivity: AdminActivity = {
        id: Date.now(),
        type: 'balance_deposit',
        description: `${userName} fez recarga de R$ ${amount.toFixed(2)} via ${method}`,
        user_id: userId,
        user_name: userName,
        amount: amount,
        created_at: new Date().toISOString()
      };
      
      setActivities(prev => [newActivity, ...prev].slice(0, 20));
    };
    
    window.addEventListener('rechargeCompleted', handleRechargeCompleted as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('rechargeCompleted', handleRechargeCompleted as EventListener);
    };
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'recarga':
      case 'entrada':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'login':
      case 'registro':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'plano':
      case 'compra':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'consulta':
        return <Eye className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  const formatDescription = (activity: AdminActivity) => {
    return (
      <div className="text-sm">
        <div className="font-medium">
          {activity.description}
        </div>
        {activity.user_name && (
          <div className="text-xs text-gray-500 mt-1">
            Usuário: {activity.user_name}
          </div>
        )}
        {activity.module && (
          <div className="text-xs text-gray-500">
            Módulo: {activity.module}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Atividade em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center border">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  {formatDescription(activity)}
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(activity.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma atividade recente</p>
            <p className="text-sm">As atividades aparecerão aqui em tempo real</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminActivityComponent;
