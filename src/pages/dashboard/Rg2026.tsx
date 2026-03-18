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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, QrCode, Loader2, AlertCircle, CheckCircle, User, Calendar, CreditCard, Users, Trash2, PenTool, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useApiModules } from '@/hooks/useApiModules';
import { useIsMobile } from '@/hooks/use-mobile';
import { getModulePrice } from '@/utils/modulePrice';
import { consultationApiService } from '@/services/consultationApiService';
import { walletApiService } from '@/services/walletApiService';
import { rg2026Service, type Rg2026Registro } from '@/services/rg2026Service';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';
import LoadingScreen from '@/components/layout/LoadingScreen';
import ScrollToTop from '@/components/ui/scroll-to-top';

const PHP_API_BASE = 'https://qr.apipainel.com.br/qrcode';
const PHP_VALIDATION_BASE = 'https://qr.apipainel.com.br/qrvalidation';

const MODULE_TITLE = 'RG 2026';
const MODULE_SOURCE = 'rg-2026';
const MODULE_ROUTE = '/dashboard/rg-2026';
const MODULE_TODOS_ROUTE = '/dashboard/rg-2026/todos';
const EXPIRY_MONTHS = 1; // mantém a lógica atual do módulo (não alterar o envio por enquanto)

const DIRETORES = ['Maranhão', 'Piauí', 'Goiânia', 'Tocantins'] as const;

type DiretorRg2026 = (typeof DIRETORES)[number];

type Sexo = 'M' | 'F' | 'O';

interface FormData {
  // usados no envio (mantém comportamento do módulo original)
  nome: string;
  dataNascimento: string;
  numeroDocumento: string;
  pai: string;
  mae: string;
  foto: File | null;

  // novos campos
  nomeSocial: string;
  sexo: Sexo | '';
  nacionalidade: string;
  naturalidade: string;
  validade: string;
  assinatura: File | null;
  numeroFolha: string;
  numeroQrcode: string;
  orgaoExpedidor: string;
  local: string;
  emissao: string;
  diretor: DiretorRg2026 | '';
}

type RegistroData = Rg2026Registro;

interface QrRegistroData {
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
  module_source?: string;
}

const Rg2026 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modules } = useApiModules();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    nomeSocial: '',
    numeroDocumento: '',
    sexo: '',
    dataNascimento: '',
    nacionalidade: '',
    naturalidade: '',
    validade: '',
    assinatura: null,
    foto: null,
    numeroFolha: '',
    numeroQrcode: '',
    mae: '',
    pai: '',
    orgaoExpedidor: '',
    local: '',
    emissao: '',
    diretor: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showSignatureEditor, setShowSignatureEditor] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [planBalance, setPlanBalance] = useState(0);
  const [modulePrice, setModulePrice] = useState(0);
  const [modulePriceLoading, setModulePriceLoading] = useState(true);
  const [balanceCheckLoading, setBalanceCheckLoading] = useState(true);
  const [qrPlan, setQrPlan] = useState<'1m' | '3m' | '6m'>('1m');

  // Cadastros do RG-2026 (tabela interna)
  const [recentRegistrations, setRecentRegistrations] = useState<RegistroData[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  // Cadastros do QR (para exibir “Meus Cadastros” com foto + QR)
  const [myQrRegistrations, setMyQrRegistrations] = useState<QrRegistroData[]>([]);
  const [myQrLoading, setMyQrLoading] = useState(false);

  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, today: 0, this_month: 0, total_cost: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const { balance, loadBalance: reloadApiBalance } = useWalletBalance();
  const {
    hasActiveSubscription,
    subscription,
    discountPercentage,
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

  const loadBalances = useCallback(() => {
    if (!user) return;
    setPlanBalance(balance.saldo_plano || 0);
    setWalletBalance(balance.saldo || 0);
  }, [user, balance]);

  const loadRecentRegistrations = useCallback(async () => {
    try {
      setRecentLoading(true);
      const userId = user?.id ? Number(user.id) : null;

      const result = await rg2026Service.list({
        limit: 100,
        offset: 0,
        ...(userId ? { user_id: userId } : {}),
      });

      if (!result.success || !result.data) {
        setRecentRegistrations([]);
        return;
      }

      const rows = result.data.data || [];
      setRecentRegistrations(rows);

      if (import.meta.env.DEV && rows[0]) {
        console.info('[RG2026] Registro (sample):', {
          keys: Object.keys(rows[0] as any),
          has_assinatura_base64: Boolean((rows[0] as any)?.assinatura_base64),
        });
      }
      const todayStr = new Date().toDateString();
      const now = new Date();
      const computed = rows.reduce(
        (acc: any, item: RegistroData) => {
          acc.total += 1;
          acc.completed += 1;
          const d = new Date(item.created_at);
          if (d.toDateString() === todayStr) acc.today += 1;
          if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) acc.this_month += 1;
          return acc;
        },
        { total: 0, completed: 0, pending: 0, today: 0, this_month: 0, total_cost: 0 }
      );
      setStats(computed);
    } catch (error) {
      console.error('Erro ao carregar cadastros RG-2026:', error);
      setRecentRegistrations([]);
    } finally {
      setRecentLoading(false);
      setStatsLoading(false);
    }
  }, [user?.id]);

  const loadMyQrRegistrations = useCallback(async () => {
    try {
      setMyQrLoading(true);
      const userId = user?.id || '';
      if (!userId) {
        setMyQrRegistrations([]);
        return;
      }

      const response = await fetch(`${PHP_API_BASE}/list_users.php?limit=100&offset=0&id_user=${encodeURIComponent(String(userId))}`);
      const data = await response.json();

      if (!data?.success || !Array.isArray(data.data)) {
        setMyQrRegistrations([]);
        return;
      }

      // QRCode RG (1m/3m/6m)
      // OBS: alguns backends não retornam `module_source` — nesse caso, não podemos filtrar por ele.
      const filtered: QrRegistroData[] = data.data.filter((item: any) => {
        const source = String(item?.module_source || '').trim();
        if (!source) return true;
        return source.startsWith('qrcode-rg-');
      });

      setMyQrRegistrations(filtered);
    } catch (error) {
      console.error('Erro ao carregar cadastros de QRCode (RG):', error);
      setMyQrRegistrations([]);
    } finally {
      setMyQrLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (balance.saldo !== undefined || balance.saldo_plano !== undefined) {
      loadBalances();
    }
  }, [balance, loadBalances]);

  useEffect(() => {
    if (!user) return;
    reloadApiBalance();
    loadRecentRegistrations();
    loadMyQrRegistrations();
  }, [user, reloadApiBalance, loadRecentRegistrations, loadMyQrRegistrations]);

  useEffect(() => {
    if (!user) return;
    loadModulePrice();
  }, [user, loadModulePrice]);

  useEffect(() => {
    if (!user) {
      setBalanceCheckLoading(false);
      return;
    }
    if (modulePriceLoading || !modulePrice) return;
    if (subscriptionLoading) return;
    setBalanceCheckLoading(false);
  }, [user, modulePriceLoading, modulePrice, subscriptionLoading]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'numeroDocumento' || field === 'numeroFolha' || field === 'numeroQrcode') value = value.replace(/\D/g, '');
    if (field === 'nome' || field === 'pai' || field === 'mae' || field === 'nomeSocial' || field === 'nacionalidade' || field === 'naturalidade' || field === 'orgaoExpedidor' || field === 'local') {
      value = value.toUpperCase();
    }
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
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Foto muito grande (máximo 10MB)');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Use apenas JPG, PNG ou GIF');
      return;
    }
    setFormData(prev => ({ ...prev, foto: file }));
    readFileAsDataUrl(file, setPhotoPreviewUrl);
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Assinatura muito grande (máximo 10MB)');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Use apenas JPG, PNG ou GIF');
      return;
    }
    setFormData(prev => ({ ...prev, assinatura: file }));
    readFileAsDataUrl(file, setSignaturePreviewUrl);
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();

    // Campos obrigatórios (agora: todos os campos do formulário)
    if (!formData.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    // Nome Social é opcional
    if (!formData.sexo) { toast.error('Sexo é obrigatório'); return; }
    if (!formData.nacionalidade.trim()) { toast.error('Nacionalidade é obrigatória'); return; }
    if (!formData.naturalidade.trim()) { toast.error('Naturalidade é obrigatória'); return; }
    if (!formData.validade) { toast.error('Validade é obrigatória'); return; }

    if (!formData.numeroDocumento.trim()) { toast.error('CPF é obrigatório'); return; }
    if (!formData.dataNascimento) { toast.error('Data de Nascimento é obrigatória'); return; }

    if (!formData.numeroFolha.trim()) { toast.error('Número da Folha é obrigatório'); return; }
    if (!formData.numeroQrcode.trim()) { toast.error('Número do QR Code é obrigatório'); return; }

    if (!formData.mae.trim()) { toast.error('Filiação / Mãe é obrigatória'); return; }
    if (!formData.pai.trim()) { toast.error('Filiação / Pai é obrigatória'); return; }

    if (!formData.orgaoExpedidor.trim()) { toast.error('Órgão Expedidor é obrigatório'); return; }
    if (!formData.local.trim()) { toast.error('Local de Emissão é obrigatório'); return; }
    if (!formData.emissao) { toast.error('Data de Emissão é obrigatória'); return; }
    if (!formData.diretor) { toast.error('Diretor Regional é obrigatório'); return; }

    // Para gerar QRCode automaticamente, precisamos da foto 3x4
    if (!formData.foto) { toast.error('A Foto 3x4 é obrigatória para gerar o QR Code'); return; }

    // Assinatura obrigatória (para exibição/integração)
    if (!formData.assinatura) { toast.error('A assinatura é obrigatória'); return; }

    if (!hasSufficientBalance(totalPrice)) {
      toast.error(`Saldo insuficiente. Necessário: R$ ${totalPrice.toFixed(2)}`);
      return;
    }

    setShowConfirmModal(true);
  };

  const originalPrice = modulePrice > 0 ? modulePrice : 0;
  const { discountedPrice: finalPrice, hasDiscount } = hasActiveSubscription && originalPrice > 0
    ? calculateSubscriptionDiscount(originalPrice)
    : { discountedPrice: originalPrice, hasDiscount: false };
  const discount = hasDiscount ? discountPercentage : 0;

  const qrFinalPrice = hasActiveSubscription && qrBasePrice > 0
    ? calculateSubscriptionDiscount(qrBasePrice).discountedPrice
    : qrBasePrice;

  const totalPrice = finalPrice + qrFinalPrice;

  // Mostrar apenas QRs vinculados a cadastros feitos no módulo Edição RG (RG-2026)
  const myRgCpfsSet = useMemo(() => {
    return new Set(
      (recentRegistrations || [])
        .map((r) => String(r.cpf || '').replace(/\D/g, ''))
        .filter(Boolean)
    );
  }, [recentRegistrations]);

  const myRgSignatureByCpf = useMemo(() => {
    const map = new Map<string, string>();
    (recentRegistrations || []).forEach((r) => {
      const cpf = String(r.cpf || '').replace(/\D/g, '');
      const sig = String((r as any).assinatura_base64 || '').trim();
      if (cpf && sig) map.set(cpf, sig);
    });
    return map;
  }, [recentRegistrations]);

  const myRgQrRegistrations = useMemo(() => {
    if (!myRgCpfsSet.size) return [] as QrRegistroData[];
    return (myQrRegistrations || []).filter((qr) => myRgCpfsSet.has(String(qr.document_number || '').replace(/\D/g, '')));
  }, [myQrRegistrations, myRgCpfsSet]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsDataURL(file);
    });

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1) Criar registro RG‑2026 (API)
      const payload: Record<string, any> = {
        // obrigatórios
        nome: formData.nome.trim(),
        cpf: formData.numeroDocumento.trim(),
        dt_nascimento: formData.dataNascimento,
        filiacao_mae: formData.mae.trim(),

        // opcionais
        nome_social: formData.nomeSocial.trim() || null,
        sexo: formData.sexo || null,
        nacionalidade: formData.nacionalidade.trim() || null,
        naturalidade: formData.naturalidade.trim() || null,
        validade: formData.validade || null,
        numero_folha: formData.numeroFolha.trim() || null,
        numero_qrcode: formData.numeroQrcode.trim() || null,
        filiacao_pai: formData.pai.trim() || null,
        orgao_expedidor: formData.orgaoExpedidor.trim() || null,
        local_emissao: formData.local.trim() || null,
        dt_emissao: formData.emissao || null,
        diretor: formData.diretor || null,
      };

      if (formData.foto) payload.foto_base64 = await fileToBase64(formData.foto);
      if (formData.assinatura) payload.assinatura_base64 = await fileToBase64(formData.assinatura);

      const rgResult = await rg2026Service.create(payload);
      if (!rgResult.success) throw new Error(rgResult.error || 'Erro ao cadastrar RG‑2026');

      // 2) Criar QRCode RG (backend PHP) usando a foto e os mesmos campos básicos
      const qrModuleSource = qrPlan === '3m' ? 'qrcode-rg-3m' : qrPlan === '6m' ? 'qrcode-rg-6m' : 'qrcode-rg-1m';
      const expiryMonths = qrPlan === '3m' ? 3 : qrPlan === '6m' ? 6 : 1;

      if (!formData.foto) {
        // (deve ter sido bloqueado antes, mas deixamos guard-rail)
        throw new Error('Foto 3x4 é obrigatória para gerar o QR Code');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.nome.toUpperCase().trim());
      formDataToSend.append('birth_date', formData.dataNascimento);
      formDataToSend.append('document_number', formData.numeroDocumento.trim());
      formDataToSend.append('parent1', formData.pai.toUpperCase().trim());
      formDataToSend.append('parent2', formData.mae.toUpperCase().trim());
      if (user?.id) formDataToSend.append('id_user', String(user.id));

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);
      formDataToSend.append('expiry_date', expiryDate.toISOString().split('T')[0]);
      formDataToSend.append('module_source', qrModuleSource);
      formDataToSend.append('photo', formData.foto);

      let qrResultData: any = { token: '', document_number: formData.numeroDocumento };
      try {
        const response = await fetch(`${PHP_VALIDATION_BASE}/register.php`, {
          method: 'POST',
          body: formDataToSend,
          redirect: 'manual',
        });

        if (response.type === 'opaqueredirect' || response.status === 0 || response.status === 302) {
          qrResultData = { token: '', document_number: formData.numeroDocumento };
        } else if (response.ok) {
          const text = await response.text();
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(text);
              if (parsed?.data) qrResultData = parsed.data;
            } catch {
              // ignore
            }
          }
        } else {
          const errorText = await response.text().catch(() => '');
          try {
            const err = JSON.parse(errorText);
            throw new Error(err.error || err.message || `Erro ${response.status}`);
          } catch (e: any) {
            throw new Error(e?.message || `Erro ${response.status}`);
          }
        }
      } catch (e: any) {
        // Não “desfaz” o RG‑2026, só avisa que o QR falhou
        throw new Error(`RG‑2026 criado, mas falhou ao gerar QR Code (${qrPlan}): ${e?.message || 'erro desconhecido'}`);
      }

      // 3) Cobrar e registrar histórico (dois lançamentos)
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
            saldoUsado = 'plano';
            walletType = 'plan';
            remainingPlan = Math.max(0, remainingPlan - amount);
          } else if (remainingPlan > 0 && remainingPlan + remainingWallet >= amount) {
            saldoUsado = 'misto';
            walletType = 'main';
            const restante = amount - remainingPlan;
            remainingPlan = 0;
            remainingWallet = Math.max(0, remainingWallet - restante);
          } else {
            saldoUsado = 'carteira';
            walletType = 'main';
            remainingWallet = Math.max(0, remainingWallet - amount);
          }

          await walletApiService.addBalance(0, -amount, args.description, 'consulta', undefined, walletType);

          await consultationApiService.recordConsultation({
            document: formData.numeroDocumento,
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

        const rgModuleId = currentModule?.panel_id || currentModule?.id || 57;
        const qrModuleId = qrModule?.panel_id || qrModule?.id || 0;
        const qrModuleName = qrPlan === '3m' ? 'QR Code RG 3M' : qrPlan === '6m' ? 'QR Code RG 6M' : 'QR Code RG 1M';

        await chargeAndRecord({
          amount: finalPrice,
          description: `Cadastro ${MODULE_TITLE} - ${formData.nome}`,
          moduleId: rgModuleId,
          pageRoute: location.pathname,
          moduleName: MODULE_TITLE,
          source: MODULE_SOURCE,
          resultData: { rg2026_id: rgResult.data?.id },
        });

        await chargeAndRecord({
          amount: qrFinalPrice,
          description: `Cadastro ${qrModuleName} - ${formData.nome}`,
          moduleId: qrModuleId,
          pageRoute: qrRoute,
          moduleName: qrModuleName,
          source: qrModuleSource,
          resultData: qrResultData,
        });

        setPlanBalance(remainingPlan);
        setWalletBalance(remainingWallet);

        await reloadApiBalance();
        window.dispatchEvent(
          new CustomEvent('balanceRechargeUpdated', {
            detail: { userId: user?.id, shouldAnimate: true, amount: totalPrice, method: 'api' },
          })
        );
      } catch (balanceError) {
        console.error('Erro ao registrar cobrança:', balanceError);
        toast.error('Cadastros realizados, mas houve erro ao registrar a cobrança.');
      }

      setShowConfirmModal(false);
      handleReset();
      await loadRecentRegistrations();
      toast.success('Cadastro realizado com sucesso!');
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
      nomeSocial: '',
      numeroDocumento: '',
      sexo: '',
      dataNascimento: '',
      nacionalidade: '',
      naturalidade: '',
      validade: '',
      assinatura: null,
      foto: null,
      numeroFolha: '',
      numeroQrcode: '',
      mae: '',
      pai: '',
      orgaoExpedidor: '',
      local: '',
      emissao: '',
      diretor: '',
    });
    setPhotoPreviewUrl(null);
    setSignaturePreviewUrl(null);
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

  const formatFullDate = (dateString: string) =>
    new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      <div className="w-full">
        <SimpleTitleBar title={MODULE_TITLE} subtitle="Cadastre e gere QR Codes de documentos" onBack={handleBack} />

        <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 md:gap-6 lg:gap-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700 w-full">
            <CardHeader className="pb-4">
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
                {/* Plano do QRCode (antes do nome) */}
                <div className="space-y-2">
                  <Label>Plano do QR Code *</Label>
                  <Select value={qrPlan} onValueChange={(v) => setQrPlan(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">QR Code RG 1M</SelectItem>
                      <SelectItem value="3m">QR Code RG 3M</SelectItem>
                      <SelectItem value="6m">QR Code RG 6M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordem solicitada */}
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input id="nome" type="text" placeholder="Nome" value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} required className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomeSocial">Nome Social</Label>
                  <Input id="nomeSocial" type="text" placeholder="Nome social (opcional)" value={formData.nomeSocial} onChange={(e) => handleInputChange('nomeSocial', e.target.value)} className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroDocumento">Registro Geral - CPF *</Label>
                  <Input id="numeroDocumento" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={11} placeholder="CPF (somente números)" value={formData.numeroDocumento} onChange={(e) => handleInputChange('numeroDocumento', e.target.value)} required className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                </div>

                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select value={formData.sexo} onValueChange={(v) => setFormData(prev => ({ ...prev, sexo: v as any }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input id="dataNascimento" type="date" value={formData.dataNascimento} onChange={(e) => handleInputChange('dataNascimento', e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nacionalidade">Nacionalidade</Label>
                  <Input id="nacionalidade" type="text" placeholder="Nacionalidade" value={formData.nacionalidade} onChange={(e) => handleInputChange('nacionalidade', e.target.value)} className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="naturalidade">Naturalidade</Label>
                  <Input id="naturalidade" type="text" placeholder="Naturalidade" value={formData.naturalidade} onChange={(e) => handleInputChange('naturalidade', e.target.value)} className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validade">Validade</Label>
                  <Input id="validade" type="date" value={formData.validade} onChange={(e) => handleInputChange('validade', e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assinatura">Assinatura do Titular</Label>
                  <Input id="assinatura" type="file" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={handleSignatureChange} className="cursor-pointer" />
                  {signaturePreviewUrl && (
                    <div className="mt-2 flex items-end gap-3">
                      <img src={signaturePreviewUrl} alt="Preview da assinatura" className="w-24 h-24 object-contain rounded-lg border bg-background" />
                      <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowSignatureEditor(true)}>
                        <PenTool className="h-3.5 w-3.5 mr-1" /> Editar Assinatura
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foto">Foto 3x4</Label>
                  <Input id="foto" type="file" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={handlePhotoChange} className="cursor-pointer" />
                  {photoPreviewUrl && (
                    <div className="mt-2 flex items-end gap-3">
                      <img src={photoPreviewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
                      <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowPhotoEditor(true)}>
                        <ImageIcon className="h-3.5 w-3.5 mr-1" /> Editar Foto
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroFolha">Numero Folha</Label>
                  <Input id="numeroFolha" type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Número da folha" value={formData.numeroFolha} onChange={(e) => handleInputChange('numeroFolha', e.target.value)} className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroQrcode">Numero QRCODE</Label>
                  <Input id="numeroQrcode" type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Número do QR Code" value={formData.numeroQrcode} onChange={(e) => handleInputChange('numeroQrcode', e.target.value)} className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mae">Filiação / Mãe *</Label>
                  <Input id="mae" type="text" placeholder="Nome da mãe" value={formData.mae} onChange={(e) => handleInputChange('mae', e.target.value)} required className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pai">Filiação / Pai</Label>
                  <Input id="pai" type="text" placeholder="Nome do pai (não obrigatório)" value={formData.pai} onChange={(e) => handleInputChange('pai', e.target.value)} className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgaoExpedidor">Órgão Expedidor</Label>
                  <Input id="orgaoExpedidor" type="text" placeholder="Órgão expedidor" value={formData.orgaoExpedidor} onChange={(e) => handleInputChange('orgaoExpedidor', e.target.value)} className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="local">Local</Label>
                  <Input id="local" type="text" placeholder="Local" value={formData.local} onChange={(e) => handleInputChange('local', e.target.value)} className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emissao">Emissão</Label>
                  <Input id="emissao" type="date" value={formData.emissao} onChange={(e) => handleInputChange('emissao', e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Selecione o Diretor</Label>
                  <Select value={formData.diretor} onValueChange={(v) => setFormData(prev => ({ ...prev, diretor: v as any }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIRETORES.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      !formData.nome ||
                      !formData.dataNascimento ||
                      !formData.numeroDocumento ||
                      !formData.mae ||
                      !formData.foto ||
                      !hasSufficientBalance(totalPrice) ||
                      modulePriceLoading
                    }
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
                        {modulePriceLoading ? 'Carregando preço...' : `Cadastrar (R$ ${finalPrice.toFixed(2)})`}
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {!hasSufficientBalance(totalPrice) && formData.nome && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-3">
                  <div className="flex items-start text-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs sm:text-sm block break-words">Saldo insuficiente. Necessário: R$ {finalPrice.toFixed(2)}</span>
                      <span className="text-xs sm:text-sm block break-words">Disponível: R$ {totalBalance.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 break-words">Saldo do plano: R$ {planBalance.toFixed(2)} | Saldo da carteira: R$ {walletBalance.toFixed(2)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="w-full space-y-2">
            <h3 className={`flex items-center font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
              <FileText className="mr-2 h-4 w-4 flex-shrink-0" />Meus Cadastros
            </h3>

            {myQrLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : myRgQrRegistrations.length > 0 ? (
              <div className="space-y-2">
                {myRgQrRegistrations.slice(0, 5).map((registration) => {
                  const daysLeft = Math.ceil((new Date(registration.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                  return (
                    <button
                      key={registration.id}
                      type="button"
                      onClick={() =>
                        window.open(
                          `https://qr.apipainel.com.br/qrvalidation/?token=${registration.token}&ref=${registration.token}&cod=${registration.token}`,
                          '_blank'
                        )
                      }
                      className="w-full text-left rounded-lg border border-border bg-card p-2.5 sm:p-3"
                    >
                      <div className="flex flex-col gap-2.5">
                        {/* Imagens sempre em 1 linha; no mobile ocupam 100% (3 colunas iguais) */}
                        <div className="flex gap-2 flex-shrink-0 flex-nowrap w-full sm:grid sm:grid-cols-3 sm:gap-2">
                          <div className="flex-1 basis-0 min-w-0">
                            {registration.photo_path ? (
                              <img
                                src={`https://qr.apipainel.com.br/qrvalidation/${registration.photo_path}`}
                                alt="Foto do cadastro"
                                className="w-full h-24 rounded-lg border object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center border">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 basis-0 min-w-0">
                            <img
                              src={
                                registration.qr_code_path
                                  ? `https://qr.apipainel.com.br/qrvalidation/${registration.qr_code_path}`
                                  : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                      `https://qr.apipainel.com.br/qrvalidation/?token=${registration.token}&ref=${registration.token}&cod=${registration.token}`
                                    )}`
                              }
                              alt="QR Code do cadastro"
                              className="w-full h-24 rounded-lg border object-contain bg-background p-1"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>

                          <div className="flex-1 basis-0 min-w-0">
                            {(() => {
                              const cpf = String(registration.document_number || '').replace(/\D/g, '');
                              const sig = myRgSignatureByCpf.get(cpf);
                              if (!sig) {
                                return <div className="w-full h-24 rounded-lg border bg-background" />;
                              }
                              return (
                                <img
                                  src={sig}
                                  alt="Assinatura do cadastro"
                                  className="w-full h-24 rounded-lg border bg-background object-contain p-1"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              );
                            })()}
                          </div>
                        </div>

                        {/* Informações SEMPRE abaixo (desktop e mobile) */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold truncate">{registration.full_name}</p>
                          <p className="text-[11px] sm:text-xs text-foreground font-mono">{registration.document_number}</p>
                          <p className="text-[11px] sm:text-xs text-foreground">Nasc. {formatDate(registration.birth_date)}</p>

                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`text-[11px] font-medium ${daysLeft > 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                            >
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
                      </div>
                    </button>
                  );
                })}

                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary hover:bg-muted"
                    onClick={() => navigate('/dashboard/qrcode-rg-reativar')}
                  >
                    <FileText className={`mr-2 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span className={isMobile ? 'text-xs' : 'text-sm'}>Ver Histórico Completo</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhum cadastro encontrado para este módulo</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />Confirmar Cadastro
            </DialogTitle>
            <DialogDescription>
              Verifique os dados antes de confirmar.
              <br />
              Será cobrado <strong>R$ {totalPrice.toFixed(2)}</strong> do seu saldo (RG‑2026 + QR Code).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {(photoPreviewUrl || signaturePreviewUrl) && (
              <div className="flex items-center justify-center gap-3">
                {photoPreviewUrl && (
                  <img
                    src={photoPreviewUrl}
                    alt="Foto 3x4 (preview)"
                    className="w-20 h-26 object-cover rounded-lg border-2 border-purple-200 shadow-md"
                  />
                )}
                {signaturePreviewUrl && (
                  <img
                    src={signaturePreviewUrl}
                    alt="Assinatura (preview)"
                    className="w-28 h-16 object-contain rounded-lg border-2 border-purple-200 shadow-md bg-background"
                  />
                )}
              </div>
            )}

            <div className="space-y-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium text-sm">{formData.nome.toUpperCase()}</p>
                </div>
              </div>
              {formData.nomeSocial.trim() && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nome Social</p>
                    <p className="font-medium text-sm">{formData.nomeSocial.toUpperCase()}</p>
                  </div>
                </div>
              )}
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
                  <p className="text-xs text-muted-foreground">Registro Geral - CPF</p>
                  <p className="font-medium text-sm font-mono">{formData.numeroDocumento}</p>
                </div>
              </div>

              {formData.sexo && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sexo</p>
                    <p className="font-medium text-sm">{formData.sexo}</p>
                  </div>
                </div>
              )}
              {formData.nacionalidade.trim() && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nacionalidade</p>
                    <p className="font-medium text-sm">{formData.nacionalidade.toUpperCase()}</p>
                  </div>
                </div>
              )}
              {formData.naturalidade.trim() && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Naturalidade</p>
                    <p className="font-medium text-sm">{formData.naturalidade.toUpperCase()}</p>
                  </div>
                </div>
              )}
              {formData.validade && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Validade</p>
                    <p className="font-medium text-sm">{formatDate(formData.validade)}</p>
                  </div>
                </div>
              )}
              {(formData.numeroFolha.trim() || formData.numeroQrcode.trim()) && (
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Folha / QRCode</p>
                    <p className="font-medium text-sm font-mono">{formData.numeroFolha.trim() || '—'} · {formData.numeroQrcode.trim() || '—'}</p>
                  </div>
                </div>
              )}
              {(formData.orgaoExpedidor.trim() || formData.local.trim() || formData.emissao) && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Emissão</p>
                    <p className="font-medium text-sm">{formData.orgaoExpedidor.trim() ? formData.orgaoExpedidor.toUpperCase() : '—'} · {formData.local.trim() ? formData.local.toUpperCase() : '—'}</p>
                    <p className="font-medium text-sm">{formData.emissao ? formatDate(formData.emissao) : '—'}</p>
                  </div>
                </div>
              )}
              {formData.diretor && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Diretor</p>
                    <p className="font-medium text-sm">{formData.diretor}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Filiação</p>
                  <p className="font-medium text-sm">{formData.pai ? formData.pai.toUpperCase() : '—'}</p>
                  <p className="font-medium text-sm">{formData.mae.toUpperCase()}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-sm">
                  <div className="font-medium">Total</div>
                  <div className="text-xs text-muted-foreground">RG‑2026: R$ {finalPrice.toFixed(2)} · QR: R$ {qrFinalPrice.toFixed(2)}</div>
                </div>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting} className="bg-brand-purple hover:bg-brand-darkPurple">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />Cadastrando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />Confirmar Cadastro
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className={`flex items-center ${isMobile ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'}`}>
            <FileText className={`mr-2 flex-shrink-0 ${isMobile ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
            <span>Histórico de Cadastros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                    <div
                      key={registration.id}
                      className="w-full rounded-md border border-border bg-card px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-mono text-xs break-words">{registration.cpf}</div>
                          <div className="text-xs font-medium truncate mt-0.5">{registration.nome}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{formatFullDate(registration.created_at)}</div>
                        </div>
                        <span
                          className="mt-0.5 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-green-500"
                          title="Concluída"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40 whitespace-nowrap">CPF</TableHead>
                      <TableHead className="min-w-[220px]">Nome</TableHead>
                      <TableHead className="min-w-[180px] whitespace-nowrap">Data e Hora</TableHead>
                      <TableHead className="w-28 text-right whitespace-nowrap">Valor</TableHead>
                      <TableHead className="w-28 text-center whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRegistrations.slice(0, 10).map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-mono text-xs sm:text-sm whitespace-nowrap">{registration.cpf}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{registration.nome}</TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap">{formatFullDate(registration.created_at)}</TableCell>
                        <TableCell className="text-right text-xs sm:text-sm font-medium text-destructive whitespace-nowrap">R$ {finalPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="text-xs rounded-full bg-foreground text-background hover:bg-foreground/90">
                            Concluída
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="text-center pt-4 mt-4 border-t border-border">
                <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-muted" onClick={() => navigate(MODULE_TODOS_ROUTE)}>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="w-full"><CardContent className="p-3 sm:p-4"><div className="text-center"><h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary truncate">{statsLoading ? '...' : stats.today}</h3><p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">Cadastros Hoje</p></div></CardContent></Card>
        <Card className="w-full"><CardContent className="p-3 sm:p-4"><div className="text-center"><h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary truncate">{statsLoading ? '...' : stats.total}</h3><p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">Total de Cadastros</p></div></CardContent></Card>
        <Card className="w-full"><CardContent className="p-3 sm:p-4"><div className="text-center"><h3 className="text-base sm:text-lg lg:text-xl font-bold text-green-600 truncate">{statsLoading ? '...' : stats.completed}</h3><p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">Concluídas</p></div></CardContent></Card>
        <Card className="w-full"><CardContent className="p-3 sm:p-4"><div className="text-center"><h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary truncate">R$ {statsLoading ? '0,00' : (stats.total * finalPrice).toFixed(2)}</h3><p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">Total Gasto</p></div></CardContent></Card>
      </div>

      {photoPreviewUrl && (
        <PhotoEditorModal
          open={showPhotoEditor}
          onOpenChange={setShowPhotoEditor}
          imageUrl={photoPreviewUrl}
          fileName={formData.numeroDocumento || 'foto'}
          onSave={(editedFile) => {
            setFormData(prev => ({ ...prev, foto: editedFile }));
            readFileAsDataUrl(editedFile, setPhotoPreviewUrl);
          }}
        />
      )}

      {signaturePreviewUrl && (
        <PhotoEditorModal
          open={showSignatureEditor}
          onOpenChange={setShowSignatureEditor}
          imageUrl={signaturePreviewUrl}
          fileName={`assinatura-${formData.numeroDocumento || 'titular'}`}
          enableBlackWhite
          onSave={(editedFile) => {
            setFormData(prev => ({ ...prev, assinatura: editedFile }));
            readFileAsDataUrl(editedFile, setSignaturePreviewUrl);
          }}
        />
      )}

      <ScrollToTop />
    </div>
  );
};

export default Rg2026;
