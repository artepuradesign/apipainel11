
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Crown, Loader2 } from 'lucide-react';
import { Plan } from '@/utils/apiService';

interface ApiPlansListProps {
  plans: Plan[];
  isLoading: boolean;
  onEdit: (plan: Plan) => void;
  onDelete: (planId: number) => void;
}

const ApiPlansList: React.FC<ApiPlansListProps> = ({ plans, isLoading, onEdit, onDelete }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando planos...</span>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum plano encontrado
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <div key={plan.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded">
              <Crown className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {plan.name}
                </span>
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
                {plan.is_popular && (
                  <Badge variant="outline" className="text-yellow-600">
                    Popular
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {plan.description}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {plan.priceFormatted} • /{plan.slug} • {plan.category}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(plan)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(plan.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApiPlansList;
