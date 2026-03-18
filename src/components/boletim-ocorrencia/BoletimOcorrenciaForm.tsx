import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';
import DynamicObjectField from '@/components/cpf/DynamicObjectField';

export interface CreateBaseBoletimOcorrencia {
  cpf_id: number;
  numero_bo?: string;
  delegacia?: string;
  data_ocorrencia?: string;
  tipo_ocorrencia?: string;
  descricao?: string;
}

interface BoletimOcorrenciaFormProps {
  boletins: Partial<CreateBaseBoletimOcorrencia>[];
  onChange: (boletins: Partial<CreateBaseBoletimOcorrencia>[]) => void;
}

const BoletimOcorrenciaForm: React.FC<BoletimOcorrenciaFormProps> = ({ boletins, onChange }) => {
  const fields = [
    { key: 'numero_bo', label: 'Número do B.O.', type: 'text' as const, placeholder: 'Número do boletim', required: true },
    { key: 'delegacia', label: 'Delegacia', type: 'text' as const, placeholder: 'Nome da delegacia' },
    { key: 'data_ocorrencia', label: 'Data da Ocorrência', type: 'date' as const, placeholder: 'DD/MM/AAAA' },
    { key: 'tipo_ocorrencia', label: 'Tipo de Ocorrência', type: 'text' as const, placeholder: 'Ex: Roubo, Furto, etc.' },
    { key: 'descricao', label: 'Descrição', type: 'text' as const, placeholder: 'Descrição da ocorrência' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
          <FileText className="h-5 w-5" />
          Boletim de Ocorrência
        </CardTitle>
        <CardDescription>
          Registros de boletins de ocorrência
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DynamicObjectField
          label=""
          value={boletins}
          onChange={onChange}
          fields={fields}
          emptyMessage="Nenhum boletim de ocorrência adicionado"
          itemTitle="Boletim"
        />
      </CardContent>
    </Card>
  );
};

export default BoletimOcorrenciaForm;
