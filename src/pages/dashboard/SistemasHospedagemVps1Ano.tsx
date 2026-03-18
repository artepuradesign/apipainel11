import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CalendarDays, CheckCircle2, CircleDollarSign, Clock3, Loader2, Server, ShieldCheck } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useApiModules } from '@/hooks/useApiModules';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { usePixPaymentFlow } from '@/hooks/usePixPaymentFlow';
import { useUserDataApi } from '@/hooks/useUserDataApi';
import PixQRCodeModal from '@/components/payment/PixQRCodeModal';
import { sistemasHospedagemVps1AnoService, type SistemaHospedagemVps1AnoRegistro } from '@/services/sistemasHospedagemVps1AnoService';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';
import { formatMoneyBR } from '@/utils/formatters';

const MODULE_ID = 179;
const DEFAULT_CONFIG = 'Ubuntu 22.04 LTS + Docker + UFW';

const SistemasHospedagemVps6 = () => {
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
  const [nomeInstancia, setNomeInstancia] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [registros, setRegistros] = useState<SistemaHospedagemVps1AnoRegistro[]>([]);
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
    const allModules = modules || [];
    const moduleById = allModules.find((m: any) => Number(m?.id) === MODULE_ID);
    if (moduleById) return moduleById;

    const pathname = (location?.pathname || '').trim();
    if (!pathname) return null;
    return allModules.find((m: any) => normalizeModuleRoute(m) === pathname) || null;
  }, [modules, location?.pathname, normalizeModuleRoute]);

  const modulePrice = useMemo(() => Number(currentModule?.price ?? 0), [currentModule?.price]);

  const ModuleIcon = useMemo(() => {
    const iconName = String(currentModule?.icon || 'Server');
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || Server;
  }, [currentModule?.icon]);

  const userPlan = hasActiveSubscription && subscription
    ? subscription.plan_name
    : (user ? localStorage.getItem(`user_plan_${user.id}`) || 'Pré-Pago' : 'Pré-Pago');

  const { discountedPrice: finalPrice, hasDiscount } = hasActiveSubscription && modulePrice > 0
    ? calculateSubscriptionDiscount(modulePrice)
    : { discountedPrice: modulePrice, hasDiscount: false };

  const toCents = (value: number) => Math.round((Number(value) || 0) * 100);
  const totalBalance = Number(
    balance.total ?? ((Number(balance.saldo) || 0) + (Number(balance.saldo_plano) || 0))
  ) || 0;
  const hasSufficientBalance = toCents(totalBalance) >= toCents(finalPrice);
  const canRegister = Boolean(user && nomeSolicitante.trim() && finalPrice > 0);

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (value: number | string) => formatMoneyBR(Number(value) || 0);

  const getStatusLabel = (status: SistemaHospedagemVps1AnoRegistro['status']) => {
    if (status === 'registrado') return 'Pagamento confirmado';
    if (status === 'em_configuracao') return 'Instalação de VPS';
    if (status === 'finalizado') return 'VPS concluída';
    return 'Cancelado';
  };

  const getStatusBadgeClass = (status: SistemaHospedagemVps1AnoRegistro['status']) => {
    if (status === 'finalizado') return 'bg-primary text-primary-foreground';
    if (status === 'em_configuracao') return 'bg-accent text-accent-foreground';
    if (status === 'registrado') return 'bg-secondary text-secondary-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  const loadRegistros = useCallback(async () => {
    if (!user?.id) return;
    try {
      setRegistrosLoading(true);
      const result = await sistemasHospedagemVps1AnoService.listMine({ limit: 50, offset: 0 });
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

  const openConfirmModal = async () => {
    if (!canRegister) {
      toast.error('Preencha os dados para continuar');
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
      toast.success('Pagamento aprovado! Agora confirme a contratação da VPS.');
    }
  };

  const handleGenerateNewPix = async () => {
    const pixAmount = Number(finalPrice.toFixed(2));
    await generateNewPayment(pixAmount, userData || user);
  };

  const handleRegister = async () => {
    setSubmitLoading(true);
    try {
      const result = await sistemasHospedagemVps1AnoService.register({
        nome_solicitante: nomeSolicitante.trim(),
        nome_instancia: nomeInstancia.trim() || `vps-${user?.id || 'cliente'}`,
        module_id: currentModule?.id || MODULE_ID,
      });

      if (!result.success || !result.data) {
        toast.error(result.error || 'Erro ao registrar VPS');
        return;
      }

      toast.success('Pedido de VPS criado! Você receberá por e-mail as configurações e o IP após a etapa de configuração.');
      setShowConfirmModal(false);
      setNomeInstancia('');
      await reloadBalance();
      await loadRegistros();
      navigate('/dashboard/meus-pedidos');
    } catch {
      toast.error('Erro ao registrar VPS');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      <div className="w-full">
        <SimpleTitleBar
          title="VPS 1 ANO"
          subtitle="Após a compra, as configurações e IP serão enviados por e-mail após configuração do administrador"
          onBack={() => navigate('/dashboard')}
          icon={<ModuleIcon className="h-5 w-5" />}
        />

        <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 md:items-start gap-4 md:gap-6 lg:gap-8">
          <Card className="w-full h-full">
            <CardHeader className="pb-4">
              <div className="relative bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-gray-800/50 dark:via-gray-800 dark:to-blue-900/20 rounded-lg border border-blue-100/50 dark:border-blue-800/30 shadow-sm transition-all duration-300">
                {hasDiscount && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-2.5 py-1 text-xs font-bold shadow-lg">
                      {discountPercentage}% OFF
                    </Badge>
                  </div>
                )}
                <div className="relative p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Plano Ativo</p>
                        <h3 className="text-base md:text-lg font-bold text-foreground truncate">{userPlan}</h3>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">R$ {formatPrice(modulePrice)}</span>
                      )}
                      <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent whitespace-nowrap">
                        R$ {formatPrice(finalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="nomeSolicitante" className="text-sm font-medium">Nome do Solicitante *</Label>
                <Input
                  id="nomeSolicitante"
                  placeholder="Seu nome completo"
                  value={nomeSolicitante}
                  onChange={(e) => setNomeSolicitante(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="nomeInstancia" className="text-sm font-medium">Nome da Instância</Label>
                <Input
                  id="nomeInstancia"
                  placeholder="ex: vps-cliente-01"
                  value={nomeInstancia}
                  onChange={(e) => setNomeInstancia(e.target.value)}
                />
              </div>

              <div className="rounded-md border border-border p-3 text-sm space-y-1.5">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Configuração Linux padrão inclusa
                </div>
                <p className="text-muted-foreground">{DEFAULT_CONFIG}</p>
                <p className="text-muted-foreground">Duração: 12 meses</p>
              </div>

              <Button type="button" onClick={openConfirmModal} disabled={!canRegister} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Contratar VPS
              </Button>

              {!hasSufficientBalance && (
                <div className="flex items-center gap-2 text-destructive text-sm leading-relaxed">
                  <AlertCircle className="h-4 w-4" />
                  <span>Saldo insuficiente. Gere o PIX para pagar R$ {formatPrice(finalPrice)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="overflow-hidden border-border/70 shadow-sm h-full">
              <CardHeader className="pb-3 border-b bg-muted/30">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle className="text-base md:text-lg font-semibold tracking-tight">Minhas VPS</CardTitle>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {registros.length} {registros.length === 1 ? 'instância' : 'instâncias'}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Acompanhe status, IP, período do plano e valor de cada contratação.
                </p>
              </CardHeader>

              <CardContent className="p-0">
                {registrosLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : registros.length === 0 ? (
                  <div className="px-4 py-8 text-center space-y-1">
                    <p className="text-base font-medium text-foreground">Nenhuma VPS contratada ainda</p>
                    <p className="text-sm text-muted-foreground">Assim que você contratar, os detalhes aparecerão aqui.</p>
                  </div>
                ) : (
                  <div className="max-h-[540px] overflow-y-auto p-3 space-y-3">
                    {registros.map((registro) => (
                      <article
                        key={registro.id}
                        className="rounded-lg border border-border/70 bg-card p-4 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm md:text-base font-semibold text-foreground truncate">{registro.nome_instancia}</p>
                            <p className="text-xs text-muted-foreground">#{registro.id}</p>
                          </div>
                          <Badge className={`text-xs font-semibold ${getStatusBadgeClass(registro.status)}`}>
                            {getStatusLabel(registro.status)}
                          </Badge>
                        </div>

                        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3 text-sm">
                          <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                            <p className="text-xs font-medium text-muted-foreground">IP da VPS</p>
                            <p className="mt-1 font-mono text-foreground break-all">
                              {registro.ip_vps?.trim() ? registro.ip_vps : 'Será enviado por e-mail após configuração'}
                            </p>
                          </div>

                          <div className="rounded-md border border-border/60 bg-muted/20 p-3 space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CalendarDays className="h-4 w-4" />
                              <span className="text-xs font-medium">Início do plano</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{formatDateTime(registro.plan_start_at)}</p>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock3 className="h-4 w-4" />
                              <span className="text-xs font-medium">Término do plano</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{formatDateTime(registro.plan_end_at)}</p>
                          </div>
                        </div>

                        <div className="mt-3 rounded-md border border-border/60 bg-muted/20 p-3">
                          <p className="text-xs font-medium text-muted-foreground">Configuração Linux</p>
                          <p className="mt-1 text-sm text-foreground">{registro.configuracao_linux}</p>
                        </div>

                        <div className="mt-3 flex flex-col items-start gap-2">
                          <p className="text-xs text-muted-foreground">Solicitado em {formatDateTime(registro.created_at)}</p>
                          <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1.5">
                            <CircleDollarSign className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">R$ {formatPrice(registro.valor_cobrado)}</span>
                          </div>
                        </div>
                      </article>
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
            <DialogTitle>Confirmar contratação da VPS</DialogTitle>
            <DialogDescription>
              Você está prestes a contratar uma VPS de 12 meses para <strong>{nomeSolicitante}</strong>. Após confirmação,
              o IP e as credenciais serão enviados por e-mail quando o administrador finalizar a configuração.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-border p-3 text-sm space-y-1">
            <p>Instância: <strong>{nomeInstancia.trim() || `vps-${user?.id || 'cliente'}`}</strong></p>
            <p>Configuração: <strong>{DEFAULT_CONFIG}</strong></p>
            <p>Valor a cobrar: <strong>R$ {formatPrice(finalPrice)}</strong></p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={submitLoading}>
              Cancelar
            </Button>
            <Button onClick={handleRegister} disabled={submitLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirmar contratação
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

export default SistemasHospedagemVps6;
