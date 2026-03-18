
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { X } from "lucide-react";
import { validateReferralCode } from '@/utils/referralSystem';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const useReferralLogic = () => {
  const query = useQuery();
  const urlReferralCode = query.get('ref');
  
  const [referralId, setReferralId] = useState('');
  const [isReferralInfoVisible, setIsReferralInfoVisible] = useState(false);
  const [verifiedReferralId, setVerifiedReferralId] = useState('');
  const [referralValidation, setReferralValidation] = useState<any>(null);

  // Cookie management
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name: string) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const verifyReferralIdAuto = async (code: string) => {
    try {
      const validationResult = await validateReferralCode(code);
      setReferralValidation(validationResult);
      
      if (validationResult.isValid && !validationResult.isExpired) {
        setVerifiedReferralId(code);
        setIsReferralInfoVisible(true);
        setCookie('referral_id', code, 7);
      } else if (validationResult.isExpired) {
        toast("Código expirado!", {
          action: {
            label: <X className="h-4 w-4" />,
            onClick: () => toast.dismiss(),
          },
        });
        setVerifiedReferralId('');
        setIsReferralInfoVisible(false);
      } else {
        setVerifiedReferralId('');
        setIsReferralInfoVisible(false);
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      setVerifiedReferralId('');
      setIsReferralInfoVisible(false);
    }
  };

  const verifyReferralId = async () => {
    if (!referralId.trim()) {
      toast("Por favor, digite um código de indicação válido!", {
        action: {
          label: <X className="h-4 w-4" />,
          onClick: () => toast.dismiss(),
        },
      });
      return;
    }
    
    const finalReferralId = referralId.trim();
    
    try {
      const validationResult = await validateReferralCode(finalReferralId);
      setReferralValidation(validationResult);
      
      if (validationResult.isValid && !validationResult.isExpired) {
        setVerifiedReferralId(finalReferralId);
        setIsReferralInfoVisible(true);
        setCookie('referral_id', finalReferralId, 7);
        
        toast(`Código válido! Válido por ${validationResult.daysRemaining || 7} dias.`, {
          action: {
            label: <X className="h-4 w-4" />,
            onClick: () => toast.dismiss(),
          },
        });
      } else if (validationResult.isExpired) {
        toast("Código de indicação expirado!", {
          action: {
            label: <X className="h-4 w-4" />,
            onClick: () => toast.dismiss(),
          },
        });
        setVerifiedReferralId('');
        setIsReferralInfoVisible(false);
      } else {
        toast("Código de indicação inválido!", {
          action: {
            label: <X className="h-4 w-4" />,
            onClick: () => toast.dismiss(),
          },
        });
        setVerifiedReferralId('');
        setIsReferralInfoVisible(false);
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      toast("Erro ao verificar código de indicação!", {
        action: {
          label: <X className="h-4 w-4" />,
          onClick: () => toast.dismiss(),
        },
      });
      setVerifiedReferralId('');
      setIsReferralInfoVisible(false);
    }
  };

  useEffect(() => {
    const cookieReferral = getCookie('referral_id');
    
    if (urlReferralCode) {
      setReferralId(urlReferralCode);
      setCookie('referral_id', urlReferralCode, 7);
      localStorage.setItem('temp_referral', urlReferralCode);
      verifyReferralIdAuto(urlReferralCode);
      toast("Convite recebido! Ganhe bônus ao completar perfil.", {
        action: {
          label: <X className="h-4 w-4" />,
          onClick: () => toast.dismiss(),
        },
      });
    } else if (cookieReferral) {
      setReferralId(cookieReferral);
      verifyReferralIdAuto(cookieReferral);
      toast("Código recuperado! Complete para ganhar bônus.", {
        action: {
          label: <X className="h-4 w-4" />,
          onClick: () => toast.dismiss(),
        },
      });
    }
  }, [urlReferralCode]);

  return {
    referralId,
    setReferralId,
    isReferralInfoVisible,
    verifiedReferralId,
    referralValidation,
    verifyReferralId,
    setCookie
  };
};
