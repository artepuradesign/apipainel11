import React from 'react';
import ControlePessoalModulePage from '@/components/dashboard/controle-pessoal/ControlePessoalModulePage';

const ControlePessoalRelatorios = () => {
  return (
    <ControlePessoalModulePage
      moduleType="relatorios"
      title="Controle Pessoal • Relatórios"
      subtitle="Consolide informações para analisar o desempenho do período"
      formTitle="Novo apontamento"
    />
  );
};

export default ControlePessoalRelatorios;
