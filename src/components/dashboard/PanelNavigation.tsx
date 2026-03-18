
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleRecords } from '@/hooks/useModuleRecords';

interface PanelNavigationProps {
  calculateTotalAvailableBalance: () => number;
  painelId?: string;
}

const PanelNavigation = ({ calculateTotalAvailableBalance, painelId }: PanelNavigationProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasRecordsInModule } = useModuleRecords();

  const checkBalanceAndNavigate = (path: string, moduleName: string, modulePrice: string) => {
    if (!user) return;

    const price = parseFloat(modulePrice);
    const totalAvailableBalance = calculateTotalAvailableBalance();
    const userHasRecords = hasRecordsInModule(path);
    
    console.log('PanelNavigation - Verificando saldo para navegação:', {
      moduleName,
      price,
      totalAvailableBalance,
      painelId,
      userHasRecords
    });
    
    if (totalAvailableBalance < price && !userHasRecords) {
      const remaining = Math.max(price - totalAvailableBalance, 0.01);
      toast.error(
        `Saldo insuficiente para ${moduleName}! Valor necessário: R$ ${price.toFixed(2)}`,
        {
          action: {
            label: "💰 Depositar",
            onClick: () => navigate(`/dashboard/adicionar-saldo?valor=${remaining.toFixed(2)}&fromModule=true`)
          }
        }
      );
      return;
    }

    if (totalAvailableBalance < price && userHasRecords) {
      toast.info(
        `Você pode visualizar seu histórico em ${moduleName}, mas precisa de saldo para novas consultas.`,
        { duration: 4000 }
      );
    }

    navigate(path);
  };

  return { checkBalanceAndNavigate };
};

export default PanelNavigation;
