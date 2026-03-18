import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Trash2, RefreshCw, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit' | 'bonus' | 'referral_bonus' | 'plan_purchase' | 'recharge' | 'plan_credit';
  description: string;
  created_at: string;
  balance_type?: 'wallet' | 'plan';
}

interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  amount: number;
  created_at: string;
  status: 'pending' | 'paid';
  referred_name?: string;
}

interface ReferralHistoryTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  allHistory: Array<Transaction | (ReferralEarning & { type: 'referral_bonus'; description: string; balance_type: 'wallet' })>;
  referralEarnings: ReferralEarning[];
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  clearReferrals: () => void;
  clearAllHistory: () => void;
  loading?: boolean;
}

const ReferralHistoryTabs: React.FC<ReferralHistoryTabsProps> = ({
  activeTab,
  setActiveTab,
  allHistory,
  referralEarnings,
  formatCurrency,
  formatDate,
  clearReferrals,
  clearAllHistory,
  loading = false
}) => {
  const EmptyState = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="text-center py-12">
      {loading ? (
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
          <p className="text-gray-500">Carregando dados...</p>
        </div>
      ) : (
        <>
          <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
            {title}
          </p>
          <p className="text-sm text-gray-400">
            {subtitle}
          </p>
        </>
      )}
    </div>
  );

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Histórico Completo</CardTitle>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Buscar por descrição ou ID da transação..." 
              className="w-80"
            />
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="recargas">Recargas</TabsTrigger>
            <TabsTrigger value="referrals">Indicações</TabsTrigger>
            <TabsTrigger value="consultas">Consultas</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-4">
            {allHistory.length > 0 ? (
              <div className="space-y-4">
                {allHistory.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.amount > 0 ? '+' : ''} {formatCurrency(item.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="Nenhuma transação encontrada"
                subtitle="Seu histórico de transações aparecerá aqui"
              />
            )}
          </TabsContent>

          <TabsContent value="recargas" className="space-y-4">
            <EmptyState 
              title="Nenhuma recarga encontrada"
              subtitle="Suas recargas aparecerão aqui"
            />
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            {/* Seção Bônus por Indicação */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bônus por Indicação</h3>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={clearReferrals}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Indicações
                </Button>
              </div>

              {/* Cards de Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-1">
                    {referralEarnings.length}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total de Indicações</p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                    {formatCurrency(referralEarnings.reduce((sum, ref) => sum + ref.amount, 0))}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total de Bônus</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                    {referralEarnings.filter(ref => ref.status === 'paid').length}
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Bônus Pagos</p>
                </div>
              </div>
            </div>

            {/* Histórico Detalhado de Bônus */}
            {referralEarnings.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🎁 Histórico Detalhado de Bônus
                </h4>
                
                {referralEarnings.map((earning) => {
                  console.log('🔍 [REFERRAL_TABS] Renderizando earning:', earning);
                  // Extrair nome/email do referred_name ou usar ID como fallback mais limpo
                  const displayName = earning.referred_name || `Usuário indicado`;
                  const userInitial = displayName.charAt(0).toUpperCase();
                  console.log('🔍 [REFERRAL_TABS] DisplayName final:', displayName);
                  
                  return (
                    <div key={earning.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {userInitial}
                          </div>
                          
                          <div className="flex-1">
                            {/* Nome/Email */}
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="font-semibold text-gray-900 dark:text-white text-lg">
                                {displayName}
                              </h5>
                              <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                                ✅ Pago
                              </span>
                              <span className="text-gray-500 text-sm">
                                ID: {earning.referred_user_id}
                              </span>
                            </div>
                            
                            {/* Descrição */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-red-500">❤️</span>
                              <p className="text-gray-600 dark:text-gray-400">
                                Bônus de boas-vindas por indicação confirmada
                              </p>
                            </div>
                            
                            {/* Data */}
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">📅</span>
                              <p className="text-gray-500 text-sm">
                                {formatDate(earning.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Valor */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                            + {formatCurrency(earning.amount)}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">Bônus recebido</p>
                          <div className="flex items-center justify-end gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              Creditado
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState 
                title="Nenhum bônus por indicação encontrado"
                subtitle="Seus ganhos por indicação aparecerão aqui quando você começar a indicar pessoas"
              />
            )}
          </TabsContent>

          <TabsContent value="consultas" className="space-y-4">
            <EmptyState 
              title="Nenhuma consulta encontrada"
              subtitle="Suas consultas aparecerão aqui"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReferralHistoryTabs;