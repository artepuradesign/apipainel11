
import { useState } from 'react';

export const useReferralState = () => {
  const [referralId, setReferralId] = useState('');
  const [isReferralInfoVisible, setIsReferralInfoVisible] = useState(false);
  const [verifiedReferralId, setVerifiedReferralId] = useState<number | null>(null);
  const [verifiedReferralCode, setVerifiedReferralCode] = useState('');
  const [referralValidation, setReferralValidation] = useState<any>(null);
  const [shouldAutoExpand, setShouldAutoExpand] = useState(false);
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);

  return {
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
  };
};
