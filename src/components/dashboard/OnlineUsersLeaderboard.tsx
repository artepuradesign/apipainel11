import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Mail, DollarSign, Calendar, UserPlus, Wallet } from 'lucide-react';
import { useApiOnlineUsers } from '@/hooks/useApiOnlineUsers';
import { useNavigate } from 'react-router-dom';

const OnlineUsersLeaderboard: React.FC = () => {
  const { onlineUsers, totalOnline, isLoading } = useApiOnlineUsers();
  const navigate = useNavigate();

  // Pegar apenas os 5 primeiros usuários para exibir
  const topUsers = onlineUsers.slice(0, 5);

  const formatLoginTime = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins === 1) return 'Há 1 min';
    if (diffMins < 60) return `Há ${diffMins} mins`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'Há 1 hora';
    if (diffHours < 24) return `Há ${diffHours} horas`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Há 1 dia';
    return `Há ${diffDays} dias`;
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-500 text-white'; // Ouro
      case 1: return 'bg-gray-400 text-white';   // Prata
      case 2: return 'bg-amber-600 text-white';  // Bronze
      default: return 'bg-primary/10 text-primary'; // Demais
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-primary" />
            Usuários Online
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {totalOnline} ativos
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Carregando usuários...</p>
          </div>
        ) : totalOnline === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhum usuário online no momento
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 hover:shadow-md bg-card hover:bg-muted/30"
              >
                {/* Rank Number */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${getRankColor(index)}`}>
                  {index + 1}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm truncate text-foreground">
                      {user.name}
                    </p>
                    
                    {user.plan && (
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className="text-xs px-2 py-1 whitespace-nowrap">
                          {user.plan}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Email */}
                  {user.email && (
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 flex-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatLoginTime(user.last_login)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Saldo e detalhes extras */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                    {user.balance !== undefined && (
                      <div className="flex items-center gap-1">
                        <Wallet className="h-3 w-3 text-green-600 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs font-medium text-green-600">
                          R$ {user.balance.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {user.plan_balance !== undefined && user.plan_balance > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-purple-600 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs font-medium text-purple-600">
                          Plano: R$ {user.plan_balance.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {(user as any).total_referrals !== undefined && (
                      <div className="flex items-center gap-1">
                        <UserPlus className="h-3 w-3 text-orange-500 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs font-medium text-orange-500">
                          {(user as any).total_referrals} indicações
                        </span>
                      </div>
                    )}
                    {(user as any).remaining_days !== undefined && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs font-medium text-blue-500">
                          {(user as any).remaining_days} dias
                        </span>
                      </div>
                    )}
                    {user.total_consultations !== undefined && user.total_consultations > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {user.total_consultations} consultas
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Online Status Indicator */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 min-w-[60px]">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-muted-foreground text-center whitespace-nowrap">
                    Online
                  </span>
                </div>
              </div>
            ))}

            {totalOnline > 5 && (
              <div className="pt-3 border-t">
                <button
                  onClick={() => navigate('/dashboard/admin/usuarios-online')}
                  className="w-full text-center text-xs text-primary hover:text-primary/80 transition-colors py-2 hover:bg-primary/5 rounded-md"
                >
                  Ver todos os {totalOnline} usuários online →
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnlineUsersLeaderboard;
