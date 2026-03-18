import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Cópia do fluxo do CPF Puxa Tudo, porém configurada para o módulo de Parentes (ID 132).
 * Título e valor são carregados do cadastro do módulo via API.
 */
const ConsultarCpfParentes: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={132}
      source="consultar-cpf-parentes"
      fallbackPricePath="/dashboard/consultar-cpf-puxa-tudo"
    />
  );
};

export default ConsultarCpfParentes;
