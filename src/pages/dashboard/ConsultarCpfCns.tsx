import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo CNS (ID 135).
 * Exibe somente a seção CNS, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfCns: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={135}
      source="consultar-cpf-cns"
      onlySection="cns"
    />
  );
};

export default ConsultarCpfCns;
