import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo Dívidas Ativas (SIDA) (ID 147).
 * Exibe somente a seção Dívidas Ativas, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfDividasAtivas: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={147}
      source="consultar-cpf-dividas-ativas"
      onlySection="dividas_ativas"
    />
  );
};

export default ConsultarCpfDividasAtivas;
