import { toast } from "@/hooks/use-toast";

interface PlanActivationToastOptions {
  planName: string;
  value?: number;
  paymentMethod?: string;
  originalPrice?: number;
  discount?: number;
}

export const showPlanActivationToast = ({
  planName,
  value,
  paymentMethod,
  originalPrice,
  discount
}: PlanActivationToastOptions) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);

  // Determinar título e descrição baseados no método de pagamento
  let title = "✅ Plano Ativado!";
  let description = `${planName} foi ativado com sucesso`;

  if (paymentMethod) {
    const methodName = paymentMethod === 'pix' ? 'PIX' : 
                      paymentMethod === 'credit' ? 'Cartão' : 
                      paymentMethod === 'transfer' ? 'Transferência' : 
                      paymentMethod === 'balance' || paymentMethod === 'Saldo da Carteira' ? 'Saldo' :
                      paymentMethod === 'Carteira Digital' ? 'Carteira' :
                      paymentMethod === 'Saldo do Plano' ? 'Plano' :
                      paymentMethod;
    
    description = `${planName} ativado via ${methodName}`;
  }

  // Adicionar valor se fornecido
  if (value) {
    description += ` • ${formatCurrency(value)}`;
  }

  // Adicionar informações de desconto se aplicável
  if (originalPrice && discount && discount > 0) {
    const discountPercent = Math.round((discount / originalPrice) * 100);
    description += ` (${discountPercent}% off)`;
  }

  toast({
    title,
    description,
    duration: 4000,
    className: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100"
  });
};

// Toast para pagamento com cupom
export const showPlanCouponToast = ({
  planName,
  value,
  originalPrice,
  discount
}: PlanActivationToastOptions) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);

  let description = `${planName} ativado com cupom`;
  
  if (value && originalPrice && discount) {
    description += ` • De ${formatCurrency(originalPrice)} por ${formatCurrency(value)}`;
  } else if (value) {
    description += ` • ${formatCurrency(value)}`;
  }

  toast({
    title: "🎉 Cupom Aplicado!",
    description,
    duration: 4000,
    className: "border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-100"
  });
};

// Toast para erro de pagamento
export const showPlanErrorToast = (message: string = "Erro ao ativar plano") => {
  toast({
    title: "❌ Erro no Pagamento",
    description: message,
    duration: 4000,
    className: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
  });
};

// Toast para saldo insuficiente
export const showInsufficientBalanceToast = () => {
  toast({
    title: "💰 Saldo Insuficiente",
    description: "Você não possui saldo suficiente para ativar este plano",
    duration: 4000,
    className: "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-100"
  });
};