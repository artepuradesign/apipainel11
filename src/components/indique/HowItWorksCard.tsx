
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReferralConfig } from '@/services/systemConfigService';
import { useIsMobile } from '@/hooks/use-mobile';

interface HowItWorksCardProps {
  config: ReferralConfig;
  referralCode: string;
}

const HowItWorksCard: React.FC<HowItWorksCardProps> = ({ config, referralCode }) => {
  const isMobile = useIsMobile();

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className={`text-gray-800 dark:text-gray-100 ${isMobile ? 'text-base' : 'text-lg'}`}>
          Sistema Simplificado - Como Funciona
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
          <div className={`flex items-start ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
            <div className={`${isMobile ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-sm'} bg-brand-purple rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-0.5`}>
              1
            </div>
            <div>
              <h4 className={`font-medium text-gray-800 dark:text-gray-100 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Compartilhe seu código
              </h4>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
                Envie seu código ID ({referralCode}) para amigos e conhecidos.
              </p>
            </div>
          </div>

          <div className={`flex items-start ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
            <div className={`${isMobile ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-sm'} bg-brand-purple rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-0.5`}>
              2
            </div>
            <div>
              <h4 className={`font-medium text-gray-800 dark:text-gray-100 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Primeiro Login = Bônus
              </h4>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
                No primeiro login do indicado: R$ {config.referral_bonus_amount.toFixed(2)} para você + R$ {config.referral_bonus_amount.toFixed(2)} para eles no <strong>saldo do plano</strong>.
              </p>
            </div>
          </div>

          <div className={`flex items-start ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
            <div className={`${isMobile ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-sm'} bg-brand-purple rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-0.5`}>
              3
            </div>
            <div>
              <h4 className={`font-medium text-gray-800 dark:text-gray-100 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Uso Imediato
              </h4>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
                O bônus vai direto para o <strong>saldo do plano</strong> e pode ser usado imediatamente para consultas.
              </p>
            </div>
          </div>

          <div className={`bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 ${isMobile ? 'p-3' : 'p-4'} rounded-lg`}>
            <h4 className={`font-medium text-gray-800 dark:text-gray-200 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
              💡 Novo Sistema Simplificado
            </h4>
            <ul className={`${isMobile ? 'text-xs space-y-0.5' : 'text-sm space-y-1'} text-gray-700 dark:text-gray-300`}>
              <li>• <strong>Bônus Único:</strong> R$ {config.referral_bonus_amount.toFixed(2)} no plano (uso imediato para consultas)</li>
              <li>• <strong>Ativação:</strong> Automática no primeiro login do indicado</li>
              <li>• <strong>Notificação:</strong> Ambos são notificados em tempo real</li>
              <li>• <strong>Limite:</strong> Sem limite de indicações</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HowItWorksCard;
