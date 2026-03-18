import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { makeDirectRequest } from '@/config/apiConfig';
import { externalReferralApiService } from '@/services/externalReferralApiService';
import { useBonusConfig } from '@/services/bonusConfigService';

import { toast } from 'sonner';

interface OptionalReferralSectionProps {
  referralId: string;
  setReferralId: (value: string) => void;
  onVerifyReferralId: (referrerId: number, referralCode: string) => void;
  isReferralInfoVisible: boolean;
  verifiedReferralId: string;
  referralValidation: any;
  autoExpand?: boolean;
  isProcessingUrl?: boolean;
}

const OptionalReferralSection = ({
  referralId,
  setReferralId,
  onVerifyReferralId,
  isReferralInfoVisible,
  verifiedReferralId,
  referralValidation,
  autoExpand = false,
  isProcessingUrl = false
}: OptionalReferralSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const { bonusAmount, isLoading: isBonusLoading } = useBonusConfig();

  // Auto expandir quando necessário
  useEffect(() => {
    if (autoExpand || referralId) {
      console.log('🔄 [REFERRAL_SECTION] Auto-expandindo seção:', { autoExpand, referralId });
      setIsExpanded(true);
    }
  }, [autoExpand, referralId]);

  // Auto validar quando recebe dados da URL
  useEffect(() => {
    if (referralValidation?.isValid && !hasVerified) {
      setHasVerified(true);
    }
  }, [referralValidation]);

  const validateReferralCode = async () => {
    if (!referralId.trim()) {
      toast('Por favor, digite um código de indicação');
      return;
    }

    if (hasVerified || referralValidation?.isValid) {
      console.log('🔄 [REFERRAL_SECTION] Código já validado');
      return;
    }

    // Não validar se estiver processando URL
    if (isProcessingUrl) {
      console.log('🔄 [REFERRAL_SECTION] Aguardando processamento da URL...');
      return;
    }

    setIsValidating(true);
    
    try {
      console.log('🔍 [REFERRAL_SECTION] Validando código manualmente:', referralId.trim());
      
      // Primeiro tentar a API externa
      const externalValidation = await externalReferralApiService.validateReferralCode(referralId.trim());
      
      if (externalValidation.valid) {
        console.log('✅ [REFERRAL_SECTION] Código válido na API externa:', externalValidation);
        
        const referrerName = externalValidation.referrer_name || 'Usuário Indicador';
        
        console.log('👤 [REFERRAL_SECTION] Nome do indicador extraído:', referrerName);
        
        setHasVerified(true);
        onVerifyReferralId(externalValidation.referrer_id!, referralId.trim());
        
        toast(`Ótimo! Código de ${referrerName} aplicado com sucesso!`);
        return;
      }
      
      // Fallback para API local se a externa falhar
      console.log('🔄 [REFERRAL_SECTION] Tentando API local como fallback...');
      
      const response = await makeDirectRequest('/auth/validate-referral', { 
        code: referralId.trim() 
      }, 'POST');
      
      console.log('📡 [REFERRAL_SECTION] Resposta completa da API local:', response);
      
      if (response.success && response.data) {
        console.log('✅ [REFERRAL_SECTION] Código válido na API local:', response.data);
        
        // Extrair o nome do indicador de forma mais robusta
        let referrerName = 'Usuário Indicador';
        if (response.data.referrer_name) {
          referrerName = response.data.referrer_name;
        } else if (response.data.referrerName) {
          referrerName = response.data.referrerName;
        } else if (response.data.full_name) {
          referrerName = response.data.full_name;
        } else if (response.data.name) {
          referrerName = response.data.name;
        }
        
        console.log('👤 [REFERRAL_SECTION] Nome do indicador extraído:', referrerName);
        
        setHasVerified(true);
        onVerifyReferralId(response.data.referrer_id, referralId.trim());
        
        toast(`Ótimo! Código de ${referrerName} aplicado com sucesso!`);
      } else {
        console.log('❌ [REFERRAL_SECTION] Código inválido - resposta completa:', response);
        
        toast(response.message || 'Código de indicação não encontrado');
        setHasVerified(false);
      }
    } catch (error) {
      console.error('❌ [REFERRAL_SECTION] Erro na validação - erro completo:', error);
      toast('Erro ao validar código. Tente novamente.');
      setHasVerified(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (value: string) => {
    console.log('📝 [REFERRAL_SECTION] Campo alterado:', value);
    setReferralId(value.toUpperCase());
    setHasVerified(false); // Reset verification when user changes the code
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const isCodeVerified = referralValidation?.isValid || hasVerified;

  if (!isExpanded) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Tem um código de indicação?
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {isBonusLoading ? 'Carregando...' : `Adicione o código e ganhe ${bonusAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de bônus`}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleExpanded}
            className="w-full md:w-auto whitespace-nowrap"
          >
            Adicionar Código
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
            💝 Código de Indicação (Opcional)
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ✕ Fechar
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="referral-code" className="text-sm font-medium">
              Digite o código de quem te indicou:
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="referral-code"
                type="text"
                value={referralId}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Ex: USER123"
                className="flex-1 uppercase"
                disabled={isValidating || isCodeVerified || isProcessingUrl}
              />
              <Button
                type="button"
                onClick={validateReferralCode}
                disabled={!referralId.trim() || isValidating || isCodeVerified || isProcessingUrl}
                variant={isCodeVerified ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap min-w-[80px]"
              >
                {isValidating 
                  ? '...' 
                  : isCodeVerified 
                    ? '✓ OK' 
                    : 'Validar'
                }
              </Button>
            </div>
          </div>

          {referralValidation && (
            <div className={`text-xs p-2 rounded ${
              referralValidation.isValid 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                : referralValidation.isExpired
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {referralValidation.isValid 
                ? `✅ Código válido! Indicado por: ${referralValidation.referrerName || 'Usuário Indicador'}`
                : referralValidation.isExpired
                  ? '⏰ Código expirado'
                : `❌ ${referralValidation.message || 'Código inválido'}`
              }
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OptionalReferralSection;