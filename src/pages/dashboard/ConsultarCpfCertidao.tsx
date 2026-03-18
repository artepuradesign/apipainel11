import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Cópia do fluxo do CPF Puxa Tudo, porém configurada para o módulo de Certidão (ID 134).
 * Título e valor são carregados do cadastro do módulo via API.
 */
const ConsultarCpfCertidao: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={134}
      source="consultar-cpf-certidao"
      fallbackPricePath="/dashboard/consultar-cpf-puxa-tudo"
    />
  );
};

export default ConsultarCpfCertidao;
