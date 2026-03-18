
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Clock } from 'lucide-react';

interface RecentReferralsCardProps {
  formatCurrency: (value: number) => string;
  referralsData?: any[];
  isLoading?: boolean;
}

const RecentReferralsCard: React.FC<RecentReferralsCardProps> = ({ 
  formatCurrency, 
  referralsData = [],
  isLoading = false 
}) => {
  // Usar dados passados como prop ou buscar do localStorage como fallback
  const getRealReferrals = () => {
    if (referralsData && referralsData.length > 0) {
      // Usar dados da API
      return referralsData.map((referral: any) => ({
        id: referral.id,
        name: referral.indicado_nome || `Usuário ${referral.indicado_id}`,
        email: referral.indicado_email || '',
        date: new Date(referral.created_at).toLocaleDateString('pt-BR'),
        datetime: new Date(referral.created_at).toLocaleString('pt-BR'),
        firstLoginDate: referral.first_login_at ? new Date(referral.first_login_at).toLocaleDateString('pt-BR') : null,
        firstLoginDateTime: referral.first_login_at ? new Date(referral.first_login_at).toLocaleString('pt-BR') : null,
        status: referral.first_login_bonus_processed ? 'Ativo' : 'Pendente',
        commission: referral.first_login_bonus_processed ? (referral.bonus_indicador || 0) : 0,
        statusColor: referral.first_login_bonus_processed ? 'bg-green-500' : 'bg-yellow-500',
        codigo: referral.codigo,
        bonusProcessed: referral.first_login_bonus_processed
      })).slice(0, 5);
    }

    // Fallback para localStorage (dados locais)
    try {
      const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      
      if (!currentUser.id) return [];
      
      const indicacoesData = JSON.parse(localStorage.getItem('indicacoes_data') || '[]');
      const usersData = JSON.parse(localStorage.getItem('system_users') || '[]');
      
      const userReferrals = indicacoesData.filter((indicacao: any) => 
        indicacao.indicador_id === currentUser.id.toString() || indicacao.indicador_id === currentUser.id
      );
      
      const referralsWithUserData = userReferrals.map((indicacao: any) => {
        const referredUser = usersData.find((user: any) => 
          user.id.toString() === indicacao.indicado_id.toString()
        );
        
        let status = 'Pendente';
        let statusColor = 'bg-yellow-500';
        let commission = 0;
        
        if (indicacao.first_login_bonus_processed) {
          status = 'Ativo';
          statusColor = 'bg-green-500';
          commission = parseFloat(indicacao.bonus_indicador || indicacao.bonus_indicado || 0);
        } else if (indicacao.status === 'ativo') {
          status = 'Cadastrado';
          statusColor = 'bg-blue-500';
        }
        
        return {
          id: indicacao.id,
          name: referredUser?.full_name || `Usuário ${indicacao.indicado_id}`,
          email: referredUser?.email || '',
          date: new Date(indicacao.created_at).toLocaleDateString('pt-BR'),
          firstLoginDate: indicacao.first_login_at ? new Date(indicacao.first_login_at).toLocaleDateString('pt-BR') : null,
          status,
          commission,
          statusColor,
          codigo: indicacao.codigo,
          bonusProcessed: indicacao.first_login_bonus_processed
        };
      });
      
      return referralsWithUserData
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
        
    } catch (error) {
      console.error('❌ [RECENT_REFERRALS] Erro ao buscar indicações:', error);
      return [];
    }
  };
  
  const recentReferrals = getRealReferrals();
  
  if (isLoading) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-100">Seus Indicados Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2 w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1 w-16"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentReferrals.length === 0) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-100">Seus Indicados Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma indicação ainda
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Compartilhe seu código de indicação para ganhar bônus quando alguém se cadastrar!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-100">Seus Indicados Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentReferrals.map((user, index) => (
            <div key={user.id || index} className="flex items-center justify-between p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-purple/10 dark:bg-brand-purple/20 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-brand-purple dark:text-brand-purple" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>Cadastro: {user.datetime || user.date}</span>
                  </div>
                  {user.firstLoginDate && (
                    <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <Clock className="h-3 w-3" />
                      <span>1º Login: {user.firstLoginDateTime || user.firstLoginDate}</span>
                    </div>
                  )}
                  {user.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1">
                    <span>Código: {user.codigo}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${user.statusColor} text-white mb-1`}>
                  {user.status}
                </Badge>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bônus: {formatCurrency(user.commission)}
                </p>
                {user.status === 'Pendente' && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      Aguardando primeiro login
                    </span>
                  </div>
                )}
                {user.status === 'Cadastrado' && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Aguardando primeiro login
                    </span>
                  </div>
                )}
                {user.status === 'Ativo' && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-green-600 dark:text-green-400">
                      ✅ Bônus creditado
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {recentReferrals.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Novo Sistema:</strong> Os bônus são creditados automaticamente no primeiro login do indicado no saldo do plano.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentReferralsCard;
