
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, CreditCard, Users, Eye } from 'lucide-react';
import { ActivityItem as ActivityItemType } from './types';

interface ActivityItemProps {
  activity: ActivityItemType;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_user': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'consultation': return <Search className="h-4 w-4 text-green-500" />;
      case 'recharge': return <CreditCard className="h-4 w-4 text-purple-500" />;
      case 'user_online': return <Users className="h-4 w-4 text-orange-500" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: ActivityItemType) => {
    switch (activity.type) {
      case 'new_user': return `${activity.user} se cadastrou`;
      case 'consultation': return `${activity.user} realizou consulta`;
      case 'recharge': return `${activity.user} fez recarga`;
      case 'user_online': return `${activity.user} está online`;
      default: return activity.user;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'new_user': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'consultation': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'recharge': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'user_online': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default: return 'bg-gray-50 dark:bg-gray-700';
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-lg border ${getActivityColor(activity.type)}`}
    >
      <div className="flex items-center gap-3">
        {getActivityIcon(activity.type)}
        <div>
          <p className="text-sm font-medium">{getActivityText(activity)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{activity.time}</p>
        </div>
      </div>
      {activity.amount && (
        <Badge variant="outline">
          R$ {activity.amount.toFixed(2)}
        </Badge>
      )}
      {activity.type === 'user_online' && (
        <Badge className="bg-green-500 text-white">
          Online
        </Badge>
      )}
    </div>
  );
};

export default ActivityItem;
