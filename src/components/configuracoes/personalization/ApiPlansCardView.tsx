import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Power, PowerOff, CreditCard, Eye } from 'lucide-react';
import { Plan } from '@/utils/apiService';

interface ApiPlansCardViewProps {
  plans: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: (planId: number) => void;
  onToggleStatus: (planId: number) => void;
}

const ApiPlansCardView: React.FC<ApiPlansCardViewProps> = ({
  plans,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const navigate = useNavigate();
  if (plans.length === 0) {
    return (
      <div className="bg-white/75 dark:bg-gray-800/75 rounded-lg border border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm p-8">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum plano encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Comece criando seu primeiro plano para o sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/75 dark:bg-gray-800/75 rounded-lg border border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>
                Planos Disponíveis
              </CardTitle>
              <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                {plans.length}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Planos configurados para comercialização
            </p>
          </div>
        </div>
      </CardHeader>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 pt-0">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className="bg-white dark:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600"
          >
            <CardContent className="p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {plan.name}
                </h3>
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant={plan.is_active ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                  {plan.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
                {plan.discountPercentage > 0 && (
                  <Badge variant="outline" className="text-green-600 text-[10px] px-1.5 py-0">
                    {plan.discountPercentage}% OFF
                  </Badge>
                )}
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  R$ {plan.price}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  /{plan.duration_days}d
                </span>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {plan.description}
              </p>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/personalizacao/plano/${plan.id}`); }}
                    title="Ver assinantes"
                    className="flex-1 p-1 h-7"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onToggleStatus(plan.id); }}
                    title={plan.is_active ? 'Desativar' : 'Ativar'}
                    className="flex-1 p-1 h-7"
                  >
                    {plan.is_active ? 
                      <PowerOff className="h-3 w-3" /> : 
                      <Power className="h-3 w-3" />
                    }
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onEdit(plan); }}
                    title="Editar plano"
                    className="flex-1 p-1 h-7"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onDelete(plan.id); }}
                    className="text-red-600 hover:text-red-700 flex-1 p-1 h-7"
                    title="Excluir plano"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApiPlansCardView;
