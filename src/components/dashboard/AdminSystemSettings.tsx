
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { systemConfigService } from '@/services/systemConfigService';

interface AdminSystemSettingsProps {
  onRefreshData: () => void;
}

const AdminSystemSettings: React.FC<AdminSystemSettingsProps> = ({ onRefreshData }) => {
  const [bonusAmount, setBonusAmount] = useState(0);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await systemConfigService.getReferralConfig();
        setBonusAmount(config.referral_bonus_amount);
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      }
    };
    loadConfig();
  }, []);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div>
            <p className="font-medium text-sm">Bônus de Indicação</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Valor pago por indicação válida</p>
          </div>
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            R$ {bonusAmount.toFixed(2)}
          </Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div>
            <p className="font-medium text-sm">Comissão de Rede</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Percentual sobre recargas dos indicados</p>
          </div>
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            5%
          </Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div>
            <p className="font-medium text-sm">Saque Mínimo PIX</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Valor mínimo para saque</p>
          </div>
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            R$ 100,00
          </Badge>
        </div>
        
        <div className="pt-4 border-t">
          <Button 
            onClick={onRefreshData}
            className="w-full"
            variant="outline"
          >
            Atualizar Dados do Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSystemSettings;
