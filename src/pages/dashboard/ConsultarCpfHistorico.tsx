import React from 'react';
import ConsultarCpfPuxaTudo from './ConsultarCpfPuxaTudo';

const ConsultarCpfHistorico: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={166}
      source="consultar-cpf-historico"
      fallbackPricePath="/dashboard/consultar-cpf-historico"
    />
  );
};

export default ConsultarCpfHistorico;
