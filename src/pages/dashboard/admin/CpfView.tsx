import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Edit, Trash2, User, FileText, 
  Calendar, Info, Camera, DollarSign, Globe, Briefcase, Heart, TrendingUp, 
  Award, Shield, Target, AlertTriangle, CreditCard, Building2, Building, Copy
} from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { baseCpfService, BaseCpf } from '@/services/baseCpfService';
import { getErrorMessage } from '@/utils/errorMessages';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { formatDateOnly } from '@/utils/formatters';
import ReceitaFederalDisplay from '@/components/dashboard/ReceitaFederalDisplay';
import placeholderImage from '@/assets/placeholder-photo.png';
import { baseReceitaService, BaseReceita } from '@/services/baseReceitaService';
import { useBaseReceita } from '@/hooks/useBaseReceita';
import TelefonesSection from '@/components/dashboard/TelefonesSection';
import EmailsSection from '@/components/dashboard/EmailsSection';
import EnderecosSection from '@/components/dashboard/EnderecosSection';
import RgSection from '@/components/dashboard/RgSection';
import CnhSection from '@/components/dashboard/CnhSection';
import CreditinkDisplay from '@/components/credilink/CreditinkDisplay';
import VacinaDisplay from '@/components/vacina/VacinaDisplay';
import { useBaseCredilink } from '@/hooks/useBaseCredilink';
import { useBaseVacina } from '@/hooks/useBaseVacina';
import ParentesSection from '@/components/dashboard/ParentesSection';
import EmpresasSocioSection from '@/components/dashboard/EmpresasSocioSection';
import { AuxilioEmergencialSection } from '@/components/dashboard/AuxilioEmergencialSection';
import { useBaseAuxilioEmergencial } from '@/hooks/useBaseAuxilioEmergencial';
import { RaisSection } from '@/components/dashboard/RaisSection';
import { useBaseRais } from '@/hooks/useBaseRais';
import InssSection from '@/components/dashboard/InssSection';
import VivoSection from '@/components/dashboard/VivoSection';
import ClaroSection from '@/components/dashboard/ClaroSection';
import TimSection from '@/components/dashboard/TimSection';
import SenhaCpfSection from '@/components/dashboard/SenhaCpfSection';
import SenhaEmailSection from '@/components/dashboard/SenhaEmailSection';
import CnpjMeiSection from '@/components/dashboard/CnpjMeiSection';
import DividasAtivasSection from '@/components/dashboard/DividasAtivasSection';
import HistoricoDeVeiculoSection from '@/components/dashboard/HistoricoDeVeiculoSection';
import BoletimOcorrenciaSection from '@/components/dashboard/BoletimOcorrenciaSection';
import FotosSection from '@/components/dashboard/FotosSection';

const CpfView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cpf, setCpf] = useState<BaseCpf | null>(null);
  const [loading, setLoading] = useState(true);
  const [receitaData, setReceitaData] = useState<BaseReceita | null>(null);
  const [receitaLoading, setReceitaLoading] = useState(true);

  const { getReceitaByCpf } = useBaseReceita();
  const { getCreditinksByCpfId } = useBaseCredilink();
  const { getVacinasByCpfId } = useBaseVacina();
  const { getAuxiliosEmergenciaisByCpfId, auxiliosEmergenciais } = useBaseAuxilioEmergencial();
  const { getRaisByCpfId, rais, loading: raisLoading } = useBaseRais();

  useEffect(() => {
    if (id) {
      // Carregar dados apenas uma vez quando o ID muda
      loadCpfData();
    }
    
    // Cleanup para evitar requisições duplicadas
    return () => {
      // Cancelar qualquer operação pendente se necessário
    };
  }, [id]);

  const loadCpfData = async () => {
    if (!id) return;
    
    setLoading(true);
    setReceitaLoading(true);
    try {
      const response = await baseCpfService.getById(Number(id));
      
      if (response.success && response.data) {
        setCpf(response.data);
        
        // Carregar dados da Receita Federal usando o CPF
        try {
          const receitaResponse = await getReceitaByCpf(response.data.cpf);
          if (receitaResponse) {
            setReceitaData(receitaResponse);
          } else {
            setReceitaData(null);
          }
        } catch (receitaError) {
          console.error('❌ [CPF_VIEW] Erro ao carregar dados da Receita Federal:', receitaError);
          setReceitaData(null);
        }

        // Carregar dados de Auxílio Emergencial
        try {
          if (response.data.id) {
            await getAuxiliosEmergenciaisByCpfId(response.data.id);
          }
        } catch (auxilioError) {
          console.error('❌ [CPF_VIEW] Erro ao carregar auxílios emergenciais:', auxilioError);
        }

        // Carregar dados de RAIS
        try {
          if (response.data.id) {
            await getRaisByCpfId(response.data.id);
          }
        } catch (raisError) {
          console.error('❌ [CPF_VIEW] Erro ao carregar RAIS:', raisError);
        }
      } else {
        toast.error(response.error || 'Erro ao carregar dados do CPF');
        navigate('/dashboard/admin/base-cpf');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      navigate('/dashboard/admin/base-cpf');
    } finally {
      setLoading(false);
      setReceitaLoading(false);
    }
  };

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

  const handleEdit = () => {
    if (!cpf?.id) return;
    navigate(`/dashboard/admin/cpf-edit/${cpf.id}`);
  };

  const handleDelete = async () => {
    if (!cpf?.id) {
      toast.error('ID do CPF não encontrado');
      return;
    }

    if (window.confirm(`Tem certeza que deseja deletar o CPF ${formatCpf(cpf.cpf)} - ${cpf.nome}?\n\nEsta ação também removerá todas as fotos associadas.`)) {
      try {
        const response = await baseCpfService.delete(cpf.id);
        
        if (response.success) {
          toast.success('CPF e fotos deletados com sucesso');
          navigate('/dashboard/admin/base-cpf');
        } else {
          throw new Error(response.error || 'Erro ao deletar CPF');
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const copyDadosBasicos = () => {
    if (!cpf) return;
    
    const dados = [
      `CPF: ${formatCpf(cpf.cpf)}`,
      `Nome: ${cpf.nome || '-'}`,
      `Data de Nascimento: ${formatDate(cpf.data_nascimento)}`,
      `Sexo: ${formatGender(cpf.sexo)}`,
      `Nome da Mãe: ${cpf.mae || '-'}`,
      `Nome do Pai: ${cpf.pai || '-'}`
    ].join('\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados básicos copiados!');
  };

  const copyDadosPessoais = () => {
    if (!cpf) return;
    
    const dados = [
      `Naturalidade: ${cpf.naturalidade || '-'}`,
      `UF Naturalidade: ${cpf.uf_naturalidade || '-'}`,
      `Cor/Raça: ${cpf.cor || '-'}`,
      `Escolaridade: ${cpf.escolaridade || '-'}`,
      `Estado Civil: ${cpf.estado_civil || '-'}`,
      `Aposentado: ${cpf.aposentado || '-'}`,
      `Profissão: ${cpf.tipo_emprego || '-'}`,
      `CBO: ${cpf.cbo || '-'}`,
      `Data de Óbito: ${formatDate(cpf.data_obito) || '-'}`
    ].join('\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados pessoais copiados!');
  };

  const copyTituloEleitor = () => {
    if (!cpf) return;
    
    const dados = [
      `Título de Eleitor: ${cpf.titulo_eleitor || '-'}`,
      `Zona Eleitoral: ${cpf.zona || '-'}`,
      `Seção Eleitoral: ${cpf.secao || '-'}`
    ].join('\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados do título de eleitor copiados!');
  };

  const copyDadosFinanceiros = () => {
    if (!cpf) return;
    
    const dados = [
      `Aposentado: ${cpf.aposentado || '-'}`,
      `Profissão: ${cpf.tipo_emprego || '-'}`,
      `CBO: ${cpf.cbo || '-'}`,
      `Poder Aquisitivo: ${renderPoderAquisitivo(cpf.poder_aquisitivo) || '-'}`,
      `Renda: ${cpf.renda || '-'}`,
      `Faixa Poder Aquisitivo: ${cpf.fx_poder_aquisitivo || '-'}`,
      `CSB8: ${cpf.csb8 || '-'}`,
      `Faixa CSB8: ${cpf.csb8_faixa || '-'}`,
      `CSBA: ${cpf.csba || '-'}`,
      `Faixa CSBA: ${cpf.csba_faixa || '-'}`
    ].join('\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados financeiros copiados!');
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

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4 text-muted-foreground">Carregando dados do CPF...</p>
      </div>
    );
  }

  if (!cpf) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">CPF não encontrado</p>
        <Button onClick={() => navigate('/dashboard/admin/base-cpf')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar à Lista
        </Button>
      </div>
    );
  }

  const scoreData = getScoreStatus(Number(cpf.score) || 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/dashboard/admin/base-cpf')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>

      {/* Fotos */}
      <FotosSection cpfId={cpf.id} cpfNumber={cpf.cpf} />

      {/* Dados Básicos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
              Dados Básicos
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyDadosBasicos}
              className="h-8 w-8"
              title="Copiar dados da seção"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formatCpf(cpf.cpf)}
                disabled
                className="bg-muted uppercase"
              />
            </div>
            
            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={cpf.nome || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                value={formatDate(cpf.data_nascimento)}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="sexo">Sexo</Label>
              <Input
                id="sexo"
                value={formatGender(cpf.sexo)}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="mae">Nome da Mãe</Label>
              <Input
                id="mae"
                value={cpf.mae || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="pai">Nome do Pai</Label>
              <Input
                id="pai"
                value={cpf.pai || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <Heart className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyDadosPessoais}
              className="h-8 w-8"
              title="Copiar dados da seção"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="naturalidade">Naturalidade</Label>
              <Input
                id="naturalidade"
                value={cpf.naturalidade || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="uf_naturalidade">UF Naturalidade</Label>
              <Input
                id="uf_naturalidade"
                value={cpf.uf_naturalidade || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="cor">Cor/Raça</Label>
              <Input
                id="cor"
                value={cpf.cor || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="escolaridade">Escolaridade</Label>
              <Input
                id="escolaridade"
                value={cpf.escolaridade || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="estado_civil">Estado Civil</Label>
              <Input
                id="estado_civil"
                value={cpf.estado_civil || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="aposentado">Aposentado</Label>
              <Input
                id="aposentado"
                value={cpf.aposentado || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="tipo_emprego">Profissão</Label>
              <Input
                id="tipo_emprego"
                value={cpf.tipo_emprego || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="cbo">CBO</Label>
              <Input
                id="cbo"
                value={cpf.cbo || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="data_obito">Data de Óbito</Label>
              <Input
                id="data_obito"
                value={formatDate(cpf.data_obito)}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Título de Eleitor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <FileText className="h-5 w-5" />
              Título de Eleitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyTituloEleitor}
              className="h-8 w-8"
              title="Copiar dados da seção"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="titulo_eleitor">Título de Eleitor</Label>
              <Input
                id="titulo_eleitor"
                value={cpf.titulo_eleitor || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="zona">Zona Eleitoral</Label>
              <Input
                id="zona"
                value={cpf.zona || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="secao">Seção Eleitoral</Label>
              <Input
                id="secao"
                value={cpf.secao || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Financeiros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <DollarSign className="h-5 w-5" />
              Dados Financeiros
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyDadosFinanceiros}
              className="h-8 w-8"
              title="Copiar dados da seção"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="aposentado_fin">Aposentado</Label>
              <Input
                id="aposentado_fin"
                value={cpf.aposentado || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="tipo_emprego_fin">Profissão</Label>
              <Input
                id="tipo_emprego_fin"
                value={cpf.tipo_emprego || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="cbo_fin">CBO</Label>
              <Input
                id="cbo_fin"
                value={cpf.cbo || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="poder_aquisitivo">Poder Aquisitivo</Label>
              <Input
                id="poder_aquisitivo"
                value={renderPoderAquisitivo(cpf.poder_aquisitivo)}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="renda">Renda</Label>
              <Input
                id="renda"
                value={cpf.renda || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="fx_poder_aquisitivo">Faixa Poder Aquisitivo</Label>
              <Input
                id="fx_poder_aquisitivo"
                value={cpf.fx_poder_aquisitivo || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="csb8">CSB8</Label>
              <Input
                id="csb8"
                value={cpf.csb8 || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="csb8_faixa">Faixa CSB8</Label>
              <Input
                id="csb8_faixa"
                value={cpf.csb8_faixa || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>

            <div>
              <Label htmlFor="csba">CSBA</Label>
              <Input
                id="csba"
                value={cpf.csba || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="csba_faixa">Faixa CSBA</Label>
              <Input
                id="csba_faixa"
                value={cpf.csba_faixa || ''}
                disabled
                className="bg-muted uppercase"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parentes - Dados da tabela base_parente */}
      <ParentesSection cpfId={cpf.id} />

      {/* Telefones (Todos) - Dados da tabela base_telefone */}
      <TelefonesSection cpfId={cpf.id} />

      {/* Emails (Todos) - Dados da tabela base_email */}
      <EmailsSection cpfId={cpf.id} />

      {/* Endereços (Todos) - Dados da tabela base_endereco */}
      <EnderecosSection cpfId={cpf.id} />

      {/* Credilink - Dados da tabela base_credilink */}
      <CreditinkDisplay cpfId={cpf.id} />

      {/* Vacinas - Dados da tabela base_vacina */}
      <VacinaDisplay cpfId={cpf.id} />

      {/* Empresas Associadas (SÓCIO) */}
      <EmpresasSocioSection cpfId={cpf.id} />

      {/* CNPJ MEI */}
      <CnpjMeiSection cpfId={cpf.id} />

      {/* Dívidas Ativas (SIDA) */}
      <DividasAtivasSection cpf={cpf.id.toString()} />

      {/* Auxílio Emergencial - Dados da tabela base_auxilio */}
      <AuxilioEmergencialSection auxilios={auxiliosEmergenciais} />

      {/* Rais - Histórico de Emprego - Dados da tabela base_rais */}
      <RaisSection data={rais} isLoading={raisLoading} />

      {/* INSS - Dados da tabela base_inss */}
      <InssSection cpfId={cpf.id} />

      {/* Operadora Vivo */}
      <VivoSection cpfId={cpf.id} />

      {/* Operadora Claro */}
      <ClaroSection cpfId={cpf.id} />

      {/* Operadora Tim */}
      <TimSection cpfId={cpf.id} />

      {/* Senhas de Email - Dados da tabela base_senha_email */}
      <SenhaEmailSection cpfId={cpf.id} />

      {/* Senhas de CPF - Dados da tabela base_senha_cpf */}
      <SenhaCpfSection cpfId={cpf.id} />

      {/* Histórico de Veículo - Dados da tabela base_historico_veiculo */}
      <HistoricoDeVeiculoSection cpfId={cpf.id} />

      {/* RG (Todos) - Dados da tabela base_rg */}
      <RgSection cpfId={cpf.id} />

      {/* CNH (Todos) - Dados da tabela base_cnh */}
      <CnhSection cpfId={cpf.id} />

      {/* Boletim de Ocorrência */}
      <BoletimOcorrenciaSection cpfId={cpf.id} />

      {/* Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <TrendingUp className="h-5 w-5" />
            Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visualização do Score - Arco */}
          <div className="bg-gradient-to-br from-background via-background to-accent/5 border rounded-xl p-6 transition-all duration-300">
            <div className="flex flex-col items-center justify-center gap-4">
              {/* Score Arc */}
              <div className="relative">
                <div className="w-48 h-28">
                  <svg viewBox="0 0 200 120" className="w-full h-full">
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
                      stroke={`url(#scoreGradient-${cpf.score || 0})`}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * Math.min((Number(cpf.score) || 0) / 1000, 1))}
                      className="transition-all duration-1000 ease-out"
                    />
                    
                    {/* Gradient Definitions */}
                    <defs>
                      <linearGradient id={`scoreGradient-${Number(cpf.score) || 0}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={(Number(cpf.score) || 0) < 400 ? "#ef4444" : "#ef4444"} />
                        <stop offset="25%" stopColor={(Number(cpf.score) || 0) < 400 ? "#ef4444" : "#eab308"} />
                        <stop offset="60%" stopColor={(Number(cpf.score) || 0) < 600 ? "#eab308" : "#22c55e"} />
                        <stop offset="100%" stopColor={(Number(cpf.score) || 0) < 800 ? "#22c55e" : "#10b981"} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                  <div className="text-center">
                    <h3 className="text-4xl font-bold text-foreground mb-1 leading-none">
                      <AnimatedCounter 
                        value={Number(cpf.score) || 0}
                        duration={1500}
                        className="tabular-nums"
                      />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      de 1000
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Score Label */}
              <div className="flex items-center gap-2">
                <scoreData.icon className={`h-4 w-4 ${scoreData.color}`} />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${scoreData.bgColor} ${scoreData.color} border ${scoreData.borderColor}`}>
                  {scoreData.label}
                </span>
              </div>
              
              {/* Score Description */}
              <p className="text-sm text-muted-foreground text-center">
                {scoreData.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receita Federal */}
      <ReceitaFederalDisplay 
        data={receitaData}
        loading={receitaLoading}
      />

      {/* Outros Dados e Informações - Grid de 2 colunas no desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outros Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <Globe className="h-5 w-5" />
              Outros Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ref">Referência</Label>
                <Input
                  id="ref"
                  value={cpf.ref || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="fonte_dados">Fonte dos Dados</Label>
                <Input
                  id="fonte_dados"
                  value={cpf.fonte_dados || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>

              <div>
                <Label htmlFor="qualidade_dados">Qualidade dos Dados</Label>
                <Input
                  id="qualidade_dados"
                  value={cpf.qualidade_dados ? `${cpf.qualidade_dados}%` : ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <Info className="h-5 w-5" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="id_registro">ID do Registro</Label>
                <Input
                  id="id_registro"
                  value={cpf.id || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="created_at">Data de Criação</Label>
                <Input
                  id="created_at"
                  value={formatDate(cpf.created_at)}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="updated_at">Última Atualização</Label>
                <Input
                  id="updated_at"
                  value={formatDate(cpf.updated_at || cpf.ultima_atualizacao)}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CpfView;