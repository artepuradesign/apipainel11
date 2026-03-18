import React from 'react';
import { Bell } from 'lucide-react';
import NotificationCard from './NotificationCard';

interface NotificationListProps {
  filteredNotifications: any[];
  filter: 'all' | 'unread' | 'read';
  onNotificationClick: (notification: any) => void;
  onDeleteNotification: (notificationId: number, e: React.MouseEvent) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
  getTypeLabel: (type: string) => string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  filteredNotifications,
  filter,
  onNotificationClick,
  onDeleteNotification,
  getPriorityColor,
  getPriorityIcon,
  getTypeLabel
}) => {
  if (filteredNotifications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="p-6 rounded-full bg-muted/50 w-fit mx-auto mb-6">
          <Bell className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">
          Nenhuma notificação encontrada
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {filter === 'unread' 
            ? 'Você não tem notificações não lidas no momento.' 
            : 'Não há notificações para exibir com os filtros selecionados.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredNotifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onNotificationClick={onNotificationClick}
          onDeleteNotification={onDeleteNotification}
          getPriorityColor={getPriorityColor}
          getPriorityIcon={getPriorityIcon}
          getTypeLabel={getTypeLabel}
        />
      ))}
    </div>
  );
};

export default NotificationList;