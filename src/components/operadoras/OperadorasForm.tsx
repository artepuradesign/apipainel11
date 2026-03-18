import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Plus } from 'lucide-react';
import DynamicObjectField from '@/components/cpf/DynamicObjectField';

export interface CreateBaseOperadora {
  cpf_id: number;
  operadora?: string;
  numero?: string;
  plano?: string;
  status?: string;
}

interface OperadorasFormProps {
  operadoras: Partial<CreateBaseOperadora>[];
  onChange: (operadoras: Partial<CreateBaseOperadora>[]) => void;
}

const OperadorasForm: React.FC<OperadorasFormProps> = ({ operadoras, onChange }) => {
  const fields = [
    { key: 'operadora', label: 'Operadora', type: 'select' as const, required: true, options: [
      { value: 'Vivo', label: 'Vivo' },
      { value: 'Claro', label: 'Claro' },
      { value: 'Tim', label: 'Tim' },
      { value: 'Oi', label: 'Oi' },
      { value: 'Nextel', label: 'Nextel' },
      { value: 'Algar', label: 'Algar' },
      { value: 'Sercomtel', label: 'Sercomtel' },
      { value: 'Outra', label: 'Outra' }
    ]},
    { key: 'numero', label: 'Número', type: 'tel' as const, placeholder: '(11) 99999-9999', required: true },
    { key: 'plano', label: 'Plano', type: 'text' as const, placeholder: 'Tipo de plano' },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { value: 'Ativo', label: 'Ativo' },
      { value: 'Inativo', label: 'Inativo' },
      { value: 'Bloqueado', label: 'Bloqueado' },
      { value: 'Cancelado', label: 'Cancelado' }
    ]}
  ];

  const addOperadora = () => {
    onChange([...operadoras, {}]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            <CardTitle>Operadoras de Telefonia</CardTitle>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOperadora}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
        <CardDescription>
          Informações das operadoras de telefonia separadas por operadora
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DynamicObjectField
          label=""
          value={operadoras}
          onChange={onChange}
          fields={fields}
          emptyMessage="Nenhuma operadora cadastrada"
          itemTitle="Operadora"
        />
      </CardContent>
    </Card>
  );
};

export default OperadorasForm;
