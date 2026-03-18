import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Loader2, AlertCircle, CheckCircle, Upload, Package, Clock, PenSquare, Database } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useApiModules } from '@/hooks/useApiModules';
import { getModulePrice } from '@/utils/modulePrice';
import { consultationApiService } from '@/services/consultationApiService';
import { walletApiService } from '@/services/walletApiService';
import { pdfRgService, type PdfRgPedido } from '@/services/pdfRgService';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';
import LoadingScreen from '@/components/layout/LoadingScreen';

const PHP_VALIDATION_BASE = 'https://qr.apipainel.com.br/qrvalidation';
const MODULE_TITLE = 'IMPRIMIR RG';
const MODULE_ROUTE = '/dashboard/imprimir-rg';
const SOURCE_MODULE_ID = 165;
const TARGET_MODULE_ID = 181;

const QR_ROUTES = {
  '1m': '/dashboard/qrcode-rg-1m',
  '3m': '/dashboard/qrcode-rg-3m',
  '6m': '/dashboard/qrcode-rg-6m',
} as const;

const DIRETORES = ['Maranhão', 'Piauí', 'Goiânia', 'Tocantins'] as const;
type DiretorPdfRg = (typeof DIRETORES)[number];
type InputMode = 'manual' | 'registro';
type QrPlan = keyof typeof QR_ROUTES;

interface FormData {
  cpf: string;
  nome: string;
  dataNascimento: string;
  naturalidade: string;
  mae: string;
  pai: string;
  diretor: DiretorPdfRg | '';
  assinatura: File | null;
  foto: File | null;
  anexos: File[];
}

interface InheritedFiles {
  assinatura_base64?: string | null;
  foto_base64?: string | null;
  anexo1_base64?: string | null;
  anexo2_base64?: string | null;
  anexo3_base64?: string | null;
  anexo1_nome?: string | null;
  anexo2_nome?: string | null;
  anexo3_nome?: string | null;
}

const STATUS_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  realizado: { label: 'Realizado', icon: <Package className="h-3 w-3" /> },
  pagamento_confirmado: { label: 'Pgto Confirmado', icon: <CheckCircle className="h-3 w-3" /> },
  em_confeccao: { label: 'Em Confecção', icon: <Clock className="h-3 w-3" /> },
  entregue: { label: 'Entregue', icon: <CheckCircle className="h-3 w-3" /> },
  cancelado: { label: 'Cancelado', icon: <AlertCircle className="h-3 w-3" /> },
};

const DEFAULT_PHOTO_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAADklEQVR42u3BAQEAAACCIP+vbkhAAQAAAO8GECAAAUGc0BwAAAAASUVORK5CYII=';

const normalizeModuleRoute = (module: any): string => {
  const raw = (module?.api_endpoint || module?.path || '').toString().trim();
  if (!raw) return '';
  if (raw.startsWith('/')) return raw;
  if (raw.startsWith('dashboard/')) return `/${raw}`;
  if (!raw.includes('/')) return `/dashboard/${raw}`;
  return raw;
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const ImprimirRg = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modules } = useApiModules();
  const { user } = useAuth();

  const [inputMode, setInputMode] = useState<InputMode | null>(null);
  const [sourceRecords, setSourceRecords] = useState<PdfRgPedido[]>([]);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [inheritedFiles, setInheritedFiles] = useState<InheritedFiles | null>(null);

  const [formData, setFormData] = useState<FormData>({
    cpf: '',
    nome: '',
    dataNascimento: '',
    naturalidade: '',
    mae: '',
    pai: '',
    diretor: '',
    assinatura: null,
    foto: null,
    anexos: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [planBalance, setPlanBalance] = useState(0);
  const [modulePrice, setModulePrice] = useState(0);
  const [modulePriceLoading, setModulePriceLoading] = useState(true);
  const [balanceCheckLoading, setBalanceCheckLoading] = useState(true);
  const [qrPlan, setQrPlan] = useState<QrPlan>('1m');

  const { balance, loadBalance: reloadApiBalance } = useWalletBalance();
  const {
    hasActiveSubscription,
    subscription,
    discountPercentage,
    calculateDiscountedPrice: calculateSubscriptionDiscount,
    isLoading: subscriptionLoading,
  } = useUserSubscription();

  const currentModule = useMemo(() => {
    const pathname = (location?.pathname || '').trim();
    if (!pathname) return null;
    return (modules || []).find((m: any) => normalizeModuleRoute(m) === pathname) || null;
  }, [modules, location?.pathname]);

  const selectedQrRoute = useMemo(() => QR_ROUTES[qrPlan], [qrPlan]);

  const selectedQrModule = useMemo(() => {
    return (modules || []).find((m: any) => normalizeModuleRoute(m) === selectedQrRoute) || null;
  }, [modules, selectedQrRoute]);

  const getQrBasePrice = useCallback((route: string) => {
    const qrModuleByRoute = (modules || []).find((m: any) => normalizeModuleRoute(m) === route);
    const rawPrice = qrModuleByRoute?.price;
    const price = Number(rawPrice ?? 0);
    if (price > 0) return price;
    return getModulePrice(route);
  }, [modules]);

  const qrBasePrice = useMemo(() => getQrBasePrice(selectedQrRoute), [selectedQrRoute, getQrBasePrice]);

  const qrPrices = useMemo(() => {
    const withDiscount = (route: string) => {
      const basePrice = getQrBasePrice(route);
      return hasActiveSubscription && basePrice > 0
        ? calculateSubscriptionDiscount(basePrice).discountedPrice
        : basePrice;
    };

    return {
      '1m': withDiscount(QR_ROUTES['1m']),
      '3m': withDiscount(QR_ROUTES['3m']),
      '6m': withDiscount(QR_ROUTES['6m']),
    };
  }, [getQrBasePrice, hasActiveSubscription, calculateSubscriptionDiscount]);

  const loadModulePrice = useCallback(() => {
    setModulePriceLoading(true);
    const rawPrice = currentModule?.price;
    const price = Number(rawPrice ?? 0);
    if (price > 0) {
      setModulePrice(price);
      setModulePriceLoading(false);
      return;
    }
    const fallbackPrice = getModulePrice(location.pathname || MODULE_ROUTE);
    setModulePrice(fallbackPrice);
    setModulePriceLoading(false);
  }, [currentModule, location.pathname]);

  const loadSourceRecords = useCallback(async () => {
    if (!user?.id) {
      setSourceRecords([]);
      return;
    }

    setSourceLoading(true);
    try {
      const result = await pdfRgService.listar({ limit: 100, offset: 0, user_id: Number(user.id) });
      const all = result.success && result.data ? result.data.data || [] : [];
      setSourceRecords(all.filter((pedido) => Number(pedido.module_id) === SOURCE_MODULE_ID));
    } catch {
      setSourceRecords([]);
    } finally {
      setSourceLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (balance.saldo !== undefined || balance.saldo_plano !== undefined) {
      setPlanBalance(balance.saldo_plano || 0);
      setWalletBalance(balance.saldo || 0);
    }
  }, [balance]);

  useEffect(() => {
    if (!user) return;
    reloadApiBalance();
    loadSourceRecords();
  }, [user, reloadApiBalance, loadSourceRecords]);

  useEffect(() => {
    if (!user) return;
    loadModulePrice();
  }, [user, loadModulePrice]);

  useEffect(() => {
    if (!user) {
      setBalanceCheckLoading(false);
      return;
    }
    if (modulePriceLoading || subscriptionLoading) return;
    setBalanceCheckLoading(false);
  }, [user, modulePriceLoading, subscriptionLoading]);

  const userPlan = hasActiveSubscription && subscription
    ? subscription.plan_name
    : user
      ? localStorage.getItem(`user_plan_${user.id}`) || 'Pré-Pago'
      : 'Pré-Pago';

  const moduleDisplayName = currentModule?.title || MODULE_TITLE;
  const isManualFlow = inputMode === 'manual';
  const isRegistroSelected = inputMode === 'registro' && selectedSourceId !== null;

  const moduleBaseSalePrice = modulePrice > 0 ? modulePrice : 0;
  const moduleBaseCostPrice = useMemo(() => {
    const parsedCostPrice = Number(currentModule?.cost_price ?? (currentModule as any)?.costPrice ?? 0);
    return Number.isFinite(parsedCostPrice) && parsedCostPrice > 0 ? parsedCostPrice : 0;
  }, [currentModule]);

  const { discountedPrice: manualModulePrice, hasDiscount: hasModuleDiscount } =
    hasActiveSubscription && moduleBaseSalePrice > 0
      ? calculateSubscriptionDiscount(moduleBaseSalePrice)
      : { discountedPrice: moduleBaseSalePrice, hasDiscount: false };

  const qrFinalPrice =
    hasActiveSubscription && qrBasePrice > 0
      ? calculateSubscriptionDiscount(qrBasePrice).discountedPrice
      : qrBasePrice;

  const manualTotalPrice = manualModulePrice + qrFinalPrice;
  const registroModulePrice = moduleBaseCostPrice > 0 ? moduleBaseCostPrice : manualModulePrice;
  const totalPrice = isRegistroSelected ? registroModulePrice : manualTotalPrice;
  const discount = !isRegistroSelected && hasModuleDiscount ? discountPercentage : 0;
  const showDiscountBadge = !isRegistroSelected && hasModuleDiscount;
  const originalDisplayPrice = !isRegistroSelected ? moduleBaseSalePrice + qrBasePrice : registroModulePrice;
  const totalBalance = planBalance + walletBalance;
  const hasSufficientBalance = totalBalance >= totalPrice;

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'cpf') value = value.replace(/\D/g, '');
    if (field === 'nome' || field === 'pai' || field === 'mae' || field === 'naturalidade') value = value.toUpperCase();
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const readFileAsDataUrl = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => cb(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Foto muito grande (máx 10MB)');
      return;
    }
    setFormData((prev) => ({ ...prev, foto: file }));
    readFileAsDataUrl(file, setPhotoPreviewUrl);
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Assinatura muito grande (máx 10MB)');
      return;
    }
    setFormData((prev) => ({ ...prev, assinatura: file }));
    readFileAsDataUrl(file, setSignaturePreviewUrl);
  };

  const handleAnexosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      toast.error('Máximo 3 anexos permitidos');
      return;
    }

    for (const f of files) {
      if (f.size > 15 * 1024 * 1024) {
        toast.error(`Arquivo ${f.name} muito grande (máx 15MB)`);
        return;
      }
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/jfif', 'image/pjpeg', 'application/pdf'];
      if (!allowed.includes(f.type)) {
        toast.error(`Formato inválido: ${f.name}. Use JPG, JPEG, PNG, JFIF ou PDF`);
        return;
      }
    }

    setFormData((prev) => ({ ...prev, anexos: files.slice(0, 3) }));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsDataURL(file);
    });

  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const resetForm = () => {
    setFormData({
      cpf: '',
      nome: '',
      dataNascimento: '',
      naturalidade: '',
      mae: '',
      pai: '',
      diretor: '',
      assinatura: null,
      foto: null,
      anexos: [],
    });
    setPhotoPreviewUrl(null);
    setSignaturePreviewUrl(null);
    setSelectedSourceId(null);
    setInheritedFiles(null);
  };

  const handleSelectSourceRecord = async (id: number) => {
    setIsLoading(true);
    try {
      const detail = await pdfRgService.obter(id);
      if (!detail.success || !detail.data) {
        toast.error(detail.error || 'Não foi possível carregar o registro selecionado.');
        return;
      }

      const data = detail.data;
      setSelectedSourceId(id);
      setFormData((prev) => ({
        ...prev,
        cpf: data.cpf || '',
        nome: data.nome || '',
        dataNascimento: data.dt_nascimento || '',
        naturalidade: data.naturalidade || '',
        mae: data.filiacao_mae || '',
        pai: data.filiacao_pai || '',
        diretor: (data.diretor as DiretorPdfRg) || '',
        assinatura: null,
        foto: null,
        anexos: [],
      }));

      setPhotoPreviewUrl(data.foto_base64 || null);
      setSignaturePreviewUrl(data.assinatura_base64 || null);

      setInheritedFiles({
        assinatura_base64: data.assinatura_base64,
        foto_base64: data.foto_base64,
        anexo1_base64: data.anexo1_base64,
        anexo2_base64: data.anexo2_base64,
        anexo3_base64: data.anexo3_base64,
        anexo1_nome: data.anexo1_nome,
        anexo2_nome: data.anexo2_nome,
        anexo3_nome: data.anexo3_nome,
      });

      toast.success('Dados do registro carregados.');
    } catch {
      toast.error('Erro ao carregar o registro selecionado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMode) {
      toast.error('Escolha primeiro como deseja preencher os dados.');
      return;
    }
    if (inputMode === 'registro' && !selectedSourceId) {
      toast.error('Selecione um registro do módulo RG para continuar.');
      return;
    }
    if (inputMode === 'registro' && moduleBaseCostPrice <= 0) {
      toast.error('Preço de custo do módulo indisponível no banco de dados.');
      return;
    }
    if (!formData.cpf.trim()) {
      toast.error('CPF é obrigatório');
      return;
    }
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.dataNascimento) {
      toast.error('Data de nascimento é obrigatória');
      return;
    }
    if (!formData.mae.trim()) {
      toast.error('Filiação / Mãe é obrigatória');
      return;
    }
    if (!hasSufficientBalance) {
      toast.error(`Saldo insuficiente. Necessário: R$ ${totalPrice.toFixed(2)}`);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const shouldChargeQr = inputMode === 'manual';
      const qrModuleSource = qrPlan === '3m' ? 'qrcode-rg-3m' : qrPlan === '6m' ? 'qrcode-rg-6m' : 'qrcode-rg-1m';
      const expiryMonths = qrPlan === '3m' ? 3 : qrPlan === '6m' ? 6 : 1;

      const payload: Record<string, any> = {
        cpf: formData.cpf.trim(),
        nome: formData.nome.trim() || null,
        dt_nascimento: formData.dataNascimento || null,
        naturalidade: formData.naturalidade.trim() || null,
        filiacao_mae: formData.mae.trim() || null,
        filiacao_pai: formData.pai.trim() || null,
        diretor: formData.diretor || null,
        qr_plan: shouldChargeQr ? qrPlan : null,
        preco_pago: totalPrice,
        desconto_aplicado: discount,
        module_id: currentModule?.id || TARGET_MODULE_ID,
        metadata: {
          source_mode: inputMode,
          source_module_id: SOURCE_MODULE_ID,
          source_record_id: selectedSourceId,
        },
      };

      if (formData.foto) payload.foto_base64 = await fileToBase64(formData.foto);
      else if (inheritedFiles?.foto_base64) payload.foto_base64 = inheritedFiles.foto_base64;

      if (formData.assinatura) payload.assinatura_base64 = await fileToBase64(formData.assinatura);
      else if (inheritedFiles?.assinatura_base64) payload.assinatura_base64 = inheritedFiles.assinatura_base64;

      for (let i = 0; i < formData.anexos.length; i++) {
        payload[`anexo${i + 1}_base64`] = await fileToBase64(formData.anexos[i]);
        payload[`anexo${i + 1}_nome`] = formData.anexos[i].name;
      }

      if (!formData.anexos.length && inheritedFiles) {
        payload.anexo1_base64 = inheritedFiles.anexo1_base64;
        payload.anexo2_base64 = inheritedFiles.anexo2_base64;
        payload.anexo3_base64 = inheritedFiles.anexo3_base64;
        payload.anexo1_nome = inheritedFiles.anexo1_nome;
        payload.anexo2_nome = inheritedFiles.anexo2_nome;
        payload.anexo3_nome = inheritedFiles.anexo3_nome;
      }

      const result = await pdfRgService.criar(payload);
      if (!result.success) throw new Error(result.error || 'Erro ao criar solicitação de impressão');

      let qrResultData: any = { token: '', document_number: formData.cpf };

      if (shouldChargeQr) {
        const formDataToSend = new FormData();
        formDataToSend.append('full_name', formData.nome.toUpperCase().trim());
        formDataToSend.append('birth_date', formData.dataNascimento);
        formDataToSend.append('document_number', formData.cpf.trim());
        formDataToSend.append('parent1', formData.pai.toUpperCase().trim());
        formDataToSend.append('parent2', formData.mae.toUpperCase().trim());
        if (user?.id) formDataToSend.append('id_user', String(user.id));

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);
        formDataToSend.append('expiry_date', expiryDate.toISOString().split('T')[0]);
        formDataToSend.append('module_source', qrModuleSource);

        if (formData.foto) {
          formDataToSend.append('photo', formData.foto);
        } else if (inheritedFiles?.foto_base64) {
          formDataToSend.append('photo', dataUrlToFile(inheritedFiles.foto_base64, `${formData.cpf.trim()}.png`));
        } else {
          formDataToSend.append('photo', dataUrlToFile(DEFAULT_PHOTO_BASE64, `${formData.cpf.trim()}.png`));
        }

        try {
          const response = await fetch(`${PHP_VALIDATION_BASE}/register.php`, {
            method: 'POST',
            body: formDataToSend,
            redirect: 'manual',
          });

          if (response.type !== 'opaqueredirect' && response.status !== 0 && response.status !== 302 && response.ok) {
            const text = await response.text();
            if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
              try {
                const parsed = JSON.parse(text);
                if (parsed?.data) qrResultData = parsed.data;
              } catch {
                // ignore
              }
            }
          }
        } catch {
          toast.warning('Solicitação criada, mas houve falha ao gerar o QR Code automaticamente.');
        }
      }

      let remainingPlan = planBalance;
      let remainingWallet = walletBalance;

      const chargeAndRecord = async (args: {
        amount: number;
        description: string;
        moduleId: number;
        pageRoute: string;
        moduleName: string;
        source: string;
        resultData: any;
      }) => {
        let saldoUsado: 'plano' | 'carteira' | 'misto' = 'carteira';
        let walletType: 'main' | 'plan' = 'main';

        if (remainingPlan >= args.amount) {
          saldoUsado = 'plano';
          walletType = 'plan';
          remainingPlan = Math.max(0, remainingPlan - args.amount);
        } else if (remainingPlan > 0 && remainingPlan + remainingWallet >= args.amount) {
          saldoUsado = 'misto';
          walletType = 'main';
          const restante = args.amount - remainingPlan;
          remainingPlan = 0;
          remainingWallet = Math.max(0, remainingWallet - restante);
        } else {
          saldoUsado = 'carteira';
          walletType = 'main';
          remainingWallet = Math.max(0, remainingWallet - args.amount);
        }

        await walletApiService.addBalance(0, -args.amount, args.description, 'consulta', undefined, walletType);

        await consultationApiService.recordConsultation({
          document: formData.cpf,
          status: 'completed',
          cost: args.amount,
          result_data: args.resultData,
          saldo_usado: saldoUsado,
          module_id: args.moduleId,
          metadata: {
            page_route: args.pageRoute,
            module_name: args.moduleName,
            module_id: args.moduleId,
            saldo_usado: saldoUsado,
            source: args.source,
            timestamp: new Date().toISOString(),
          },
        });
      };

      const moduleChargePrice = shouldChargeQr ? manualModulePrice : registroModulePrice;

      await chargeAndRecord({
        amount: moduleChargePrice,
        description: `Impressão RG - ${formData.nome || formData.cpf}`,
        moduleId: currentModule?.panel_id || currentModule?.id || TARGET_MODULE_ID,
        pageRoute: location.pathname,
        moduleName: moduleDisplayName,
        source: 'imprimir-rg',
        resultData: { pedido_id: result.data?.id, source_record_id: selectedSourceId },
      });

      if (shouldChargeQr) {
        await chargeAndRecord({
          amount: qrFinalPrice,
          description: `QR Code RG ${qrPlan.toUpperCase()} - ${formData.nome || formData.cpf}`,
          moduleId: selectedQrModule?.panel_id || selectedQrModule?.id || 0,
          pageRoute: selectedQrRoute,
          moduleName: `QR Code RG ${qrPlan.toUpperCase()}`,
          source: qrModuleSource,
          resultData: qrResultData,
        });
      }

      setPlanBalance(remainingPlan);
      setWalletBalance(remainingWallet);
      await reloadApiBalance();

      setShowConfirmModal(false);
      resetForm();
      await loadSourceRecords();
      toast.success('Solicitação de impressão criada com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar solicitação de impressão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/dashboard');
  };

  if (balanceCheckLoading || modulePriceLoading) {
    return <LoadingScreen message="Verificando acesso ao módulo..." variant="dashboard" />;
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      <div className="w-full">
        <SimpleTitleBar title={MODULE_TITLE} subtitle="Solicite a impressão com base no RG já comprado ou enviando os dados" onBack={handleBack} />

        <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 md:gap-6 lg:gap-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700 w-full">
            <CardHeader className="pb-4">
              <div className="relative bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-gray-800/50 dark:via-gray-800 dark:to-emerald-900/20 rounded-lg border border-emerald-100/50 dark:border-emerald-800/30 shadow-sm transition-all duration-300">
                {showDiscountBadge && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-2.5 py-1 text-xs font-bold shadow-lg">
                      {discount}% OFF
                    </Badge>
                  </div>
                )}
                <div className="relative p-3.5 md:p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-1 h-10 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Plano Ativo</p>
                        <h3 className="text-sm md:text-base font-bold text-foreground truncate">
                          {hasActiveSubscription ? subscription?.plan_name : userPlan}
                        </h3>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      {showDiscountBadge && (
                        <span className="text-[10px] md:text-xs text-muted-foreground line-through">
                          R$ {originalDisplayPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent whitespace-nowrap">
                        R$ {totalPrice.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {!isRegistroSelected
                          ? `${moduleDisplayName} R$ ${manualModulePrice.toFixed(2)} + QR R$ ${qrFinalPrice.toFixed(2)}`
                          : `${moduleDisplayName} (custo) R$ ${registroModulePrice.toFixed(2)} (sem novo QR)`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={inputMode === 'manual' ? 'default' : 'outline'}
                  className="justify-start gap-2 h-auto py-3"
                  onClick={() => {
                    setInputMode('manual');
                    resetForm();
                  }}
                >
                  <PenSquare className="h-4 w-4" />
                  <span>Informar dados manualmente</span>
                </Button>

                <Button
                  type="button"
                  variant={inputMode === 'registro' ? 'default' : 'outline'}
                  className="justify-start gap-2 h-auto py-3"
                  onClick={() => {
                    setInputMode('registro');
                    resetForm();
                  }}
                >
                  <Database className="h-4 w-4" />
                  <span>Selecionar do PDF criado</span>
                </Button>
              </div>

              {inputMode === 'registro' && (
                <div className="space-y-3 rounded-md border p-3">
                  <p className="text-sm font-medium">Registros do módulo RG (ID 165)</p>
                  {sourceLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Carregando registros...</div>
                  ) : sourceRecords.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum registro encontrado no módulo 165.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {sourceRecords.map((record) => {
                        const status = STATUS_LABELS[record.status] || STATUS_LABELS.realizado;
                        return (
                          <div key={record.id} className="rounded-md border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{record.nome || record.cpf}</p>
                              <p className="text-xs text-muted-foreground">#{record.id} • {record.cpf} • {formatDate(record.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs gap-1">{status.icon}{status.label}</Badge>
                              <Button type="button" size="sm" onClick={() => void handleSelectSourceRecord(record.id)} disabled={isLoading}>
                                {selectedSourceId === record.id ? 'Selecionado' : 'Usar dados'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {(isManualFlow || isRegistroSelected) && (
                <form onSubmit={handleOpenConfirmModal} className="space-y-4">
                  {isManualFlow && (
                    <div className="space-y-2">
                      <Label>Período do QR Code *</Label>
                      <Select value={qrPlan} onValueChange={(v) => setQrPlan(v as QrPlan)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1m">QR Code RG 1M — R$ {qrPrices['1m'].toFixed(2)}</SelectItem>
                          <SelectItem value="3m">QR Code RG 3M — R$ {qrPrices['3m'].toFixed(2)}</SelectItem>
                          <SelectItem value="6m">QR Code RG 6M — R$ {qrPrices['6m'].toFixed(2)}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="cpf">Registro Geral - CPF * <span className="text-xs text-muted-foreground">(obrigatório)</span></Label>
                    <Input id="cpf" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={11} placeholder="CPF (somente números)" value={formData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} required className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome * <span className="text-xs text-muted-foreground">(obrigatório)</span></Label>
                    <Input id="nome" type="text" placeholder="Nome completo" value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} required className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de Nascimento * <span className="text-xs text-muted-foreground">(obrigatório)</span></Label>
                    <Input id="dataNascimento" type="date" value={formData.dataNascimento} onChange={(e) => handleInputChange('dataNascimento', e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foto">Foto 3x4 * <span className="text-xs text-muted-foreground">(obrigatório para QR Code — sem foto será usada imagem temporária)</span></Label>
                    <Input id="foto" type="file" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={handlePhotoChange} className="cursor-pointer" />
                    {photoPreviewUrl && (
                      <div className="mt-2">
                        <img src={photoPreviewUrl} alt="Preview foto" className="w-24 h-24 object-cover rounded-lg border" />
                      </div>
                    )}
                    {!isManualFlow && !formData.foto && inheritedFiles?.foto_base64 && (
                      <p className="text-xs text-muted-foreground">Será utilizada a foto do registro selecionado.</p>
                    )}
                    {isManualFlow && !formData.foto && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">⚠ Sem foto: será usada uma imagem temporária padrão. Atualize depois.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mae">Filiação / Mãe * <span className="text-xs text-muted-foreground">(obrigatório)</span></Label>
                    <Input id="mae" type="text" placeholder="Nome da mãe" value={formData.mae} onChange={(e) => handleInputChange('mae', e.target.value)} required className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pai">Filiação / Pai</Label>
                    <Input id="pai" type="text" placeholder="Nome do pai (opcional)" value={formData.pai} onChange={(e) => handleInputChange('pai', e.target.value)} className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="naturalidade">Naturalidade</Label>
                    <Input id="naturalidade" type="text" placeholder="Naturalidade" value={formData.naturalidade} onChange={(e) => handleInputChange('naturalidade', e.target.value)} className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assinatura">Assinatura do Titular</Label>
                    <Input id="assinatura" type="file" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={handleSignatureChange} className="cursor-pointer" />
                    {signaturePreviewUrl && (
                      <div className="mt-2">
                        <img src={signaturePreviewUrl} alt="Preview assinatura" className="w-24 h-24 object-contain rounded-lg border bg-background" />
                      </div>
                    )}
                    {!isManualFlow && !formData.assinatura && inheritedFiles?.assinatura_base64 && (
                      <p className="text-xs text-muted-foreground">Será utilizada a assinatura do registro selecionado.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Selecione o Diretor</Label>
                    <Select value={formData.diretor} onValueChange={(v) => setFormData((prev) => ({ ...prev, diretor: v as DiretorPdfRg }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {DIRETORES.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anexos">Anexos <span className="text-xs text-muted-foreground">(até 3 arquivos - foto ou PDF)</span></Label>
                    <Input id="anexos" type="file" accept="image/jpeg,image/jpg,image/png,image/jfif,image/pjpeg,application/pdf" multiple onChange={handleAnexosChange} className="cursor-pointer" />
                    {!!formData.anexos.length && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.anexos.map((file, index) => (
                          <Badge key={`${file.name}-${index}`} variant="secondary" className="text-xs gap-1">
                            <Upload className="h-3 w-3" />
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {!formData.anexos.length && !isManualFlow && (inheritedFiles?.anexo1_base64 || inheritedFiles?.anexo2_base64 || inheritedFiles?.anexo3_base64) && (
                      <p className="text-xs text-muted-foreground">Serão utilizados anexos do registro selecionado (se houver).</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading || !hasSufficientBalance || isSubmitting || !inputMode}>
                      {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processando...</>
                      ) : (
                        <><FileText className="h-4 w-4 mr-2" />Solicitar Pedido (R$ {totalPrice.toFixed(2)})</>
                      )}
                    </Button>

                    {!hasSufficientBalance && (
                      <div className="flex items-center gap-2 text-destructive text-xs">
                        <AlertCircle className="h-4 w-4" />
                        <span>Saldo insuficiente. Necessário: R$ {totalPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Meus Registros (Pedido + QR)</CardTitle>
                <CardDescription className="text-xs">Registros do módulo RG (ID 165) para reaproveitar no pedido de impressão.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {sourceLoading ? (
                  <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : sourceRecords.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum registro encontrado</p>
                ) : (
                  <div className="divide-y max-h-[520px] overflow-y-auto">
                    {sourceRecords.map((record) => {
                      const status = STATUS_LABELS[record.status] || STATUS_LABELS.realizado;
                      const pendingDays = Math.max(0, Math.floor((Date.now() - new Date(record.created_at).getTime()) / 86400000));

                      return (
                        <div key={record.id} className="px-3 py-3 space-y-2.5 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-xs font-mono text-muted-foreground">#{record.id}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium truncate">{record.nome || record.cpf}</p>
                                <p className="text-[10px] text-muted-foreground">{formatDate(record.created_at)}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-[9px] gap-0.5 px-1.5 py-0.5">
                              {status.icon} {status.label}
                            </Badge>
                          </div>

                          <div className="space-y-1 text-[11px]">
                            <p className="font-medium truncate">{record.nome || '-'}</p>
                            <p className="text-muted-foreground">{record.cpf || '-'}</p>
                            <p className="text-muted-foreground">Nasc. {record.dt_nascimento ? record.dt_nascimento.split('-').reverse().join('/') : '-'}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{pendingDays} dias</span>
                              <Badge variant="outline" className="text-[10px]">{selectedSourceId === record.id ? 'Selecionado' : 'Pendente'}</Badge>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant={selectedSourceId === record.id ? 'default' : 'outline'}
                            className="w-full"
                            onClick={() => {
                              setInputMode('registro');
                              void handleSelectSourceRecord(record.id);
                            }}
                            disabled={isLoading}
                          >
                            {selectedSourceId === record.id ? 'Registro selecionado' : 'Usar este registro'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar solicitação de impressão</DialogTitle>
            <DialogDescription>
              Você será cobrado em <strong>R$ {totalPrice.toFixed(2)}</strong> ({isManualFlow ? `${moduleDisplayName} + QR Code RG ${qrPlan.toUpperCase()}` : `${moduleDisplayName} sem nova cobrança de QR Code`}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            <p><strong>Nome:</strong> {formData.nome}</p>
            <p><strong>CPF:</strong> {formData.cpf}</p>
            <p><strong>Origem dos dados:</strong> {inputMode === 'registro' ? `Registro #${selectedSourceId}` : 'Informado manualmente'}</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Confirmando...</> : 'Confirmar e pagar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImprimirRg;
