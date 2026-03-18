
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { X } from "lucide-react";
import { cookieUtils } from '@/utils/cookieUtils';
import { useReferralValidation } from '@/hooks/useReferralValidation';
import { useReferralState } from '@/hooks/useReferralState';
import { bonusConfigService } from '@/services/bonusConfigService';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const useRegistrationReferralLogic = () => {
  const query = useQuery();
  const urlReferralCode = query.get('ref');
  
  const { validateReferralCode } = useReferralValidation();
  const {
    referralId,
    setReferralId,
    isReferralInfoVisible,
    setIsReferralInfoVisible,
    verifiedReferralId,
    setVerifiedReferralId,
    verifiedReferralCode,
    setVerifiedReferralCode,
    referralValidation,
    setReferralValidation,
    shouldAutoExpand,
    setShouldAutoExpand,
    isProcessingUrl,
    setIsProcessingUrl
  } = useReferralState();

  const verifyReferralIdAuto = async (code: string, fromUrl: boolean = false) => {
    try {
      console.log('🔍 [REFERRAL] Verificando código automaticamente:', code, 'FromURL:', fromUrl);
      setIsProcessingUrl(fromUrl);
      
      const validationResult = await validateReferralCode(code);
      setReferralValidation(validationResult);
      
      if (validationResult.isValid && validationResult.referrerId) {
        console.log('✅ [REFERRAL] Código válido, configurando automaticamente');
        
        setVerifiedReferralId(validationResult.referrerId);
        setVerifiedReferralCode(code);
        setIsReferralInfoVisible(true);
        setShouldAutoExpand(true);
        cookieUtils.set('referral_id', code, 7);
        
        if (fromUrl) {
          // Buscar valor do bônus da API
          const bonusAmount = await bonusConfigService.getBonusAmount();
          const formattedBonus = bonusAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          
          toast(`Código de indicação válido! Você e ${validationResult.referrerName} ganharão ${formattedBonus} de bônus ao completar o cadastro!`, {
            action: {
              label: <X className="h-4 w-4" />,
              onClick: () => toast.dismiss(),
            },
          });
        }
      } else {
        console.log('❌ [REFERRAL] Código inválido:', code, 'Resposta:', validationResult);
        if (!fromUrl) {
          toast(`Código de indicação inválido: ${validationResult.message || 'Verifique o código'}`, {
            action: {
              label: <X className="h-4 w-4" />,
              onClick: () => toast.dismiss(),
            },
          });
        }
        setReferralId(code);
        setVerifiedReferralId(null);
        setVerifiedReferralCode('');
        setIsReferralInfoVisible(false);
        setShouldAutoExpand(true);
      }
    } catch (error) {
      console.error('❌ [REFERRAL] Erro ao verificar código:', error);
      if (fromUrl) {
        toast("Erro ao verificar código de indicação!", {
          action: {
            label: <X className="h-4 w-4" />,
            onClick: () => toast.dismiss(),
          },
        });
      }
      setReferralId(code);
      setVerifiedReferralId(null);
      setVerifiedReferralCode('');
      setIsReferralInfoVisible(false);
      setShouldAutoExpand(true);
    } finally {
      setIsProcessingUrl(false);
    }
  };

  const verifyReferralId = async (referrerId: number, referralCode: string) => {
    console.log('🔍 [REFERRAL] Código validado manualmente:', { referrerId, referralCode });
    
    setVerifiedReferralId(referrerId);
    setVerifiedReferralCode(referralCode);
    setIsReferralInfoVisible(true);
    cookieUtils.set('referral_id', referralCode, 7);
  };

  useEffect(() => {
    console.log('🚀 [REFERRAL] useEffect executado - URL referral code:', urlReferralCode);
    const cookieReferral = cookieUtils.get('referral_id');
    
    if (urlReferralCode) {
      console.log('📥 [REFERRAL] Processando código da URL:', urlReferralCode);
      
      setReferralId(urlReferralCode);
      setShouldAutoExpand(true);
      cookieUtils.set('referral_id', urlReferralCode, 7);
      localStorage.setItem('temp_referral', urlReferralCode);
      
      verifyReferralIdAuto(urlReferralCode, true);
      
      // Buscar valor do bônus da API para o toast
      bonusConfigService.getBonusAmount().then(bonusAmount => {
        const formattedBonus = bonusAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        toast(`Convite de indicação recebido! Complete seu cadastro e receba ${formattedBonus} de bônus imediatamente no seu saldo do plano.`, {
          duration: 6000,
          action: {
            label: <X className="h-4 w-4" />,
            onClick: () => toast.dismiss(),
          },
        });
      });
    } else if (cookieReferral) {
      console.log('🍪 [REFERRAL] Recuperando código do cookie:', cookieReferral);
      setReferralId(cookieReferral);
      setShouldAutoExpand(true);
      verifyReferralIdAuto(cookieReferral, false);
      
      bonusConfigService.getBonusAmount().then(bonusAmount => {
        const formattedBonus = bonusAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        toast(`Código de indicação recuperado! Complete seu cadastro e receba ${formattedBonus} de bônus imediatamente no seu saldo do plano.`, {
          duration: 6000,
          action: {
            label: <X className="h-4 w-4" />,
            onClick: () => toast.dismiss(),
          },
        });
      });
    }
  }, [urlReferralCode]);

  return {
    referralId,
    setReferralId,
    isReferralInfoVisible,
    verifiedReferralId,
    verifiedReferralCode,
    referralValidation,
    verifyReferralId,
    setCookie: cookieUtils.set,
    shouldAutoExpand,
    isProcessingUrl
  };
};
