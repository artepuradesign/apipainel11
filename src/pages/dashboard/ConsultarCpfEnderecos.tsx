import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Fluxo do CPF Puxa Tudo configurado para o módulo de Endereços (ID 143).
 * Título e valor são carregados do cadastro do módulo via API.
 */
const ConsultarCpfEnderecos: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={143}
      source="consultar-cpf-enderecos"
      fallbackPricePath="/dashboard/consultar-cpf-puxa-tudo"
    />
  );
};

export default ConsultarCpfEnderecos;
