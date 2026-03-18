import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, FileText, Mail, Phone, MapPin, 
  Calendar, Info, Camera, DollarSign, Globe, Briefcase, Heart, TrendingUp, 
  Award, Shield, Target, AlertTriangle, CheckCircle, Download, Building2
} from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useBaseReceita } from '@/hooks/useBaseReceita';
import { formatDateOnly } from '@/utils/formatters';

interface CPFResult {
  id?: number;
  cpf: string;
  ref?: string;
  situacao_cpf?: string;
  nome: string;
  data_nascimento?: string;
  sexo?: string;
  genero?: string;
  idade?: number;
  mae?: string;
  pai?: string;
  nome_mae?: string;
  nome_pai?: string;
  naturalidade?: string;
  uf_naturalidade?: string;
  cor?: string;
  cns?: string;
  estado_civil?: string;
  escolaridade?: string;
  email?: string;
  senha_email?: string;
  telefone?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  uf_endereco?: string;
  endereco?: string;
  data_obito?: string;
  foto?: string;
  foto2?: string;
  ultima_atualizacao?: string;
  fonte_dados?: string;
  qualidade_dados?: number;
  score?: number;
  created_at?: string;
  updated_at?: string;
  
  // Documentos
  rg?: string;
  orgao_emissor?: string;
  uf_emissao?: string;
  cnh?: string;
  dt_expedicao_cnh?: string;
  passaporte?: string;
  nit?: string;
  ctps?: string;
  pis?: string;
  titulo_eleitor?: string;
  zona?: string;
  secao?: string;
  nsu?: string;
  
  // Dados profissionais
  aposentado?: boolean | string;
  tipo_emprego?: string;
  cbo?: string;
  
  // Dados financeiros
  renda?: number | string;
  renda_presumida?: number | string;
  poder_aquisitivo?: string;
  faixa_poder_aquisitivo?: string;
  fx_poder_aquisitivo?: string;
  csb8?: number | string;
  csb8_faixa?: string;
  csba?: number | string;
  csba_faixa?: string;
  
  [key: string]: any;
}

interface CpfResultDisplayProps {
  data: CPFResult | null;
  loading?: boolean;
  error?: string;
  showExportButton?: boolean;
  onExport?: () => void;
}

const CpfResultDisplay: React.FC<CpfResultDisplayProps> = ({ 
  data, 
  loading = false, 
  error, 
  showExportButton = true,
  onExport 
}) => {
  const [receitaData, setReceitaData] = useState<any>(null);
  const { getReceitaByCpf, isLoading: receitaLoading, formatDataInscricao, formatDataEmissao, getSituacaoColor } = useBaseReceita();

  // Buscar dados da Receita Federal quando os dados do CPF mudarem
  useEffect(() => {
    if (data?.cpf) {
      console.log('🔍 [RECEITA_FEDERAL] Iniciando busca por dados da Receita para CPF:', data.cpf);
      const fetchReceitaData = async () => {
        try {
          const result = await getReceitaByCpf(data.cpf);
          console.log('📊 [RECEITA_FEDERAL] Resultado da busca:', result);
          setReceitaData(result);
        } catch (error) {
          console.error('❌ [RECEITA_FEDERAL] Erro ao buscar dados:', error);
          setReceitaData(null);
        }
      };
      fetchReceitaData();
    } else {
      setReceitaData(null);
    }
  }, [data?.cpf, getReceitaByCpf]);
  
  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
            Consultando...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Realizando consulta, aguarde...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader className="bg-destructive/5">
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Erro na Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultado da Consulta CPF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            <p>Nenhuma consulta realizada ainda.</p>
            <p className="text-sm mt-2">Preencha os dados e clique em pesquisar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string | null | undefined) => {
    return formatDateOnly(dateString || '');
  };

  const formatGender = (gender: string | null | undefined) => {
    if (!gender) return '-';
    const genderLower = gender.toLowerCase();
    if (genderLower === 'm' || genderLower === 'masculino') return 'Masculino';
    if (genderLower === 'f' || genderLower === 'feminino') return 'Feminino';
    return gender;
  };

  const renderPoderAquisitivo = (value: any) => {
    if (!value) return '-';
    
    const poderAquisivoOptions: { [key: string]: string } = {
      'CLASSE A': 'Classe A - Alta renda (Acima de R$ 22.000)',
      'CLASSE B1': 'Classe B1 - Renda alta (R$ 15.000 a R$ 22.000)',
      'CLASSE B2': 'Classe B2 - Renda média-alta (R$ 8.500 a R$ 15.000)',
      'CLASSE C1': 'Classe C1 - Renda média (R$ 4.500 a R$ 8.500)',
      'CLASSE C2': 'Classe C2 - Renda média-baixa (R$ 2.500 a R$ 4.500)',
      'CLASSE D': 'Classe D - Renda baixa (R$ 1.500 a R$ 2.500)',
      'CLASSE E': 'Classe E - Renda muito baixa (Até R$ 1.500)',
      'SEM_RENDA': 'Sem renda comprovada'
    };
    
    return poderAquisivoOptions[value] || value;
  };

  const renderField = (label: string, value: any, type: 'text' | 'date' | 'poder_aquisitivo' = 'text', uppercase: boolean = false) => {
    let displayValue = '-';
    
    if (value !== null && value !== undefined && value !== '') {
      switch (type) {
        case 'date':
          displayValue = formatDate(value);
          break;
        case 'poder_aquisitivo':
          displayValue = renderPoderAquisitivo(value);
          break;
        default:
          displayValue = String(value);
      }
      
      if (uppercase && displayValue !== '-') {
        displayValue = displayValue.toUpperCase();
      }
    }

    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <p className="text-sm">{displayValue}</p>
      </div>
    );
  };

  const renderSituacaoField = (label: string, value: string | null | undefined) => {
    if (!value) {
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">{label}</label>
          <p className="text-sm">-</p>
        </div>
      );
    }

    const situacaoLower = value.toLowerCase();
    const isRegular = situacaoLower === 'regular';

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div>
          {isRegular ? (
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
              {value.toUpperCase()}
            </Badge>
          ) : (
            <p className="text-sm">{value.toUpperCase()}</p>
          )}
        </div>
      </div>
    );
  };

  const getScoreStatus = (score: number) => {
    const getScoreLabel = (score: number) => {
      if (score >= 800) return 'Excelente';
      if (score >= 600) return 'Bom';
      if (score >= 400) return 'Regular';
      return 'Baixo';
    };

    const getScoreColor = (score: number) => {
      if (score >= 800) return 'emerald';
      if (score >= 600) return 'green';
      if (score >= 400) return 'yellow';
      return 'red';
    };

    const color = getScoreColor(score);
    
    return {
      label: getScoreLabel(score),
      color: `text-${color}-600 dark:text-${color}-400`,
      bgColor: `bg-${color}-50 dark:bg-${color}-900/20`,
      borderColor: `border-${color}-200 dark:border-${color}-800`,
      icon: score >= 800 ? Award : score >= 600 ? Shield : score >= 400 ? Target : AlertTriangle,
      description: score >= 800 ? 'Score muito alto, excelente para crédito' :
                  score >= 600 ? 'Score bom, boas chances de aprovação' :
                  score >= 400 ? 'Score regular, pode melhorar' : 'Score baixo, precisa de atenção'
    };
  };

  const hasContacts = data.telefone || data.email || (data.cep && data.cidade);

  return (
    <div className="space-y-6">
      {/* Header com status de sucesso */}
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader id="cpf-encontrado" className="bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-green-700 dark:text-green-300">
              <CheckCircle className="mr-2 h-5 w-5" />
              CPF Encontrado
            </CardTitle>
            {showExportButton && onExport && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExport}
                className="border-green-200 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Dados Pessoais
          </CardTitle>
          <CardDescription>
            Informações complementares pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderField('Naturalidade', data.naturalidade, 'text', true)}
            {renderField('UF Naturalidade', data.uf_naturalidade, 'text', true)}
            {renderField('Cor/Raça', data.cor, 'text', true)}
            {renderField('Escolaridade', data.escolaridade, 'text', true)}
            {renderField('Estado Civil', data.estado_civil, 'text', true)}
            {renderField('Aposentado', data.aposentado, 'text', true)}
            {renderField('Tipo de Emprego', data.tipo_emprego, 'text', true)}
            {renderField('CBO', data.cbo, 'text', true)}
            {renderField('Data de Óbito', data.data_obito, 'date')}
          </div>
        </CardContent>
      </Card>

      {/* Documentos - Título de Eleitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Título de Eleitor
          </CardTitle>
          <CardDescription>
            Informações eleitorais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderField('Título de Eleitor', data.titulo_eleitor)}
            {renderField('Zona Eleitoral', data.zona)}
            {renderField('Seção Eleitoral', data.secao)}
          </div>
        </CardContent>
      </Card>

      {/* Dados Financeiros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Dados Financeiros
          </CardTitle>
          <CardDescription>
            Informações sobre renda e poder aquisitivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderField('Poder Aquisitivo', data.poder_aquisitivo, 'poder_aquisitivo', true)}
            {renderField('Renda', data.renda)}
            {renderField('Faixa Poder Aquisitivo', data.fx_poder_aquisitivo, 'text', true)}
            {renderField('CSB8', data.csb8)}
            {renderField('Faixa CSB8', data.csb8_faixa, 'text', true)}
            {renderField('CSBA', data.csba)}
            {renderField('Faixa CSBA', data.csba_faixa, 'text', true)}
          </div>
        </CardContent>
      </Card>

      {/* Telefones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Telefones
          </CardTitle>
          <CardDescription>
            Informações de contato telefônico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderField('Telefone', data.telefone)}
          </div>
        </CardContent>
      </Card>

      {/* Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Emails
          </CardTitle>
          <CardDescription>
            Informações de email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderField('Email', data.email, 'text', true)}
            {renderField('Senha Email', data.senha_email ? '••••••••' : '-')}
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </CardTitle>
          <CardDescription>
            Informações de localização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderField('CEP', data.cep)}
            {renderField('Logradouro', data.logradouro, 'text', true)}
            {renderField('Número', data.numero)}
            {renderField('Complemento', data.complemento, 'text', true)}
            {renderField('Bairro', data.bairro, 'text', true)}
            {renderField('Cidade', data.cidade, 'text', true)}
            {renderField('UF', data.uf_endereco, 'text', true)}
          </div>
        </CardContent>
      </Card>

      {/* Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SCORE
          </CardTitle>
          <CardDescription>
            Pontuação de análise de crédito e risco financeiro
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Visualização do Score - Arco */}
          {data.score && Number(data.score) > 0 ? (
            <div className="w-full max-w-md mx-auto">
              <div className="bg-gradient-to-br from-background via-background to-accent/5 border rounded-2xl p-6 transition-all duration-300">
                <div className="flex flex-col items-center space-y-4">
                  {/* Score Arc Container */}
                  <div className="relative w-full max-w-xs">
                    <div className="aspect-square w-full">
                      <svg
                        viewBox="0 0 240 140"
                        className="w-full h-auto"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        {/* Background Arc */}
                        <path
                          d="M 40 120 A 80 80 0 0 1 200 120"
                          fill="none"
                          stroke="hsl(var(--muted-foreground) / 0.2)"
                          strokeWidth="12"
                          strokeLinecap="round"
                        />
                        
                        {/* Progress Arc */}
                        <path
                          d="M 40 120 A 80 80 0 0 1 200 120"
                          fill="none"
                          stroke={`url(#scoreGradient-${data.score})`}
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * Math.min(Number(data.score) / 1000, 1))}
                          className="transition-all duration-1500 ease-out"
                        />
                        
                        {/* Gradient Definitions */}
                        <defs>
                          <linearGradient id={`scoreGradient-${data.score}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="33%" stopColor="#eab308" />
                            <stop offset="66%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Score Text Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-center mt-4">
                          <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-1">
                            <AnimatedCounter value={Number(data.score)} duration={2000} />
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">
                            de 1000
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Score Status Label */}
                  {(() => {
                    const scoreStatus = getScoreStatus(Number(data.score));
                    const StatusIcon = scoreStatus.icon;
                    return (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${scoreStatus.bgColor} ${scoreStatus.borderColor} border`}>
                            <StatusIcon className={`h-5 w-5 ${scoreStatus.color}`} />
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${scoreStatus.bgColor} ${scoreStatus.color} ${scoreStatus.borderColor} border`}>
                            {scoreStatus.label}
                          </span>
                        </div>
                        <p className="text-xs text-center text-muted-foreground max-w-xs">
                          {scoreStatus.description}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum score registrado</p>
              <p className="text-sm mt-2">Este CPF não possui pontuação de crédito disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receita Federal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Receita Federal
          </CardTitle>
          <CardDescription>
            Informações da Receita Federal do Brasil
          </CardDescription>
        </CardHeader>
        <CardContent>
          {receitaLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando dados da Receita...</span>
            </div>
          ) : receitaData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Situação Cadastral</label>
                  <div>
                    <Badge 
                      variant="outline" 
                      className={`${receitaData.situacao_cadastral?.toLowerCase() === 'regular' 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'}`}
                    >
                      {receitaData.situacao_cadastral?.toUpperCase() || '-'}
                    </Badge>
                  </div>
                </div>
                {renderField('Data de Inscrição', formatDataInscricao(receitaData.data_inscricao))}
                {renderField('Dígito Verificador', receitaData.digito_verificador)}
                {renderField('Data de Emissão', formatDataEmissao(receitaData.data_emissao))}
                {renderField('Código de Controle', receitaData.codigo_controle, 'text', true)}
              </div>
              
              {/* Informação sobre a fonte dos dados */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Dados obtidos da base da Receita Federal
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Última atualização: {receitaData.updated_at ? formatDate(receitaData.updated_at) : 'Não informado'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Dados da Receita Federal não encontrados</p>
              <p className="text-sm mt-2">Este CPF não possui informações disponíveis na base da Receita Federal</p>
              
              {/* Botão para tentar recarregar os dados */}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4" 
                onClick={async () => {
                  if (data?.cpf) {
                    console.log('🔄 [RECEITA_FEDERAL] Recarregando dados para CPF:', data.cpf);
                    const result = await getReceitaByCpf(data.cpf);
                    setReceitaData(result);
                  }
                }}
                disabled={receitaLoading}
              >
                {receitaLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Carregando...
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outros Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Outros Dados
          </CardTitle>
          <CardDescription>
            Informações complementares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderField('RG', data.rg)}
            {renderField('Órgão Emissor RG', data.orgao_emissor, 'text', true)}
            {renderField('UF Emissão RG', data.uf_emissao, 'text', true)}
            {renderField('CNH', data.cnh)}
            {renderField('Data Expedição CNH', data.dt_expedicao_cnh, 'date')}
            {renderField('Passaporte', data.passaporte, 'text', true)}
            {renderField('CNS', data.cns)}
            {renderField('NIT', data.nit)}
            {renderField('CTPS', data.ctps)}
            {renderField('PIS', data.pis)}
            {renderField('NSU', data.nsu)}
            {renderField('Fonte dos Dados', data.fonte_dados, 'text', true)}
            {renderField('Qualidade dos Dados', data.qualidade_dados ? `${data.qualidade_dados}%` : '-')}
            {renderField('Última Atualização', data.ultima_atualizacao, 'date')}
          </div>
        </CardContent>
      </Card>

      {/* Informações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informações
          </CardTitle>
          <CardDescription>
            Metadados e auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.id && renderField('ID do Registro', data.id)}
            {renderField('Data de Cadastro', data.created_at, 'date')}
            {renderField('Última Modificação', data.updated_at, 'date')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CpfResultDisplay;