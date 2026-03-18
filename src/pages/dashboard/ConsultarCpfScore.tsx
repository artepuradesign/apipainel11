import React from 'react';
import ConsultarCpfPuxaTudo from '@/pages/dashboard/ConsultarCpfPuxaTudo';

/**
 * Página específica do módulo SCORE (ID 140).
 * Exibe SCORE + CSB8 + CSBA, mantendo o layout do Puxa Tudo.
 */
const ConsultarCpfScore: React.FC = () => {
  return (
    <ConsultarCpfPuxaTudo
      moduleId={140}
      source="consultar-cpf-score"
      onlySection="score"
    />
  );
};

export default ConsultarCpfScore;
