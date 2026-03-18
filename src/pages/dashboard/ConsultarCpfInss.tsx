import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo INSS (ID 150).
 * Exibe somente a seção INSS, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfInss: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={150}
      source="consultar-cpf-inss"
      onlySection="inss"
    />
  );
};

export default ConsultarCpfInss;
