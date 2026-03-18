import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo Senhas de CPF (ID 152).
 * Exibe somente a seção Senhas de CPF, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfSenhasCpf: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={152}
      source="consultar-cpf-senhascpf"
      onlySection="senhas_cpf"
    />
  );
};

export default ConsultarCpfSenhasCpf;
