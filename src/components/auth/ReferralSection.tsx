
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Gift } from "lucide-react";
import ReferralInfo from '@/components/ReferralInfo';

interface ReferralSectionProps {
  referralId: string;
  setReferralId: (id: string) => void;
  onVerifyReferralId: () => void;
  isReferralInfoVisible: boolean;
  verifiedReferralId: string;
  referralValidation: any;
}

const ReferralSection: React.FC<ReferralSectionProps> = ({
  referralId,
  setReferralId,
  onVerifyReferralId,
  isReferralInfoVisible,
  verifiedReferralId,
  referralValidation
}) => {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="referralId" className="text-sm font-medium">ID de Indicação (Opcional)</Label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Gift className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="referralId"
              placeholder="ID de quem te indicou"
              value={referralId}
              onChange={(e) => setReferralId(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Button 
            type="button" 
            onClick={onVerifyReferralId}
            variant="outline"
            size="sm"
            className="whitespace-nowrap h-10 px-4 text-sm"
          >
            Confirmar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Opcional - Deixe vazio se não foi indicado
        </p>
      </div>
      
      {referralValidation?.isExpired && (
        <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs text-amber-700 dark:text-amber-300">
            Código expirado (validade: 7 dias)
          </span>
        </div>
      )}
      
      <ReferralInfo 
        referralId={verifiedReferralId} 
        isVisible={isReferralInfoVisible}
        expirationDate={referralValidation?.expirationDate}
      />
    </div>
  );
};

export default ReferralSection;
