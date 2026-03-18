
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Circle } from 'lucide-react';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';

const OnlineUsersCard: React.FC = () => {
  const { onlineUsers, formatLoginTime, totalOnline } = useOnlineUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Usuários Online
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {totalOnline}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Usuários ativos agora
          </p>
          <div className="mt-2 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Tempo real
              </span>
            </div>
          </div>
        </div>

        {totalOnline > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Lista de Usuários Online:
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-2 rounded-lg border ${
                    user.isCurrentUser 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Circle 
                      className={`h-2 w-2 fill-current ${
                        user.isCurrentUser ? 'text-green-500' : 'text-blue-500'
                      }`} 
                    />
                    <span className={`text-sm font-medium ${
                      user.isCurrentUser 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {user.name}
                      {user.isCurrentUser && (
                        <span className="text-xs text-green-600 dark:text-green-400 ml-1">
                          (Você)
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatLoginTime(user.loginTime)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalOnline === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p className="text-sm">Nenhum usuário online no momento</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnlineUsersCard;
