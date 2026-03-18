import React from 'react';
import DynamicObjectField from './DynamicObjectField';
import { formatDateOfBirth } from '@/utils/formatters';
import { CreateBaseCnh } from '@/services/baseCnhService';

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

const CATEGORIAS_HABILITACAO = [
  { value: 'A', label: 'A - Motocicleta' },
  { value: 'B', label: 'B - Automóvel' },
  { value: 'C', label: 'C - Caminhão' },
  { value: 'D', label: 'D - Ônibus' },
  { value: 'E', label: 'E - Carreta' },
  { value: 'AB', label: 'AB - A + B' },
  { value: 'AC', label: 'AC - A + C' },
  { value: 'AD', label: 'AD - A + D' },
  { value: 'AE', label: 'AE - A + E' }
];

const cnhFieldsConfig = [
  { key: 'n_espelho', label: 'Número do Espelho', type: 'text' as const },
  { key: 'nome', label: 'Nome', type: 'text' as const },
  { key: 'foto_cnh', label: 'Foto da CNH', type: 'text' as const },
  { key: 'doc_identidade', label: 'Documento de Identidade', type: 'text' as const },
  { key: 'orgao_expedidor', label: 'Órgão Expedidor', type: 'text' as const },
  { 
    key: 'uf_emissao', 
    label: 'UF Emissão', 
    type: 'select' as const,
    options: ESTADOS_BRASILEIROS.map(estado => ({ value: estado.sigla, label: `${estado.sigla} - ${estado.nome}` }))
  },
  { key: 'data_nascimento', label: 'Data de Nascimento', type: 'date' as const },
  { key: 'pai', label: 'Nome do Pai', type: 'text' as const },
  { key: 'mae', label: 'Nome da Mãe', type: 'text' as const },
  { key: 'permissao', label: 'Permissão', type: 'text' as const },
  { key: 'acc', label: 'ACC', type: 'text' as const },
  { 
    key: 'cat_hab', 
    label: 'Categoria de Habilitação', 
    type: 'select' as const,
    options: CATEGORIAS_HABILITACAO
  },
  { key: 'n_registro', label: 'Número de Registro', type: 'text' as const },
  { key: 'validade', label: 'Validade', type: 'date' as const },
  { key: 'primeira_habilitacao', label: 'Primeira Habilitação', type: 'text' as const },
  { key: 'observacoes', label: 'Observações', type: 'text' as const },
  { key: 'assinatura', label: 'Assinatura', type: 'text' as const },
  { key: 'local', label: 'Local', type: 'text' as const },
  { key: 'data_emissao', label: 'Data de Emissão', type: 'date' as const },
  { key: 'diretor', label: 'Diretor', type: 'text' as const },
  { key: 'n_seg1', label: 'Número de Segurança 1', type: 'text' as const },
  { key: 'n_renach', label: 'Número RENACH', type: 'text' as const },
  { key: 'qrcode', label: 'QR Code', type: 'text' as const }
];

interface CnhDocumentosFieldProps {
  value: CreateBaseCnh[];
  onChange: (value: CreateBaseCnh[]) => void;
}

const CnhDocumentosField: React.FC<CnhDocumentosFieldProps> = ({
  value,
  onChange
}) => {
  return (
    <DynamicObjectField
      label="CNH (Documentos)"
      value={value}
      onChange={onChange}
      fields={cnhFieldsConfig}
      emptyMessage="Nenhum documento CNH adicionado"
      itemTitle="Documento CNH"
    />
  );
};

export default CnhDocumentosField;