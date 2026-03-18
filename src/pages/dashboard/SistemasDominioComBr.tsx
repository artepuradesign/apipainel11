import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, Globe, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useApiModules } from '@/hooks/useApiModules';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { usePixPaymentFlow } from '@/hooks/usePixPaymentFlow';
import { useUserDataApi } from '@/hooks/useUserDataApi';
import PixQRCodeModal from '@/components/payment/PixQRCodeModal';
import { getModulePrice } from '@/utils/modulePrice';
import { sistemasDominioComBrService, type SistemaDominioComBrRegistro } from '@/services/sistemasDominioComBrService';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';

const MODULE_ID = 180;
const MODULE_ROUTE = '/dashboard/sistemas-dominio-com-br';

const SistemasDominioComBr = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { userData } = useUserDataApi();
  const { modules } = useApiModules();
  const { balance, loadBalance: reloadBalance } = useWalletBalance();
  const {
    hasActiveSubscription,
    subscription,
    discountPercentage,
    calculateDiscountedPrice: calculateSubscriptionDiscount,
  } = useUserSubscription();
  const { createPixPayment, checkPaymentStatus, generateNewPayment, checkingPayment, pixResponse, loading: pixLoading } = usePixPaymentFlow();

  const [nomeSolicitante, setNomeSolicitante] = useState('');
  const [dominioNome, setDominioNome] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [availability, setAvailability] = useState<{ dominioCompleto: string; disponivel: boolean; message: string } | null>(null);
  const [registros, setRegistros] = useState<SistemaDominioComBrRegistro[]>([]);
  const [registrosLoading, setRegistrosLoading] = useState(false);

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

  const modulePrice = useMemo(() => {
    const configuredPrice = Number(currentModule?.price ?? 0);
    if (configuredPrice > 0) return configuredPrice;
    return getModulePrice(MODULE_ROUTE);
  }, [currentModule?.price]);

  const userPlan = hasActiveSubscription && subscription
    ? subscription.plan_name
    : (user ? localStorage.getItem(`user_plan_${user.id}`) || 'Pré-Pago' : 'Pré-Pago');

  const { discountedPrice: finalPrice, hasDiscount } = hasActiveSubscription && modulePrice > 0
    ? calculateSubscriptionDiscount(modulePrice)
    : { discountedPrice: modulePrice, hasDiscount: false };

  const totalBalance = (balance.saldo || 0) + (balance.saldo_plano || 0);
  const hasSufficientBalance = totalBalance >= finalPrice;
  const canRegister = Boolean(
    user &&
    nomeSolicitante.trim() &&
    availability?.disponivel &&
    finalPrice > 0
  );

  const loadRegistros = useCallback(async () => {
    if (!user?.id) return;
    try {
      setRegistrosLoading(true);
      const result = await sistemasDominioComBrService.listMine({ limit: 50, offset: 0 });
      if (result.success && result.data) {
        setRegistros(result.data.data || []);
      } else {
        setRegistros([]);
      }
    } catch {
      setRegistros([]);
    } finally {
      setRegistrosLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    reloadBalance();
    loadRegistros();
  }, [user, reloadBalance, loadRegistros]);

  const handleCheck = async () => {
    if (!nomeSolicitante.trim()) {
      toast.error('Informe o nome do solicitante');
      return;
    }

    const cleanedDomain = dominioNome.trim().toLowerCase().replace(/\.com\.br$/, '').replace(/\.com$/, '');
    if (!cleanedDomain) {
      toast.error('Informe um nome para o domínio .com.br');
      return;
    }

    setCheckLoading(true);
    try {
      const result = await sistemasDominioComBrService.checkAvailability(cleanedDomain);
      if (!result.success || !result.data) {
        toast.error(result.error || 'Erro ao verificar domínio');
        setAvailability(null);
        return;
      }

      const isAvailable = Boolean(result.data.disponivel);
      setAvailability({
        dominioCompleto: result.data.dominio_completo,
        disponivel: isAvailable,
        message: isAvailable ? 'Domínio .com.br disponível para registro.' : 'Domínio .com.br já registrado.',
      });

      if (isAvailable) toast.success('Domínio disponível!');
      else toast.error('Domínio indisponível.');
    } catch {
      toast.error('Erro ao consultar domínio');
      setAvailability(null);
    } finally {
      setCheckLoading(false);
    }
  };

  const openConfirmModal = async () => {
    if (!canRegister) {
      toast.error('Preencha os dados e pesquise um domínio disponível');
      return;
    }

    if (hasSufficientBalance) {
      setShowConfirmModal(true);
      return;
    }

    const pixAmount = Number(finalPrice.toFixed(2));
    const pixData = await createPixPayment(pixAmount, userData || user);

    if (pixData) {
      setShowPixModal(true);
      toast.info('Saldo insuficiente. Gere o PIX para concluir o pedido.');
    }
  };

  const handlePixPaymentConfirm = async () => {
    if (!pixResponse?.payment_id) return;

    const status = await checkPaymentStatus(pixResponse.payment_id);
    if (status === 'approved') {
      await reloadBalance();
      setShowPixModal(false);
      setShowConfirmModal(true);
      toast.success('Pagamento aprovado! Agora confirme o registro do domínio.');
    }
  };

  const handleGenerateNewPix = async () => {
    const pixAmount = Number(finalPrice.toFixed(2));
    await generateNewPayment(pixAmount, userData || user);
  };

  const handleRegister = async () => {
    if (!availability?.disponivel) return;

    setSubmitLoading(true);
    try {
      const result = await sistemasDominioComBrService.register({
        nome_solicitante: nomeSolicitante.trim(),
        dominio_nome: availability.dominioCompleto.replace(/\.com\.br$/, '').replace(/\.com$/, ''),
        module_id: currentModule?.id || MODULE_ID,
      });

      if (!result.success || !result.data) {
        toast.error(result.error || 'Erro ao registrar domínio');
        return;
      }

      toast.success(`Domínio ${result.data.dominio_completo} registrado com sucesso!`);
      setShowConfirmModal(false);
      setDominioNome('');
      setAvailability(null);
      await reloadBalance();
      navigate('/dashboard/meus-pedidos');
    } catch {
      toast.error('Erro ao registrar domínio');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      <div className="w-full">
        <SimpleTitleBar
          title="DOMÍNIO .COM.BR"
          subtitle="Informe o solicitante, pesquise o domínio e confirme o registro"
          onBack={() => navigate('/dashboard')}
          icon={<Globe className="h-5 w-5" />}
        />

        <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 md:gap-6 lg:gap-8">
          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="relative bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-gray-800/50 dark:via-gray-800 dark:to-blue-900/20 rounded-lg border border-blue-100/50 dark:border-blue-800/30 shadow-sm transition-all duration-300">
                {hasDiscount && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-2.5 py-1 text-xs font-bold shadow-lg">
                      {discountPercentage}% OFF
                    </Badge>
                  </div>
                )}
                <div className="relative p-3.5 md:p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Plano Ativo</p>
                        <h3 className="text-sm md:text-base font-bold text-foreground truncate">{userPlan}</h3>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      {hasDiscount && (
                        <span className="text-[10px] md:text-xs text-muted-foreground line-through">R$ {modulePrice.toFixed(2)}</span>
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
              <div className="grid gap-1.5">
                <Label htmlFor="nomeSolicitante">Nome do Solicitante *</Label>
                <Input
                  id="nomeSolicitante"
                  placeholder="Seu nome completo"
                  value={nomeSolicitante}
                  onChange={(e) => setNomeSolicitante(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="dominioNome">Nome para domínio .com.br *</Label>
                <div className="flex items-center rounded-md border border-input bg-background px-3">
                  <Input
                    id="dominioNome"
                    className="border-0 px-0 focus-visible:ring-0"
                    placeholder="meudominio"
                    value={dominioNome}
                    onChange={(e) => setDominioNome(e.target.value.toLowerCase())}
                  />
                  <span className="text-sm text-muted-foreground">.com.br</span>
                </div>
              </div>

              {availability && (
                <div className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {availability.disponivel ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm font-medium">{availability.dominioCompleto}</span>
                    </div>
                    <Badge variant={availability.disponivel ? 'secondary' : 'destructive'}>
                      {availability.disponivel ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{availability.message}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button type="button" onClick={handleCheck} disabled={checkLoading} variant="outline">
                  {checkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Pesquisar
                </Button>
                <Button type="button" onClick={openConfirmModal} disabled={!canRegister} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Registrar
                </Button>
              </div>

              {!hasSufficientBalance && (
                <div className="flex items-center gap-2 text-destructive text-xs">
                  <AlertCircle className="h-4 w-4" />
                  <span>Saldo insuficiente. Gere o PIX para pagar R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Meus Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {registrosLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : registros.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum pedido encontrado</p>
                ) : (
                  <div className="divide-y max-h-[500px] overflow-y-auto">
                    {registros.map((registro) => (
                      <div key={registro.id} className="px-4 py-3.5 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">{registro.dominio_completo}</p>
                          <Badge variant={registro.status === 'registrado' ? 'default' : 'destructive'} className="text-xs px-2 py-0.5">
                            {registro.status === 'registrado' ? 'Registrado' : 'Cancelado'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Solicitante: {registro.nome_solicitante}</p>
                        <p className="text-xs text-muted-foreground">{new Date(registro.created_at).toLocaleString('pt-BR')}</p>
                        <p className="text-sm font-semibold text-foreground mt-1">R$ {Number(registro.valor_cobrado).toFixed(2).replace('.', ',')}</p>
                      </div>
                    ))}
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
            <DialogTitle>Confirmar registro de domínio</DialogTitle>
            <DialogDescription>
              Você está prestes a registrar o domínio <strong>{availability?.dominioCompleto}</strong> para <strong>{nomeSolicitante}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-border p-3 text-sm space-y-1">
            <p>Valor a cobrar: <strong>R$ {finalPrice.toFixed(2).replace('.', ',')}</strong></p>
            <p>O saldo será descontado automaticamente após confirmar.</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={submitLoading}>
              Cancelar
            </Button>
            <Button onClick={handleRegister} disabled={submitLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirmar e registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PixQRCodeModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        amount={Number(finalPrice.toFixed(2))}
        onPaymentConfirm={handlePixPaymentConfirm}
        isProcessing={checkingPayment || pixLoading}
        pixData={pixResponse}
        onGenerateNew={handleGenerateNewPix}
      />
    </div>
  );
};

export default SistemasDominioComBr;
