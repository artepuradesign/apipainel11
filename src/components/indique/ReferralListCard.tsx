import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp } from 'lucide-react';

interface ReferralData {
  id: number;
  indicado_id: number;
  codigo: string;
  status: string;
  bonus_indicador: number;
  bonus_indicado: number;
  first_login_bonus_processed: boolean;
  first_login_at: string | null;
  created_at: string;
  indicado_nome: string;
  indicado_email: string;
  indicado_cadastro: string;
}

interface ReferralListCardProps {
  referralsData: ReferralData[];
  formatCurrency: (value: number) => string;
  isLoading?: boolean;
}

const ReferralListCard: React.FC<ReferralListCardProps> = ({
  referralsData = [],
  formatCurrency,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            Suas Indicações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-6 bg-gray-300 rounded w-32"></div>
                    <div className="h-4 bg-gray-300 rounded w-48"></div>
                  </div>
                  <div className="h-8 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string, firstLoginProcessed: boolean) => {
    if (firstLoginProcessed) {
      return <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Bônus Pago</Badge>;
    }
    
    switch (status) {
      case 'ativo':
        return <Badge variant="default">Ativo</Badge>;
      case 'confirmada':
        return <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Confirmada</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          Suas Indicações ({referralsData.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Histórico completo de suas indicações e ganhos
        </p>
      </CardHeader>
      <CardContent>
        {referralsData.length > 0 ? (
          <div className="space-y-4">
            {referralsData.map((referral, index) => (
              <div 
                key={referral.id || index} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(referral.status, referral.first_login_bonus_processed)}
                      <Badge variant="outline" className="text-xs">
                        Código: {referral.codigo}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {referral.indicado_nome || `Usuário ${referral.indicado_id}`}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {referral.indicado_email}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>
                        Indicado em: {new Date(referral.indicado_cadastro).toLocaleDateString('pt-BR')}
                      </span>
                      {referral.first_login_at && (
                        <span>
                          Primeiro login: {new Date(referral.first_login_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(referral.bonus_indicador)}
                    </div>
                    <p className="text-xs text-gray-500">Seu bônus</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma indicação ainda
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Compartilhe seu link de indicação para começar a ganhar bônus!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralListCard;