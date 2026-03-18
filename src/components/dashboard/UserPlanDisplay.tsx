
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserPlanDisplayProps {
  planName: string;
  className?: string;
}

const planData = {
  'Pré-Pago': {
    price: 'R$ 0,00/mês',
    discount: '0%',
    color: 'bg-gray-100 text-gray-800',
    status: 'Ativo'
  },
  'Valete de Copas': {
    price: 'R$ 49,90/mês',
    discount: '10%',
    color: 'bg-blue-100 text-blue-800',
    status: 'Ativo'
  },
  'Rainha de Copas': {
    price: 'R$ 149,90/mês',
    discount: '25%',
    color: 'bg-green-100 text-green-800',
    status: 'Ativo'
  },
  'Rei de Copas': {
    price: 'R$ 299,90/mês',
    discount: '40%',
    color: 'bg-purple-100 text-purple-800',
    status: 'Ativo'
  },
  'Valete de Ouros': {
    price: 'R$ 99,90/mês',
    discount: '15%',
    color: 'bg-yellow-100 text-yellow-800',
    status: 'Ativo'
  },
  'Rainha de Ouros': {
    price: 'R$ 199,90/mês',
    discount: '30%',
    color: 'bg-orange-100 text-orange-800',
    status: 'Ativo'
  },
  'Rei de Ouros': {
    price: 'R$ 399,90/mês',
    discount: '50%',
    color: 'bg-red-100 text-red-800',
    status: 'Ativo'
  },
  'Valete de Espadas': {
    price: 'R$ 199,90/mês',
    discount: '35%',
    color: 'bg-indigo-100 text-indigo-800',
    status: 'Ativo'
  },
  'Rainha de Espadas': {
    price: 'R$ 349,90/mês',
    discount: '45%',
    color: 'bg-pink-100 text-pink-800',
    status: 'Ativo'
  },
  'Rei de Espadas': {
    price: 'R$ 499,90/mês',
    discount: '60%',
    color: 'bg-gray-800 text-white',
    status: 'Ativo'
  }
};

const UserPlanDisplay: React.FC<UserPlanDisplayProps> = ({ planName, className = '' }) => {
  const { 
    hasActiveSubscription, 
    subscription, 
    planInfo, 
    discountPercentage, 
    isLoading 
  } = useUserSubscription();

  if (isLoading) {
    return (
      <div className={`space-y-4 animate-pulse ${className}`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  // Usar dados da assinatura ativa se disponível, senão usar planInfo ou fallback
  const currentPlan = subscription?.plan_name || planInfo?.name || planName;
  // Desconto deve refletir o campo discount_percentage configurado no plano (Personalização)
  const currentDiscount = discountPercentage || planInfo?.discount_percentage || 0;
  const isActive = hasActiveSubscription || (planInfo && planName !== 'Pré-Pago');
  
  // Dados de fallback para planos não encontrados
  const fallbackPlan = planData[planName as keyof typeof planData] || planData['Pré-Pago'];
  
  const getStatusBadge = () => {
    if (hasActiveSubscription && subscription) {
      switch (subscription.status) {
        case 'active':
          return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
        case 'cancelled':
          return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
        case 'expired':
          return <Badge className="bg-gray-100 text-gray-800">Expirado</Badge>;
        case 'suspended':
          return <Badge className="bg-yellow-100 text-yellow-800">Suspenso</Badge>;
        default:
          return <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>;
      }
    }
    
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
    }
    
    return <Badge className="bg-gray-100 text-gray-800">Pré-Pago</Badge>;
  };

  const getNextBillingDate = () => {
    if (hasActiveSubscription && subscription) {
      try {
        const endDate = new Date(subscription.ends_at);
        return formatDistanceToNow(endDate, { 
          addSuffix: true, 
          locale: ptBR 
        });
      } catch {
        return 'Data inválida';
      }
    }
    
    if (planName === 'Pré-Pago') {
      return 'Não se aplica';
    }
    
    return 'Não definido';
  };

  const getPlanPrice = () => {
    if (planInfo?.price) {
      const formatted = planInfo.price.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `${formatted}/mês`;
    }
    
    // Remove R$ do fallback
    return fallbackPlan.price.replace('R$ ', '');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{currentPlan}</h3>
          <p className="text-sm text-muted-foreground">{getPlanPrice()}</p>
        </div>
        {getStatusBadge()}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Desconto nas consultas</span>
          <span className="font-medium text-green-600">
            {currentDiscount > 0 ? `${currentDiscount}%` : '0%'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>
            {hasActiveSubscription ? 'Expira' : 'Próxima cobrança'}
          </span>
          <span className="font-medium">
            {getNextBillingDate()}
          </span>
        </div>
        {hasActiveSubscription && subscription?.auto_renew && (
          <div className="flex justify-between text-sm">
            <span>Renovação automática</span>
            <span className="font-medium text-blue-600">Ativada</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPlanDisplay;
