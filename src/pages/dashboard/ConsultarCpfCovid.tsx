import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo Vacinas (ID 144).
 * Exibe somente a seção Vacinas, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfCovid: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={144}
      source="consultar-cpf-covid"
      onlySection="vacinas"
    />
  );
};

export default ConsultarCpfCovid;
