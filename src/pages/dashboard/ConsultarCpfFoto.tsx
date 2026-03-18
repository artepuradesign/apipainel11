import React from 'react';
import ConsultarCpfCompleto from '@/pages/dashboard/ConsultarCpfCompleto';

/**
 * Cópia do CPF Completo, porém configurada para o módulo CPF FOTO (ID 23).
 * Título e valor vêm do cadastro do módulo via API.
 */
const ConsultarCpfFoto: React.FC = () => {
  return <ConsultarCpfCompleto moduleId={23} source="consultar-cpf-foto" />;
};

export default ConsultarCpfFoto;
