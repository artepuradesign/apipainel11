import React from 'react';
import ControlePessoalModulePage from '@/components/dashboard/controle-pessoal/ControlePessoalModulePage';

const ControlePessoalAgenda = () => {
  return (
    <ControlePessoalModulePage
      moduleType="agenda"
      title="Controle Pessoal • Agenda"
      subtitle="Organize compromissos e tarefas do seu dia de trabalho"
      formTitle="Novo compromisso"
    />
  );
};

export default ControlePessoalAgenda;
