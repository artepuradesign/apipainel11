import React from 'react';
import { Ticket } from 'lucide-react';
import ConsultationCard from '../ConsultationCard';
import RechargeCard from '../RechargeCard';
import PlanTransactionCard from '../PlanTransactionCard';
import WalletTransactionCard from '../WalletTransactionCard';
import TransactionItem from '../TransactionItem';
import EmptyState from '../EmptyState';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit' | 'bonus' | 'referral_bonus' | 'plan_purchase' | 'plan_activation' | 'recharge' | 'plan_credit' | 'recarga' | 'consultation';
  description: string;
  created_at: string;
  balance_type?: 'wallet' | 'plan';
  category?: string;
  is_referral?: boolean;
  status?: string;
  payment_method?: string;
  plan_name?: string;
  module_type?: string;
  document?: string;
  cost?: number;
  original_price?: number;
  discount_percent?: number;
  saldo_usado?: 'plano' | 'carteira' | 'misto' | string;
  result_data?: any;
}

interface CupomHistoryItem {
  id: string;
  codigo: string;
  descricao?: string;
  tipo: 'fixo' | 'percentual';
  valor_desconto: number;
  created_at: string;
  category: 'cupom';
}

interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  amount: number;
  created_at: string;
  status: 'pending' | 'paid';
}

interface AllHistorySectionProps {
  allHistory: Array<Transaction | CupomHistoryItem | (ReferralEarning & { type: 'referral_bonus'; description: string; balance_type: 'wallet' })>;
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  loading?: boolean;
}

const AllHistorySection: React.FC<AllHistorySectionProps> = ({
  allHistory,
  formatBrazilianCurrency,
  formatDate,
  loading = false
}) => {
  return (
    <div className="mt-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Todos os Registros</h3>
      </div>
      <div className="space-y-4">
        {allHistory.length > 0 ? (
          allHistory.map((item) => {
            // Verificar se é um cupom
            if ('category' in item && item.category === 'cupom') {
              const cupomItem = item as CupomHistoryItem;
              return (
                <div key={cupomItem.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white">
                          <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            Bônus
                          </h5>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              ✅ Aplicado
                            </span>
                            <span className="text-xs text-gray-500">
                              {cupomItem.tipo === 'fixo' ? 'Desconto Fixo' : 'Desconto Percentual'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {cupomItem.descricao || 'Cupom de desconto aplicado'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        📅 {formatDate(cupomItem.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">
                        + {formatBrazilianCurrency(cupomItem.valor_desconto)}
                      </div>
                      <p className="text-xs text-gray-500">Creditado no Saldo</p>
                      <div className="mt-2">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        <span className="text-xs text-green-600 dark:text-green-400">Creditado</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Verificar se é uma transação de indicação/bônus
            const transactionItem = item as Transaction;
            if (transactionItem.is_referral || transactionItem.type === 'bonus' || 
                (transactionItem.category && transactionItem.category === 'bonus')) {
              return (
                <div key={transactionItem.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          👥
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            Bônus de Indicação
                          </h5>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              ✅ Pago
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transactionItem.description || 'Bônus por indicação de novo usuário'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        📅 {formatDate(transactionItem.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">
                        + {formatBrazilianCurrency(transactionItem.amount)}
                      </div>
                      <p className="text-xs text-gray-500">Bônus recebido</p>
                      <div className="mt-2">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        <span className="text-xs text-green-600 dark:text-green-400">Creditado</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Verificar se é uma transação de indicação (tipo referral_bonus)
            if ('type' in item && item.type === 'referral_bonus') {
              const referralItem = item as (ReferralEarning & { type: 'referral_bonus'; description: string; balance_type: 'wallet' });
              return (
                <div key={referralItem.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          👥
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            Bônus de Indicação
                          </h5>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              ✅ Pago
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {referralItem.description || 'Bônus por indicação de novo usuário'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        📅 {formatDate(referralItem.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">
                        + {formatBrazilianCurrency(referralItem.amount)}
                      </div>
                      <p className="text-xs text-gray-500">Bônus recebido</p>
                      <div className="mt-2">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        <span className="text-xs text-green-600 dark:text-green-400">Creditado</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Verificar se é uma consulta realizada
            if ('type' in item && item.type === 'consultation') {
              const consultationItem = item as any;
              return (
                <ConsultationCard
                  key={consultationItem.id}
                  consultation={consultationItem}
                  formatBrazilianCurrency={formatBrazilianCurrency}
                  formatDate={formatDate}
                />
              );
            }

            // Transação normal - verificar se tem os campos obrigatórios
            if ('user_id' in item && 'amount' in item && 'description' in item) {
              const normalTransaction = item as Transaction;
              
              // Filtrar consultas - elas devem aparecer apenas via ConsultationCard
              if (normalTransaction.type === 'consultation' || 
                  normalTransaction.description?.toLowerCase().includes('consulta')) {
                return null;
              }
              
              // Verificar se é uma recarga para usar o componente visual específico
              if (normalTransaction.type === 'recarga' || normalTransaction.type === 'recharge') {
                return (
                  <RechargeCard
                    key={normalTransaction.id}
                    transaction={normalTransaction}
                    formatBrazilianCurrency={formatBrazilianCurrency}
                    formatDate={formatDate}
                  />
                );
              }

              // Verificar se é transação de plano - também verificar pela descrição
              if (normalTransaction.type === 'plan_purchase' || 
                  normalTransaction.type === 'plan_activation' ||
                  normalTransaction.description.includes('Compra do plano') ||
                  normalTransaction.description.includes('Ativação do plano')) {
                
                // Determinar o tipo correto baseado na descrição se necessário
                let planType: 'plan_purchase' | 'plan_activation' = 'plan_purchase';
                if (normalTransaction.type === 'plan_activation' || normalTransaction.description.includes('Ativação')) {
                  planType = 'plan_activation';
                }
                
                return (
                  <PlanTransactionCard
                    key={normalTransaction.id}
                    transaction={{
                      ...normalTransaction,
                      type: planType,
                      payment_method: normalTransaction.payment_method,
                      coupon_applied: normalTransaction.description?.includes('Cupom') 
                        ? normalTransaction.description.match(/Cupom:\s*([A-Z0-9]+)/)?.[1] 
                        : undefined,
                      original_amount: normalTransaction.description?.includes('Cupom') 
                        ? normalTransaction.amount * 1.2 
                        : undefined
                    }}
                    formatBrazilianCurrency={formatBrazilianCurrency}
                    formatDate={formatDate}
                  />
                );
              }

              // Verificar se é transação da carteira (crédito/débito/bônus)
              if (['credit', 'debit', 'bonus'].includes(normalTransaction.type)) {
                return (
                  <WalletTransactionCard
                    key={normalTransaction.id}
                    transaction={{
                      ...normalTransaction,
                      type: normalTransaction.type as 'recharge' | 'debit' | 'credit' | 'bonus' | 'referral_bonus'
                    }}
                    formatBrazilianCurrency={formatBrazilianCurrency}
                    formatDate={formatDate}
                  />
                );
              }

              // Transação normal (fallback)
              return (
                <TransactionItem
                  key={normalTransaction.id}
                  item={normalTransaction as any}
                  formatBrazilianCurrency={formatBrazilianCurrency}
                  formatDate={formatDate}
                  isReferral={false}
                />
              );
            }
            
            // Fallback para itens que não se enquadram em nenhuma categoria
            return null;
          })
        ) : (
          <EmptyState 
            title="Nenhum histórico encontrado"
            subtitle="Suas transações e ganhos aparecerão aqui"
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default AllHistorySection;