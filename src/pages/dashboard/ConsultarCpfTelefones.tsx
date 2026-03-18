import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Fluxo do CPF Puxa Tudo configurado para o módulo de Telefones (ID 141).
 * Título e valor são carregados do cadastro do módulo via API.
 */
const ConsultarCpfTelefones: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={141}
      source="consultar-cpf-telefones"
      fallbackPricePath="/dashboard/consultar-cpf-puxa-tudo"
    />
  );
};

export default ConsultarCpfTelefones;
