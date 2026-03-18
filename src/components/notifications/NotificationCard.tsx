import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCardProps {
  notification: any;
  onNotificationClick: (notification: any) => void;
  onDeleteNotification: (notificationId: number, e: React.MouseEvent) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
  getTypeLabel: (type: string) => string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onNotificationClick,
  onDeleteNotification,
  getPriorityColor,
  getPriorityIcon,
  getTypeLabel
}) => {
  return (
    <div
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border rounded-xl p-5 ${
        !notification.is_read 
          ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-md' 
          : 'bg-background border-border hover:border-primary/20 shadow-sm'
      }`}
      onClick={() => onNotificationClick(notification)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-xl transition-colors ${
            !notification.is_read ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
          }`}>
            {getPriorityIcon(notification.priority)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground text-base line-clamp-1">
                  {notification.title}
                </h3>
                {!notification.is_read && (
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse flex-shrink-0" />
                )}
              </div>
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                {notification.message}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <Badge 
                variant={getPriorityColor(notification.priority) as "default" | "destructive" | "outline" | "secondary"}
                className="text-xs px-2 py-1 font-medium"
              >
                {notification.priority.toUpperCase()}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {getTypeLabel(notification.type)}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
              {notification.action_text && (
                <span className="text-primary font-medium hidden sm:flex items-center gap-1">
                  {notification.action_text} →
                </span>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
              onClick={(e) => onDeleteNotification(notification.id, e)}
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;