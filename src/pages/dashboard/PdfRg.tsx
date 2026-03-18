import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Loader2, AlertCircle, CheckCircle, Upload, Download, Eye, Package, Clock, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { getFullApiUrl } from '@/utils/apiHelper';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useApiModules } from '@/hooks/useApiModules';
import { useIsMobile } from '@/hooks/use-mobile';
import { getModulePrice } from '@/utils/modulePrice';
import { consultationApiService } from '@/services/consultationApiService';
import { walletApiService } from '@/services/walletApiService';
import { pdfRgService, type PdfRgPedido } from '@/services/pdfRgService';
import { qrcodeRegistrationsService, type QrRegistration } from '@/services/qrcodeRegistrationsService';
import QrCadastroCard from '@/components/qrcode/QrCadastroCard';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';
import LoadingScreen from '@/components/layout/LoadingScreen';
import ScrollToTop from '@/components/ui/scroll-to-top';

const PHP_VALIDATION_BASE = 'https://qr.apipainel.com.br/qrvalidation';

const MODULE_TITLE = 'PDF RG';
const MODULE_ROUTE = '/dashboard/pdf-rg';

const DIRETORES = ['Maranhão', 'Piauí', 'Goiânia', 'Tocantins'] as const;
type DiretorPdfRg = (typeof DIRETORES)[number];

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  realizado: { label: 'Realizado', color: 'bg-blue-500', icon: <Package className="h-3 w-3" /> },
  pagamento_confirmado: { label: 'Pgto Confirmado', color: 'bg-emerald-500', icon: <CheckCircle className="h-3 w-3" /> },
  em_confeccao: { label: 'Em Confecção', color: 'bg-orange-500', icon: <Clock className="h-3 w-3" /> },
  entregue: { label: 'Entregue', color: 'bg-emerald-600', icon: <Truck className="h-3 w-3" /> },
};

// Default placeholder photo (1x1 transparent PNG as base64 - will be used as temporary)
const DEFAULT_PHOTO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAADklEQVR42u3BAQEAAACCIP+vbkhAAQAAAO8GECAAAUGc0BwAAAAASUVORK5CYII=';

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

const PdfRg = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modules } = useApiModules();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState<FormData>({
    cpf: '', nome: '', dataNascimento: '', naturalidade: '',
    mae: '', pai: '', diretor: '', assinatura: null, foto: null, anexos: [],
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
  const [qrPlan, setQrPlan] = useState<'1m' | '3m' | '6m'>('1m');

  const [meusPedidos, setMeusPedidos] = useState<PdfRgPedido[]>([]);
  const [pedidosLoading, setPedidosLoading] = useState(false);
  const [pedidoDetalhe, setPedidoDetalhe] = useState<PdfRgPedido | null>(null);
  const [showDetalheModal, setShowDetalheModal] = useState(false);
  const [meusCadastrosQr, setMeusCadastrosQr] = useState<QrRegistration[]>([]);
  const [cadastrosQrLoading, setCadastrosQrLoading] = useState(false);

  const { balance, loadBalance: reloadApiBalance } = useWalletBalance();
  const {
    hasActiveSubscription, subscription, discountPercentage,
    calculateDiscountedPrice: calculateSubscriptionDiscount,
    isLoading: subscriptionLoading,
  } = useUserSubscription();

  const normalizeModuleRoute = useCallback((module: any): string => {
    const raw = (module?.api_endpoint || module?.path || '').toString().trim();
    if (!raw) return '';
    if (raw.startsWith('/')) return raw;
    if (raw.startsWith('dashboard/')) return `/${raw}`;
    if (!raw.includes('/')) return `/dashboard/${raw}`;
    return raw;
  }, []);

  const currentModule = useMemo(() => {
    const pathname = (location?.pathname || '').trim();
    if (!pathname) return null;
    return (modules || []).find((m: any) => normalizeModuleRoute(m) === pathname) || null;
  }, [modules, location?.pathname, normalizeModuleRoute]);

  const userPlan = hasActiveSubscription && subscription
    ? subscription.plan_name
    : (user ? localStorage.getItem(`user_plan_${user.id}`) || 'Pré-Pago' : 'Pré-Pago');

  const totalBalance = planBalance + walletBalance;
  const hasSufficientBalance = (price: number) => totalBalance >= price;

  const qrRoute = useMemo(() => {
    if (qrPlan === '3m') return '/dashboard/qrcode-rg-3m';
    if (qrPlan === '6m') return '/dashboard/qrcode-rg-6m';
    return '/dashboard/qrcode-rg-1m';
  }, [qrPlan]);

  const qrModule = useMemo(() => {
    return (modules || []).find((m: any) => normalizeModuleRoute(m) === qrRoute) || null;
  }, [modules, normalizeModuleRoute, qrRoute]);

  const qrBasePrice = useMemo(() => {
    const rawPrice = qrModule?.price;
    const price = Number(rawPrice ?? 0);
    if (price && price > 0) return price;
    return getModulePrice(qrRoute);
  }, [qrModule?.price, qrRoute]);

  // Preços para cada plano de QR (para exibir no select)
  const qrPrices = useMemo(() => {
    const getPrice = (route: string) => {
      const mod = (modules || []).find((m: any) => normalizeModuleRoute(m) === route);
      const rawPrice = mod?.price;
      const price = Number(rawPrice ?? 0);
      if (price && price > 0) {
        return hasActiveSubscription ? calculateSubscriptionDiscount(price).discountedPrice : price;
      }
      const fallback = getModulePrice(route);
      return hasActiveSubscription ? calculateSubscriptionDiscount(fallback).discountedPrice : fallback;
    };
    return {
      '1m': getPrice('/dashboard/qrcode-rg-1m'),
      '3m': getPrice('/dashboard/qrcode-rg-3m'),
      '6m': getPrice('/dashboard/qrcode-rg-6m'),
    };
  }, [modules, normalizeModuleRoute, hasActiveSubscription, calculateSubscriptionDiscount]);

  const loadModulePrice = useCallback(() => {
    setModulePriceLoading(true);
    const rawPrice = currentModule?.price;
    const price = Number(rawPrice ?? 0);
    if (price && price > 0) { setModulePrice(price); setModulePriceLoading(false); return; }
    const fallbackPrice = getModulePrice(location.pathname || MODULE_ROUTE);
    setModulePrice(fallbackPrice);
    setModulePriceLoading(false);
  }, [currentModule, location.pathname]);

  const loadBalances = useCallback(() => {
    if (!user) return;
    setPlanBalance(balance.saldo_plano || 0);
    setWalletBalance(balance.saldo || 0);
  }, [user, balance]);

  const loadMeusPedidos = useCallback(async () => {
    try {
      setPedidosLoading(true);
      const userId = user?.id ? Number(user.id) : null;
      const result = await pdfRgService.listar({ limit: 50, offset: 0, ...(userId ? { user_id: userId } : {}) });
      if (result.success && result.data) {
        setMeusPedidos(result.data.data || []);
      } else {
        setMeusPedidos([]);
      }
    } catch {
      setMeusPedidos([]);
    } finally {
      setPedidosLoading(false);
    }
  }, [user?.id]);

  const loadMeusCadastrosQr = useCallback(async () => {
    if (!user?.id) {
      setMeusCadastrosQr([]);
      return;
    }

    try {
      setCadastrosQrLoading(true);
      const registros = await qrcodeRegistrationsService.list({ idUser: String(user.id), limit: 100 });
      setMeusCadastrosQr(registros.filter((registro) => {
        const source = String(registro.module_source || '').trim();
        return !source || source.startsWith('qrcode-rg-');
      }));
    } catch {
      setMeusCadastrosQr([]);
    } finally {
      setCadastrosQrLoading(false);
    }
  }, [user?.id]);

  const cadastrosQrRelacionados = useMemo(() => {
    if (meusCadastrosQr.length === 0) return [];
    if (meusPedidos.length === 0) return meusCadastrosQr.slice(0, 5);

    const cpfsPedidos = new Set(meusPedidos.map((pedido) => qrcodeRegistrationsService.normalizeDigits(pedido.cpf || '')));
    const relacionados = meusCadastrosQr.filter((registro) =>
      cpfsPedidos.has(qrcodeRegistrationsService.normalizeDigits(registro.document_number || '')),
    );

    return (relacionados.length > 0 ? relacionados : meusCadastrosQr).slice(0, 5);
  }, [meusCadastrosQr, meusPedidos]);

  useEffect(() => {
    if (balance.saldo !== undefined || balance.saldo_plano !== undefined) loadBalances();
  }, [balance, loadBalances]);

  useEffect(() => {
    if (!user) return;
    reloadApiBalance();
    loadMeusPedidos();
    loadMeusCadastrosQr();
  }, [user, reloadApiBalance, loadMeusPedidos, loadMeusCadastrosQr]);

  useEffect(() => { if (user) loadModulePrice(); }, [user, loadModulePrice]);

  useEffect(() => {
    if (!user) { setBalanceCheckLoading(false); return; }
    if (modulePriceLoading || !modulePrice) return;
    if (subscriptionLoading) return;
    setBalanceCheckLoading(false);
  }, [user, modulePriceLoading, modulePrice, subscriptionLoading]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'cpf') value = value.replace(/\D/g, '');
    if (field === 'nome' || field === 'pai' || field === 'mae' || field === 'naturalidade') value = value.toUpperCase();
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const readFileAsDataUrl = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => cb(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Foto muito grande (máx 10MB)'); return; }
    setFormData(prev => ({ ...prev, foto: file }));
    readFileAsDataUrl(file, setPhotoPreviewUrl);
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Assinatura muito grande (máx 10MB)'); return; }
    setFormData(prev => ({ ...prev, assinatura: file }));
    readFileAsDataUrl(file, setSignaturePreviewUrl);
  };

  const handleAnexosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) { toast.error('Máximo 3 anexos permitidos'); return; }
    for (const f of files) {
      if (f.size > 15 * 1024 * 1024) { toast.error(`Arquivo ${f.name} muito grande (máx 15MB)`); return; }
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/jfif', 'image/pjpeg', 'application/pdf'];
      if (!allowed.includes(f.type)) { toast.error(`Formato inválido: ${f.name}. Use JPG, JPEG, PNG, JFIF ou PDF`); return; }
    }
    setFormData(prev => ({ ...prev, anexos: files.slice(0, 3) }));
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    // Campos obrigatórios
    if (!formData.cpf.trim()) { toast.error('CPF é obrigatório'); return; }
    if (!formData.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    if (!formData.dataNascimento) { toast.error('Data de Nascimento é obrigatória'); return; }
    if (!formData.mae.trim()) { toast.error('Filiação / Mãe é obrigatória'); return; }
    // Foto não é obrigatória - usará foto padrão temporária se não enviar
    if (!hasSufficientBalance(totalPrice)) { toast.error(`Saldo insuficiente. Necessário: R$ ${totalPrice.toFixed(2)}`); return; }
    setShowConfirmModal(true);
  };

  const originalPrice = modulePrice > 0 ? modulePrice : 0;
  const { discountedPrice: finalPrice, hasDiscount } = hasActiveSubscription && originalPrice > 0
    ? calculateSubscriptionDiscount(originalPrice) : { discountedPrice: originalPrice, hasDiscount: false };
  const discount = hasDiscount ? discountPercentage : 0;

  const qrFinalPrice = hasActiveSubscription && qrBasePrice > 0
    ? calculateSubscriptionDiscount(qrBasePrice).discountedPrice : qrBasePrice;

  const totalPrice = finalPrice + qrFinalPrice;

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsDataURL(file);
    });

  // Converte base64 data URL para Blob/File para enviar via FormData
  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1) Criar pedido PDF-RG
      const payload: Record<string, any> = {
        cpf: formData.cpf.trim(),
        nome: formData.nome.trim() || null,
        dt_nascimento: formData.dataNascimento || null,
        naturalidade: formData.naturalidade.trim() || null,
        filiacao_mae: formData.mae.trim() || null,
        filiacao_pai: formData.pai.trim() || null,
        diretor: formData.diretor || null,
        qr_plan: qrPlan,
        preco_pago: totalPrice,
        desconto_aplicado: discount,
        module_id: currentModule?.id || 0,
      };

      if (formData.foto) payload.foto_base64 = await fileToBase64(formData.foto);
      if (formData.assinatura) payload.assinatura_base64 = await fileToBase64(formData.assinatura);

      for (let i = 0; i < formData.anexos.length; i++) {
        payload[`anexo${i + 1}_base64`] = await fileToBase64(formData.anexos[i]);
        payload[`anexo${i + 1}_nome`] = formData.anexos[i].name;
      }

      const result = await pdfRgService.criar(payload);
      if (!result.success) throw new Error(result.error || 'Erro ao criar pedido');

      // 2) Gerar QR Code automaticamente (mesmo fluxo do RG-2026)
      const qrModuleSource = qrPlan === '3m' ? 'qrcode-rg-3m' : qrPlan === '6m' ? 'qrcode-rg-6m' : 'qrcode-rg-1m';
      const expiryMonths = qrPlan === '3m' ? 3 : qrPlan === '6m' ? 6 : 1;

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

      // Usar foto real ou foto padrão temporária
      if (formData.foto) {
        formDataToSend.append('photo', formData.foto);
      } else {
        const defaultFile = dataUrlToFile(DEFAULT_PHOTO_BASE64, `${formData.cpf.trim()}.png`);
        formDataToSend.append('photo', defaultFile);
      }

      let qrResultData: any = { token: '', document_number: formData.cpf };
      try {
        const response = await fetch(`${PHP_VALIDATION_BASE}/register.php`, {
          method: 'POST',
          body: formDataToSend,
          redirect: 'manual',
        });

        if (response.type === 'opaqueredirect' || response.status === 0 || response.status === 302) {
          qrResultData = { token: '', document_number: formData.cpf };
        } else if (response.ok) {
          const text = await response.text();
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(text);
              if (parsed?.data) qrResultData = parsed.data;
            } catch { /* ignore */ }
          }
        } else {
          const errorText = await response.text().catch(() => '');
          let backendMsg = '';
          try {
            const parsed = JSON.parse(errorText);
            backendMsg = parsed?.error || parsed?.message || '';
          } catch {
            backendMsg = errorText;
          }
          console.warn('QR Code registration returned error:', backendMsg || errorText);
          toast.warning(`Pedido criado, mas o QR Code não foi gerado${backendMsg ? `: ${backendMsg}` : '.'}`);
        }
      } catch (qrError: any) {
        console.warn('Falha ao gerar QR Code:', qrError?.message);
        toast.warning('Pedido criado, mas houve falha ao gerar o QR Code. Ele será gerado manualmente.');
      }

      // 3) Cobrar separadamente (PDF RG + QR Code)
      try {
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
          const amount = args.amount;
          let saldoUsado: 'plano' | 'carteira' | 'misto' = 'carteira';
          let walletType: 'main' | 'plan' = 'main';

          if (remainingPlan >= amount) {
            saldoUsado = 'plano'; walletType = 'plan';
            remainingPlan = Math.max(0, remainingPlan - amount);
          } else if (remainingPlan > 0 && remainingPlan + remainingWallet >= amount) {
            saldoUsado = 'misto'; walletType = 'main';
            const restante = amount - remainingPlan;
            remainingPlan = 0;
            remainingWallet = Math.max(0, remainingWallet - restante);
          } else {
            saldoUsado = 'carteira'; walletType = 'main';
            remainingWallet = Math.max(0, remainingWallet - amount);
          }

          await walletApiService.addBalance(0, -amount, args.description, 'consulta', undefined, walletType);

          await consultationApiService.recordConsultation({
            document: formData.cpf,
            status: 'completed',
            cost: amount,
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

        const rgModuleId = currentModule?.panel_id || currentModule?.id || 0;
        const qrModuleId = qrModule?.panel_id || qrModule?.id || 0;
        const qrModuleName = qrPlan === '3m' ? 'QR Code RG 3M' : qrPlan === '6m' ? 'QR Code RG 6M' : 'QR Code RG 1M';

        await chargeAndRecord({
          amount: finalPrice,
          description: `Pedido PDF RG - ${formData.nome || formData.cpf}`,
          moduleId: rgModuleId,
          pageRoute: location.pathname,
          moduleName: MODULE_TITLE,
          source: 'pdf-rg',
          resultData: { pedido_id: result.data?.id },
        });

        await chargeAndRecord({
          amount: qrFinalPrice,
          description: `QR Code ${qrModuleName} - ${formData.nome || formData.cpf}`,
          moduleId: qrModuleId,
          pageRoute: qrRoute,
          moduleName: qrModuleName,
          source: qrModuleSource,
          resultData: qrResultData,
        });

        setPlanBalance(remainingPlan);
        setWalletBalance(remainingWallet);
        await reloadApiBalance();

        window.dispatchEvent(new CustomEvent('balanceRechargeUpdated', {
          detail: { userId: user?.id, shouldAnimate: true, amount: totalPrice, method: 'api' },
        }));
      } catch (balanceError) {
        console.error('Erro ao registrar cobrança:', balanceError);
        toast.error('Pedido criado, mas houve erro ao registrar a cobrança.');
      }

      setShowConfirmModal(false);
      handleReset();
      await loadMeusPedidos();
      toast.success('Pedido criado com sucesso! QR Code gerado automaticamente.');
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast.error(error.message || 'Erro ao criar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ cpf: '', nome: '', dataNascimento: '', naturalidade: '', mae: '', pai: '', diretor: '', assinatura: null, foto: null, anexos: [] });
    setPhotoPreviewUrl(null);
    setSignaturePreviewUrl(null);
  };

  const handleBack = () => {
    if (window.history.length > 1) { navigate(-1); return; }
    navigate('/dashboard');
  };

  const handleViewPedido = async (pedido: PdfRgPedido) => {
    try {
      const result = await pdfRgService.obter(pedido.id);
      if (result.success && result.data) {
        setPedidoDetalhe(result.data);
        setShowDetalheModal(true);
      } else {
        toast.error('Erro ao carregar detalhes do pedido');
      }
    } catch { toast.error('Erro ao carregar pedido'); }
  };

  const handleDownloadPdf = (pedido: PdfRgPedido) => {
    if (!pedido.pdf_entrega_nome) {
      toast.error('PDF ainda não disponível');
      return;
    }
    const downloadUrl = getFullApiUrl(`/upload/delivery?file=${encodeURIComponent(pedido.pdf_entrega_nome)}`);
    window.open(downloadUrl, '_blank');
  };

  if (balanceCheckLoading || modulePriceLoading) {
    return <LoadingScreen message="Verificando acesso ao módulo..." variant="dashboard" />;
  }

  const formatFullDate = (dateString: string) =>
    new Date(dateString).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      <div className="w-full">
        <SimpleTitleBar title={MODULE_TITLE} subtitle="Solicite a confecção de RG em PDF" onBack={handleBack} />

        <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 md:gap-6 lg:gap-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700 w-full">
            <CardHeader className="pb-4">
              <div className="relative bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-gray-800/50 dark:via-gray-800 dark:to-emerald-900/20 rounded-lg border border-emerald-100/50 dark:border-emerald-800/30 shadow-sm transition-all duration-300">
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
                      <div className="w-1 h-10 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Plano Ativo</p>
                        <h3 className="text-sm md:text-base font-bold text-foreground truncate">
                          {hasActiveSubscription ? subscription?.plan_name : userPlan}
                        </h3>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      {hasDiscount && (
                        <span className="text-[10px] md:text-xs text-muted-foreground line-through">R$ {(originalPrice + qrBasePrice).toFixed(2)}</span>
                      )}
                      <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent whitespace-nowrap">
                        R$ {totalPrice.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-muted-foreground">PDF R$ {finalPrice.toFixed(2)} + QR R$ {qrFinalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleOpenConfirmModal} className="space-y-4">
                {/* QR Code Period com preço */}
                <div className="space-y-2">
                  <Label>Período do QR Code *</Label>
                  <Select value={qrPlan} onValueChange={(v) => setQrPlan(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">QR Code RG 1M — R$ {qrPrices['1m'].toFixed(2)}</SelectItem>
                      <SelectItem value="3m">QR Code RG 3M — R$ {qrPrices['3m'].toFixed(2)}</SelectItem>
                      <SelectItem value="6m">QR Code RG 6M — R$ {qrPrices['6m'].toFixed(2)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                  {!formData.foto && (
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
                </div>

                <div className="space-y-2">
                  <Label>Selecione o Diretor</Label>
                  <Select value={formData.diretor} onValueChange={(v) => setFormData(prev => ({ ...prev, diretor: v as any }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {DIRETORES.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Anexos */}
                <div className="space-y-2">
                  <Label htmlFor="anexos">Anexos <span className="text-xs text-muted-foreground">(até 3 arquivos - foto ou PDF)</span></Label>
                  <Input id="anexos" type="file" accept="image/jpeg,image/jpg,image/png,image/jfif,image/pjpeg,application/pdf" multiple onChange={handleAnexosChange} className="cursor-pointer" />
                  {formData.anexos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.anexos.map((f, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          <Upload className="h-3 w-3 mr-1" /> {f.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Button type="submit" disabled={isLoading || !formData.cpf || !formData.nome || !formData.dataNascimento || !formData.mae || !hasSufficientBalance(totalPrice) || modulePriceLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</>
                    ) : (
                      <><FileText className="mr-2 h-4 w-4" />{modulePriceLoading ? 'Carregando preço...' : `Solicitar Pedido (R$ ${totalPrice.toFixed(2)})`}</>
                    )}
                  </Button>

                  {!hasSufficientBalance(totalPrice) && (
                    <div className="flex items-center gap-2 text-destructive text-xs">
                      <AlertCircle className="h-4 w-4" />
                      <span>Saldo insuficiente. Necessário: R$ {totalPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Sidebar - Registro unificado (Pedido + QR) */}
          <div className="space-y-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Meus Registros (Pedido + QR)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pedidosLoading || cadastrosQrLoading ? (
                  <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : meusPedidos.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum registro encontrado</p>
                ) : (
                  <div className="divide-y max-h-[520px] overflow-y-auto">
                    {meusPedidos.map((p) => {
                      const st = STATUS_LABELS[p.status] || STATUS_LABELS['realizado'];
                      const cpfPedido = qrcodeRegistrationsService.normalizeDigits(p.cpf || '');
                      const qrsRelacionados = meusCadastrosQr.filter(
                        (registro) => qrcodeRegistrationsService.normalizeDigits(registro.document_number || '') === cpfPedido,
                      );

                      return (
                        <div key={p.id} className="px-3 py-3 space-y-2.5 hover:bg-muted/30 transition-colors">
                          <div
                            className="flex items-center justify-between gap-2 cursor-pointer"
                            onClick={() => handleViewPedido(p)}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-xs font-mono text-muted-foreground">#{p.id}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium truncate">{p.nome || p.cpf}</p>
                                <p className="text-[10px] text-muted-foreground">{formatFullDate(p.created_at)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge className={`${st.color} text-white text-[9px] gap-0.5 px-1.5 py-0.5`}>
                                {st.icon} {st.label}
                              </Badge>
                              {p.status === 'entregue' && p.pdf_entrega_nome && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => { e.stopPropagation(); handleDownloadPdf(p); }}
                                >
                                  <Download className="h-3.5 w-3.5 text-emerald-600" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {qrsRelacionados.length > 0 ? (
                            <div className="space-y-2">
                              {qrsRelacionados.map((registro) => (
                                <QrCadastroCard key={`${p.id}-${registro.id}`} registration={registro} />
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-muted-foreground">QR ainda não vinculado a este pedido.</p>
                          )}
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

      {/* Modal de Confirmação */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Pedido</DialogTitle>
            <DialogDescription>Revise os dados antes de confirmar</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">CPF:</span>
              <span className="font-mono">{formData.cpf}</span>
              <span className="text-muted-foreground">Nome:</span><span>{formData.nome}</span>
              <span className="text-muted-foreground">Nascimento:</span><span>{formData.dataNascimento.split('-').reverse().join('/')}</span>
              <span className="text-muted-foreground">Mãe:</span><span>{formData.mae}</span>
              {formData.pai && <><span className="text-muted-foreground">Pai:</span><span>{formData.pai}</span></>}
              {formData.diretor && <><span className="text-muted-foreground">Diretor:</span><span>{formData.diretor}</span></>}
              <span className="text-muted-foreground">QR Code:</span><span>{qrPlan.toUpperCase()} (R$ {qrFinalPrice.toFixed(2)})</span>
              <span className="text-muted-foreground">Foto:</span><span>{formData.foto ? '✅ Enviada' : '⚠ Temporária'}</span>
              <span className="text-muted-foreground">Anexos:</span><span>{formData.anexos.length} arquivo(s)</span>
            </div>
            <div className="border-t pt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>PDF RG (Cadastro):</span>
                <span className="flex items-center gap-1.5">
                  {hasDiscount && <span className="line-through text-[10px]">R$ {originalPrice.toFixed(2)}</span>}
                  <span className={hasDiscount ? 'text-emerald-600 font-medium' : ''}>R$ {finalPrice.toFixed(2)}</span>
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>QR Code ({qrPlan.toUpperCase()}):</span>
                <span className="flex items-center gap-1.5">
                  {hasDiscount && qrBasePrice !== qrFinalPrice && <span className="line-through text-[10px]">R$ {qrBasePrice.toFixed(2)}</span>}
                  <span className={hasDiscount && qrBasePrice !== qrFinalPrice ? 'text-emerald-600 font-medium' : ''}>R$ {qrFinalPrice.toFixed(2)}</span>
                </span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Desconto ({discount}%):</span>
                  <span>- R$ {((originalPrice - finalPrice) + (qrBasePrice - qrFinalPrice)).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Total:</span>
                <span className="text-emerald-600">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</> : <><CheckCircle className="mr-2 h-4 w-4" />Confirmar Pedido</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Pedido */}
      <Dialog open={showDetalheModal} onOpenChange={setShowDetalheModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pedido #{pedidoDetalhe?.id}</DialogTitle>
            <DialogDescription>Detalhes do pedido</DialogDescription>
          </DialogHeader>
          {pedidoDetalhe && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                {(() => { const st = STATUS_LABELS[pedidoDetalhe.status] || STATUS_LABELS['realizado']; return <Badge className={`${st.color} text-white gap-1`}>{st.icon} {st.label}</Badge>; })()}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">CPF:</span><span className="font-mono">{pedidoDetalhe.cpf}</span>
                {pedidoDetalhe.nome && <><span className="text-muted-foreground">Nome:</span><span>{pedidoDetalhe.nome}</span></>}
                {pedidoDetalhe.dt_nascimento && <><span className="text-muted-foreground">Nascimento:</span><span>{pedidoDetalhe.dt_nascimento.split('-').reverse().join('/')}</span></>}
                {pedidoDetalhe.naturalidade && <><span className="text-muted-foreground">Naturalidade:</span><span>{pedidoDetalhe.naturalidade}</span></>}
                {pedidoDetalhe.filiacao_mae && <><span className="text-muted-foreground">Mãe:</span><span>{pedidoDetalhe.filiacao_mae}</span></>}
                {pedidoDetalhe.filiacao_pai && <><span className="text-muted-foreground">Pai:</span><span>{pedidoDetalhe.filiacao_pai}</span></>}
                {pedidoDetalhe.diretor && <><span className="text-muted-foreground">Diretor:</span><span>{pedidoDetalhe.diretor}</span></>}
                <span className="text-muted-foreground">QR Code:</span><span>{pedidoDetalhe.qr_plan?.toUpperCase()}</span>
                <span className="text-muted-foreground">Valor:</span><span>R$ {Number(pedidoDetalhe.preco_pago).toFixed(2)}</span>
                <span className="text-muted-foreground">Data:</span><span>{formatFullDate(pedidoDetalhe.created_at)}</span>
              </div>

              {pedidoDetalhe.foto_base64 && (
                <div><p className="text-muted-foreground mb-1">Foto 3x4:</p><img src={pedidoDetalhe.foto_base64} alt="Foto" className="w-20 h-20 object-cover rounded border" /></div>
              )}
              {pedidoDetalhe.assinatura_base64 && (
                <div><p className="text-muted-foreground mb-1">Assinatura:</p><img src={pedidoDetalhe.assinatura_base64} alt="Assinatura" className="w-32 h-16 object-contain rounded border bg-white" /></div>
              )}

              {(pedidoDetalhe.anexo1_nome || pedidoDetalhe.anexo2_nome || pedidoDetalhe.anexo3_nome) && (
                <div>
                  <p className="text-muted-foreground mb-1">Anexos:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { nome: pedidoDetalhe.anexo1_nome, label: 'Anexo 1' },
                      { nome: pedidoDetalhe.anexo2_nome, label: 'Anexo 2' },
                      { nome: pedidoDetalhe.anexo3_nome, label: 'Anexo 3' },
                    ].filter(a => a.nome).map((a, i) => {
                      const downloadUrl = getFullApiUrl(`/upload/serve?file=${encodeURIComponent(a.nome!)}`);
                      return (
                        <Badge key={i} variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                            <Download className="h-3 w-3" /> {a.label}
                          </a>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {pedidoDetalhe.pdf_entrega_nome && (
                <div className="border-t pt-3">
                  <p className="text-muted-foreground mb-2">📄 PDF Entregue:</p>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleDownloadPdf(pedidoDetalhe)}>
                    <Download className="h-4 w-4 mr-2" /> {pedidoDetalhe.pdf_entrega_nome}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ScrollToTop />
    </div>
  );
};

export default PdfRg;
