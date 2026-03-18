import React from 'react';
import { CheckCircle, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface PlanPurchaseDetails {
  planName: string;
  amount: number;
  method: string;
  startDate: string;
  endDate: string;
}

export const showPlanPurchaseToast = (details: PlanPurchaseDetails) => {
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(details.amount);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const methodNames: Record<string, string> = {
    'pix': 'PIX',
    'credit': 'Cartão de Crédito',
    'paypal': 'PayPal',
    'wallet': 'Saldo da Carteira',
    'bank_transfer': 'Transferência Bancária'
  };

  const methodName = methodNames[details.method] || details.method;

  toast.success(
     <div className="flex items-center gap-2 max-w-xs">
       <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
       <div className="flex-1 min-w-0">
         <div className="font-semibold text-foreground text-sm mb-1">
           Plano Ativado com Sucesso!
         </div>
         <div className="text-xs text-muted-foreground mb-1">
           {details.planName}
         </div>
         <div className="text-xs font-medium text-foreground mb-1">
           {formattedAmount} ({methodName.toLowerCase()})
         </div>
         <div className="flex items-center gap-1 text-xs text-muted-foreground">
           <Calendar className="w-3 h-3" />
           <span>Até {formatDate(details.endDate)}</span>
         </div>
       </div>
     </div>,
    {
      duration: 6000
    }
  );
};