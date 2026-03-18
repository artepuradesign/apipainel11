import React from 'react';
import DynamicObjectField from '@/components/cpf/DynamicObjectField';

export interface CreateBaseEmpresasSocio {
  cpf_id: number;
  socio_nome?: string;
  socio_cpf?: string;
  socio_data_entrada?: string;
  socio_qualificacao?: string;
  empresa_cnpj?: string;
}

interface EmpresasSocioFormProps {
  empresas: Partial<CreateBaseEmpresasSocio>[];
  onChange: (empresas: Partial<CreateBaseEmpresasSocio>[]) => void;
}

const EmpresasSocioForm: React.FC<EmpresasSocioFormProps> = ({ empresas, onChange }) => {
  const fields = [
    { key: 'empresa_cnpj', label: 'CNPJ da Empresa', type: 'text' as const, placeholder: '00.000.000/0000-00', required: true },
    { key: 'socio_nome', label: 'Nome do Sócio', type: 'text' as const, placeholder: 'Nome completo do sócio', required: true },
    { key: 'socio_cpf', label: 'CPF do Sócio', type: 'text' as const, placeholder: '000.000.000-00', required: true },
    { key: 'socio_qualificacao', label: 'Qualificação', type: 'text' as const, placeholder: 'Ex: Sócio, Administrador' },
    { key: 'socio_data_entrada', label: 'Data de Entrada', type: 'date' as const, placeholder: 'DD/MM/AAAA' }
  ];

  return (
    <DynamicObjectField
      label=""
      value={empresas}
      onChange={onChange}
      fields={fields}
      emptyMessage="Nenhuma empresa associada"
      itemTitle="Empresa"
    />
  );
};

export default EmpresasSocioForm;
