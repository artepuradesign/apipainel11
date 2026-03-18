
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Settings, Crown, Search, ArrowLeft, CheckCircle, Copy, User, 
  DollarSign, FileText, Phone, Mail, MapPin, Users, Camera,
  Shield, Award, Target, AlertTriangle, TrendingUp, Loader2,
  ShoppingCart, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useIsMobile } from '@/hooks/use-mobile';
import { baseCpfService } from '@/services/baseCpfService';
import { baseReceitaService, BaseReceita } from '@/services/baseReceitaService';
import { consultasCpfService } from '@/services/consultasCpfService';
import { cookieUtils } from '@/utils/cookieUtils';
import { useBaseAuxilioEmergencial } from '@/hooks/useBaseAuxilioEmergencial';
import { useBaseRais } from '@/hooks/useBaseRais';
import { useBaseCredilink } from '@/hooks/useBaseCredilink';
import { useBaseVacina } from '@/hooks/useBaseVacina';
import { atitoConsultaCpfService } from '@/services/atitoConsultaCpfService';
import { formatDateOnly } from '@/utils/formatters';
import { smoothScrollToHash } from '@/utils/smoothScroll';

// Section components
import FotosSection from '@/components/dashboard/FotosSection';
import ScoreGaugeCard from '@/components/dashboard/ScoreGaugeCard';
import TelefonesSection from '@/components/dashboard/TelefonesSection';
import EmailsSection from '@/components/dashboard/EmailsSection';
import EnderecosSection from '@/components/dashboard/EnderecosSection';
import ParentesSection from '@/components/dashboard/ParentesSection';
import CertidaoNascimentoSection from '@/components/dashboard/CertidaoNascimentoSection';
import DocumentoSection from '@/components/dashboard/DocumentoSection';
import CnsSection from '@/components/dashboard/CnsSection';
import PisSection from '@/components/dashboard/PisSection';
import VacinaDisplay from '@/components/vacina/VacinaDisplay';
import EmpresasSocioSection from '@/components/dashboard/EmpresasSocioSection';
import CnpjMeiSection from '@/components/dashboard/CnpjMeiSection';
import DividasAtivasSection from '@/components/dashboard/DividasAtivasSection';
import { AuxilioEmergencialSection } from '@/components/dashboard/AuxilioEmergencialSection';
import { RaisSection } from '@/components/dashboard/RaisSection';
import InssSection from '@/components/dashboard/InssSection';
import ClaroSection from '@/components/dashboard/ClaroSection';
import VivoSection from '@/components/dashboard/VivoSection';
import OperadoraTimSection from '@/components/dashboard/OperadoraTimSection';
import OperadoraOiSection from '@/components/dashboard/OperadoraOiSection';
import SenhaEmailSection from '@/components/dashboard/SenhaEmailSection';
import SenhaCpfSection from '@/components/dashboard/SenhaCpfSection';
import BoletimOcorrenciaBoSection from '@/components/dashboard/BoletimOcorrenciaBoSection';
import GestaoSection from '@/components/dashboard/GestaoSection';
import SectionActionButtons from '@/components/dashboard/SectionActionButtons';
import ScrollToTop from '@/components/ui/scroll-to-top';

// ─── Section definitions ───────────────────────────────────────────────
interface SectionOption {
  id: string;
  label: string;
  description: string;
  price: number;
  category: string;
  icon: React.ElementType;
}

const sectionOptions: SectionOption[] = [
  // Dados Pessoais
  { id: 'dados_basicos', label: 'Dados Básicos', description: 'CPF, Nome, Nascimento, Sexo, Filiação, RG, Estado Civil', price: 0.50, category: 'Dados Pessoais', icon: User },
  { id: 'fotos', label: 'Fotos', description: 'Fotos vinculadas ao CPF', price: 2.00, category: 'Dados Pessoais', icon: Camera },
  { id: 'documento', label: 'Documento', description: 'Dados do documento de identificação', price: 0.50, category: 'Dados Pessoais', icon: FileText },
  { id: 'certidao', label: 'Certidão de Nascimento', description: 'Dados da certidão de nascimento', price: 1.00, category: 'Dados Pessoais', icon: FileText },

  // Contato
  { id: 'telefones', label: 'Telefones', description: 'Números de telefone vinculados', price: 1.00, category: 'Contato', icon: Phone },
  { id: 'emails', label: 'Emails', description: 'Endereços de e-mail vinculados', price: 1.00, category: 'Contato', icon: Mail },
  { id: 'enderecos', label: 'Endereços', description: 'Endereços vinculados ao CPF', price: 1.00, category: 'Contato', icon: MapPin },

  // Financeiro
  { id: 'score', label: 'Score de Crédito', description: 'Score, CSB8 e CSBA', price: 1.50, category: 'Financeiro', icon: Award },
  { id: 'dados_financeiros', label: 'Dados Financeiros', description: 'Poder aquisitivo, renda, faixa', price: 1.00, category: 'Financeiro', icon: DollarSign },
  { id: 'dividas_ativas', label: 'Dívidas Ativas (SIDA)', description: 'Dívidas ativas federais', price: 2.00, category: 'Financeiro', icon: DollarSign },

  // Família
  { id: 'parentes', label: 'Parentes', description: 'Parentes vinculados ao CPF', price: 1.50, category: 'Família', icon: Users },

  // Documentos
  { id: 'titulo_eleitor', label: 'Título de Eleitor', description: 'Dados do título de eleitor', price: 0.50, category: 'Documentos', icon: FileText },
  { id: 'cns', label: 'CNS', description: 'Cartão Nacional de Saúde', price: 0.50, category: 'Documentos', icon: Shield },
  { id: 'pis', label: 'PIS', description: 'Programa de Integração Social', price: 0.50, category: 'Documentos', icon: FileText },

  // Trabalho & Benefícios
  { id: 'rais', label: 'RAIS - Histórico Emprego', description: 'Histórico de empregos formais', price: 1.50, category: 'Trabalho & Benefícios', icon: FileText },
  { id: 'inss', label: 'INSS', description: 'Dados previdenciários', price: 1.50, category: 'Trabalho & Benefícios', icon: Shield },
  { id: 'auxilio', label: 'Auxílio Emergencial', description: 'Benefícios de auxílio emergencial', price: 1.00, category: 'Trabalho & Benefícios', icon: DollarSign },

  // Empresarial
  { id: 'empresas_socio', label: 'Empresas Associadas (SÓCIO)', description: 'Sociedades empresariais', price: 2.00, category: 'Empresarial', icon: Shield },
  { id: 'cnpj_mei', label: 'CNPJ MEI', description: 'Microempreendedor Individual', price: 1.00, category: 'Empresarial', icon: FileText },

  // Saúde
  { id: 'vacinas', label: 'Vacinas', description: 'Histórico de vacinação COVID', price: 0.50, category: 'Saúde', icon: Shield },

  // Telecomunicações
  { id: 'operadoras', label: 'Operadoras (Claro/Vivo/TIM/OI)', description: 'Dados de operadoras de telefonia', price: 2.00, category: 'Telecomunicações', icon: Phone },

  // Segurança
  { id: 'senhas_email', label: 'Senhas de Email', description: 'Senhas vazadas vinculadas ao email', price: 1.00, category: 'Segurança', icon: Shield },
  { id: 'senhas_cpf', label: 'Senhas de CPF', description: 'Senhas vazadas vinculadas ao CPF', price: 1.00, category: 'Segurança', icon: Shield },
  { id: 'bo', label: 'Boletim de Ocorrência', description: 'Boletins de ocorrência registrados', price: 1.50, category: 'Segurança', icon: FileText },

  // Outros
  { id: 'gestao', label: 'Gestão Cadastral', description: 'Dados de gestão cadastral', price: 0.50, category: 'Outros', icon: Settings },
];

const categoryIcons: Record<string, React.ElementType> = {
  'Dados Pessoais': User,
  'Contato': Phone,
  'Financeiro': DollarSign,
  'Família': Users,
  'Documentos': FileText,
  'Trabalho & Benefícios': Shield,
  'Empresarial': Shield,
  'Saúde': Shield,
  'Telecomunicações': Phone,
  'Segurança': Shield,
  'Outros': Settings,
};

// ─── CPF Result interface (same as PuxaTudo) ──────────────────────────
interface CPFResult {
  id?: number;
  cpf: string;
  nome: string;
  data_nascimento?: string;
  sexo?: string;
  mae?: string;
  pai?: string;
  nome_mae?: string;
  nome_pai?: string;
  estado_civil?: string;
  rg?: string;
  cbo?: string;
  orgao_emissor?: string;
  uf_emissao?: string;
  data_obito?: string;
  renda?: number | string;
  titulo_eleitor?: string;
  zona?: string;
  secao?: string;
  pis?: string;
  cns?: string;
  score?: number;
  csb8?: number | string;
  csb8_faixa?: string;
  csba?: number | string;
  csba_faixa?: string;
  poder_aquisitivo?: string;
  fx_poder_aquisitivo?: string;
  aposentado?: boolean | string;
  tipo_emprego?: string;
  foto?: string;
  foto2?: string;
  [key: string]: any;
}

const ConsultaPersonalizada = () => {
  const [cpf, setCpf] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CPFResult | null>(null);
  const [receitaData, setReceitaData] = useState<BaseReceita | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Verification modal state
  const [verificationLoadingOpen, setVerificationLoadingOpen] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationSecondsLeft, setVerificationSecondsLeft] = useState<number | null>(null);
  const [verificationPhase, setVerificationPhase] = useState<'initial' | 'retry' | null>(null);

  // Section counts
  const [fotosCount, setFotosCount] = useState(0);
  const [telefonesCount, setTelefonesCount] = useState(0);
  const [emailsCount, setEmailsCount] = useState(0);
  const [enderecosCount, setEnderecosCount] = useState(0);
  const [parentesCount, setParentesCount] = useState(0);
  const [cnsCount, setCnsCount] = useState(0);
  const [vacinasCount, setVacinasCount] = useState(0);
  const [empresasSocioCount, setEmpresasSocioCount] = useState(0);
  const [cnpjMeiCount, setCnpjMeiCount] = useState(0);
  const [dividasAtivasCount, setDividasAtivasCount] = useState(0);
  const [certidaoNascimentoCount, setCertidaoNascimentoCount] = useState(0);
  const [documentoCount, setDocumentoCount] = useState(0);
  const [inssCount, setInssCount] = useState(0);
  const [claroCount, setClaroCount] = useState(0);
  const [vivoCount, setVivoCount] = useState(0);
  const [timCount, setTimCount] = useState(0);
  const [oiCount, setOiCount] = useState(0);
  const [senhaEmailCount, setSenhaEmailCount] = useState(0);
  const [senhaCpfCount, setSenhaCpfCount] = useState(0);
  const [boCount, setBoCount] = useState(0);
  const [gestaoCount, setGestaoCount] = useState(0);

  // Subscription & Balance
  const { 
    hasActiveSubscription, 
    subscription,
    discountPercentage,
    calculateDiscountedPrice: calculateSubscriptionDiscount,
    isLoading: subscriptionLoading 
  } = useUserSubscription();
  const { balance, loadBalance: reloadApiBalance } = useWalletBalance();

  const planBalance = balance.saldo_plano || 0;
  const walletBalance = balance.saldo || 0;
  const totalBalance = planBalance + walletBalance;

  // Related data hooks
  const { getAuxiliosEmergenciaisByCpfId, auxiliosEmergenciais } = useBaseAuxilioEmergencial();
  const { getRaisByCpfId, rais, loading: raisLoading } = useBaseRais();
  const { getCreditinksByCpfId } = useBaseCredilink();
  const { getVacinasByCpfId } = useBaseVacina();

  useEffect(() => {
    if (!result?.id) return;
    getAuxiliosEmergenciaisByCpfId(result.id);
  }, [result?.id, getAuxiliosEmergenciaisByCpfId]);

  // ─── Access check ──────────────────────────────────────────────────
  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Verificando acesso...</span>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className="space-y-6">
        <PageHeaderCard 
          title="Consulta Personalizada" 
          subtitle="Acesso exclusivo para assinantes"
        />
        <Card className="border-border">
          <CardContent className="pt-6 text-center">
            <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Acesso Exclusivo</h3>
            <p className="text-muted-foreground mb-6">
              A Consulta Personalizada é um recurso exclusivo para assinantes com plano ativo.
              Escolha as seções que deseja consultar e pague apenas pelo que precisa.
            </p>
            <div className="space-y-3">
              <Link to="/dashboard/planos">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Crown className="mr-2 h-4 w-4" />
                  Ver Planos Disponíveis
                </Button>
              </Link>
              <Link to="/dashboard/consultar-cpf-puxa-tudo">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Consulta Padrão
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Helpers ───────────────────────────────────────────────────────
  const hasSection = (id: string) => selectedSections.includes(id);

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const selectAll = () => {
    setSelectedSections(sectionOptions.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedSections([]);
  };

  const calculateTotal = () => {
    const basePrice = sectionOptions
      .filter(s => selectedSections.includes(s.id))
      .reduce((total, s) => total + s.price, 0);
    
    if (hasActiveSubscription && discountPercentage > 0) {
      const { discountedPrice } = calculateSubscriptionDiscount(basePrice);
      return { basePrice, finalPrice: discountedPrice, discount: discountPercentage };
    }
    return { basePrice, finalPrice: basePrice, discount: 0 };
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatRenda = (renda: string | number | null | undefined): string => {
    if (!renda) return '';
    if (typeof renda === 'string' && (renda.includes('R$') || /[A-Za-z]/.test(renda))) return renda;
    const numValue = typeof renda === 'number' ? renda : parseFloat(String(renda).replace(/[^\d.-]/g, ''));
    if (!isNaN(numValue)) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue / 100);
    }
    return String(renda);
  };

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    return true;
  };

  const getScoreStatus = (score: number) => {
    const getLabel = (s: number) => s >= 800 ? 'Excelente' : s >= 600 ? 'Bom' : s >= 400 ? 'Regular' : 'Baixo';
    const getColor = (s: number) => s >= 800 ? 'emerald' : s >= 600 ? 'green' : s >= 400 ? 'yellow' : 'red';
    const color = getColor(score);
    return {
      label: getLabel(score),
      color: `text-${color}-600 dark:text-${color}-400`,
      description: score >= 800 ? 'Score muito alto' : score >= 600 ? 'Score bom' : score >= 400 ? 'Score regular' : 'Score baixo',
    };
  };

  const hasValue = (v: unknown) => {
    if (v === null || v === undefined) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (typeof v === 'number') return !Number.isNaN(v);
    return true;
  };

  // ─── Search ────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!cpf || cpf.length !== 11) {
      toast.error("Digite um CPF válido (11 dígitos)");
      return;
    }
    if (!validateCPF(cpf)) {
      toast.error("CPF Inválido");
      return;
    }
    if (selectedSections.length === 0) {
      toast.error("Selecione pelo menos uma seção");
      return;
    }
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    const sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    if (!sessionToken) {
      toast.error("Token de autenticação não encontrado");
      return;
    }

    const { finalPrice, basePrice, discount } = calculateTotal();

    if (totalBalance < finalPrice) {
      toast.error(`Saldo insuficiente. Necessário: ${formatCurrency(finalPrice)}, Disponível: ${formatCurrency(totalBalance)}`, {
        description: `Saldo do plano: ${formatCurrency(planBalance)} | Carteira: ${formatCurrency(walletBalance)}`,
        duration: 5000
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 1) Try base_cpf first
      const searchResult = await baseCpfService.getByCpf(cpf);
      const receitaResult = await baseReceitaService.getByCpf(cpf);

      let cpfData: any = null;

      if (searchResult.success && searchResult.data) {
        cpfData = searchResult.data;
      } else {
        // Send to Atito and poll
        setLoading(false);
        setVerificationLoadingOpen(true);
        setVerificationPhase(null);
        setVerificationSecondsLeft(null);
        setVerificationProgress(0);

        const atitoResult = await atitoConsultaCpfService.enviarCpf(cpf);
        if (!atitoResult.success) {
          toast.error('Falha ao enviar CPF para processamento');
          setVerificationLoadingOpen(false);
          return;
        }

        toast.success('CPF enviado para processamento!', { duration: 2000 });
        await new Promise(r => setTimeout(r, 250));

        const tickCountdown = async (secondsTotal: number) => {
          for (let elapsed = 0; elapsed < secondsTotal; elapsed++) {
            await new Promise(r => setTimeout(r, 1000));
            setVerificationSecondsLeft(Math.max(secondsTotal - (elapsed + 1), 0));
            setVerificationProgress(Math.min(Math.round(((elapsed + 1) / secondsTotal) * 100), 100));
          }
        };

        // Wait 10s
        setVerificationPhase('initial');
        setVerificationSecondsLeft(10);
        await tickCountdown(10);

        let check = await baseCpfService.getByCpf(cpf);
        if (check.success && check.data) {
          cpfData = check.data;
        } else {
          // Retry 5s
          setVerificationPhase('retry');
          setVerificationSecondsLeft(5);
          setVerificationProgress(0);
          await tickCountdown(5);
          check = await baseCpfService.getByCpf(cpf);
          if (check.success && check.data) cpfData = check.data;
        }

        setVerificationLoadingOpen(false);
        setVerificationSecondsLeft(null);
        setVerificationProgress(0);
        setVerificationPhase(null);

        if (!cpfData) {
          toast.error('CPF não encontrado após processamento');
          return;
        }
        setLoading(true);
      }

      // 2) Register consultation
      let saldoUsado: 'plano' | 'carteira' | 'misto' = 'carteira';
      if (planBalance >= finalPrice) saldoUsado = 'plano';
      else if (planBalance > 0 && totalBalance >= finalPrice) saldoUsado = 'misto';

      try {
        await consultasCpfService.create({
          user_id: parseInt(user.id),
          module_type: 'cpf',
          document: cpf,
          cost: finalPrice,
          status: 'completed',
          result_data: cpfData,
          ip_address: window.location.hostname,
          user_agent: navigator.userAgent,
          saldo_usado: saldoUsado,
          metadata: {
            source: 'consulta-personalizada',
            page_route: window.location.pathname,
            module_title: 'Consulta Personalizada',
            discount: discount,
            original_price: basePrice,
            discounted_price: finalPrice,
            final_price: finalPrice,
            subscription_discount: hasActiveSubscription,
            plan_type: subscription?.plan_name || 'Pré-Pago',
            selected_sections: selectedSections,
            timestamp: new Date().toISOString(),
            saldo_usado: saldoUsado
          }
        } as any);
      } catch (e) {
        console.error('Erro ao registrar consulta:', e);
      }

      // 3) Set result
      setResult({
        id: cpfData.id,
        cpf: cpfData.cpf || cpf,
        nome: cpfData.nome || 'Nome não informado',
        data_nascimento: cpfData.data_nascimento,
        sexo: cpfData.sexo,
        mae: cpfData.mae,
        pai: cpfData.pai,
        nome_mae: cpfData.nome_mae,
        nome_pai: cpfData.nome_pai,
        estado_civil: cpfData.estado_civil,
        rg: cpfData.rg,
        cbo: cpfData.cbo,
        orgao_emissor: cpfData.orgao_emissor,
        uf_emissao: cpfData.uf_emissao,
        data_obito: cpfData.data_obito,
        renda: cpfData.renda,
        titulo_eleitor: cpfData.titulo_eleitor,
        zona: cpfData.zona,
        secao: cpfData.secao,
        pis: cpfData.pis,
        cns: cpfData.cns,
        score: cpfData.score,
        csb8: cpfData.csb8?.toString(),
        csb8_faixa: cpfData.csb8_faixa,
        csba: cpfData.csba?.toString(),
        csba_faixa: cpfData.csba_faixa,
        poder_aquisitivo: cpfData.poder_aquisitivo,
        fx_poder_aquisitivo: cpfData.fx_poder_aquisitivo,
        aposentado: cpfData.aposentado,
        tipo_emprego: cpfData.tipo_emprego,
        foto: cpfData.foto,
        foto2: cpfData.foto2,
        naturalidade: cpfData.naturalidade,
        uf_naturalidade: cpfData.uf_naturalidade,
        cor: cpfData.cor,
        escolaridade: cpfData.escolaridade,
        logradouro: cpfData.logradouro,
        numero: cpfData.numero,
        complemento: cpfData.complemento,
        uf_endereco: cpfData.uf_endereco || cpfData.uf,
        ref: cpfData.ref,
        situacao_cpf: cpfData.situacao_cpf,
        foto_rosto_rg: cpfData.foto_rosto_rg,
        foto_rosto_cnh: cpfData.foto_rosto_cnh,
        foto_doc_rg: cpfData.foto_doc_rg,
        foto_doc_cnh: cpfData.foto_doc_cnh,
      });

      if (receitaResult?.success && receitaResult.data) {
        setReceitaData(receitaResult.data);
      }

      // Load related data
      if (cpfData.id) {
        Promise.all([
          getAuxiliosEmergenciaisByCpfId(cpfData.id),
          getRaisByCpfId(cpfData.id),
          getCreditinksByCpfId(cpfData.id),
          getVacinasByCpfId(cpfData.id)
        ]).catch(() => {});
      }

      // Update balance
      await reloadApiBalance();

      window.dispatchEvent(new CustomEvent('balanceUpdated', {
        detail: { shouldAnimate: true, immediate: true }
      }));

      toast.success(
        <div className="flex flex-col gap-0.5">
          <div>✅ Consulta personalizada realizada!</div>
          <div className="text-sm text-muted-foreground">
            Valor cobrado: {formatCurrency(finalPrice)} ({selectedSections.length} seções)
          </div>
        </div>,
        { duration: 4000 }
      );

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);

    } catch (error) {
      console.error('Erro na consulta personalizada:', error);
      toast.error('Erro ao realizar consulta');
    } finally {
      setLoading(false);
    }
  };

  // ─── Grouped sections for selection UI ─────────────────────────────
  const groupedSections = sectionOptions.reduce((acc, section) => {
    if (!acc[section.category]) acc[section.category] = [];
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SectionOption[]>);

  const { basePrice, finalPrice, discount } = calculateTotal();

  // ─── Result helpers ────────────────────────────────────────────────
  const hasDadosBasicos = result ? [
    result.cpf, result.nome, result.data_nascimento, result.sexo,
    result.mae, result.nome_mae, result.pai, result.nome_pai,
    result.estado_civil, result.rg, result.cbo
  ].some(hasValue) : false;

  const hasDadosFinanceiros = result ? [
    result.aposentado, result.tipo_emprego, result.cbo,
    result.poder_aquisitivo, result.renda, result.fx_poder_aquisitivo
  ].some(hasValue) : false;

  const hasTituloEleitor = result ? [result.titulo_eleitor, result.zona, result.secao].some(hasValue) : false;

  const scoreCount = result && Number(result.score) > 0 ? 1 : 0;
  const csb8Count = result && (hasValue(result.csb8) || hasValue(result.csb8_faixa)) ? 1 : 0;
  const csbaCount = result && (hasValue(result.csba) || hasValue(result.csba_faixa)) ? 1 : 0;
  const pisCount = (() => {
    if (!result) return 0;
    const v = (result.pis ?? '').toString().trim().toUpperCase();
    if (!v || v === '-' || v === 'SEM RESULTADO' || v === 'SEM DADOS') return 0;
    return 1;
  })();

  const onlineCardClass = (hasData: boolean) =>
    hasData ? "border-success-border bg-success-subtle" : undefined;

  // Build text for copy/export
  const buildFullReportText = () => {
    if (!result) return '';
    const lines: string[] = ['=== CONSULTA PERSONALIZADA ===', ''];
    if (hasSection('dados_basicos')) {
      lines.push('--- DADOS BÁSICOS ---');
      lines.push(`CPF: ${result.cpf}`, `Nome: ${result.nome}`, '');
    }
    return lines.join('\n');
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Consulta Personalizada" 
        subtitle={`Selecione as seções desejadas • ${subscription?.plan_name || 'Assinante'} • ${discountPercentage}% de desconto`}
      />

      {/* Verification Loading Modal */}
      <AlertDialog open={verificationLoadingOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {verificationPhase === 'retry' ? 'Tentativa adicional...' : 'Processando CPF...'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {verificationSecondsLeft !== null
                ? `Aguardando processamento... ${verificationSecondsLeft}s restantes`
                : 'Enviando CPF para processamento...'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {verificationProgress > 0 && (
            <Progress value={verificationProgress} className="w-full" />
          )}
        </AlertDialogContent>
      </AlertDialog>

      {!result ? (
        /* ─── SELECTION MODE ─────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: CPF Input + Section Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* CPF Input */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Search className="mr-2 h-5 w-5" />
                  Digite o CPF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="cpf-personalizada">CPF (apenas números)</Label>
                  <Input
                    id="cpf-personalizada"
                    placeholder="Digite o CPF (11 dígitos)"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      setCpf(pastedText.replace(/\D/g, '').slice(0, 11));
                    }}
                    maxLength={11}
                    className="text-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Select All / Deselect All */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Selecione as seções que deseja incluir na consulta
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Selecionar Todas
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Limpar
                </Button>
              </div>
            </div>

            {/* Section Groups */}
            {Object.entries(groupedSections).map(([category, sections]) => {
              const CategoryIcon = categoryIcons[category] || Settings;
              const categorySelected = sections.filter(s => selectedSections.includes(s.id)).length;
              const categoryTotal = sections.reduce((sum, s) => sum + (selectedSections.includes(s.id) ? s.price : 0), 0);
              
              return (
                <Card key={category} className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-base">
                        <CategoryIcon className="mr-2 h-4 w-4" />
                        {category}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {categorySelected > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {categorySelected}/{sections.length}
                          </Badge>
                        )}
                        {categoryTotal > 0 && (
                          <Badge className="bg-primary/10 text-primary text-xs">
                            {formatCurrency(categoryTotal)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sections.map((section) => {
                        const SectionIcon = section.icon;
                        const isSelected = selectedSections.includes(section.id);
                        return (
                          <div 
                            key={section.id} 
                            className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleSectionToggle(section.id)}
                          >
                            <Checkbox
                              id={section.id}
                              checked={isSelected}
                              onCheckedChange={() => handleSectionToggle(section.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <label htmlFor={section.id} className="text-sm font-medium cursor-pointer block">
                                {section.label}
                              </label>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {section.description}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
                              {formatCurrency(section.price)}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Right: Summary & Checkout */}
          <div className="space-y-4">
            <Card className="border-border sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Resumo da Consulta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan info */}
                <div className="bg-primary/5 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{subscription?.plan_name}</span>
                  </div>
                  {discountPercentage > 0 && (
                    <span className="text-xs text-primary">
                      {discountPercentage}% de desconto aplicado
                    </span>
                  )}
                </div>

                {/* Selected items */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Seções selecionadas:</span>
                    <span className="font-medium">{selectedSections.length}</span>
                  </div>
                  
                  {selectedSections.length > 0 && (
                    <>
                      <div className="border-t border-border pt-2 space-y-1 max-h-48 overflow-y-auto">
                        {selectedSections.map(sectionId => {
                          const section = sectionOptions.find(s => s.id === sectionId);
                          return section ? (
                            <div key={sectionId} className="flex justify-between text-xs">
                              <span className="truncate mr-2">{section.label}</span>
                              <span className="flex-shrink-0">{formatCurrency(section.price)}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                      
                      <div className="border-t border-border pt-2 space-y-1">
                        {discount > 0 && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Subtotal:</span>
                              <span className="line-through text-muted-foreground">
                                {formatCurrency(basePrice)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-green-600">Desconto ({discount}%):</span>
                              <span className="text-green-600">
                                -{formatCurrency(basePrice - finalPrice)}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between text-base font-bold">
                          <span>Total:</span>
                          <span className="text-primary">{formatCurrency(finalPrice)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Balance info */}
                <div className="text-xs text-muted-foreground border-t border-border pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Saldo do plano:</span>
                    <span>{formatCurrency(planBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saldo da carteira:</span>
                    <span>{formatCurrency(walletBalance)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-foreground">
                    <span>Total disponível:</span>
                    <span>{formatCurrency(totalBalance)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <Button
                  onClick={handleSearch}
                  disabled={loading || !cpf || cpf.length !== 11 || selectedSections.length === 0 || totalBalance < finalPrice}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Consultar ({formatCurrency(finalPrice)})
                    </>
                  )}
                </Button>

                {totalBalance < finalPrice && selectedSections.length > 0 && (
                  <p className="text-xs text-destructive text-center">
                    Saldo insuficiente para esta consulta
                  </p>
                )}

                <Link to="/dashboard/consultar-cpf-puxa-tudo">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Consulta Padrão
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* ─── RESULTS MODE ───────────────────────────────────────────── */
        <div ref={resultRef} className="space-y-6 w-full max-w-full overflow-hidden">
          {/* Header */}
          <Card className="border-success-border w-full overflow-hidden">
            <CardHeader className="bg-success-subtle p-4 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center text-success-subtle-foreground min-w-0">
                  <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                  <span className="truncate text-base sm:text-lg">Consulta Personalizada - Resultado</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setResult(null);
                      setReceitaData(null);
                    }}
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    Nova Consulta
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-3">
              <div className="flex flex-wrap gap-2">
                {selectedSections.map(sectionId => {
                  const section = sectionOptions.find(s => s.id === sectionId);
                  if (!section) return null;
                  return (
                    <Badge key={sectionId} variant="secondary" className="bg-success text-success-foreground text-xs">
                      {section.label}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Fotos */}
          {hasSection('fotos') && (
            <div id="fotos-section" className={fotosCount === 0 ? 'hidden' : ''}>
              <FotosSection cpfId={result.id} cpfNumber={result.cpf} onCountChange={setFotosCount} />
            </div>
          )}

          {/* Score Cards */}
          {hasSection('score') && (scoreCount > 0 || csb8Count > 0 || csbaCount > 0) && (
            <section className="mx-auto w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {scoreCount > 0 && (
                <Card id="score-section" className={onlineCardClass(hasValue(result.score))}>
                  <CardContent className="p-2 space-y-1">
                    <ScoreGaugeCard
                      title="SCORE"
                      score={result.score}
                      faixa={getScoreStatus(Number(result.score) || 0).label}
                      icon="chart"
                      compact
                      embedded
                    />
                  </CardContent>
                </Card>
              )}
              {csb8Count > 0 && (
                <Card id="csb8-section" className={onlineCardClass(hasValue(result.csb8))}>
                  <CardContent className="p-2">
                    <ScoreGaugeCard title="CSB8 [SCORE]" score={result.csb8} faixa={result.csb8_faixa} icon="chart" compact embedded />
                  </CardContent>
                </Card>
              )}
              {csbaCount > 0 && (
                <Card id="csba-section" className={onlineCardClass(hasValue(result.csba))}>
                  <CardContent className="p-2">
                    <ScoreGaugeCard title="CSBA [SCORE]" score={result.csba} faixa={result.csba_faixa} icon="trending" compact embedded />
                  </CardContent>
                </Card>
              )}
            </section>
          )}

          {/* Dados Financeiros */}
          {hasSection('dados_financeiros') && hasDadosFinanceiros && (
            <Card id="dados-financeiros-section" className={onlineCardClass(hasDadosFinanceiros)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <DollarSign className="h-5 w-5" />
                    Dados Financeiros
                  </CardTitle>
                  <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.poder_aquisitivo && (
                    <div>
                      <Label>Poder Aquisitivo</Label>
                      <Input value={result.poder_aquisitivo} disabled className="uppercase text-[14px]" />
                    </div>
                  )}
                  {result.renda && (
                    <div>
                      <Label>Renda</Label>
                      <Input value={formatRenda(result.renda)} disabled className="text-[14px]" />
                    </div>
                  )}
                  {result.fx_poder_aquisitivo && (
                    <div>
                      <Label>Faixa Poder Aquisitivo</Label>
                      <Input value={result.fx_poder_aquisitivo} disabled className="uppercase text-[14px]" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dados Básicos */}
          {hasSection('dados_basicos') && hasDadosBasicos && (
            <Card id="dados-basicos-section" className={onlineCardClass(hasDadosBasicos) ? `w-full ${onlineCardClass(hasDadosBasicos)}` : "w-full"}>
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <User className="h-5 w-5" />
                    Dados Básicos
                  </CardTitle>
                  <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {result.cpf && (
                    <div>
                      <Label className="text-xs sm:text-sm">CPF</Label>
                      <Input value={result.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')} disabled className="bg-muted uppercase text-[14px]" />
                    </div>
                  )}
                  {result.nome && (
                    <div>
                      <Label className="text-xs sm:text-sm">Nome Completo</Label>
                      <Input value={result.nome} disabled className="bg-muted uppercase text-[14px]" />
                    </div>
                  )}
                  {result.data_nascimento && (
                    <div>
                      <Label className="text-xs sm:text-sm">Data de Nascimento</Label>
                      <Input value={formatDateOnly(result.data_nascimento)} disabled className="bg-muted text-[14px]" />
                    </div>
                  )}
                  {result.sexo && (
                    <div>
                      <Label className="text-xs sm:text-sm">Sexo</Label>
                      <Input value={(result.sexo.toLowerCase() === 'm' ? 'Masculino' : result.sexo.toLowerCase() === 'f' ? 'Feminino' : result.sexo).toUpperCase()} disabled className="bg-muted text-[14px]" />
                    </div>
                  )}
                  {(result.mae || result.nome_mae) && (
                    <div>
                      <Label className="text-xs sm:text-sm">Nome da Mãe</Label>
                      <Input value={(result.mae || result.nome_mae) || ''} disabled className="bg-muted uppercase text-[14px]" />
                    </div>
                  )}
                  {(result.pai || result.nome_pai) && (
                    <div>
                      <Label className="text-xs sm:text-sm">Nome do Pai</Label>
                      <Input value={(result.pai || result.nome_pai) || ''} disabled className="bg-muted uppercase text-[14px]" />
                    </div>
                  )}
                  {result.estado_civil && (
                    <div>
                      <Label className="text-xs sm:text-sm">Estado Civil</Label>
                      <Input value={result.estado_civil} disabled className="bg-muted uppercase text-[14px]" />
                    </div>
                  )}
                  {result.rg && (
                    <div>
                      <Label className="text-xs sm:text-sm">RG</Label>
                      <Input value={result.rg} disabled className="bg-muted uppercase text-[14px]" />
                    </div>
                  )}
                  {result.cbo && (
                    <div>
                      <Label className="text-xs sm:text-sm">CBO</Label>
                      <Input value={result.cbo} disabled className="bg-muted uppercase text-[14px]" />
                    </div>
                  )}
                  {result.orgao_emissor && (
                    <div>
                      <Label className="text-xs sm:text-sm">Órgão Emissor</Label>
                      <Input value={result.orgao_emissor} disabled className="bg-muted uppercase text-[14px]" />
                    </div>
                  )}
                  {result.data_obito && (
                    <div>
                      <Label className="text-xs sm:text-sm">Data Óbito</Label>
                      <Input value={new Date(result.data_obito).toLocaleDateString('pt-BR')} disabled className="bg-muted text-[14px]" />
                    </div>
                  )}
                  {result.renda && (
                    <div>
                      <Label className="text-xs sm:text-sm">Renda</Label>
                      <Input value={formatRenda(result.renda)} disabled className="bg-muted text-[14px]" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Telefones */}
          {hasSection('telefones') && (
            <div id="telefones-section" className={telefonesCount === 0 ? 'hidden' : ''}>
              <TelefonesSection cpfId={result.id} onCountChange={setTelefonesCount} />
            </div>
          )}

          {/* Emails */}
          {hasSection('emails') && (
            <div id="emails-section" className={emailsCount === 0 ? 'hidden' : ''}>
              <EmailsSection cpfId={result.id} onCountChange={setEmailsCount} />
            </div>
          )}

          {/* Endereços */}
          {hasSection('enderecos') && (
            <div id="enderecos-section" className={enderecosCount === 0 ? 'hidden' : ''}>
              <EnderecosSection cpfId={result.id} onCountChange={setEnderecosCount} />
            </div>
          )}

          {/* Título de Eleitor */}
          {hasSection('titulo_eleitor') && hasTituloEleitor && (
            <Card id="titulo-eleitor-section" className={onlineCardClass(hasTituloEleitor)}>
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="h-5 w-5" />
                    Título de Eleitor
                  </CardTitle>
                  <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">Título de Eleitor</Label>
                    <Input value={result.titulo_eleitor || ''} disabled className="bg-muted uppercase text-[14px]" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Zona</Label>
                    <Input value={result.zona || ''} disabled className="bg-muted text-[14px]" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Seção</Label>
                    <Input value={result.secao || ''} disabled className="bg-muted text-[14px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parentes */}
          {hasSection('parentes') && (
            <div id="parentes-section" className={parentesCount === 0 ? 'hidden' : ''}>
              <ParentesSection cpfId={result.id} onCountChange={setParentesCount} />
            </div>
          )}

          {/* Certidão de Nascimento */}
          {hasSection('certidao') && (
            <div id="certidao-nascimento-section" className={certidaoNascimentoCount === 0 ? 'hidden' : ''}>
              <CertidaoNascimentoSection cpfId={result.id} onCountChange={setCertidaoNascimentoCount} />
            </div>
          )}

          {/* Documento */}
          {hasSection('documento') && (
            <div id="documento-section" className={documentoCount === 0 ? 'hidden' : ''}>
              <DocumentoSection cpfId={result.id} onCountChange={setDocumentoCount} />
            </div>
          )}

          {/* CNS */}
          {hasSection('cns') && (
            <div id="cns-section" className={cnsCount === 0 ? 'hidden' : ''}>
              <CnsSection cpfId={result.id} onCountChange={setCnsCount} />
            </div>
          )}

          {/* PIS */}
          {hasSection('pis') && pisCount > 0 && (
            <div id="pis-section">
              <PisSection pis={result.pis} />
            </div>
          )}

          {/* Vacinas */}
          {hasSection('vacinas') && (
            <div id="vacinas-section" className={vacinasCount === 0 ? 'hidden' : ''}>
              <VacinaDisplay cpfId={result.id} onCountChange={setVacinasCount} />
            </div>
          )}

          {/* Empresas Associadas */}
          {hasSection('empresas_socio') && (
            <div id="empresas-socio-section" className={empresasSocioCount === 0 ? 'hidden' : ''}>
              <EmpresasSocioSection cpfId={result.id} onCountChange={setEmpresasSocioCount} />
            </div>
          )}

          {/* CNPJ MEI */}
          {hasSection('cnpj_mei') && (
            <div id="cnpj-mei-section" className={cnpjMeiCount === 0 ? 'hidden' : ''}>
              <CnpjMeiSection cpfId={result.id} onCountChange={setCnpjMeiCount} />
            </div>
          )}

          {/* Dívidas Ativas */}
          {hasSection('dividas_ativas') && (
            <div id="dividas-ativas-section" className={dividasAtivasCount === 0 ? 'hidden' : ''}>
              <DividasAtivasSection cpf={result.id?.toString() || ''} onCountChange={setDividasAtivasCount} />
            </div>
          )}

          {/* Auxílio Emergencial */}
          {hasSection('auxilio') && (auxiliosEmergenciais?.length ?? 0) > 0 && (
            <div id="auxilio-emergencial-section">
              <AuxilioEmergencialSection auxilios={auxiliosEmergenciais} />
            </div>
          )}

          {/* RAIS */}
          {hasSection('rais') && (rais?.length ?? 0) > 0 && (
            <div id="rais-section">
              <RaisSection data={rais} isLoading={raisLoading} />
            </div>
          )}

          {/* INSS */}
          {hasSection('inss') && (
            <div id="inss-section" className={inssCount === 0 ? 'hidden' : ''}>
              <InssSection cpfId={result.id} onCountChange={setInssCount} />
            </div>
          )}

          {/* Operadoras */}
          {hasSection('operadoras') && (
            <>
              <div id="claro-section" className={claroCount === 0 ? 'hidden' : ''}>
                <ClaroSection cpfId={result.id} onCountChange={setClaroCount} />
              </div>
              <div id="vivo-section" className={vivoCount === 0 ? 'hidden' : ''}>
                <VivoSection cpfId={result.id} onCountChange={setVivoCount} />
              </div>
              <div id="tim-section" className={timCount === 0 ? 'hidden' : ''}>
                <OperadoraTimSection cpfId={result.id} onCountChange={setTimCount} />
              </div>
              <div id="oi-section" className={oiCount === 0 ? 'hidden' : ''}>
                <OperadoraOiSection cpfId={result.id} onCountChange={setOiCount} />
              </div>
            </>
          )}

          {/* Senhas de Email */}
          {hasSection('senhas_email') && (
            <div id="senhas-email-section" className={senhaEmailCount === 0 ? 'hidden' : ''}>
              <SenhaEmailSection cpfId={result.id} onCountChange={setSenhaEmailCount} />
            </div>
          )}

          {/* Senhas de CPF */}
          {hasSection('senhas_cpf') && (
            <div id="senhas-cpf-section" className={senhaCpfCount === 0 ? 'hidden' : ''}>
              <SenhaCpfSection cpfId={result.id} onCountChange={setSenhaCpfCount} />
            </div>
          )}

          {/* Boletim de Ocorrência */}
          {hasSection('bo') && (
            <div id="bo-section" className={boCount === 0 ? 'hidden' : ''}>
              <BoletimOcorrenciaBoSection cpfId={result.id} onCountChange={setBoCount} />
            </div>
          )}

          {/* Gestão Cadastral */}
          {hasSection('gestao') && (
            <div id="gestao-cadastral-section" className={gestaoCount === 0 ? 'hidden' : ''}>
              <GestaoSection cpfId={result.id} onCountChange={setGestaoCount} />
            </div>
          )}
        </div>
      )}

      <ScrollToTop />
    </div>
  );
};

export default ConsultaPersonalizada;
