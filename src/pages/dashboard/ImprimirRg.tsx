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
const QR_ROUTE = '/dashboard/qrcode-rg-1m';

const DIRETORES = ['Maranhão', 'Piauí', 'Goiânia', 'Tocantins'] as const;
type DiretorPdfRg = (typeof DIRETORES)[number];
type InputMode = 'manual' | 'registro';

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [planBalance, setPlanBalance] = useState(0);
  const [modulePrice, setModulePrice] = useState(0);
  const [modulePriceLoading, setModulePriceLoading] = useState(true);
  const [balanceCheckLoading, setBalanceCheckLoading] = useState(true);

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

  const qrModule = useMemo(() => {
    return (modules || []).find((m: any) => normalizeModuleRoute(m) === QR_ROUTE) || null;
  }, [modules]);

  const qrBasePrice = useMemo(() => {
    const rawPrice = qrModule?.price;
    const price = Number(rawPrice ?? 0);
    if (price && price > 0) return price;
    return getModulePrice(QR_ROUTE);
  }, [qrModule?.price]);

  const loadModulePrice = useCallback(() => {
    setModulePriceLoading(true);
    const rawPrice = currentModule?.price;
    const price = Number(rawPrice ?? 0);
    if (price && price > 0) {
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

  const originalPrice = modulePrice > 0 ? modulePrice : 0;
  const { discountedPrice: finalPrice, hasDiscount } =
    hasActiveSubscription && originalPrice > 0
      ? calculateSubscriptionDiscount(originalPrice)
      : { discountedPrice: originalPrice, hasDiscount: false };

  const qrFinalPrice =
    hasActiveSubscription && qrBasePrice > 0
      ? calculateSubscriptionDiscount(qrBasePrice).discountedPrice
      : qrBasePrice;

  const totalPrice = finalPrice + qrFinalPrice;
  const discount = hasDiscount ? discountPercentage : 0;
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
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Assinatura muito grande (máx 10MB)');
      return;
    }
    setFormData((prev) => ({ ...prev, assinatura: file }));
  };

  const handleAnexosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      toast.error('Máximo 3 anexos permitidos');
      return;
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
      const payload: Record<string, any> = {
        cpf: formData.cpf.trim(),
        nome: formData.nome.trim() || null,
        dt_nascimento: formData.dataNascimento || null,
        naturalidade: formData.naturalidade.trim() || null,
        filiacao_mae: formData.mae.trim() || null,
        filiacao_pai: formData.pai.trim() || null,
        diretor: formData.diretor || null,
        qr_plan: '1m',
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

      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.nome.toUpperCase().trim());
      formDataToSend.append('birth_date', formData.dataNascimento);
      formDataToSend.append('document_number', formData.cpf.trim());
      formDataToSend.append('parent1', formData.pai.toUpperCase().trim());
      formDataToSend.append('parent2', formData.mae.toUpperCase().trim());
      if (user?.id) formDataToSend.append('id_user', String(user.id));

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      formDataToSend.append('expiry_date', expiryDate.toISOString().split('T')[0]);
      formDataToSend.append('module_source', 'qrcode-rg-1m');

      if (formData.foto) {
        formDataToSend.append('photo', formData.foto);
      } else if (inheritedFiles?.foto_base64) {
        formDataToSend.append('photo', dataUrlToFile(inheritedFiles.foto_base64, `${formData.cpf.trim()}.png`));
      } else {
        formDataToSend.append('photo', dataUrlToFile(DEFAULT_PHOTO_BASE64, `${formData.cpf.trim()}.png`));
      }

      let qrResultData: any = { token: '', document_number: formData.cpf };
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

      await chargeAndRecord({
        amount: finalPrice,
        description: `Impressão RG - ${formData.nome || formData.cpf}`,
        moduleId: currentModule?.panel_id || currentModule?.id || TARGET_MODULE_ID,
        pageRoute: location.pathname,
        moduleName: MODULE_TITLE,
        source: 'imprimir-rg',
        resultData: { pedido_id: result.data?.id, source_record_id: selectedSourceId },
      });

      await chargeAndRecord({
        amount: qrFinalPrice,
        description: `QR Code RG 1M - ${formData.nome || formData.cpf}`,
        moduleId: qrModule?.panel_id || qrModule?.id || 0,
        pageRoute: QR_ROUTE,
        moduleName: 'QR Code RG 1M',
        source: 'qrcode-rg-1m',
        resultData: qrResultData,
      });

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

        <div className="mt-4 md:mt-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Como deseja iniciar?</CardTitle>
              <CardDescription className="text-sm">Escolha entre preencher manualmente ou reaproveitar um registro comprado no módulo RG (ID 165).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button type="button" variant={inputMode === 'manual' ? 'default' : 'outline'} className="justify-start gap-2 h-auto py-3" onClick={() => { setInputMode('manual'); resetForm(); }}>
                  <PenSquare className="h-4 w-4" />
                  <span>Informar dados manualmente</span>
                </Button>
                <Button type="button" variant={inputMode === 'registro' ? 'default' : 'outline'} className="justify-start gap-2 h-auto py-3" onClick={() => { setInputMode('registro'); resetForm(); }}>
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

              {inputMode && (
                <form onSubmit={handleOpenConfirmModal} className="space-y-4">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Total cobrado (módulo + QR padrão 1 mês)</p>
                    <p className="text-lg font-semibold">R$ {totalPrice.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{MODULE_TITLE} R$ {finalPrice.toFixed(2)} + QR Code 1M R$ {qrFinalPrice.toFixed(2)}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input id="cpf" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={11} placeholder="CPF (somente números)" value={formData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input id="nome" type="text" placeholder="Nome completo" value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento">Data de nascimento *</Label>
                      <Input id="dataNascimento" type="date" value={formData.dataNascimento} onChange={(e) => handleInputChange('dataNascimento', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="naturalidade">Naturalidade</Label>
                      <Input id="naturalidade" type="text" placeholder="Naturalidade" value={formData.naturalidade} onChange={(e) => handleInputChange('naturalidade', e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="mae">Filiação / Mãe *</Label>
                      <Input id="mae" type="text" placeholder="Nome da mãe" value={formData.mae} onChange={(e) => handleInputChange('mae', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pai">Filiação / Pai</Label>
                      <Input id="pai" type="text" placeholder="Nome do pai" value={formData.pai} onChange={(e) => handleInputChange('pai', e.target.value)} />
                    </div>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="foto">Foto 3x4</Label>
                      <Input id="foto" type="file" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={handlePhotoChange} className="cursor-pointer" />
                      {!formData.foto && inheritedFiles?.foto_base64 && (
                        <p className="text-xs text-muted-foreground">Será utilizada a foto do registro selecionado.</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assinatura">Assinatura</Label>
                      <Input id="assinatura" type="file" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={handleSignatureChange} className="cursor-pointer" />
                      {!formData.assinatura && inheritedFiles?.assinatura_base64 && (
                        <p className="text-xs text-muted-foreground">Será utilizada a assinatura do registro selecionado.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anexos">Anexos (até 3)</Label>
                    <Input id="anexos" type="file" accept="image/jpeg,image/jpg,image/png,image/jfif,image/pjpeg,application/pdf" multiple onChange={handleAnexosChange} className="cursor-pointer" />
                    {!!formData.anexos.length && (
                      <div className="flex flex-wrap gap-2">
                        {formData.anexos.map((file, index) => (
                          <Badge key={`${file.name}-${index}`} variant="secondary" className="text-xs gap-1">
                            <Upload className="h-3 w-3" />
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {!formData.anexos.length && (inheritedFiles?.anexo1_base64 || inheritedFiles?.anexo2_base64 || inheritedFiles?.anexo3_base64) && (
                      <p className="text-xs text-muted-foreground">Serão utilizados anexos do registro selecionado (se houver).</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || !hasSufficientBalance || isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processando...</>
                    ) : (
                      <><FileText className="h-4 w-4 mr-2" />Solicitar impressão (R$ {totalPrice.toFixed(2)})</>
                    )}
                  </Button>

                  {!hasSufficientBalance && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Saldo insuficiente. Necessário: R$ {totalPrice.toFixed(2)}
                    </div>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resumo de cobrança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plano ativo</span>
                  <span className="font-medium">{hasActiveSubscription ? subscription?.plan_name : userPlan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Módulo {TARGET_MODULE_ID}</span>
                  <span>R$ {finalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">QR Code 1 mês</span>
                  <span>R$ {qrFinalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                {hasDiscount && (
                  <Badge variant="secondary" className="text-xs">Desconto de assinatura aplicado: {discount}%</Badge>
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
              Você será cobrado em <strong>R$ {totalPrice.toFixed(2)}</strong> ({MODULE_TITLE} + QR Code 1 mês).
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
