import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo Empresas Associadas (SÓCIO) (ID 145).
 * Exibe somente a seção de empresas associadas, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfEmpresasSocio: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={145}
      source="consultar-cpf-empresas-socio"
      onlySection="empresas_socio"
    />
  );
};

export default ConsultarCpfEmpresasSocio;
