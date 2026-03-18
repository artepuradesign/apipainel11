import React from 'react';
import ControlePessoalModulePage from '@/components/dashboard/controle-pessoal/ControlePessoalModulePage';

const ControlePessoalFinanceiro = () => {
  return (
    <ControlePessoalModulePage
      moduleType="financeiro"
      title="Controle Pessoal • Financeiro"
      subtitle="Registre entradas, saídas e acompanhe sua movimentação"
      formTitle="Nova movimentação"
    />
  );
};

export default ControlePessoalFinanceiro;
