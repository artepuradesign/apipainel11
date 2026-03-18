
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from './RegistrationForm';
import TermsSection from './TermsSection';
import { useRegistrationSubmit } from '@/hooks/useRegistrationSubmit';
import { useRegistrationReferralLogic } from '@/hooks/useRegistrationReferralLogic';
import { useAuth } from '@/contexts/AuthContext';

const RegistrationCard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const userType = 'assinante'; // Fixo como assinante
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Registration-specific referral logic
  const {
    referralId,
    setReferralId,
    isReferralInfoVisible,
    verifiedReferralId,
    verifiedReferralCode,
    referralValidation,
    verifyReferralId,
    setCookie,
    shouldAutoExpand
  } = useRegistrationReferralLogic();
  
  // Registration submission logic
  const { handleSubmit, isSubmitting } = useRegistrationSubmit({
    name,
    email,
    password,
    userType,
    acceptTerms,
    verifiedReferralId,
    verifiedReferralCode,
    referralValidation,
    setCookie,
    navigate
  });
  
  // Check if form is complete - código de indicação é opcional
  const isFormComplete = name.trim() !== '' && email.trim() !== '' && password.trim() !== '' && acceptTerms;

  useEffect(() => {
    // Se usuário já logado, redirecionar
    if (!loading && user) {
      console.log('✅ [REGISTRATION] Usuário já autenticado, redirecionando...');
      const redirectTo = user.user_role === 'suporte' ? '/dashboard/admin' : '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate]);

  // Se carregando ou usuário já logado, não mostrar form
  if (loading || user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RegistrationForm
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isSubmitting={isSubmitting}
        isFormComplete={isFormComplete}
        referralId={referralId}
        setReferralId={setReferralId}
        onVerifyReferralId={verifyReferralId}
        referralValidation={referralValidation}
      />
      
      <TermsSection
        acceptTerms={acceptTerms}
        setAcceptTerms={setAcceptTerms}
      />
    </form>
  );
};

export default RegistrationCard;
