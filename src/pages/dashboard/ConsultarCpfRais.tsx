import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo Rais - Histórico de Emprego (ID 149).
 * Exibe somente a seção Rais, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfRais: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={149}
      source="consultar-cpf-rais"
      onlySection="rais"
    />
  );
};

export default ConsultarCpfRais;
