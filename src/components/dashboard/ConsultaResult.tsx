
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, User, AlertCircle, Phone, MapPin, CreditCard, Briefcase, DollarSign, Heart, Globe, Camera, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateOnly } from '@/utils/formatters';

interface ConsultaResultData {
  // Dados Básicos
  cpf?: string;
  ref?: string;
  nome?: string;
  data_nascimento?: string;
  sexo?: string;
  situacao_cpf?: string;
  mae?: string;
  nome_mae?: string;
  pai?: string;
  nome_pai?: string;
  
  // Dados Pessoais
  naturalidade?: string;
  uf_naturalidade?: string;
  cor?: string;
  escolaridade?: string;
  estado_civil?: string;
  aposentado?: boolean | string;
  tipo_emprego?: string;
  cbo?: string;
  data_obito?: string;
  
  // Contato
  email?: string;
  senha_email?: string;
  telefone?: string;
  
  // Endereço
  cep?: string;
  logradouro?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  uf_endereco?: string;
  
  // Documentos
  rg?: string;
  orgao_emissor?: string;
  uf_emissao?: string;
  cnh?: string;
  dt_expedicao_cnh?: string;
  passaporte?: string;
  cns?: string;
  nit?: string;
  ctps?: string;
  titulo_eleitor?: string;
  zona?: string;
  secao?: string;
  pis?: string;
  nsu?: string;
  
  // Dados Financeiros
  poder_aquisitivo?: string;
  renda?: number | string;
  fx_poder_aquisitivo?: string;
  csb8?: number | string;
  csb8_faixa?: string;
  csba?: number | string;
  csba_faixa?: string;
  
  // Fotos
  foto?: string;
  foto2?: string;
  
  // Outros Dados
  fonte_dados?: string;
  qualidade_dados?: number;
  score?: number;
  
  // Campos legados para compatibilidade
  idade?: string;
  situacao?: string;
  
  [key: string]: any;
}

interface ConsultaResultProps {
  title: string;
  data: ConsultaResultData | null;
  loading?: boolean;
  error?: string;
  showExportButton?: boolean;
  onExport?: () => void;
}

const ConsultaResult = ({ 
  title, 
  data, 
  loading = false, 
  error, 
  showExportButton = true,
  onExport 
}: ConsultaResultProps) => {
  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="animate-spin h-5 w-5 border-2 border-brand-purple border-t-transparent rounded-full mr-2"></div>
            Consultando...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Realizando consulta, aguarde...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700 border-red-200 dark:border-red-800">
        <CardHeader className="bg-red-50 dark:bg-red-900/20">
          <CardTitle className="flex items-center text-red-700 dark:text-red-300">
            <AlertCircle className="mr-2 h-5 w-5" />
            Erro na Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            <p>Nenhuma consulta realizada ainda.</p>
            <p className="text-sm mt-2">Preencha os dados e clique em pesquisar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    return String(value);
  };

  const formatDate = (dateString: string) => {
    return formatDateOnly(dateString);
  };

  const formatSex = (sexo: string) => {
    if (!sexo) return 'N/A';
    const s = sexo.toLowerCase();
    if (s === 'm' || s === 'masculino') return 'Masculino';
    if (s === 'f' || s === 'feminino') return 'Feminino';
    return sexo;
  };

  const renderField = (label: string, value: any, formatter?: (val: any) => string, uppercase: boolean = true, fullWidth: boolean = false) => {
    const displayValue = formatter ? formatter(value) : formatValue(value);
    const finalValue = uppercase && displayValue !== 'N/A' ? displayValue.toUpperCase() : displayValue;
    
    if (fullWidth) {
      return (
        <div className="col-span-full space-y-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {finalValue}
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex justify-between items-start py-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[120px]">{label}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-right flex-1">
          {finalValue}
        </span>
      </div>
    );
  };

  const renderSituacaoField = (label: string, value: any) => {
    if (!value || value === 'N/A') {
      return renderField(label, 'N/A', undefined, false);
    }

    const situacaoLower = String(value).toLowerCase();
    const isRegular = situacaoLower === 'regular';

    return (
      <div className="flex justify-between items-start py-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[120px]">{label}</span>
        <div className="text-right flex-1">
          {isRegular ? (
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
              {String(value).toUpperCase()}
            </Badge>
          ) : (
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {String(value).toUpperCase()}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-green-700 dark:text-green-300">
            <CheckCircle className="mr-2 h-5 w-5" />
            CPF Encontrado
          </CardTitle>
          {showExportButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport}
              className="border-green-200 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">
        {/* Dados Básicos */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
            <User className="mr-2 h-5 w-5" />
            Dados Básicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderField('CPF', data.cpf, undefined, false)}
            {renderField('Nome Completo', data.nome, undefined, true, true)}
            {renderField('Referência', data.ref)}
            {renderField('Data de Nascimento', data.data_nascimento, formatDate, false)}
            {renderField('Sexo', data.sexo, formatSex)}
            {renderSituacaoField('Situação CPF', data.situacao_cpf || data.situacao)}
            {renderField('Nome da Mãe', data.mae || data.nome_mae, undefined, true, true)}
            {renderField('Nome do Pai', data.pai || data.nome_pai, undefined, true, true)}
          </div>
        </div>

        {/* Dados Pessoais */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
            <Heart className="mr-2 h-5 w-5" />
            Dados Pessoais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderField('Naturalidade', data.naturalidade)}
            {renderField('UF Naturalidade', data.uf_naturalidade)}
            {renderField('Cor/Raça', data.cor)}
            {renderField('Escolaridade', data.escolaridade)}
            {renderField('Estado Civil', data.estado_civil)}
            {renderField('Aposentado', data.aposentado)}
            {renderField('Tipo de Emprego', data.tipo_emprego)}
            {renderField('CBO', data.cbo)}
            {renderField('Data de Óbito', data.data_obito, formatDate)}
          </div>
        </div>

        {/* Contato */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
            <Phone className="mr-2 h-5 w-5" />
            Contato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderField('Email', data.email)}
            {renderField('Senha Email', data.senha_email ? '***' : 'N/A')}
            {renderField('Telefone', data.telefone)}
          </div>
        </div>

        {/* Endereço */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Endereço
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderField('CEP', data.cep)}
            {renderField('Logradouro', data.logradouro || data.endereco)}
            {renderField('Número', data.numero)}
            {renderField('Complemento', data.complemento)}
            {renderField('Bairro', data.bairro)}
            {renderField('Cidade', data.cidade)}
            {renderField('UF', data.uf_endereco || data.uf)}
          </div>
        </div>

        {/* Documentos */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Documentos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderField('RG', data.rg)}
            {renderField('Órgão Emissor RG', data.orgao_emissor)}
            {renderField('UF Emissão RG', data.uf_emissao)}
            {renderField('CNH', data.cnh)}
            {renderField('Data Expedição CNH', data.dt_expedicao_cnh, formatDate)}
            {renderField('Passaporte', data.passaporte)}
            {renderField('CNS', data.cns)}
            {renderField('NIT', data.nit)}
            {renderField('CTPS', data.ctps)}
            {renderField('Título de Eleitor', data.titulo_eleitor)}
            {renderField('Zona Eleitoral', data.zona)}
            {renderField('Seção Eleitoral', data.secao)}
            {renderField('PIS', data.pis)}
            {renderField('NSU', data.nsu)}
          </div>
        </div>

        {/* Dados Financeiros */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Dados Financeiros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderField('Poder Aquisitivo', data.poder_aquisitivo)}
            {renderField('Renda', data.renda)}
            {renderField('Faixa Poder Aquisitivo', data.fx_poder_aquisitivo)}
            {renderField('CSB8', data.csb8)}
            {renderField('Faixa CSB8', data.csb8_faixa)}
            {renderField('CSBA', data.csba)}
            {renderField('Faixa CSBA', data.csba_faixa)}
          </div>
        </div>

        {/* Fotos */}
        {(data.foto || data.foto2) && (
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
              <Camera className="mr-2 h-5 w-5" />
              Fotos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.foto && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Foto Principal</span>
                  <img 
                    src={`/api/photos/${data.foto}`} 
                    alt="Foto Principal" 
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {data.foto2 && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Foto Secundária</span>
                  <img 
                    src={`/api/photos/${data.foto2}`} 
                    alt="Foto Secundária" 
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Score */}
        {data.score && Number(data.score) > 0 && (
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Score
            </h3>
            <div className="bg-gradient-to-br from-background via-background to-accent/5 border rounded-xl p-8 transition-all duration-300">
              <div className="flex flex-col items-center">
                {/* Score Arc */}
                <div className="relative w-64 h-36 mb-6">
                  <svg
                    viewBox="0 0 200 120"
                    className="w-full h-full"
                  >
                    {/* Background Arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    
                    {/* Progress Arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke={`url(#scoreGradient-${data.score})`}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * Math.min(Number(data.score) / 1000, 1))}
                      className="transition-all duration-1000 ease-out"
                    />
                    
                    {/* Gradient Definitions */}
                    <defs>
                      <linearGradient id={`scoreGradient-${data.score}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={Number(data.score) < 400 ? "#ef4444" : "#ef4444"} />
                        <stop offset="25%" stopColor={Number(data.score) < 400 ? "#ef4444" : "#eab308"} />
                        <stop offset="60%" stopColor={Number(data.score) < 600 ? "#eab308" : "#22c55e"} />
                        <stop offset="100%" stopColor={Number(data.score) < 800 ? "#22c55e" : "#10b981"} />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Score Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
                    <div className="text-center">
                      <h3 className="text-5xl font-bold text-foreground mb-2 leading-tight">
                        {data.score}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        de 1000
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Score Status */}
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${Number(data.score) >= 800 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 
                                                      Number(data.score) >= 600 ? 'bg-green-50 dark:bg-green-900/20' : 
                                                      Number(data.score) >= 400 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 
                                                      'bg-red-50 dark:bg-red-900/20'}`}>
                    <Shield className={`h-4 w-4 ${Number(data.score) >= 800 ? 'text-emerald-600 dark:text-emerald-400' : 
                                                    Number(data.score) >= 600 ? 'text-green-600 dark:text-green-400' : 
                                                    Number(data.score) >= 400 ? 'text-yellow-600 dark:text-yellow-400' : 
                                                    'text-red-600 dark:text-red-400'}`} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    Number(data.score) >= 800 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 
                    Number(data.score) >= 600 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 
                    Number(data.score) >= 400 ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' : 
                    'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  }`}>
                    {Number(data.score) >= 800 ? 'Excelente' : 
                     Number(data.score) >= 600 ? 'Bom' : 
                     Number(data.score) >= 400 ? 'Regular' : 'Baixo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Outros Dados */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Outros Dados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderField('Fonte dos Dados', data.fonte_dados)}
            {renderField('Qualidade dos Dados', data.qualidade_dados ? `${data.qualidade_dados}%` : 'N/A')}
            {renderField('Score', data.score)}
            {renderField('Idade', data.idade)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultaResult;
