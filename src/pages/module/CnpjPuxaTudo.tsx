import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, Search, AlertCircle, CheckCircle, Download, Settings, Crown, FileText, 
  Globe, TrendingUp, Award, Shield, Target, AlertTriangle, Info, Copy, DollarSign, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { getPlanType } from '@/utils/planUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { baseCnpjService } from '@/services/baseCnpjService';
import { consultasCnpjService } from '@/services/consultasCnpjService';
import { consultationApiService } from '@/services/consultationApiService';
import { walletApiService } from '@/services/walletApiService';
import { cookieUtils } from '@/utils/cookieUtils';
import PriceDisplay from '@/components/dashboard/PriceDisplay';
import { checkBalanceForModule } from '@/utils/balanceChecker';
import { getModulePrice } from '@/utils/modulePrice';
import { getModulePriceById } from '@/services/moduleService';
import ConsultaHistoryItem from '@/components/consultas/ConsultaHistoryItem';
import ConsultationCard from '@/components/historico/ConsultationCard';
import ConsultationsSection from '@/components/historico/sections/ConsultationsSection';
import { formatBrazilianCurrency, formatDate } from '@/utils/historicoUtils';
import LoadingScreen from '@/components/layout/LoadingScreen';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ElegantPriceCard from '@/components/consultas/ElegantPriceCard';
import ConsultationDetailDialog from '@/components/consultas/ConsultationDetailDialog';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { formatCnpj } from '@/utils/formatters';

interface CNPJResult {
  id?: number;
  cnpj: string;
  razao_social?: string;
  nome_fantasia?: string;
  natureza_juridica?: string;
  capital_social?: number;
  data_inicio?: string;
  porte?: string;
  tipo?: string;
  telefone_1?: string;
  telefone_2?: string;
  email?: string;
  situacao?: string;
  situacao_data?: string;
  situacao_motivo?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  uf?: string;
  municipio?: string;
  mei?: string;
  socios?: any[];
  atividades?: any[];
  created_at?: string;
  updated_at?: string;
}

const CnpjPuxaTudo = () => {
  const navigate = useNavigate();
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CNPJResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<any[]>([]);
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);
  const [recentConsultationsLoading, setRecentConsultationsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [planBalance, setPlanBalance] = useState(0);
  const [modulePrice, setModulePrice] = useState(0);
  const [modulePriceLoading, setModulePriceLoading] = useState(true);
  const [balanceCheckLoading, setBalanceCheckLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    processing: 0,
    today: 0,
    this_month: 0,
    total_cost: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(5);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  const [showInsufficientBalanceDialog, setShowInsufficientBalanceDialog] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(60);
  const isMobile = useIsMobile();
  const resultRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { balance, loadBalance: reloadApiBalance } = useWalletBalance();
  
  const { 
    hasActiveSubscription, 
    subscription, 
    planInfo, 
    discountPercentage,
    calculateDiscountedPrice: calculateSubscriptionDiscount,
    isLoading: subscriptionLoading 
  } = useUserSubscription();

  const userPlan = hasActiveSubscription && subscription 
    ? subscription.plan_name 
    : (user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago");

  const loadRecentConsultations = async () => {
    if (!user) return;
    
    try {
      setRecentConsultationsLoading(true);
      console.log('📋 [RECENT_CONSULTATIONS] Carregando últimas 5 consultas CNPJ...');
      
      const response = await consultationApiService.getConsultationHistory(5, 0);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        const cnpjConsultations = response.data
          .filter(item => item.module_type === 'cnpj')
          .map((consultation: any) => ({
            id: `consultation-${consultation.id}`,
            type: 'consultation',
            module_type: 'cnpj',
            document: consultation.document,
            cost: consultation.cost,
            amount: -Math.abs(consultation.cost),
            status: consultation.status,
            created_at: consultation.created_at,
            updated_at: consultation.updated_at,
            description: `Consulta CNPJ ${formatCnpj(consultation.document)}`,
            result_data: consultation.result_data
          }));
        
        setRecentConsultations(cnpjConsultations);
        console.log('✅ [RECENT_CONSULTATIONS] Últimas consultas carregadas:', cnpjConsultations.length);
      } else {
        console.warn('⚠️ [RECENT_CONSULTATIONS] Nenhuma consulta encontrada');
        setRecentConsultations([]);
      }
    } catch (error) {
      console.error('❌ [RECENT_CONSULTATIONS] Erro ao carregar consultas:', error);
      setRecentConsultations([]);
    } finally {
      setRecentConsultationsLoading(false);
    }
  };

  const planType = getPlanType(userPlan);

  useEffect(() => {
    if (user) {
      loadBalances();
      reloadApiBalance();
      loadModulePrice();
      
      Promise.all([
        loadConsultationHistory(),
        loadRecentConsultations(),
        loadStats()
      ]).then(() => {
        console.log('✅ [INIT] Todos os dados foram carregados');
      }).catch((error) => {
        console.error('❌ [INIT] Erro ao carregar dados:', error);
      });
    }
  }, [user, reloadApiBalance]);

  useEffect(() => {
    if (queryHistory.length > 0 && stats.total === 0) {
      console.log('📊 [STATS] Query history atualizado, recalculando estatísticas...');
      loadStats();
    }
  }, [queryHistory]);

  useEffect(() => {
    const checkPageAccess = async () => {
      if (!user) {
        setBalanceCheckLoading(false);
        return;
      }

      if (modulePriceLoading || !modulePrice) {
        return;
      }

      if (subscriptionLoading) {
        return;
      }

      console.log('🛡️ [BALANCE_GUARD] Verificando acesso à página CNPJ Puxa Tudo');
      
      const originalPrice = modulePrice;
      const finalPrice = hasActiveSubscription && discountPercentage > 0 
        ? calculateSubscriptionDiscount(originalPrice).discountedPrice 
        : originalPrice;
      
      const totalBalance = planBalance + walletBalance;
      
      console.log('🛡️ [BALANCE_GUARD] Dados da verificação:', {
        modulePrice: originalPrice,
        finalPrice,
        totalBalance,
        planBalance,
        walletBalance,
        hasActiveSubscription,
        discountPercentage
      });

      console.log('✅ [BALANCE_GUARD] Acesso liberado - verificação de saldo na consulta');
      setBalanceCheckLoading(false);
    };

    const timer = setTimeout(checkPageAccess, 300);
    return () => clearTimeout(timer);
  }, [
    user, 
    modulePrice, 
    modulePriceLoading, 
    planBalance, 
    walletBalance, 
    hasActiveSubscription, 
    discountPercentage, 
    calculateSubscriptionDiscount,
    subscriptionLoading
  ]);

  useEffect(() => {
    if (balance.saldo !== undefined || balance.saldo_plano !== undefined) {
      loadBalances();
    }
  }, [balance]);

  const loadBalances = () => {
    if (!user) return;
    
    const apiPlanBalance = balance.saldo_plano || 0;
    const apiWalletBalance = balance.saldo || 0;
    
    setPlanBalance(apiPlanBalance);
    setWalletBalance(apiWalletBalance);
    
    console.log('ConsultarCNPJ - Saldos carregados da API:', { 
      plan: apiPlanBalance, 
      wallet: apiWalletBalance, 
      total: apiPlanBalance + apiWalletBalance 
    });
  };

  const loadModulePrice = async () => {
    try {
      setModulePriceLoading(true);
      console.log('💰 Carregando preço do módulo ID 105 via API...');
      
      const price = await getModulePriceById(105);
      
      if (price && price > 0) {
        setModulePrice(price);
        console.log('✅ Preço do módulo ID 105 carregado da API:', price);
      } else {
        console.warn('⚠️ Preço inválido recebido da API, usando fallback');
        const fallbackPrice = getModulePrice('/dashboard/consultar-cnpj');
        setModulePrice(fallbackPrice);
        console.log('⚠️ Usando preço fallback:', fallbackPrice);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar preço do módulo ID 105:', error);
      const fallbackPrice = getModulePrice('/dashboard/consultar-cnpj');
      setModulePrice(fallbackPrice);
      console.log('⚠️ Usando preço fallback devido ao erro:', fallbackPrice);
    } finally {
      setModulePriceLoading(false);
    }
  };

  const loadConsultationHistory = async () => {
    if (!user) return;
    
    try {
      console.log('📋 [CNPJ_HISTORY] Carregando histórico de consultas CNPJ da API externa...');
      
      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('session_token');
      if (!authToken) {
        console.error('❌ [CNPJ_HISTORY] Token de autenticação não encontrado');
        setQueryHistory([]);
        return;
      }

      const response = await consultasCnpjService.getByUserId(parseInt(user.id), 1, 50);

      console.log('📡 [CNPJ_HISTORY] Resposta do serviço:', response);

      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar histórico');
      }

      const data = response;
      console.log('📋 [CNPJ_HISTORY] Dados recebidos da API:', data);
      
      if (data.success && data.data && Array.isArray(data.data)) {
        const consultasFormatted = data.data.map((consulta: any) => {
          const valorCobrado = parseFloat(consulta.valor_cobrado || 0);
          const descontoAplicado = parseFloat(consulta.desconto_aplicado || 0);
          const valorOriginal = valorCobrado + descontoAplicado;
          const descontoPercent = descontoAplicado > 0 ? Math.round((descontoAplicado / valorOriginal) * 100) : 0;

          return {
            date: consulta.created_at,
            document: consulta.cnpj_consultado || 'N/A',
            price: valorCobrado,
            original_price: valorOriginal > valorCobrado ? valorOriginal : undefined,
            discount_percent: descontoPercent,
            status: 'completed',
            success: true,
            saldo_usado: consulta.saldo_usado || 'carteira',
            source_table: 'consultas_cnpj',
            result_data: consulta.resultado ? (typeof consulta.resultado === 'string' ? JSON.parse(consulta.resultado) : consulta.resultado) : null
          };
        });
        
        setQueryHistory(consultasFormatted);
        console.log('✅ [CNPJ_HISTORY] Histórico carregado com sucesso:', consultasFormatted.length, 'consultas');
      } else {
        console.warn('⚠️ [CNPJ_HISTORY] Nenhuma consulta encontrada');
        setQueryHistory([]);
      }
    } catch (error) {
      console.error('❌ [CNPJ_HISTORY] Erro ao carregar histórico:', error);
      setQueryHistory([]);
    }
  };

  const loadStats = async () => {
    if (!user) {
      setStatsLoading(false);
      return;
    }
    
    setStatsLoading(true);
    
    try {
      console.log('📊 [STATS] Carregando estatísticas de consultas CNPJ...');
      
      const response = await consultationApiService.getConsultationHistory(1000, 0);
      
      console.log('📊 [STATS] Resposta da API:', response);
      
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        const cnpjConsultations = response.data.filter((c: any) => c.module_type === 'cnpj');
        
        console.log('📊 [STATS] Consultas CNPJ encontradas:', cnpjConsultations.length);
        
        const todayStr = new Date().toDateString();
        const now = new Date();
        
        const computed = cnpjConsultations.reduce((acc: any, item: any) => {
          acc.total += 1;
          const st = item.status || 'completed';
          if (st === 'completed') acc.completed += 1;
          else if (st === 'failed') acc.failed += 1;
          else if (st === 'processing') acc.processing += 1;
          acc.total_cost += Number(item.cost || 0);
          const d = new Date(item.created_at);
          if (d.toDateString() === todayStr) acc.today += 1;
          if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) acc.this_month += 1;
          return acc;
        }, { total: 0, completed: 0, failed: 0, processing: 0, today: 0, this_month: 0, total_cost: 0 });
        
        console.log('📊 [STATS] Estatísticas calculadas:', computed);
        
        setStats(computed);
        setStatsLoading(false);
        return;
      }
      
      console.warn('⚠️ [STATS] Sem dados da API, usando queryHistory como fallback...');
    } catch (error) {
      console.error('❌ [STATS] Erro ao carregar estatísticas:', error);
    }
    
    try {
      console.log('📊 [STATS] Usando fallback - calculando a partir do histórico local');
      
      if (queryHistory.length === 0) {
        console.log('📊 [STATS] Query history vazio, aguardando 500ms...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const todayStr = new Date().toDateString();
      const now = new Date();
      
      const computed = queryHistory.reduce((acc: any, item: any) => {
        acc.total += 1;
        const st = item.status || 'completed';
        if (st === 'completed') acc.completed += 1;
        else if (st === 'failed') acc.failed += 1;
        else if (st === 'processing') acc.processing += 1;
        acc.total_cost += Number(item.price || 0);
        const d = new Date(item.date);
        if (d.toDateString() === todayStr) acc.today += 1;
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) acc.this_month += 1;
        return acc;
      }, { total: 0, completed: 0, failed: 0, processing: 0, today: 0, this_month: 0, total_cost: 0 });
      
      console.log('📊 [STATS] Estatísticas do fallback:', computed);
      
      setStats(computed);
    } catch (error) {
      console.error('❌ [STATS] Erro no fallback:', error);
      setStats({ total: 0, completed: 0, failed: 0, processing: 0, today: 0, this_month: 0, total_cost: 0 });
    } finally {
      setStatsLoading(false);
    }
  };

  const totalBalance = planBalance + walletBalance;
  const hasSufficientBalance = (amount: number) => {
    return planBalance >= amount || (planBalance + walletBalance) >= amount;
  };

  const validateCNPJ = (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    if (cleanCNPJ.length !== 14) return false;
    
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    
    let size = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, size);
    const digits = cleanCNPJ.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
  };

  const handleSearch = async () => {
    console.log('🚀 [HANDLE_SEARCH] INÍCIO da consulta CNPJ');
    
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (!cleanCnpj || cleanCnpj.length !== 14) {
      console.error('❌ [HANDLE_SEARCH] CNPJ inválido:', cleanCnpj);
      toast.error("Digite um CNPJ válido (14 dígitos)");
      return;
    }

    if (!validateCNPJ(cleanCnpj)) {
      console.error('❌ [HANDLE_SEARCH] CNPJ não passou na validação:', cleanCnpj);
      toast.error("CNPJ Inválido");
      return;
    }

    performSearch(cleanCnpj);
  };

  const performSearch = async (cleanCnpj: string) => {
    console.log('🚀 [PERFORM_SEARCH] Iniciando consulta no banco de dados');

    if (!user) {
      console.error('❌ [HANDLE_SEARCH] Usuário não autenticado');
      toast.error("Usuário não autenticado");
      return;
    }
    
    const sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    if (!sessionToken) {
      console.error('❌ [HANDLE_SEARCH] Token não encontrado');
      toast.error("Token de autenticação não encontrado. Faça login novamente.");
      return;
    }
    
    console.log('✅ [HANDLE_SEARCH] Validações iniciais aprovadas');
    console.log('👤 [HANDLE_SEARCH] Usuário:', { id: user.id, email: user.email });

    setLoading(true);

    try {
      let originalPrice = modulePrice;
      if (originalPrice <= 0) {
        console.log('⏳ Aguardando preço do módulo ser carregado...');
        toast.info('Carregando preço do módulo...', { duration: 2000 });
        return;
      }
      
      console.log('💰 Preço original do módulo ID 84:', originalPrice);
      
      const { discountedPrice: finalPrice, hasDiscount } = hasActiveSubscription 
        ? calculateSubscriptionDiscount(originalPrice)
        : { discountedPrice: originalPrice, hasDiscount: false };
      
      const discount = hasDiscount ? discountPercentage : 0;
      
      console.log('💳 Cálculo de preços:', {
        originalPrice,
        finalPrice,
        discount,
        hasDiscount,
        hasActiveSubscription
      });

      if (!hasSufficientBalance(finalPrice)) {
        const errorMsg = `Saldo insuficiente. Necessário: R$ ${finalPrice.toFixed(2)}, Disponível: R$ ${totalBalance.toFixed(2)}`;
        console.error('❌ [HANDLE_SEARCH] Saldo insuficiente');
        toast.error(errorMsg, {
          description: `Saldo do plano: R$ ${planBalance.toFixed(2)} | Carteira: R$ ${walletBalance.toFixed(2)}`,
          duration: 5000
        });
        setLoading(false);
        return;
      }

      console.log('✅ [HANDLE_SEARCH] Saldo suficiente verificado');
      console.log('🔍 [HANDLE_SEARCH] Consultando CNPJ no banco de dados...');
      
      const searchResult = await baseCnpjService.getByCnpj(cleanCnpj);

      console.log('📊 [CNPJ_CONSULTA] Resultado da busca:', {
        success: searchResult.success,
        hasData: !!searchResult.data
      });

      if (searchResult.success && searchResult.data) {
        console.log('✅ [CNPJ_CONSULTA] CNPJ encontrado:', searchResult.data.razao_social);
        
        let saldoUsado: 'plano' | 'carteira' | 'misto' = 'carteira';
        if (planBalance >= finalPrice) {
          saldoUsado = 'plano';
        } else if (planBalance > 0 && (planBalance + walletBalance) >= finalPrice) {
          saldoUsado = 'misto';
        }
        
        const registroPayload = {
          user_id: parseInt(user.id.toString()),
          module_type: 'cnpj',
          document: cleanCnpj,
          cost: finalPrice,
          status: 'completed',
          result_data: searchResult.data,
          ip_address: window.location.hostname,
          user_agent: navigator.userAgent,
          saldo_usado: saldoUsado,
          metadata: {
            source: 'cnpj-puxa-tudo',
            discount: discount || 0,
            original_price: originalPrice,
            discounted_price: finalPrice,
            final_price: finalPrice,
            subscription_discount: hasDiscount,
            plan_type: userPlan,
            module_id: 84,
            timestamp: new Date().toISOString(),
            saldo_usado: saldoUsado
          }
        };
        
        console.log('📤 [REGISTRO_CONSULTA] Registrando consulta...');
        await consultasCnpjService.create(registroPayload as any);
        
        setResult(searchResult.data);
        
        if (resultRef.current) {
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
        
        await loadBalances();
        await reloadApiBalance();
        await loadConsultationHistory();
        await loadRecentConsultations();
        await loadStats();
        
        toast.success('CNPJ encontrado com sucesso!', { duration: 3000 });
      } else {
        console.log('❌ [CNPJ_CONSULTA] CNPJ não encontrado na base');
        toast.error('CNPJ não encontrado na base de dados');
      }
    } catch (error) {
      console.error('❌ [CNPJ_CONSULTA] Erro na consulta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro na consulta: ${errorMessage}`, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copiado para área de transferência');
  };

  const formatField = (label: string, value: any) => {
    if (!value || value === 'SEM INFORMACAO' || value === 'N/A') return null;
    
    return (
      <div className="mb-3">
        <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input 
            value={value} 
            readOnly 
            className="bg-muted/50"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCopy(value.toString())}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (balanceCheckLoading || modulePriceLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <PageHeaderCard
        title="Consultar CNPJ PUXA TUDO"
        subtitle="Consulte informações completas do CNPJ"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 lg:gap-8 w-full">
        {/* Formulário de Consulta */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 w-full">
          <CardHeader className="pb-4">
            {/* Compact Price Display */}
            <div className="relative bg-gradient-to-br from-purple-50/50 via-white to-blue-50/30 dark:from-gray-800/50 dark:via-gray-800 dark:to-purple-900/20 rounded-lg border border-purple-100/50 dark:border-purple-800/30 shadow-sm transition-all duration-300">
              {/* Badge de desconto centralizado no topo */}
              {hasActiveSubscription && discountPercentage > 0 && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-2.5 py-1 text-xs font-bold shadow-lg">
                    {discountPercentage}% OFF
                  </Badge>
                </div>
              )}
              
              <div className="relative p-3.5 md:p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Nome do plano - Esquerda */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-1 h-10 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                        Plano Ativo
                      </p>
                      <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate">
                        {hasActiveSubscription ? subscription?.plan_name : userPlan}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Preço - Direita */}
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    {hasActiveSubscription && discountPercentage > 0 && (
                      <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 line-through">
                        R$ {modulePrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                      R$ {(hasActiveSubscription 
                        ? calculateSubscriptionDiscount(modulePrice).discountedPrice 
                        : modulePrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ (apenas números)</Label>
              <Input
                id="cnpj"
                placeholder="Digite o CNPJ (14 dígitos)"
                value={cnpj}
                onChange={(e) => {
                  const formatted = formatCnpj(e.target.value);
                  setCnpj(formatted);
                }}
                onKeyPress={(e) => {
                  const cleanCnpj = cnpj.replace(/\D/g, '');
                  if (e.key === 'Enter' && cleanCnpj.length === 14 && !loading && hasSufficientBalance(hasActiveSubscription 
                    ? calculateSubscriptionDiscount(modulePrice).discountedPrice 
                    : modulePrice) && !modulePriceLoading) {
                    handleSearch();
                  }
                }}
                maxLength={18}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSearch}
                disabled={loading || !cnpj || cnpj.replace(/\D/g, '').length !== 14 || !hasSufficientBalance(hasActiveSubscription 
                  ? calculateSubscriptionDiscount(modulePrice).discountedPrice 
                  : modulePrice) || modulePriceLoading}
                className="w-full bg-brand-purple hover:bg-brand-darkPurple"
              >
                <Search className="mr-2 h-4 w-4" />
                {loading ? "Consultando..." : modulePriceLoading ? "Carregando preço..." : `Consultar CNPJ (R$ ${(hasActiveSubscription 
                  ? calculateSubscriptionDiscount(modulePrice).discountedPrice 
                  : modulePrice).toFixed(2)})`}
              </Button>
            </div>

            {/* Indicador de saldo insuficiente */}
            {!hasSufficientBalance(hasActiveSubscription 
              ? calculateSubscriptionDiscount(modulePrice).discountedPrice 
              : modulePrice) && cnpj.replace(/\D/g, '').length === 14 && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-3">
                <div className="flex items-start text-red-700 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm block break-words">
                      Saldo insuficiente. Necessário: R$ {(hasActiveSubscription 
                        ? calculateSubscriptionDiscount(modulePrice).discountedPrice 
                        : modulePrice).toFixed(2)}
                    </span>
                    <span className="text-xs sm:text-sm block break-words">
                      Disponível: R$ {totalBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-red-600 dark:text-red-400 break-words">
                  Saldo do plano: R$ {planBalance.toFixed(2)} | Saldo da carteira: R$ {walletBalance.toFixed(2)}
                </div>
                <Button
                  onClick={() => navigate('/dashboard/historico')}
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <FileText className="mr-2 h-3 w-3" />
                  Ver Histórico de Consultas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Últimas Consultas CNPJ */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 w-full">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className={`flex items-center ${isMobile ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'}`}>
              <FileText className={`mr-2 flex-shrink-0 ${isMobile ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
              <span className="truncate">Últimas Consultas</span>
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs sm:text-sm flex-shrink-0">
              {recentConsultations.length} Recentes
            </Badge>
          </div>
          <CardDescription className={`break-words ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            5 Últimas consultas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentConsultationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando consultas...</span>
            </div>
          ) : recentConsultations.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40">CNPJ</TableHead>
                      <TableHead className="w-48">Data e Hora</TableHead>
                      <TableHead className="w-24 text-right">Valor</TableHead>
                      <TableHead className="w-24 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentConsultations.map((consultation) => {
                      const formatFullDate = (dateString: string) => {
                        const date = new Date(dateString);
                        return date.toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        });
                      };

                      const consultationValue = consultation.cost || consultation.amount || 0;
                      const numericValue = typeof consultationValue === 'string' 
                        ? parseFloat(consultationValue.toString().replace(',', '.')) 
                        : Number(consultationValue) || 0;

                      return (
                        <TableRow 
                          key={consultation.id} 
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => {
                            // Exibir consulta na mesma tela sem cobrar novamente
                            if (consultation.result_data) {
                              setResult(consultation.result_data);
                              setCnpj(consultation.document);
                              setLoading(false);
                              
                              // Scroll suave para a seção de resultados
                              setTimeout(() => {
                                resultRef.current?.scrollIntoView({ 
                                  behavior: 'smooth', 
                                  block: 'start' 
                                });
                              }, 100);
                              
                              toast.success('Consulta carregada do histórico (sem cobrança)', { duration: 2000 });
                            } else {
                              toast.error('Dados da consulta não disponíveis');
                            }
                          }}
                        >
                          <TableCell className="font-mono text-sm">
                            {formatCnpj(consultation.document || '')}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatFullDate(consultation.created_at)}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium text-red-600 dark:text-red-400">
                            R$ {Math.abs(numericValue).toFixed(2).replace('.', ',')}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant="outline" 
                              className={
                                consultation.status === 'completed' 
                                  ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400' 
                                  : consultation.status === 'failed'
                                  ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400'
                                  : 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400'
                              }
                            >
                              {consultation.status === 'completed' ? 'Concluída' : 
                               consultation.status === 'failed' ? 'Falhou' : 'Processando'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {recentConsultations.map((consultation) => {
                  const formatShortDate = (dateString: string) => {
                    const date = new Date(dateString);
                    return date.toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  };

                  const consultationValue = consultation.cost || consultation.amount || 0;
                  const numericValue = typeof consultationValue === 'string' 
                    ? parseFloat(consultationValue.toString().replace(',', '.')) 
                    : Number(consultationValue) || 0;

                  return (
                    <Card 
                      key={consultation.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        // Exibir consulta na mesma tela sem cobrar novamente
                        if (consultation.result_data) {
                          setResult(consultation.result_data);
                          setCnpj(consultation.document);
                          setLoading(false);
                          
                          // Scroll suave para a seção de resultados
                          setTimeout(() => {
                            resultRef.current?.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'start' 
                            });
                          }, 100);
                          
                          toast.success('Consulta carregada do histórico (sem cobrança)', { duration: 2000 });
                        } else {
                          toast.error('Dados da consulta não disponíveis');
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-muted-foreground mb-1">CNPJ</div>
                            <div className="font-mono text-sm font-medium truncate">
                              {formatCnpj(consultation.document || '')}
                            </div>
                          </div>
                          <Badge 
                            variant="outline"
                            className={
                              consultation.status === 'completed' 
                                ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 text-xs flex-shrink-0 ml-2' 
                                : consultation.status === 'failed'
                                ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 text-xs flex-shrink-0 ml-2'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs flex-shrink-0 ml-2'
                            }
                          >
                            {consultation.status === 'completed' ? 'OK' : 
                             consultation.status === 'failed' ? 'Falhou' : 'Processando'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                          <span className="truncate">{formatShortDate(consultation.created_at)}</span>
                          <span className="font-semibold text-red-600 dark:text-red-400 flex-shrink-0">
                            R$ {Math.abs(numericValue).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma consulta recente encontrada</p>
              <p className="text-xs mt-1">Faça sua primeira consulta CNPJ acima</p>
            </div>
          )}
          
          {recentConsultations.length > 0 && (
            <div className="text-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "sm"}
                onClick={() => navigate('/dashboard/historico')}
                className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <FileText className={`mr-2 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span className={isMobile ? 'text-xs' : 'text-sm'}>
                  Ver Histórico Completo
                </span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Consultas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary truncate">
                {statsLoading ? '...' : stats.today}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">Consultas Hoje</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary truncate">
                {statsLoading ? '...' : stats.total}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">Total de Consultas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-green-600 truncate">
                {statsLoading ? '...' : stats.completed}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary truncate">
                R$ {statsLoading ? '0,00' : stats.total_cost.toFixed(2)}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">Total Gasto</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultado da Consulta */}
      {result && (
        <div ref={resultRef} className="w-full max-w-full overflow-hidden">
          <Card className="border-green-200 dark:border-green-800 w-full">
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    CNPJ Encontrado
                  </CardTitle>
                  <CardDescription className="mt-2">
                    CNPJ: {formatCnpj(result.cnpj)}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700">
                  Encontrado
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-4 md:p-6">
              {/* Dados da Empresa */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2 flex-wrap">
                  <Building2 className="h-5 w-5 flex-shrink-0" />
                  Dados da Empresa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {formatField('CNPJ', formatCnpj(result.cnpj))}
                  {formatField('Razão Social', result.razao_social)}
                  {formatField('Nome Fantasia', result.nome_fantasia)}
                  {formatField('Natureza Jurídica', result.natureza_juridica)}
                  {formatField('Capital Social', result.capital_social ? `R$ ${result.capital_social.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : null)}
                  {formatField('Data de Início', result.data_inicio)}
                  {formatField('Porte', result.porte)}
                  {formatField('Tipo', result.tipo)}
                  {formatField('MEI', result.mei)}
                </div>
              </div>

              {/* Contato */}
              {(result.telefone_1 || result.telefone_2 || result.email) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2 flex-wrap">
                    <Globe className="h-5 w-5 flex-shrink-0" />
                    Contato
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {formatField('Telefone 1', result.telefone_1)}
                    {formatField('Telefone 2', result.telefone_2)}
                    {formatField('E-mail', result.email)}
                  </div>
                </div>
              )}

              {/* Situação Cadastral */}
              {(result.situacao || result.situacao_data || result.situacao_motivo) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2 flex-wrap">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    Situação Cadastral
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {formatField('Situação', result.situacao)}
                    {formatField('Data da Situação', result.situacao_data)}
                    {formatField('Motivo', result.situacao_motivo)}
                  </div>
                </div>
              )}

              {/* Endereço */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2 flex-wrap">
                  <Target className="h-5 w-5 flex-shrink-0" />
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {formatField('Logradouro', result.logradouro)}
                  {formatField('Número', result.numero)}
                  {formatField('Complemento', result.complemento)}
                  {formatField('Bairro', result.bairro)}
                  {formatField('CEP', result.cep)}
                  {formatField('UF', result.uf)}
                  {formatField('Município', result.municipio)}
                </div>
              </div>

              {/* Sócios */}
              {result.socios && result.socios.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2 flex-wrap">
                    <Users className="h-5 w-5 flex-shrink-0" />
                    Sócios ({result.socios.length})
                  </h3>
                  <div className="space-y-4 w-full">
                    {result.socios.map((socio: any, index: number) => (
                      <Card key={index} className="p-4 bg-muted/50 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                          {formatField('Nome', socio.nome)}
                          {formatField('CPF/CNPJ', socio.cpf_cnpj)}
                          {formatField('Data de Entrada', socio.data_entrada)}
                          {formatField('Qualificação', socio.qualificacao)}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog de Detalhes */}
      <ConsultationDetailDialog
        open={consultationDialogOpen}
        onOpenChange={setConsultationDialogOpen}
        consultation={selectedConsultation}
      />
    </div>
  );
};

export default CnpjPuxaTudo;
