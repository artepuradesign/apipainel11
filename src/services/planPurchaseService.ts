// Serviço para compra de planos via API
import { API_BASE_URL } from '@/config/apiConfig';
import { cookieUtils } from '@/utils/cookieUtils';
import { planWalletService } from './planWalletService';
import { showPlanPurchaseToast } from '@/components/toasts/PlanPurchaseToast';

export interface PlanPurchaseData {
  plan_id: number;
  payment_method: string;
  amount: number;
  description?: string;
}

export interface PlanPurchaseResponse {
  success: boolean;
  message?: string;
  data?: {
    transaction_id: string;
    user_plan_id: number;
    new_balance: {
      saldo: number;
      saldo_plano: number;
      total: number;
    };
    plan_details: {
      name: string;
      start_date: string;
      end_date: string;
      status: string;
    };
  };
  error?: string;
}

class PlanPurchaseService {
  private baseUrl = API_BASE_URL;

  async purchasePlan(planData: PlanPurchaseData): Promise<PlanPurchaseResponse> {
    try {
      console.log('🔄 [PLAN_PURCHASE] Iniciando compra do plano usando sistema similar ao addBalance:', planData);

      // Usar o novo serviço que segue a mesma lógica do sistema de adicionar saldo
      const result = await planWalletService.purchasePlan(
        planData.plan_id,
        planData.payment_method,
        planData.amount,
        planData.description || `Compra do plano ${planData.plan_id}`
      );

      if (!result.success) {
        throw new Error(result.error || 'Erro ao processar compra do plano');
      }

      console.log('✅ [PLAN_PURCHASE] Plano comprado com sucesso:', result.data);

      // Disparar eventos SINCRONIZADOS específicos para compra de planos
      const eventDetails = {
        planId: planData.plan_id,
        amount: planData.amount,
        method: planData.payment_method,
        planName: planData.description || `Plano ${planData.plan_id}`,
        timestamp: Date.now()
      };

      // 1. Evento ESPECÍFICO para compra de planos (atualiza apenas valores de planos)
      window.dispatchEvent(new CustomEvent('planPurchaseUpdated', {
        detail: { 
          shouldAnimate: true, 
          amount: planData.amount,
          planId: planData.plan_id,
          planName: eventDetails.planName,
          method: planData.payment_method
        }
      }));

      // 2. Evento para dashboard admin (valores + notificações)
      window.dispatchEvent(new CustomEvent('planPurchaseCompleted', {
        detail: eventDetails
      }));

      // 3. Evento para forçar refresh de notificações 
      window.dispatchEvent(new CustomEvent('notificationsUpdated', {
        detail: { 
          reason: 'plan_purchase_instant',
          immediate: true 
        }
      }));

      console.log('🎯 [PLAN_PURCHASE] Eventos sincronizados disparados:', eventDetails);

      // Exibir toast consolidado único para o usuário
      const planDetails = {
        planName: planData.description?.replace(/^Compra do plano\s*/i, '') || `Plano ${planData.plan_id}`,
        amount: planData.amount,
        method: planData.payment_method,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      showPlanPurchaseToast(planDetails);

      // Retornar dados formatados conforme interface esperada
      return {
        success: true,
        message: 'Plano adquirido com sucesso',
        data: {
          transaction_id: result.data?.id?.toString() || '',
          user_plan_id: planData.plan_id,
          new_balance: {
            saldo: result.data?.new_saldo || 0,
            saldo_plano: result.data?.new_saldo_plano || 0,
            total: (result.data?.new_saldo || 0) + (result.data?.new_saldo_plano || 0)
          },
          plan_details: {
            name: planData.description || `Plano ${planData.plan_id}`,
            start_date: planDetails.startDate,
            end_date: planDetails.endDate,
            status: 'active'
          }
        }
      };
    } catch (error) {
      console.error('❌ [PLAN_PURCHASE] Erro ao comprar plano:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getUserActivePlan(): Promise<any> {
    try {
      return await planWalletService.getUserActivePlan();
    } catch (error) {
      console.error('❌ [PLAN_PURCHASE] Erro ao buscar plano ativo:', error);
      throw error;
    }
  }

  async getPlanUsageStats(): Promise<any> {
    try {
      return await planWalletService.getPlanUsageStats();
    } catch (error) {
      console.error('❌ [PLAN_PURCHASE] Erro ao buscar estatísticas do plano:', error);
      throw error;
    }
  }
}

export const planPurchaseService = new PlanPurchaseService();