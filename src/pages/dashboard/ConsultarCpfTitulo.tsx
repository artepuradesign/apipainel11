import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo Título de Eleitor (ID 136).
 * Exibe somente a seção Título de Eleitor, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfTitulo: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={136}
      source="consultar-cpf-titulo"
      onlySection="titulo"
    />
  );
};

export default ConsultarCpfTitulo;
