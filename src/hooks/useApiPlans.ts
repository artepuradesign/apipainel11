import { useState, useEffect } from 'react';
import { planService, type Plan } from '@/utils/apiService';
import { toast } from 'sonner';

export const useApiPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 [PLANS] Iniciando carregamento de planos...');
      
      // Usar /plans/active (mesmo endpoint da página pública que funciona)
      const response = await planService.getActive();
      
      console.log('📊 [PLANS] Resposta da API:', response);
      
      if (response.success && response.data) {
        setPlans(response.data);
        console.log('✅ [PLANS] Planos carregados:', response.data.length, 'planos');
        toast.success(`${response.data.length} planos carregados com sucesso!`);
      } else {
        console.error('❌ [PLANS] Erro na resposta:', response.error);
        toast.error(response.error || 'Erro ao carregar planos');
        setPlans([]);
      }
    } catch (error) {
      console.error('❌ [PLANS] Erro ao conectar com a API:', error);
      toast.error('Erro de conexão com a API de planos');
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlanStatus = async (id: number) => {
    try {
      console.log('🔄 [PLANS] Alternando status do plano:', id);
      
      const response = await planService.update(id, { is_active: !plans.find(p => p.id === id)?.is_active });
      
      if (response.success) {
        toast.success('Status do plano atualizado com sucesso!');
        await loadPlans();
      } else {
        console.error('❌ [PLANS] Erro ao atualizar status:', response.error);
        toast.error(response.error || 'Erro ao atualizar status do plano');
        throw new Error(response.error || 'Erro ao atualizar status do plano');
      }
    } catch (error) {
      console.error('❌ [PLANS] Erro ao atualizar status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      throw error;
    }
  };

  const createPlan = async (planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🔄 [PLANS] Criando plano:', planData);
      
      const response = await planService.create(planData);
      
      if (response.success) {
        toast.success('Plano criado com sucesso!');
        await loadPlans();
        return response.data;
      } else {
        console.error('❌ [PLANS] Erro ao criar:', response.error);
        toast.error(response.error || 'Erro ao criar plano');
        throw new Error(response.error || 'Erro ao criar plano');
      }
    } catch (error) {
      console.error('❌ [PLANS] Erro ao criar plano:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updatePlan = async (id: number, planData: Partial<Plan>) => {
    try {
      console.log('🔄 [PLANS] Atualizando plano:', id, planData);
      
      const response = await planService.update(id, planData);
      
      if (response.success) {
        toast.success('Plano atualizado com sucesso!');
        await loadPlans();
      } else {
        console.error('❌ [PLANS] Erro ao atualizar:', response.error);
        toast.error(response.error || 'Erro ao atualizar plano');
        throw new Error(response.error || 'Erro ao atualizar plano');
      }
    } catch (error) {
      console.error('❌ [PLANS] Erro ao atualizar plano:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      throw error;
    }
  };

  const deletePlan = async (id: number) => {
    try {
      console.log('🔄 [PLANS] Excluindo plano:', id);
      
      const response = await planService.delete(id);
      
      if (response.success) {
        toast.success('Plano excluído com sucesso!');
        await loadPlans();
      } else {
        console.error('❌ [PLANS] Erro ao excluir:', response.error);
        
        // Verificar se a resposta contém dados de assinantes
        const responseData = (response as any).data;
        const responseCode = (response as any).code;
        
        if (responseCode === 'PLAN_HAS_SUBSCRIBERS' && responseData?.subscribers) {
          toast.error(`O plano possui ${responseData.subscribers_count} assinatura(s) vinculada(s)`);
          const error: any = new Error(response.error || 'Plano possui assinantes');
          error.code = 'PLAN_HAS_SUBSCRIBERS';
          error.data = responseData;
          throw error;
        } else {
          toast.error(response.error || 'Erro ao excluir plano');
          throw new Error(response.error || 'Erro ao excluir plano');
        }
      }
    } catch (error) {
      console.error('❌ [PLANS] Erro ao excluir plano:', error);
      if (!(error instanceof Error) || !(error as any).code) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  useEffect(() => {
    console.log('🚀 [PLANS] Hook inicializado, carregando planos...');
    loadPlans();
  }, []);

  return {
    plans,
    isLoading,
    loadPlans,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus
  };
};
