import React from 'react';
import ControlePessoalModulePage from '@/components/dashboard/controle-pessoal/ControlePessoalModulePage';

const ControlePessoalNovoCliente = () => {
  return (
    <ControlePessoalModulePage
      moduleType="novocliente"
      title="Controle Pessoal • Novo Cliente"
      subtitle="Cadastre e mantenha um histórico rápido dos seus clientes"
      formTitle="Novo cliente"
    />
  );
};

export default ControlePessoalNovoCliente;
