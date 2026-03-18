import React from 'react';
import ControlePessoalModulePage from '@/components/dashboard/controle-pessoal/ControlePessoalModulePage';

const ControlePessoalVendaSimples = () => {
  return (
    <ControlePessoalModulePage
      moduleType="vendasimples"
      title="Controle Pessoal • Venda Simples"
      subtitle="Lance vendas rápidas e acompanhe seus registros comerciais"
      formTitle="Nova venda"
    />
  );
};

export default ControlePessoalVendaSimples;
