import React, { useMemo, useState, useEffect, useCallback } from 'react';
import PhotoEditorModal from '@/components/cpf/PhotoEditorModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { FileText, QrCode, Loader2, AlertCircle, CheckCircle, User, Calendar, CreditCard, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useApiModules } from '@/hooks/useApiModules';
import { useIsMobile } from '@/hooks/use-mobile';
import { getModulePrice } from '@/utils/modulePrice';
import { consultationApiService } from '@/services/consultationApiService';
import { moduleHistoryService } from '@/services/moduleHistoryService';
import { walletApiService } from '@/services/walletApiService';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';
import LoadingScreen from '@/components/layout/LoadingScreen';
import ScrollToTop from '@/components/ui/scroll-to-top';

// URL base do backend PHP
const PHP_API_BASE = 'https://qr.apipainel.com.br/qrcode';
const PHP_VALIDATION_BASE = 'https://qr.apipainel.com.br/qrvalidation';

interface FormData {
  nome: string;
  dataNascimento: string;
  numeroDocumento: string;
  pai: string;
  mae: string;
  foto: File | null;
}

interface RegistroData {
  id: number;
  token: string;
  full_name: string;
  birth_date: string;
  document_number: string;
  parent1: string;
  parent2: string;
  photo_path: string;
  validation: 'pending' | 'verified';
  expiry_date: string;
  is_expired: boolean;
  qr_code_path: string;
  id_user: string | null;
  created_at: string;
}

const QRCodeRg6m = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modules } = useApiModules();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    dataNascimento: '',
    numeroDocumento: '',
    pai: '',
    mae: '',
    foto: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Modal de confirmação
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);

  // Balance & pricing state
  const [walletBalance, setWalletBalance] = useState(0);
  const [planBalance, setPlanBalance] = useState(0);
  const [modulePrice, setModulePrice] = useState(0);
  const [modulePriceLoading, setModulePriceLoading] = useState(true);
  const [balanceCheckLoading, setBalanceCheckLoading] = useState(true);

  // Recent registrations & stats (do banco PHP)
  const [recentRegistrations, setRecentRegistrations] = useState<RegistroData[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    today: 0,
    this_month: 0,
    total_cost: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [costMap, setCostMap] = useState<Record<string, number>>({});

  // Hooks para saldo
  const { balance, loadBalance: reloadApiBalance } = useWalletBalance();
  const { 
    hasActiveSubscription, 
    subscription, 
    discountPercentage,
    calculateDiscountedPrice: calculateSubscriptionDiscount,
    isLoading: subscriptionLoading 
  } = useUserSubscription();

  const currentModule = useMemo(() => {
    const normalizeModuleRoute = (module: any): string => {
      const raw = (module?.api_endpoint || module?.path || '').toString().trim();
      if (!raw) return '';
      if (raw.startsWith('/')) return raw;
      if (raw.startsWith('dashboard/')) return `/${raw}`;
      if (!raw.includes('/')) return `/dashboard/${raw}`;
      return raw;
    };

    const pathname = (location?.pathname || '').trim();
    if (!pathname) return null;

    return (modules || []).find((m: any) => normalizeModuleRoute(m) === pathname) || null;
  }, [modules, location?.pathname]);

  const userPlan = hasActiveSubscription && subscription 
    ? subscription.plan_name 
    : (user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago");

  const totalBalance = planBalance + walletBalance;
  const hasSufficientBalance = (price: number) => totalBalance >= price;

  // Carregar preço do módulo
  const loadModulePrice = useCallback(() => {
    setModulePriceLoading(true);

    const rawPrice = currentModule?.price;
    const price = Number(rawPrice ?? 0);

    if (price && price > 0) {
      setModulePrice(price);
      setModulePriceLoading(false);
      return;
    }

    const fallbackPrice = getModulePrice(location.pathname || '/dashboard/qrcode-rg-6m');
    setModulePrice(fallbackPrice);
    setModulePriceLoading(false);
  }, [currentModule, location.pathname]);

  // Carregar saldos
  const loadBalances = useCallback(() => {
    if (!user) return;
    
    const apiPlanBalance = balance.saldo_plano || 0;
    const apiWalletBalance = balance.saldo || 0;
    
    setPlanBalance(apiPlanBalance);
    setWalletBalance(apiWalletBalance);
  }, [user, balance]);

  // Carregar últimos cadastros do banco PHP
  const loadRecentRegistrations = useCallback(async () => {
    try {
      setRecentLoading(true);
      
      const userId = user?.id || '';
      const response = await fetch(`${PHP_API_BASE}/list_users.php?limit=100&offset=0&id_user=${encodeURIComponent(userId)}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Filtrar apenas cadastros do módulo QR Code RG 6M
        const filtered = data.data.filter((item: any) => {
          // Se tem module_source, usar diretamente
          if (item.module_source) return item.module_source === 'qrcode-rg-6m';
          // Fallback: filtrar por duração da validade (>135 dias = 6M)
          const created = new Date(item.created_at).getTime();
          const expiry = new Date(item.expiry_date).getTime();
          const diffDays = (expiry - created) / (1000 * 60 * 60 * 24);
          return diffDays > 135;
        });
        setRecentRegistrations(filtered);
        // Calcular estatísticas
        const todayStr = new Date().toDateString();
        const now = new Date();
        
        const computed = filtered.reduce((acc: any, item: RegistroData) => {
          acc.total += 1;
          if (item.validation === 'verified') acc.completed += 1;
          else acc.pending += 1;
          
          const d = new Date(item.created_at);
          if (d.toDateString() === todayStr) acc.today += 1;
          if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) acc.this_month += 1;
          
          return acc;
        }, { total: 0, completed: 0, pending: 0, today: 0, this_month: 0, total_cost: 0 });
        
        setStats(computed);
      } else {
        setRecentRegistrations([]);
      }
    } catch (error) {
      console.error('Erro ao carregar cadastros do PHP:', error);
      setRecentRegistrations([]);
    } finally {
      setRecentLoading(false);
      setStatsLoading(false);
    }
  }, [user]);

  // Atualizar saldos quando o saldo da API mudar
  useEffect(() => {
    if (balance.saldo !== undefined || balance.saldo_plano !== undefined) {
      loadBalances();
    }
  }, [balance, loadBalances]);

  // Carregar dados iniciais apenas uma vez quando o user estiver disponível
  useEffect(() => {
    if (user) {
      reloadApiBalance();
      loadRecentRegistrations();
      // Carregar custos reais das consultas via módulo history + wallet transactions
      const loadCosts = async () => {
        try {
          // Tentar via module history (consultations table)
          const historyResponse = await moduleHistoryService.getHistory('/dashboard/qrcode-rg-6m', 100, 0);
          const map: Record<string, number> = {};
          
          if (historyResponse.success && historyResponse.data?.data) {
            historyResponse.data.data.forEach((item: any) => {
              if (item.document && item.cost) {
                map[item.document] = item.cost;
              }
            });
          }
          
          // Complementar com wallet transactions (mais confiável)
          const txResponse = await walletApiService.getTransactionHistory(parseInt(user.id), 200);
          if (txResponse.success && txResponse.data) {
            const transactions = Array.isArray(txResponse.data) ? txResponse.data : [];
            transactions.forEach((tx: any) => {
              // Buscar transações de consulta QR Code RG
              if (tx.description && tx.description.includes('Cadastro QR Code RG') && tx.amount < 0) {
                // Extrair nome da descrição: "Cadastro QR Code RG - NOME"
                const nameMatch = tx.description.match(/Cadastro QR Code RG[^-]*-\s*(.+?)(?:\s*\(|$)/);
                if (nameMatch) {
                  const nome = nameMatch[1].trim();
                  // Não sobrescrever se já temos do module history
                  if (!map[nome]) {
                    map[`__name__${nome}`] = Math.abs(tx.amount);
                  }
                }
              }
            });
          }
          
          setCostMap(map);
        } catch (e) {
          console.error('Erro ao carregar custos:', e);
        }
      };
      loadCosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadModulePrice();
  }, [user, loadModulePrice]);

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
      setBalanceCheckLoading(false);
    };
    checkPageAccess();
  }, [user, modulePriceLoading, modulePrice, subscriptionLoading]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    // CPF field: numbers only
    if (field === 'numeroDocumento') {
      value = value.replace(/\D/g, '');
    }
    // Text fields: force uppercase
    if (field === 'nome' || field === 'pai' || field === 'mae') {
      value = value.toUpperCase();
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Foto muito grande (máximo 10MB)');
        return;
      }
      
      // Validar tipo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Formato inválido. Use apenas JPG, PNG ou GIF');
        return;
      }
      
      setFormData(prev => ({ ...prev, foto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Abrir modal de confirmação
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error('Nome Completo é obrigatório');
      return;
    }
    if (!formData.dataNascimento) {
      toast.error('Data de Nascimento é obrigatória');
      return;
    }
    if (!formData.numeroDocumento.trim()) {
      toast.error('Número de Documento é obrigatório');
      return;
    }
    if (!formData.mae.trim()) {
      toast.error('Nome da Mãe é obrigatório');
      return;
    }
    if (!formData.foto) {
      toast.error('Foto é obrigatória');
      return;
    }

    if (!hasSufficientBalance(finalPrice)) {
      toast.error('Saldo insuficiente para realizar o cadastro');
      return;
    }

    setShowConfirmModal(true);
  };

  // Confirmar e enviar cadastro
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 1. Enviar para o backend PHP
      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.nome.toUpperCase().trim());
      formDataToSend.append('birth_date', formData.dataNascimento);
      formDataToSend.append('document_number', formData.numeroDocumento.trim());
      formDataToSend.append('parent1', formData.pai.toUpperCase().trim());
      formDataToSend.append('parent2', formData.mae.toUpperCase().trim());
      
      if (user?.id) {
        formDataToSend.append('id_user', user.id);
      }

      // Data de validade = 6 meses a partir de hoje
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6);
      const formattedExpiry = expiryDate.toISOString().split('T')[0]; // YYYY-MM-DD
      formDataToSend.append('expiry_date', formattedExpiry);
      formDataToSend.append('module_source', 'qrcode-rg-6m');
      
      if (formData.foto) {
        formDataToSend.append('photo', formData.foto);
      }

      console.log('📤 Enviando cadastro para:', `${PHP_VALIDATION_BASE}/register.php`);

      let response: Response;
      try {
        response = await fetch(`${PHP_VALIDATION_BASE}/register.php`, {
          method: 'POST',
          body: formDataToSend,
          redirect: 'manual'
        });
      } catch (networkError) {
        console.error('❌ Erro de rede (CORS ou servidor indisponível):', networkError);
        throw new Error('Erro de conexão com o servidor. Verifique se o servidor está online e com CORS habilitado.');
      }

      console.log('📊 Response type:', response.type, 'status:', response.status);

      // O register.php pode retornar JSON ou fazer redirect (302)
      let result: any = { success: false };
      
      if (response.type === 'opaqueredirect' || response.status === 0 || response.status === 302) {
        result = { success: true, data: { token: '', document_number: formData.numeroDocumento } };
      } else if (response.ok) {
        const text = await response.text();
        console.log('📄 Response body preview:', text.substring(0, 200));
        
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          try {
            result = JSON.parse(text);
          } catch {
            result = { success: true, data: { token: '', document_number: formData.numeroDocumento } };
          }
        } else {
          // Resposta não-JSON mas OK = provavelmente sucesso (HTML redirect etc)
          result = { success: true, data: { token: '', document_number: formData.numeroDocumento } };
        }
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('❌ Erro HTTP:', response.status, errorText.substring(0, 300));
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Erro ${response.status} ao cadastrar`);
        } catch (e: any) {
          if (e.message?.includes('Erro')) throw e;
          throw new Error(`Erro ${response.status} ao cadastrar`);
        }
      }

      if (!result.success) {
        throw new Error(result.error || 'Erro ao cadastrar');
      }

      // 2. Cobrar do saldo via API de carteira - TRANSAÇÃO ÚNICA
      try {
        // Determinar tipo de saldo usado
        let saldoUsado: 'plano' | 'carteira' | 'misto' = 'carteira';
        
        if (planBalance >= finalPrice) {
          // Plano cobre tudo - transação única do plano
          saldoUsado = 'plano';
          await walletApiService.addBalance(0, -finalPrice, `Cadastro QR Code RG - ${formData.nome}`, 'consulta', undefined, 'plan');
        } else if (planBalance > 0 && (planBalance + walletBalance) >= finalPrice) {
          // Saldo misto - primeiro esgota o plano, depois completa com carteira
          saldoUsado = 'misto';
          const restanteDaCarteira = finalPrice - planBalance;
          await walletApiService.addBalance(0, -planBalance, `Cadastro QR Code RG - ${formData.nome} (saldo plano)`, 'consulta', undefined, 'plan');
          await walletApiService.addBalance(0, -restanteDaCarteira, `Cadastro QR Code RG - ${formData.nome} (saldo carteira)`, 'consulta', undefined, 'main');
        } else {
          // Só carteira - transação única da carteira
          await walletApiService.addBalance(0, -finalPrice, `Cadastro QR Code RG - ${formData.nome}`, 'consulta', undefined, 'main');
        }

        const moduleId = currentModule?.panel_id || currentModule?.id || 0;

        // Registrar no histórico de consultas
        await consultationApiService.recordConsultation({
          document: formData.numeroDocumento,
          status: 'completed',
          cost: finalPrice,
          result_data: result.data,
          saldo_usado: saldoUsado,
          module_id: moduleId,
          metadata: {
            page_route: location.pathname,
            module_name: currentModule?.title || 'QR Code RG 6M',
            module_id: moduleId,
            token: result.data.token,
            saldo_usado: saldoUsado,
            source: 'qrcode-rg-6m',
            timestamp: new Date().toISOString()
          }
        });

        // Deduzir saldo localmente para feedback imediato
        if (saldoUsado === 'plano') {
          setPlanBalance(prev => Math.max(0, prev - finalPrice));
        } else if (saldoUsado === 'misto') {
          const restante = finalPrice - planBalance;
          setPlanBalance(0);
          setWalletBalance(prev => Math.max(0, prev - restante));
        } else {
          setWalletBalance(prev => Math.max(0, prev - finalPrice));
        }

        // Atualizar saldo da API
        await reloadApiBalance();
        
        // Disparar evento para atualizar saldo na UI (sidebar, header, etc)
        window.dispatchEvent(new CustomEvent('balanceRechargeUpdated', { 
          detail: { userId: user?.id, shouldAnimate: true, amount: finalPrice, method: 'api' }
        }));
      } catch (balanceError) {
        console.error('Erro ao registrar cobrança:', balanceError);
        toast.error('Cadastro realizado, mas houve erro ao cobrar o saldo. Contate o suporte.');
      }

      // 3. Limpar formulário e fechar modal
      setShowConfirmModal(false);
      handleReset();
      
      // 4. Recarregar lista
      await loadRecentRegistrations();

      toast.success('Cadastro realizado com sucesso!', {
        description: `QR Code gerado para ${formData.nome}`
      });

    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      toast.error(error.message || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nome: '',
      dataNascimento: '',
      numeroDocumento: '',
      pai: '',
      mae: '',
      foto: null
    });
    setPreviewUrl(null);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/dashboard');
  };

  // Calcular preço com desconto
  const originalPrice = modulePrice > 0 ? modulePrice : 0;
  const { discountedPrice: finalPrice, hasDiscount } = hasActiveSubscription && originalPrice > 0
    ? calculateSubscriptionDiscount(originalPrice)
    : { discountedPrice: originalPrice, hasDiscount: false };
  const discount = hasDiscount ? discountPercentage : 0;

  if (balanceCheckLoading || modulePriceLoading) {
    return (
      <LoadingScreen 
        message="Verificando acesso ao módulo..." 
        variant="dashboard" 
      />
    );
  }

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      <div className="w-full">
        <SimpleTitleBar
          title="QR Code RG 6M"
          subtitle="Cadastre e gere QR Codes de documentos"
          onBack={handleBack}
        />

        <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 md:gap-6 lg:gap-8">
          {/* Formulário de Cadastro */}
          <Card className="dark:bg-gray-800 dark:border-gray-700 w-full">
            <CardHeader className="pb-4">
              {/* Compact Price Display */}
              <div className="relative bg-gradient-to-br from-purple-50/50 via-white to-blue-50/30 dark:from-gray-800/50 dark:via-gray-800 dark:to-purple-900/20 rounded-lg border border-purple-100/50 dark:border-purple-800/30 shadow-sm transition-all duration-300">
                {hasDiscount && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-2.5 py-1 text-xs font-bold shadow-lg">
                      {discount}% OFF
                    </Badge>
                  </div>
                )}
                
                <div className="relative p-3.5 md:p-4">
                  <div className="flex items-center justify-between gap-4">
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
                    
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      {hasDiscount && (
                        <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 line-through">
                          R$ {originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                        R$ {finalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleOpenConfirmModal} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Nome completo"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    required
                    className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroDocumento">Número de Documento (CPF) *</Label>
                  <Input
                    id="numeroDocumento"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={11}
                    placeholder="CPF (somente números)"
                    value={formData.numeroDocumento}
                    onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                    required
                    className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pai">Nome do Pai</Label>
                  <Input
                    id="pai"
                    type="text"
                    placeholder="Nome do pai (opcional)"
                    value={formData.pai}
                    onChange={(e) => handleInputChange('pai', e.target.value)}
                    className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mae">Nome da Mãe *</Label>
                  <Input
                    id="mae"
                    type="text"
                    placeholder="Nome da mãe"
                    value={formData.mae}
                    onChange={(e) => handleInputChange('mae', e.target.value)}
                    required
                    className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foto">Foto 3x4 *</Label>
                  <Input
                    id="foto"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    required
                  />
                  {previewUrl && (
                    <div className="mt-2 flex items-end gap-3">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowPhotoEditor(true)}
                      >
                        Editar Foto
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.nome || !formData.dataNascimento || !formData.numeroDocumento || !formData.mae || !formData.foto || !hasSufficientBalance(finalPrice) || modulePriceLoading}
                    className="w-full bg-brand-purple hover:bg-brand-darkPurple"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <QrCode className="mr-2 h-4 w-4" />
                        {modulePriceLoading ? "Carregando preço..." : `Cadastrar (R$ ${finalPrice.toFixed(2)})`}
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Indicador de saldo insuficiente */}
              {!hasSufficientBalance(finalPrice) && formData.nome && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-3">
                  <div className="flex items-start text-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs sm:text-sm block break-words">
                        Saldo insuficiente. Necessário: R$ {finalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs sm:text-sm block break-words">
                        Disponível: R$ {totalBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 break-words">
                    Saldo do plano: R$ {planBalance.toFixed(2)} | Saldo da carteira: R$ {walletBalance.toFixed(2)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meus Cadastros - ao lado do formulário em desktop/tablet */}
          <div className="w-full space-y-2">
            <h3 className={`flex items-center font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
              <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
              Meus Cadastros
            </h3>
            {recentLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : recentRegistrations.length > 0 ? (
              <div className="space-y-2">
                {recentRegistrations.slice(0, 5).map((registration) => {
                  const daysLeft = Math.ceil((new Date(registration.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div
                      key={registration.id}
                      className="rounded-lg border border-border bg-muted p-2.5 sm:p-3"
                    >
                      <div className="flex gap-2.5">
                        {/* Foto + QR */}
                        <div className="flex gap-2 flex-shrink-0">
                          {registration.photo_path ? (
                            <img
                              src={`https://qr.apipainel.com.br/qrvalidation/${registration.photo_path}`}
                              alt="Foto"
                              className="object-cover rounded-lg border w-16 h-20 sm:w-20 sm:h-24"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-16 h-20 sm:w-20 sm:h-24 bg-muted rounded-lg flex items-center justify-center border">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <img
                            src={registration.qr_code_path
                              ? `https://qr.apipainel.com.br/qrvalidation/${registration.qr_code_path}`
                              : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://qr.apipainel.com.br/qrvalidation/?token=${registration.token}&ref=${registration.token}&cod=${registration.token}`)}`
                            }
                            alt="QR Code"
                            className="border w-20 h-20 sm:w-24 sm:h-24"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>

                        {/* Dados compactos */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold truncate">{registration.full_name}</p>
                          <p className="text-[11px] sm:text-xs text-foreground font-mono">{registration.document_number}</p>
                          <p className="text-[11px] sm:text-xs text-foreground">Nasc. {formatDate(registration.birth_date)}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[11px] font-medium ${daysLeft > 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                              {daysLeft > 0 ? `${daysLeft} dias` : 'Expirado'}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1 py-0 ${
                                registration.is_expired
                                  ? 'border-destructive/50 text-destructive bg-destructive/10'
                                  : registration.validation === 'verified'
                                  ? 'border-emerald-500/50 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400'
                                  : 'border-amber-500/50 text-amber-600 bg-amber-500/10 dark:text-amber-400'
                              }`}
                            >
                              {registration.is_expired ? 'Expirado' : registration.validation === 'verified' ? 'Verificado' : 'Pendente'}
                            </Badge>
                          </div>
                        </div>

                        {/* Delete button */}
                        <div className="flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              toast.info('Use o Gerenciamento Total para excluir cadastros');
                              navigate('/dashboard/qrcode-rg-6m/todos');
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Ver Histórico Completo */}
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary hover:bg-muted"
                    onClick={() => navigate('/dashboard/qrcode-rg-6m/todos')}
                  >
                    <FileText className={`mr-2 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span className={isMobile ? 'text-xs' : 'text-sm'}>Ver Histórico Completo</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhum cadastro encontrado</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal de Confirmação */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Confirmar Cadastro
            </DialogTitle>
            <DialogDescription>
              Verifique os dados antes de confirmar. Será cobrado <strong>R$ {finalPrice.toFixed(2)}</strong> do seu saldo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            {/* Preview da foto */}
            {previewUrl && (
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt="Foto"
                  className="w-20 h-26 object-cover rounded-lg border-2 border-purple-200 shadow-md"
                />
              </div>
            )}
            
            {/* Dados do cadastro */}
            <div className="space-y-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Nome Completo</p>
                  <p className="font-medium text-sm">{formData.nome.toUpperCase()}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                  <p className="font-medium text-sm">{formatDate(formData.dataNascimento)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Documento (CPF)</p>
                  <p className="font-medium text-sm font-mono">{formData.numeroDocumento}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Filiação</p>
                  <p className="font-medium text-sm">
                    {formData.pai ? formData.pai.toUpperCase() : '—'}
                  </p>
                  <p className="font-medium text-sm">{formData.mae.toUpperCase()}</p>
                </div>
              </div>
            </div>
            
            {/* Valor a ser cobrado */}
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <span className="text-sm font-medium">Valor do cadastro:</span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                R$ {finalPrice.toFixed(2)}
              </span>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="bg-brand-purple hover:bg-brand-darkPurple"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Cadastro
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Histórico de Cadastros - estilo CPF Simples */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className={`flex items-center ${isMobile ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'}`}>
              <FileText className={`mr-2 flex-shrink-0 ${isMobile ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
              <span>Histórico de Cadastros</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Lista de histórico primeiro */}
          {recentLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="ml-3 text-muted-foreground">Carregando histórico...</span>
            </div>
          ) : recentRegistrations.length > 0 ? (
            <>
              {isMobile ? (
                <div className="space-y-2">
                  {recentRegistrations.slice(0, 10).map((registration) => (
                    <button
                      key={registration.id}
                      type="button"
                      onClick={() => window.open(`https://qr.apipainel.com.br/qrvalidation/?token=${registration.token}&ref=${registration.token}&cod=${registration.token}`, '_blank')}
                      className="w-full text-left rounded-md border border-border bg-card px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-mono text-xs break-words">
                            {registration.document_number}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            QR CODE RG 6M
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {formatFullDate(registration.created_at)}
                          </div>
                        </div>
                        <span
                          className={
                            registration.validation === 'verified'
                              ? 'mt-0.5 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-green-500'
                              : 'mt-0.5 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-muted-foreground'
                          }
                          title={registration.validation === 'verified' ? 'Concluída' : 'Pendente'}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40 whitespace-nowrap">Documento</TableHead>
                      <TableHead className="min-w-[180px] whitespace-nowrap">Módulo</TableHead>
                      <TableHead className="min-w-[180px] whitespace-nowrap">Data e Hora</TableHead>
                      <TableHead className="w-28 text-right whitespace-nowrap">Valor</TableHead>
                      <TableHead className="w-28 text-center whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRegistrations.slice(0, 10).map((registration) => (
                      <TableRow 
                        key={registration.id} 
                        className="cursor-pointer"
                        onClick={() => window.open(`https://qr.apipainel.com.br/qrvalidation/?token=${registration.token}&ref=${registration.token}&cod=${registration.token}`, '_blank')}
                      >
                        <TableCell className="font-mono text-xs sm:text-sm whitespace-nowrap">
                          {registration.document_number}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                          QR CODE RG 6M
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                          {formatFullDate(registration.created_at)}
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm font-medium text-destructive whitespace-nowrap">
                          R$ {(costMap[registration.document_number] ?? costMap[`__name__${registration.full_name}`] ?? finalPrice).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="text-xs rounded-full bg-foreground text-background hover:bg-foreground/90">
                            {registration.validation === 'verified' ? 'Concluída' : 'Pendente'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Botão Ver Histórico Completo */}
              <div className="text-center pt-4 mt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary hover:bg-muted"
                  onClick={() => navigate('/dashboard/qrcode-rg-6m/todos')}
                >
                  <FileText className={`mr-2 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span className={isMobile ? 'text-xs' : 'text-sm'}>Ver Histórico Completo</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Nenhum cadastro encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards - padrão bg-card como CPF Simples */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary truncate">
                {statsLoading ? '...' : stats.today}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">Cadastros Hoje</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary truncate">
                {statsLoading ? '...' : stats.total}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">Total de Cadastros</p>
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
                R$ {statsLoading ? '0,00' : (stats.total * finalPrice).toFixed(2)}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">Total Gasto</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photo Editor Modal */}
      {previewUrl && (
        <PhotoEditorModal
          open={showPhotoEditor}
          onOpenChange={setShowPhotoEditor}
          imageUrl={previewUrl}
          fileName={formData.numeroDocumento || 'foto'}
          onSave={(editedFile) => {
            setFormData(prev => ({ ...prev, foto: editedFile }));
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(editedFile);
          }}
        />
      )}

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default QRCodeRg6m;
