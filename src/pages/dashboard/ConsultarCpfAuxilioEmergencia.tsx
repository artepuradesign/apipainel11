import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo Auxílio Emergencial (ID 148).
 * Exibe somente a seção Auxílio Emergencial, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfAuxilioEmergencia: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={148}
      source="consultar-cpf-auxilio-emergencia"
      onlySection="auxilio_emergencial"
    />
  );
};

export default ConsultarCpfAuxilioEmergencia;
