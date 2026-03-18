
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationContainer from '@/components/auth/RegistrationContainer';

const Registration = () => {
  const navigate = useNavigate();

  const navigateToLogin = () => {
    console.log('Navegando para login...');
    navigate('/login');
  };

  return (
    <RegistrationContainer onNavigateToLogin={navigateToLogin} />
  );
};

export default Registration;
