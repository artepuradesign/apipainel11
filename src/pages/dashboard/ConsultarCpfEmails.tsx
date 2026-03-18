import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Fluxo do CPF Puxa Tudo configurado para o módulo de Emails (ID 142).
 * Título e valor são carregados do cadastro do módulo via API.
 */
const ConsultarCpfEmails: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={142}
      source="consultar-cpf-emails"
      fallbackPricePath="/dashboard/consultar-cpf-puxa-tudo"
    />
  );
};

export default ConsultarCpfEmails;
