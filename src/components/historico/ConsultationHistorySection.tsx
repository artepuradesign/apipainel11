import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw } from 'lucide-react';
import { formatDate } from '@/utils/historicoUtils';
import { consultasCpfHistoryService } from '@/services/consultasCpfHistoryService';
import { consultasCpfService } from '@/services/consultasCpfService';
import { consultationsService } from '@/services/consultationsService';
import { consultationApiService } from '@/services/consultationApiService';
import { useAuth } from '@/contexts/AuthContext';
import ConsultaHistoryItem from '@/components/consultas/ConsultaHistoryItem';

interface ConsultationHistorySectionProps {
  loading: boolean;
}

const ConsultationHistorySection: React.FC<ConsultationHistorySectionProps> = ({ loading: parentLoading }) => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [stats, setStats] = useState({
    today: 0,
    total: 0,
    completed: 0,
    total_cost: 0
  });

  // Mesmo método usado na página consultar-cpf
  const loadConsultationHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('📋 [CPF_HISTORY_DEBUG] Carregando histórico de consultas CPF...');
      const response = await consultasCpfHistoryService.getHistory(1, 50);
      
      console.log('📋 [CPF_HISTORY_DEBUG] Response completa:', response);
      
      if (response.success && response.data && Array.isArray(response.data.data) && response.data.data.length) {
        console.log('📋 [CPF_HISTORY_DEBUG] Dados brutos da API:', response.data.data);
        
      const formattedHistory = response.data.data.map((item: any, index: number) => {
        console.log(`📋 [CPF_HISTORY_DEBUG] Item ${index}:`, {
          id: item.id,
          cost: item.cost,
          saldo_usado_da_api: item.saldo_usado,
          source_table: item.source_table
        });
        
        const formatted = {
          date: item.created_at,
          document: item.document,
          price: Number(item.cost) || 0,
          original_price: item.source_table === 'consultas_cpf' && item.desconto_aplicado 
            ? Number(item.cost) + Number(item.desconto_aplicado) 
            : Number(item.metadata?.original_price) || Number(item.cost),
          discount: item.source_table === 'consultas_cpf' && item.desconto_aplicado
            ? Math.round((Number(item.desconto_aplicado) / (Number(item.cost) + Number(item.desconto_aplicado))) * 100)
            : Number(item.metadata?.discount) || 0,
          status: item.status || 'completed',
          success: (item.status || 'completed') === 'completed',
          saldo_usado: item.saldo_usado || 'carteira', // Usar direto da API
          source_table: item.source_table || 'consultations'
        };
        
        console.log(`📋 [CPF_HISTORY_DEBUG] Item ${index} formatado:`, {
          saldo_usado_final: formatted.saldo_usado,
          saldo_usado_api: item.saldo_usado,
          price: formatted.price
        });
        
        return formatted;
      });
        
        setConsultations(formattedHistory);
        setHasMoreData(formattedHistory.length >= 50);
        console.log('✅ [CPF_HISTORY_DEBUG] Histórico final formatado:', formattedHistory);
        
        // Calcular estatísticas
        const today = new Date().toDateString();
        const todayCount = formattedHistory.filter((c: any) => 
          new Date(c.date || '').toDateString() === today
        ).length;
        
        const completedCount = formattedHistory.filter((c: any) => 
          c.success
        ).length;
        
        const totalCost = formattedHistory.reduce((sum: number, c: any) => 
          sum + (c.price || 0), 0
        );
        
        setStats({
          today: todayCount,
          total: formattedHistory.length,
          completed: completedCount,
          total_cost: totalCost
        });
        return;
      }
      
      console.warn('⚠️ [CPF_HISTORY_DEBUG] Endpoint unificado indisponível. Aplicando fallback por serviços existentes...');
      const results = await Promise.allSettled([
        consultasCpfService.getByUserId(Number(user.id), 1, 50), // legado
        consultationsService.getByUserId(Number(user.id), 1, 50), // novo /consultas/user/{id}
        consultationApiService.getConsultationHistory(50, 0) // novo /consultas/history
      ]);

      const combined: any[] = [];

      // Legado consultas_cpf
      if (results[0].status === 'fulfilled' && results[0].value?.success && results[0].value.data) {
        try {
          const legacyItems = results[0].value.data.map((c: any) => {
            console.log('📋 [CPF_HISTORY_DEBUG] Legacy item saldo_usado:', c.saldo_usado);
            return {
              date: c.created_at || c.data || new Date().toISOString(),
              document: c.document || c.cpf_consultado,
              price: Number(c.cost || c.valor_cobrado || 0),
              original_price: c.desconto_aplicado 
                ? Number(c.cost || c.valor_cobrado || 0) + Number(c.desconto_aplicado)
                : Number(c.cost || c.valor_cobrado || 0),
              discount: c.desconto_aplicado 
                ? Math.round((Number(c.desconto_aplicado) / (Number(c.cost || c.valor_cobrado || 0) + Number(c.desconto_aplicado))) * 100)
                : 0,
              status: c.status || 'completed',
              success: (c.status || 'completed') === 'completed',
              saldo_usado: c.saldo_usado || 'carteira', // Usar direto da API
              source_table: 'consultas_cpf'
            };
          });
          combined.push(...legacyItems);
          console.log('✅ [CPF_HISTORY_DEBUG] Dados legacy carregados:', legacyItems.length, legacyItems);
        } catch (e) {
          console.warn('⚠️ Erro processando dados legacy:', e);
        }
      }

      // Novo consultations
      if (results[1].status === 'fulfilled' && results[1].value?.success && results[1].value.data?.data) {
        try {
          const newItems = results[1].value.data.data.map((c: any) => ({
            date: c.created_at || new Date().toISOString(),
            document: c.document,
            price: Number(c.cost || 0),
            original_price: Number(c.metadata?.original_price || c.cost || 0),
            discount: Number(c.metadata?.discount || 0),
            status: c.status || 'completed',
            success: (c.status || 'completed') === 'completed',
            saldo_usado: c.metadata?.saldo_usado || 'carteira',
            source_table: 'consultations'
          }));
          combined.push(...newItems);
          console.log('✅ Dados new consultations carregados:', newItems.length);
        } catch (e) {
          console.warn('⚠️ Erro processando dados new consultations:', e);
        }
      }

      // API History
      if (results[2].status === 'fulfilled' && results[2].value?.success && results[2].value.data) {
        try {
          const historyItems = results[2].value.data.map((c: any) => ({
            date: c.created_at || new Date().toISOString(),
            document: c.document,
            price: Number(c.cost || 0),
            original_price: Number(c.cost || 0),
            discount: 0,
            status: c.status || 'completed',
            success: (c.status || 'completed') === 'completed',
            saldo_usado: 'carteira',
            source_table: 'api_history'
          }));
          combined.push(...historyItems);
          console.log('✅ Dados history API carregados:', historyItems.length);
        } catch (e) {
          console.warn('⚠️ Erro processando dados history API:', e);
        }
      }

      // Remover duplicatas e ordenar
      const uniqueItems = combined.filter((item, index, self) =>
        index === self.findIndex(t => t.document === item.document && t.date === item.date)
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setConsultations(uniqueItems);
      setHasMoreData(uniqueItems.length >= 50);
      
      // Calcular estatísticas
      const today = new Date().toDateString();
      const todayCount = uniqueItems.filter((c: any) => 
        new Date(c.date || '').toDateString() === today
      ).length;
      
      const completedCount = uniqueItems.filter((c: any) => 
        c.success
      ).length;
      
      const totalCost = uniqueItems.reduce((sum: number, c: any) => 
        sum + (c.price || 0), 0
      );
      
      setStats({
        today: todayCount,
        total: uniqueItems.length,
        completed: completedCount,
        total_cost: totalCost
      });

      console.log('✅ Histórico final carregado:', uniqueItems.length, 'registros únicos');
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 10);
  };

  useEffect(() => {
    loadConsultationHistory();
  }, [user]);

  const isLoadingAny = loading || parentLoading;

  return (
    <div className="space-y-6">
      {/* Histórico de Consultas */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Histórico de Consultas CPF
              </CardTitle>
              <CardDescription>
                Últimas consultas realizadas
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {consultations.length} Total
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadConsultationHistory}
                disabled={isLoadingAny}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingAny ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAny ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Carregando consultas...</p>
            </div>
          ) : consultations.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                {consultations.slice(0, displayLimit).map((query, index) => (
                  <ConsultaHistoryItem
                    key={`${query.document}-${query.date}-${index}`}
                    document={query.document}
                    date={query.date || ''}
                    price={query.price}
                    original_price={query.original_price}
                    discount_percent={query.discount}
                    saldo_usado={query.saldo_usado}
                    status={query.success ? 'completed' : 'failed'}
                  />
                ))}
              </div>
              
              {consultations.length > displayLimit && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    Ver mais consultas ({consultations.length - displayLimit} restantes)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma consulta realizada ainda
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Realize uma consulta para ver o histórico aqui
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-primary">
                {isLoadingAny ? '...' : stats.today}
              </h3>
              <p className="text-sm text-muted-foreground">Consultas Hoje</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-primary">
                {isLoadingAny ? '...' : stats.total}
              </h3>
              <p className="text-sm text-muted-foreground">Total de Consultas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-green-600">
                {isLoadingAny ? '...' : stats.completed}
              </h3>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-primary">
                R$ {isLoadingAny ? '0,00' : stats.total_cost.toFixed(2)}
              </h3>
              <p className="text-sm text-muted-foreground">Total Gasto</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsultationHistorySection;