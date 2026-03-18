
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Gift } from 'lucide-react';
import { useBonusConfig } from '@/services/bonusConfigService';

interface AccountActivationAlertProps {
  indicadorId: string;
}

const AccountActivationAlert: React.FC<AccountActivationAlertProps> = ({ indicadorId }) => {
  const { bonusAmount: welcomeBonus } = useBonusConfig();
  const referralBonus = welcomeBonus;

  // Temporariamente mostrar até mesmo quando valor é 0 para debug
  // if (welcomeBonus <= 0) {
  //   return null;
  // }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-gray-800 dark:border-yellow-800">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <Gift className="h-5 w-5 text-green-600 flex-shrink-0" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
              Conta Pendente de Ativação - Bônus Aguardando!
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
              Complete seu cadastro preenchendo as informações de CPF, nome completo, e dados pessoais para ativar sua conta.
            </p>
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-2">
              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                🎁 Ao ativar sua conta, você receberá automaticamente {formatCurrency(welcomeBonus)} de bônus de boas-vindas!
              </p>
              {indicadorId && indicadorId !== '5' && referralBonus > 0 && (
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Você foi indicado pelo usuário {indicadorId} - ambos receberão {formatCurrency(referralBonus)} de bônus de indicação!
                </p>
              )}
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Basta completar o cadastro com as informações básicas.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountActivationAlert;
