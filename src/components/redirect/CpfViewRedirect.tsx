import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const CpfViewRedirect = () => {
  useEffect(() => {
    // Log para debug
    console.log('🔀 Redirecionando para CPF correto');
  }, []);

  // Redirecionar para o CPF ID 43 que existe
  return <Navigate to="/dashboard/admin/cpf-view/43" replace />;
};

export default CpfViewRedirect;