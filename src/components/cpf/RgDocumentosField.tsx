import React from 'react';
import DynamicObjectField from './DynamicObjectField';
import { formatDateOfBirth } from '@/utils/formatters';
import { CreateBaseRg } from '@/services/baseRgService';

const ESTADOS_BRASILEIROS = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

const rgFieldsConfig = [
  { key: 'mai', label: 'MAI', type: 'text' as const },
  { key: 'rg', label: 'RG', type: 'text' as const },
  { key: 'dni', label: 'DNI', type: 'text' as const },
  { key: 'dt_expedicao', label: 'Data de Expedição', type: 'date' as const },
  { key: 'nome', label: 'Nome', type: 'text' as const },
  { key: 'filiacao', label: 'Filiação', type: 'text' as const },
  { key: 'naturalidade', label: 'Naturalidade', type: 'text' as const },
  { key: 'dt_nascimento', label: 'Data de Nascimento', type: 'date' as const },
  { key: 'registro_civil', label: 'Registro Civil', type: 'text' as const },
  { key: 'titulo_eleitor', label: 'Título de Eleitor', type: 'text' as const },
  { key: 'titulo_zona', label: 'Zona Eleitoral', type: 'text' as const },
  { key: 'titulo_secao', label: 'Seção Eleitoral', type: 'text' as const },
  { key: 'ctps', label: 'CTPS', type: 'text' as const },
  { key: 'ctps_serie', label: 'CTPS Série', type: 'text' as const },
  { 
    key: 'ctps_uf', 
    label: 'CTPS UF', 
    type: 'select' as const,
    options: ESTADOS_BRASILEIROS.map(estado => ({ value: estado.sigla, label: `${estado.sigla} - ${estado.nome}` }))
  },
  { key: 'nis', label: 'NIS', type: 'text' as const },
  { key: 'pis', label: 'PIS', type: 'text' as const },
  { key: 'pasep', label: 'PASEP', type: 'text' as const },
  { key: 'rg_profissional', label: 'RG Profissional', type: 'text' as const },
  { key: 'cert_militar', label: 'Certificado Militar', type: 'text' as const },
  { key: 'cnh', label: 'CNH', type: 'text' as const },
  { key: 'cns', label: 'CNS', type: 'text' as const },
  { key: 'rg_anterior', label: 'RG Anterior', type: 'text' as const },
  { key: 'via_p', label: 'Via P', type: 'text' as const },
  { key: 'via', label: 'Via', type: 'text' as const },
  { 
    key: 'diretor', 
    label: 'Diretor', 
    type: 'select' as const,
    options: [
      { value: 'Lúcio Flávio', label: 'Lúcio Flávio' },
      { value: 'Fábio Viegas', label: 'Fábio Viegas' },
      { value: 'Fábio Sérgio', label: 'Fábio Sérgio' }
    ]
  },
  { key: 'orgao_expedidor', label: 'Órgão Expedidor', type: 'text' as const },
  { 
    key: 'uf_emissao', 
    label: 'UF Emissão', 
    type: 'select' as const,
    options: ESTADOS_BRASILEIROS.map(estado => ({ value: estado.sigla, label: `${estado.sigla} - ${estado.nome}` }))
  },
  { key: 'fator_rh', label: 'Fator RH', type: 'text' as const },
  { key: 'qrcode', label: 'QR Code', type: 'text' as const },
  { key: 'numeracao_folha', label: 'Numeração da Folha', type: 'text' as const },
  { key: 'observacao', label: 'Observação', type: 'text' as const }
];

interface RgDocumentosFieldProps {
  value: CreateBaseRg[];
  onChange: (value: CreateBaseRg[]) => void;
  defaultValues?: Partial<CreateBaseRg>;
}

const RgDocumentosField: React.FC<RgDocumentosFieldProps> = ({
  value,
  onChange,
  defaultValues = {}
}) => {
  return (
    <DynamicObjectField
      label="RG (Documentos)"
      value={value}
      onChange={onChange}
      fields={rgFieldsConfig}
      emptyMessage="Nenhum documento RG adicionado"
      itemTitle="Documento RG"
      defaultValues={defaultValues}
    />
  );
};

export default RgDocumentosField;