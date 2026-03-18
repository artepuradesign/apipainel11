import { walletApiService } from '@/services/walletApiService';
import { consultasCpfHistoryService } from '@/services/consultasCpfHistoryService';

export interface UnifiedHistoryItem {
  id: string;
  type: 'transaction' | 'consultation';
  amount: number;
  description: string;
  created_at: string;
  status: 'completed' | 'failed' | 'processing' | 'cancelled';
  category: string;
  balance_type?: 'wallet' | 'plan';
  payment_method?: string;
  document?: string;
  source_table?: string;
}

export const unifiedHistoryService = {
  /**
   * Buscar histórico unificado de transações e consultas
   */
  async getUnifiedHistory(userId: number, limit: number = 100): Promise<{
    success: boolean;
    data?: UnifiedHistoryItem[];
    error?: string;
  }> {
    try {
      console.log('🔄 [UNIFIED_HISTORY] Carregando histórico unificado...');
      
      const results = await Promise.allSettled([
        // Carregar transações da carteira
        walletApiService.getTransactionHistory(userId, limit),
        // Carregar consultas CPF
        consultasCpfHistoryService.getHistory(1, limit)
      ]);

      const unifiedItems: UnifiedHistoryItem[] = [];

      // Processar transações da carteira
      if (results[0].status === 'fulfilled' && results[0].value.success && results[0].value.data) {
        const transactions = results[0].value.data.map((t: any) => ({
          id: `transaction_${t.id}` || `transaction_${Date.now()}_${Math.random()}`,
          type: 'transaction' as const,
          amount: parseFloat(t.amount) || 0,
          description: t.description || 'Transação',
          created_at: t.created_at || new Date().toISOString(),
          status: (t.status || 'completed') as 'completed' | 'failed' | 'processing' | 'cancelled',
          category: t.type || 'other',
          balance_type: (t.wallet_type === 'plan' ? 'plan' : 'wallet') as 'wallet' | 'plan',
          payment_method: t.payment_method || ''
        }));
        
        unifiedItems.push(...transactions);
        console.log('✅ [UNIFIED_HISTORY] Transações carregadas:', transactions.length);
      } else {
        console.warn('⚠️ [UNIFIED_HISTORY] Erro ao carregar transações:', 
          results[0].status === 'fulfilled' ? results[0].value.error : results[0].reason);
      }

      // Processar consultas CPF
      if (results[1].status === 'fulfilled' && results[1].value.success && results[1].value.data) {
        const consultations = results[1].value.data.data.map((c: any) => ({
          id: `consultation_${c.source_table}_${c.id}`,
          type: 'consultation' as const,
          amount: -parseFloat(c.cost), // Negativo porque é gasto
          description: `Consulta CPF ${c.document}`,
          created_at: c.created_at,
          status: c.status as 'completed' | 'failed' | 'processing' | 'cancelled',
          category: 'consultation',
          balance_type: (c.saldo_usado === 'plano' ? 'plan' : 'wallet') as 'wallet' | 'plan',
          document: c.document,
          source_table: c.source_table
        }));
        
        unifiedItems.push(...consultations);
        console.log('✅ [UNIFIED_HISTORY] Consultas CPF carregadas:', consultations.length);
      } else {
        console.warn('⚠️ [UNIFIED_HISTORY] Erro ao carregar consultas:', 
          results[1].status === 'fulfilled' ? results[1].value.error : results[1].reason);
      }

      // Ordenar por data (mais recentes primeiro)
      unifiedItems.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log('✅ [UNIFIED_HISTORY] Histórico unificado carregado:', unifiedItems.length, 'itens');

      return {
        success: true,
        data: unifiedItems.slice(0, limit) // Limitar resultado
      };

    } catch (error) {
      console.error('❌ [UNIFIED_HISTORY] Erro ao carregar histórico unificado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
};