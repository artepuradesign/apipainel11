import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { FileText, Loader2, AlertCircle, CheckCircle, Upload, Download, Package, Clock, Truck, Eye, WrenchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getFullApiUrl } from '@/utils/apiHelper';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useApiModules } from '@/hooks/useApiModules';
import { consultationApiService } from '@/services/consultationApiService';
import { walletApiService } from '@/services/walletApiService';
import { editarPdfService, type EditarPdfPedido } from '@/services/pdfPersonalizadoService';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';
import LoadingScreen from '@/components/layout/LoadingScreen';
import ScrollToTop from '@/components/ui/scroll-to-top';

const MODULE_TITLE = 'PDF PERSONALIZADO';
const MODULE_ROUTE = '/dashboard/pdf-personalizado';
const MODULE_ID = 173;

const STATUS_ORDER = ['realizado', 'pagamento_confirmado', 'em_confeccao', 'entregue'] as const;
type PdfStatus = typeof STATUS_ORDER[number];

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  realizado: { label: 'Realizado', color: 'bg-blue-500', icon: <Package className="h-3 w-3" /> },
  pagamento_confirmado: { label: 'Pgto Confirmado', color: 'bg-emerald-500', icon: <CheckCircle className="h-3 w-3" /> },
  em_confeccao: { label: 'Em Confecção', color: 'bg-orange-500', icon: <Clock className="h-3 w-3" /> },
  entregue: { label: 'Entregue', color: 'bg-emerald-600', icon: <Truck className="h-3 w-3" /> },
};

const statusIcons: Record<string, React.ReactNode> = {
  realizado: <Package className="h-5 w-5" />,
  pagamento_confirmado: <CheckCircle className="h-5 w-5" />,
  em_confeccao: <Clock className="h-5 w-5" />,
  entregue: <Truck className="h-5 w-5" />,
};

const getStatusIndex = (status: string) => STATUS_ORDER.indexOf(status as PdfStatus);

const StatusProgressTracker = ({ pedido }: { pedido: EditarPdfPedido }) => {
  const currentIdx = getStatusIndex(pedido.status);

  const getTimestamp = (step: string) => {
    const map: Record<string, string | null> = {
      realizado: pedido.realizado_at,
      pagamento_confirmado: pedido.pagamento_confirmado_at,
      em_confeccao: pedido.em_confeccao_at,
      entregue: pedido.entregue_at,
    };
    return map[step];
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="w-full py-6 px-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-[12%] right-[12%] h-1 bg-muted rounded-full" />
        <div
          className="absolute top-5 left-[12%] h-1 rounded-full transition-all duration-700 ease-out bg-emerald-500"
          style={{ width: `${Math.max(0, (currentIdx / 3) * 76)}%` }}
        />
        {STATUS_ORDER.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isActive = idx <= currentIdx;
          const isEmConfeccao = step === 'em_confeccao' && isCurrent;
          const timestamp = getTimestamp(step);

          return (
            <div key={step} className="flex flex-col items-center z-10 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                isCompleted || (isCurrent && step === 'entregue')
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : isEmConfeccao
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 animate-pulse'
                  : isCurrent
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-muted text-muted-foreground'
              } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}>
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : statusIcons[step]}
              </div>
              <span className={`text-[10px] sm:text-xs mt-2 text-center leading-tight max-w-[80px] ${
                isActive ? (isEmConfeccao ? 'text-blue-600 font-semibold' : 'text-emerald-600 font-semibold') : 'text-muted-foreground'
              }`}>
                {STATUS_LABELS[step].label}
              </span>
              {timestamp && isActive && (
                <span className="text-[9px] text-muted-foreground mt-0.5">{formatTime(timestamp)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface FormData {
  nomeSolicitante: string;
  descricaoAlteracoes: string;
  anexos: File[];
}

const EditarPdf = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modules } = useApiModules();
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    nomeSolicitante: '', descricaoAlteracoes: '', anexos: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [planBalance, setPlanBalance] = useState(0);
  const [modulePrice, setModulePrice] = useState(0);
  const [modulePriceLoading, setModulePriceLoading] = useState(true);
  const [balanceCheckLoading, setBalanceCheckLoading] = useState(true);

  const [meusPedidos, setMeusPedidos] = useState<EditarPdfPedido[]>([]);
  const [pedidosLoading, setPedidosLoading] = useState(false);
  const [pedidoDetalhe, setPedidoDetalhe] = useState<EditarPdfPedido | null>(null);
  const [showDetalheModal, setShowDetalheModal] = useState(false);

  // Solicitar Correção
  const [showCorrecaoModal, setShowCorrecaoModal] = useState(false);
  const [correcaoTexto, setCorrecaoTexto] = useState('');
  const [correcaoLoading, setCorrecaoLoading] = useState(false);

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
    return (modules || []).find((m: any) => m.id === MODULE_ID) || null;
  }, [modules]);

  const userPlan = hasActiveSubscription && subscription
    ? subscription.plan_name
    : (user ? localStorage.getItem(`user_plan_${user.id}`) || 'Pré-Pago' : 'Pré-Pago');

  const totalBalance = planBalance + walletBalance;
  const hasSufficientBalance = (price: number) => totalBalance >= price;

  const loadModulePrice = useCallback(() => {
    setModulePriceLoading(true);
    const rawPrice = currentModule?.price;
    const price = Number(rawPrice ?? 0);
    if (price && price > 0) { setModulePrice(price); setModulePriceLoading(false); return; }
    setModulePrice(250); // fallback
    setModulePriceLoading(false);
  }, [currentModule]);

  const loadBalances = useCallback(() => {
    if (!user) return;
    setPlanBalance(balance.saldo_plano || 0);
    setWalletBalance(balance.saldo || 0);
  }, [user, balance]);

  const loadMeusPedidos = useCallback(async () => {
    try {
      setPedidosLoading(true);
      const userId = user?.id ? Number(user.id) : null;
      const result = await editarPdfService.listar({ limit: 50, offset: 0, ...(userId ? { user_id: userId } : {}) });
      if (result.success && result.data) {
        setMeusPedidos(result.data.data || []);
      } else {
        setMeusPedidos([]);
      }
    } catch { setMeusPedidos([]); }
    finally { setPedidosLoading(false); }
  }, [user?.id]);

  useEffect(() => {
    if (balance.saldo !== undefined || balance.saldo_plano !== undefined) loadBalances();
  }, [balance, loadBalances]);

  useEffect(() => {
    if (!user) return;
    reloadApiBalance();
    loadMeusPedidos();
  }, [user, reloadApiBalance, loadMeusPedidos]);

  useEffect(() => { if (user) loadModulePrice(); }, [user, loadModulePrice]);

  useEffect(() => {
    if (!user) { setBalanceCheckLoading(false); return; }
    if (modulePriceLoading || !modulePrice) return;
    if (subscriptionLoading) return;
    setBalanceCheckLoading(false);
  }, [user, modulePriceLoading, modulePrice, subscriptionLoading]);

  const handleAnexosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) { toast.error('Máximo 3 anexos permitidos'); return; }
    for (const f of files) {
      if (f.size > 15 * 1024 * 1024) { toast.error(`Arquivo ${f.name} muito grande (máx 15MB)`); return; }
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowed.includes(f.type)) { toast.error(`Formato inválido: ${f.name}. Use JPG, PNG, GIF ou PDF`); return; }
    }
    setFormData(prev => ({ ...prev, anexos: files.slice(0, 3) }));
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomeSolicitante.trim()) { toast.error('Nome do solicitante é obrigatório'); return; }
    if (!formData.descricaoAlteracoes.trim()) { toast.error('Descrição das alterações é obrigatória'); return; }
    if (formData.anexos.length === 0) { toast.error('Envie pelo menos 1 documento para edição'); return; }
    if (!hasSufficientBalance(finalPrice)) { toast.error(`Saldo insuficiente. Necessário: R$ ${finalPrice.toFixed(2)}`); return; }
    setShowConfirmModal(true);
  };

  const originalPrice = modulePrice > 0 ? modulePrice : 0;
  const { discountedPrice: finalPrice, hasDiscount } = hasActiveSubscription && originalPrice > 0
    ? calculateSubscriptionDiscount(originalPrice) : { discountedPrice: originalPrice, hasDiscount: false };
  const discount = hasDiscount ? discountPercentage : 0;

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
      const payload: Record<string, any> = {
        nome_solicitante: formData.nomeSolicitante.trim(),
        descricao_alteracoes: formData.descricaoAlteracoes.trim(),
        preco_pago: finalPrice,
        desconto_aplicado: discount,
        module_id: currentModule?.id || MODULE_ID,
        user_id: user?.id ? Number(user.id) : null,
      };

      for (let i = 0; i < formData.anexos.length; i++) {
        payload[`anexo${i + 1}_base64`] = await fileToBase64(formData.anexos[i]);
        payload[`anexo${i + 1}_nome`] = formData.anexos[i].name;
      }

      const result = await editarPdfService.criar(payload);
      if (!result.success) throw new Error(result.error || 'Erro ao criar pedido');

      // Cobrar do saldo
      try {
        let remainingPlan = planBalance;
        let remainingWallet = walletBalance;
        const amount = finalPrice;
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

        await walletApiService.addBalance(0, -amount, `Pedido Editar PDF - ${formData.nomeSolicitante}`, 'consulta', undefined, walletType);

        await consultationApiService.recordConsultation({
          document: formData.nomeSolicitante,
          status: 'completed',
          cost: amount,
          result_data: { pedido_id: result.data?.id },
          saldo_usado: saldoUsado,
          module_id: currentModule?.id || MODULE_ID,
          metadata: {
            page_route: location.pathname,
            module_name: MODULE_TITLE,
            module_id: currentModule?.id || MODULE_ID,
            saldo_usado: saldoUsado,
            source: 'pdf-personalizado',
            timestamp: new Date().toISOString(),
          },
        });

        setPlanBalance(remainingPlan);
        setWalletBalance(remainingWallet);
        await reloadApiBalance();

        window.dispatchEvent(new CustomEvent('balanceRechargeUpdated', {
          detail: { userId: user?.id, shouldAnimate: true, amount: finalPrice, method: 'api' },
        }));
      } catch (balanceError) {
        console.error('Erro ao registrar cobrança:', balanceError);
        toast.error('Pedido criado, mas houve erro ao registrar a cobrança.');
      }

      setShowConfirmModal(false);
      handleReset();
      await loadMeusPedidos();
      toast.success('Pedido de edição criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast.error(error.message || 'Erro ao criar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ nomeSolicitante: '', descricaoAlteracoes: '', anexos: [] });
  };

  const handleBack = () => {
    if (window.history.length > 1) { navigate(-1); return; }
    navigate('/dashboard');
  };

  const handleViewPedido = async (pedido: EditarPdfPedido) => {
    try {
      const result = await editarPdfService.obter(pedido.id);
      if (result.success && result.data) {
        setPedidoDetalhe(result.data);
        setShowDetalheModal(true);
      } else {
        toast.error('Erro ao carregar detalhes do pedido');
      }
    } catch { toast.error('Erro ao carregar pedido'); }
  };

  const handleSolicitarCorrecao = async () => {
    if (!pedidoDetalhe || !correcaoTexto.trim()) {
      toast.error('Descreva o que precisa ser corrigido');
      return;
    }
    setCorrecaoLoading(true);
    try {
      const novaDescricao = pedidoDetalhe.descricao_alteracoes + '\n\n--- SOLICITAÇÃO DE CORREÇÃO ---\n' + correcaoTexto.trim();
      const result = await editarPdfService.solicitarCorrecao(pedidoDetalhe.id, correcaoTexto.trim(), novaDescricao);
      if (!result.success) throw new Error(result.error || 'Erro ao solicitar correção');
      toast.success('Correção solicitada com sucesso! Status alterado para Pagamento Confirmado.');
      setShowCorrecaoModal(false);
      setCorrecaoTexto('');
      // Recarregar detalhes
      const updated = await editarPdfService.obter(pedidoDetalhe.id);
      if (updated.success && updated.data) setPedidoDetalhe(updated.data);
      await loadMeusPedidos();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao solicitar correção');
    } finally {
      setCorrecaoLoading(false);
    }
  };

  const handleDownloadPdf = (pedido: EditarPdfPedido) => {
    if (!pedido.pdf_entrega_nome && !pedido.pdf_entrega_base64) {
      toast.error('PDF ainda não disponível');
      return;
    }

    // Se temos base64, criar download direto (fallback para pedidos legados)
    if (pedido.pdf_entrega_base64) {
      try {
        let base64Data = pedido.pdf_entrega_base64;
        let mimeType = 'application/pdf';
        if (base64Data.includes(',')) {
          const parts = base64Data.split(',');
          const header = parts[0];
          base64Data = parts[1];
          const mimeMatch = header.match(/data:([^;]+)/);
          if (mimeMatch) mimeType = mimeMatch[1];
        }
        const byteChars = atob(base64Data);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pedido.pdf_entrega_nome || 'entrega.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      } catch (e) {
        console.error('Erro ao criar download do base64:', e);
      }
    }

    // Fallback: via endpoint de serve
    if (pedido.pdf_entrega_nome) {
      const downloadUrl = getFullApiUrl(`/upload/delivery?file=${encodeURIComponent(pedido.pdf_entrega_nome)}`);
      window.open(downloadUrl, '_blank');
    }
  };

  if (balanceCheckLoading || modulePriceLoading) {
    return <LoadingScreen message="Verificando acesso ao módulo..." variant="dashboard" />;
  }

  const formatFullDate = (dateString: string) =>
    new Date(dateString).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      <div className="w-full">
        <SimpleTitleBar title={MODULE_TITLE} subtitle="Envie o arquivo para atualização e preencha as informações para alteração" onBack={handleBack} />

        <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 md:gap-6 lg:gap-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700 w-full">
            <CardHeader className="pb-4">
              <div className="relative bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-gray-800/50 dark:via-gray-800 dark:to-blue-900/20 rounded-lg border border-blue-100/50 dark:border-blue-800/30 shadow-sm transition-all duration-300">
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
                      <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Plano Ativo</p>
                        <h3 className="text-sm md:text-base font-bold text-foreground truncate">
                          {hasActiveSubscription ? subscription?.plan_name : userPlan}
                        </h3>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      {hasDiscount && (
                        <span className="text-[10px] md:text-xs text-muted-foreground line-through">R$ {originalPrice.toFixed(2)}</span>
                      )}
                      <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent whitespace-nowrap">
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
                  <Label htmlFor="nomeSolicitante">Nome do Solicitante * <span className="text-xs text-muted-foreground">(obrigatório)</span></Label>
                  <Input id="nomeSolicitante" type="text" placeholder="Seu nome completo" value={formData.nomeSolicitante} onChange={(e) => setFormData(prev => ({ ...prev, nomeSolicitante: e.target.value.toUpperCase() }))} required className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm" />
                </div>

                {/* Anexos - Documentos para edição */}
                <div className="space-y-2">
                  <Label htmlFor="anexos">Documentos para Edição * <span className="text-xs text-muted-foreground">(até 3 arquivos - envie o PDF ou imagem do documento a ser editado)</span></Label>
                  <Input id="anexos" type="file" accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf" multiple onChange={handleAnexosChange} className="cursor-pointer" />
                  {formData.anexos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.anexos.map((f, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          <Upload className="h-3 w-3 mr-1" /> {f.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">OBS: Limite de 2 folhas por PDF do mesmo documento. Para maior quantidade, escolha o Módulo PDF VIP.</p>
                </div>

                {/* Descrição das alterações */}
                <div className="space-y-2">
                  <Label htmlFor="descricaoAlteracoes">Descrição das Alterações * <span className="text-xs text-muted-foreground">(obrigatório)</span></Label>
                  <Textarea
                    id="descricaoAlteracoes"
                    placeholder="Descreva detalhadamente as alterações que deseja no documento. Ex: Alterar nome para FULANO DE TAL, trocar foto, alterar data de nascimento para 01/01/1990..."
                    value={formData.descricaoAlteracoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricaoAlteracoes: e.target.value }))}
                    required
                    className="min-h-[120px] text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Button type="submit" disabled={isLoading || !formData.nomeSolicitante || !formData.descricaoAlteracoes || formData.anexos.length === 0 || !hasSufficientBalance(finalPrice) || modulePriceLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</>
                    ) : (
                      <><FileText className="mr-2 h-4 w-4" />{modulePriceLoading ? 'Carregando preço...' : `Solicitar Edição (R$ ${finalPrice.toFixed(2)})`}</>
                    )}
                  </Button>

                  {!hasSufficientBalance(finalPrice) && (
                    <div className="flex items-center gap-2 text-destructive text-xs">
                      <AlertCircle className="h-4 w-4" />
                      <span>Saldo insuficiente. Necessário: R$ {finalPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Sidebar - Meus Pedidos */}
          <div className="space-y-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Meus Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pedidosLoading ? (
                  <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : meusPedidos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum pedido encontrado</p>
                ) : (
                  <div className="divide-y max-h-[500px] overflow-y-auto">
                    {meusPedidos.map((p) => {
                      const st = STATUS_LABELS[p.status] || STATUS_LABELS['realizado'];
                      return (
                        <div key={p.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-sm font-mono text-muted-foreground">#{p.id}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{p.nome_solicitante}</p>
                              <p className="text-xs text-muted-foreground">{formatFullDate(p.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className={`${st.color} text-white text-xs gap-1 px-2 py-0.5`}>
                              {st.icon} {st.label}
                            </Badge>
                            <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs gap-1" onClick={() => handleViewPedido(p)}>
                              <Eye className="h-3.5 w-3.5" /> Detalhes
                            </Button>
                            {p.status === 'entregue' && (p.pdf_entrega_nome || p.pdf_entrega_base64) && (
                              <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs gap-1 text-blue-600" onClick={() => handleDownloadPdf(p)}>
                                <Download className="h-3.5 w-3.5" /> Download
                              </Button>
                            )}
                          </div>
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
            <DialogTitle>Confirmar Pedido de Edição</DialogTitle>
            <DialogDescription>Revise os dados antes de confirmar</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Solicitante:</span>
              <span>{formData.nomeSolicitante}</span>
              <span className="text-muted-foreground">Anexos:</span>
              <span>{formData.anexos.length} arquivo(s)</span>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Alterações solicitadas:</span>
              <p className="text-xs mt-1 bg-muted/50 p-2 rounded max-h-24 overflow-y-auto">{formData.descricaoAlteracoes}</p>
            </div>
            <div className="border-t pt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Edição PDF:</span>
                <span className="flex items-center gap-1.5">
                  {hasDiscount && <span className="line-through text-[10px]">R$ {originalPrice.toFixed(2)}</span>}
                  <span className={hasDiscount ? 'text-blue-600 font-medium' : ''}>R$ {finalPrice.toFixed(2)}</span>
                </span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Desconto ({discount}%):</span>
                  <span>- R$ {(originalPrice - finalPrice).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Total:</span>
                <span className="text-blue-600">R$ {finalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
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
            <DialogDescription>Detalhes do pedido de edição</DialogDescription>
          </DialogHeader>
          {pedidoDetalhe && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                {(() => { const st = STATUS_LABELS[pedidoDetalhe.status] || STATUS_LABELS['realizado']; return <Badge className={`${st.color} text-white gap-1`}>{st.icon} {st.label}</Badge>; })()}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Solicitante:</span><span>{pedidoDetalhe.nome_solicitante}</span>
                <span className="text-muted-foreground">Valor:</span><span>R$ {Number(pedidoDetalhe.preco_pago).toFixed(2)}</span>
                <span className="text-muted-foreground">Data:</span><span>{formatFullDate(pedidoDetalhe.created_at)}</span>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Alterações solicitadas:</p>
                <p className="text-xs bg-muted/50 p-2 rounded whitespace-pre-wrap">{pedidoDetalhe.descricao_alteracoes}</p>
              </div>

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

              {/* Progress Tracker */}
              <div className="border-t pt-2">
                <StatusProgressTracker pedido={pedidoDetalhe} />
              </div>

              {/* PDF de Entrega - Badge verde ou laranja */}
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">PDF de Entrega:</p>
                {(pedidoDetalhe.pdf_entrega_nome || pedidoDetalhe.pdf_entrega_base64) ? (
                  <Badge
                    className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-xs px-3 py-1.5 gap-1.5"
                    onClick={() => handleDownloadPdf(pedidoDetalhe)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {pedidoDetalhe.pdf_entrega_nome || 'PDF Entregue'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-950/20 text-xs px-3 py-1.5 gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Aguardando PDF de entrega
                  </Badge>
                )}
              </div>

              {/* Botão Solicitar Correção - visível quando entregue */}
              {pedidoDetalhe.status === 'entregue' && (
                <div className="border-t pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 gap-1.5"
                    onClick={() => { setShowCorrecaoModal(true); }}
                  >
                    <WrenchIcon className="h-3.5 w-3.5" />
                    Solicitar Correção
                  </Button>
                  <p className="text-[10px] text-muted-foreground mt-1">Detectou algum erro? Solicite a correção do PDF.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Solicitar Correção */}
      <Dialog open={showCorrecaoModal} onOpenChange={(open) => { setShowCorrecaoModal(open); if (!open) setCorrecaoTexto(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WrenchIcon className="h-4 w-4 text-amber-500" />
              Solicitar Correção
            </DialogTitle>
            <DialogDescription>
              Descreva o que precisa ser corrigido. O status será revertido para <strong>Pagamento Confirmado</strong> e a equipe irá corrigir e reenviar o PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder="Ex: O nome está com erro de digitação, deveria ser FULANO DE TAL... A foto inserida está diferente da solicitada..."
              value={correcaoTexto}
              onChange={(e) => setCorrecaoTexto(e.target.value)}
              className="min-h-[120px] text-xs"
            />
            <p className="text-[10px] text-muted-foreground">Este texto será adicionado à descrição original do pedido.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowCorrecaoModal(false); setCorrecaoTexto(''); }} disabled={correcaoLoading}>
              Cancelar
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleSolicitarCorrecao}
              disabled={correcaoLoading || !correcaoTexto.trim()}
            >
              {correcaoLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <><WrenchIcon className="mr-2 h-4 w-4" />Enviar Correção</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ScrollToTop />
    </div>
  );
};

export default EditarPdf;
