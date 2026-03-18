import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from 'lucide-react';
import DynamicObjectField from '@/components/cpf/DynamicObjectField';

export interface CreateBaseSenha {
  cpf_id: number;
  tipo?: string;
  identificador?: string;
  senha?: string;
  observacao?: string;
}

interface SenhasFormProps {
  senhas: Partial<CreateBaseSenha>[];
  onChange: (senhas: Partial<CreateBaseSenha>[]) => void;
}

const SenhasForm: React.FC<SenhasFormProps> = ({ senhas, onChange }) => {
  const fields = [
    { key: 'tipo', label: 'Tipo', type: 'select' as const, required: true, options: [
      { value: 'Email', label: 'Email' },
      { value: 'CPF', label: 'CPF' },
      { value: 'Rede Social', label: 'Rede Social' },
      { value: 'Banco', label: 'Banco' },
      { value: 'Aplicativo', label: 'Aplicativo' },
      { value: 'Outro', label: 'Outro' }
    ]},
    { key: 'identificador', label: 'Identificador', type: 'text' as const, placeholder: 'Ex: email@exemplo.com', required: true },
    { key: 'senha', label: 'Senha', type: 'text' as const, placeholder: 'Senha vazada' },
    { key: 'observacao', label: 'Observação', type: 'text' as const, placeholder: 'Informações adicionais' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
          <Lock className="h-5 w-5" />
          Senhas Vazadas
        </CardTitle>
        <CardDescription>
          Registro de senhas comprometidas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DynamicObjectField
          label=""
          value={senhas}
          onChange={onChange}
          fields={fields}
          emptyMessage="Nenhuma senha vazada registrada"
          itemTitle="Senha"
        />
      </CardContent>
    </Card>
  );
};

export default SenhasForm;
