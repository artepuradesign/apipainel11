import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo Senhas de Email (ID 151).
 * Exibe somente a seção Senhas de Email, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfSenhasEmail: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={151}
      source="consultar-cpf-senhasemail"
      onlySection="senhas_email"
    />
  );
};

export default ConsultarCpfSenhasEmail;
