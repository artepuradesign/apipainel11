
import { useState, useCallback } from 'react';
import { makeDirectRequest } from '@/config/apiConfig';

interface ReferralValidationResult {
  isValid: boolean;
  referrerId?: number;
  referrerName?: string;
  referralCode?: string;
  message?: string;
}

export const useReferralValidation = () => {
  const [validationResult, setValidationResult] = useState<ReferralValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateReferralCode = useCallback(async (code: string): Promise<ReferralValidationResult> => {
    if (!code.trim()) {
      const result = { isValid: false, message: 'Código não pode estar vazio' };
      setValidationResult(result);
      return result;
    }

    setIsValidating(true);
    
    try {
      console.log('🔍 [REFERRAL] Validando código via API:', code);
      
      // Fazer requisição para a API para validar o código
      const response = await makeDirectRequest('/auth/validate-referral', { code: code.trim() }, 'POST');
      
      console.log('📥 [REFERRAL] Resposta da API:', response);
      
      if (response && response.success && response.data) {
        const result: ReferralValidationResult = {
          isValid: true,
          referrerId: response.data.referrer_id, // ID numérico do usuário indicador
          referrerName: response.data.referrer_name || 'Usuário Indicador',
          referralCode: response.data.code || code.trim(),
          message: 'Código de indicação válido!'
        };
        
        console.log('✅ [REFERRAL] Código validado com sucesso:', result);
        setValidationResult(result);
        return result;
      } else {
        const errorMessage = response?.message || response?.error || 'Código de indicação não encontrado';
        const result: ReferralValidationResult = {
          isValid: false,
          message: errorMessage
        };
        
        console.log('❌ [REFERRAL] Código inválido:', result);
        setValidationResult(result);
        return result;
      }
      
    } catch (error: any) {
      console.error('❌ [REFERRAL] Erro na validação:', error);
      
      let errorMessage = 'Erro ao validar código';
      
      if (error.message) {
        if (error.message.includes('JSON')) {
          errorMessage = 'Erro de comunicação com o servidor';
        } else if (error.message.includes('HTTP')) {
          errorMessage = 'Servidor temporariamente indisponível';
        } else {
          errorMessage = error.message;
        }
      }
      
      const result = { isValid: false, message: errorMessage };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validateReferralCode,
    validationResult,
    isValidating,
    clearValidation
  };
};
