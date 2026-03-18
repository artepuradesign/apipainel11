import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo PIS (ID 139).
 * Exibe somente a seção PIS, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfPis: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={139}
      source="consultar-cpf-pis"
      onlySection="pis"
    />
  );
};

export default ConsultarCpfPis;
