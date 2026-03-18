
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from 'lucide-react';
import { useBonusConfig } from '@/services/bonusConfigService';

interface ReferralInfoProps {
  referralId: string;
  isVisible: boolean;
  expirationDate?: string;
}

const ReferralInfo: React.FC<ReferralInfoProps> = ({ referralId, isVisible, expirationDate }) => {
  const { bonusAmount: welcomeBonus } = useBonusConfig();

  if (!isVisible) return null;
  
  // Mock referral data - in a real app, this would come from an API call or database
  const mockReferralInfo = {
    "250325001": {
      name: "João Silva",
      validatedReferrals: 24
    },
    "250325002": {
      name: "Maria Souza", 
      validatedReferrals: 16
    },
    "default": {
      name: "Sistema APIPanel",
      validatedReferrals: 125
    }
  };
  
  // Get referral info based on ID or use default if not found
  const referralInfo = mockReferralInfo[referralId as keyof typeof mockReferralInfo] || mockReferralInfo.default;
  
  // Calculate days remaining if expiration date exists
  const daysRemaining = expirationDate ? Math.ceil((new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  return (
    <Card className="border-brand-purple/30 dark:border-brand-purple/50 border-2 mt-4 bg-gradient-to-br from-brand-lightPurple/50 to-white/80 dark:from-brand-purple/10 dark:to-gray-800/90 backdrop-blur-sm w-full shadow-lg">
      <CardContent className="pt-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-brand-purple dark:text-brand-purple">{referralInfo.name}</h3>
            {referralId === '5' && (
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600">
                Sistema
              </Badge>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">ID: {referralId}</p>
          <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-brand-purple dark:text-brand-purple">{referralInfo.validatedReferrals}</span> indicações validadas
          </p>
          
          {daysRemaining !== null && referralId !== '5' && (
            <div className="flex items-center gap-1 mt-2">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                {daysRemaining > 0 ? `Válido por ${daysRemaining} dias` : 'Código expirado'}
              </span>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-2 rounded-lg mt-3 border border-green-200/50 dark:border-green-700/30">
            <p className="text-xs text-green-700 dark:text-green-300 font-medium">
              🎁 Bônus de {formatCurrency(welcomeBonus)} será creditado após completar seu cadastro!
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              O indicador também recebe o mesmo valor!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralInfo;
