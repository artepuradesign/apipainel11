
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Plus, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { useApiPlans } from '@/hooks/useApiPlans';
import EmptyState from '@/components/ui/empty-state';
import ApiPlanForm from './ApiPlanForm';
import ApiPlansCardView from './ApiPlansCardView';
import PlanSubscribersModal from './PlanSubscribersModal';
import { toast } from 'sonner';
import { apiRequest } from '@/config/api';

const ApiPlanManagement = () => {
  const { plans, isLoading, createPlan, updatePlan, deletePlan, loadPlans, togglePlanStatus } = useApiPlans();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [subscribersModal, setSubscribersModal] = useState<{
    open: boolean;
    planName: string;
    planId: number;
    subscribers: any[];
  }>({ open: false, planName: '', planId: 0, subscribers: [] });

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setShowForm(true);
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowForm(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await togglePlanStatus(id);
    } catch (error) {
      console.error('Erro ao alterar status do plano:', error);
    }
  };

  const handleFormSubmit = async (planData: any) => {
    try {
      if (selectedPlan) {
        await updatePlan(selectedPlan.id, planData);
      } else {
        await createPlan(planData);
      }
      setShowForm(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedPlan(null);
  };

  const handleDeletePlan = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await deletePlan(id);
      } catch (error: any) {
        if (error?.code === 'PLAN_HAS_SUBSCRIBERS' && error?.data?.subscribers) {
          setSubscribersModal({
            open: true,
            planName: error.data.plan_name || 'Plano',
            planId: error.data.plan_id || id,
            subscribers: error.data.subscribers,
          });
        }
        console.error('Erro ao excluir plano:', error);
      }
    }
  };

  const handleMigrateAndDelete = async (planId: number, targetPlanId: number | string) => {
    try {
      const targetValue = targetPlanId === 'prepago' ? 'prepago' : targetPlanId;
      
      // Migrar assinantes
      const migrateResponse = await apiRequest<any>(`/plans/${planId}/migrate`, {
        method: 'POST',
        body: JSON.stringify({ target_plan_id: targetValue }),
      });

      if (migrateResponse && migrateResponse.success !== false) {
        toast.success(`${migrateResponse.data?.migrated_count || 0} usuário(s) migrado(s) com sucesso!`);
        
        // Agora excluir o plano
        try {
          await deletePlan(planId);
          toast.success('Plano excluído com sucesso!');
        } catch (deleteError) {
          // Recarregar planos mesmo se der erro
          await loadPlans();
          toast.info('Usuários migrados. Tente excluir o plano novamente.');
        }
      } else {
        toast.error(migrateResponse?.error || 'Erro ao migrar assinantes');
      }
    } catch (error) {
      console.error('Erro ao migrar e excluir:', error);
      toast.error('Erro ao migrar assinantes');
      throw error;
    }
  };

  if (showForm) {
    return (
      <ApiPlanForm
        plan={selectedPlan}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gerenciamento de Planos (API)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure planos do sistema via API externa
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadPlans}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={handleCreatePlan}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando planos...</span>
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="py-12">
            <EmptyState 
              icon={AlertCircle}
              title="Nenhum plano encontrado"
              description="Comece criando seu primeiro plano para que os usuários possam assinar."
            />
            <div className="flex justify-center mt-6">
              <Button onClick={handleCreatePlan} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Plano
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ApiPlansCardView
          plans={plans}
          onEdit={handleEditPlan}
          onDelete={handleDeletePlan}
          onToggleStatus={handleToggleStatus}
        />
      )}

      <PlanSubscribersModal
        open={subscribersModal.open}
        onClose={() => setSubscribersModal({ open: false, planName: '', planId: 0, subscribers: [] })}
        planName={subscribersModal.planName}
        planId={subscribersModal.planId}
        subscribers={subscribersModal.subscribers}
        availablePlans={plans.map(p => ({ id: p.id, name: p.name }))}
        onMigrateAndDelete={handleMigrateAndDelete}
      />
    </div>
  );
};

export default ApiPlanManagement;
