import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo CNPJ MEI (ID 146).
 * Exibe somente a seção CNPJ MEI, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfMei: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={146}
      source="consultar-cpf-mei"
      onlySection="cnpj_mei"
    />
  );
};

export default ConsultarCpfMei;
