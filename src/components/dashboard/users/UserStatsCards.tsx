import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, User, Crown, CheckSquare } from 'lucide-react';

interface UserStatsCardsProps {
  stats: {
    total: number;
    assinantes: number;
    suporte: number;
    admin?: number;
    ativos: number;
    assinaturasAtivas: number;
  };
}

const UserStatsCards = ({ stats }: UserStatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <Card className="dashboard-card">
        <CardContent className="p-3 lg:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs lg:text-sm text-muted-foreground truncate">Total Usuários</p>
              <p className="text-lg lg:text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-1.5 lg:p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
              <Users className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardContent className="p-3 lg:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs lg:text-sm text-muted-foreground truncate">Assinantes</p>
              <p className="text-lg lg:text-2xl font-bold">{stats.assinantes}</p>
            </div>
            <div className="p-1.5 lg:p-2 bg-green-500/10 rounded-lg flex-shrink-0">
              <User className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardContent className="p-3 lg:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs lg:text-sm text-muted-foreground truncate">Suporte/Admin</p>
              <p className="text-lg lg:text-2xl font-bold">{stats.suporte + (stats.admin || 0)}</p>
            </div>
            <div className="p-1.5 lg:p-2 bg-yellow-500/10 rounded-lg flex-shrink-0">
              <Crown className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardContent className="p-3 lg:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs lg:text-sm text-muted-foreground truncate">Assinaturas Ativas</p>
              <p className="text-lg lg:text-2xl font-bold">{stats.assinaturasAtivas}</p>
            </div>
            <div className="p-1.5 lg:p-2 bg-purple-500/10 rounded-lg flex-shrink-0">
              <CheckSquare className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStatsCards;
