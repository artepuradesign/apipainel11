import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileText, Loader2, AlertCircle, CheckCircle, User, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useApiModules } from '@/hooks/useApiModules';
import { useIsMobile } from '@/hooks/use-mobile';
import { walletApiService } from '@/services/walletApiService';
import { consultationApiService } from '@/services/consultationApiService';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';
import LoadingScreen from '@/components/layout/LoadingScreen';
import ScrollToTop from '@/components/ui/scroll-to-top';

const PHP_API_BASE = 'https://qr.apipainel.com.br/qrcode';
const PHP_VALIDATION_BASE = 'https://qr.apipainel.com.br/qrvalidation';

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

interface PeriodOption {
  label: string;
  months: number;
  moduleRoute: string;
  price: number;
}

const QRCodeRgReativar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modules } = useApiModules();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [recentRegistrations, setRecentRegistrations] = useState<RegistroData[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // Balance
  const [walletBalance, setWalletBalance] = useState(0);
  const [planBalance, setPlanBalance] = useState(0);
  const { balance, loadBalance: reloadApiBalance } = useWalletBalance();
  const {
    hasActiveSubscription,
    subscription,
    discountPercentage,
    calculateDiscountedPrice: calculateSubscriptionDiscount,
    isLoading: subscriptionLoading
  } = useUserSubscription();

  // Reactivate modal
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistroData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6');
  const [isReactivating, setIsReactivating] = useState(false);

  // Get prices from API modules for QR Code RG 6m, 3m, 1m
  const periodOptions: PeriodOption[] = useMemo(() => {
    const getModulePrice = (route: string): number => {
      const mod = (modules || []).find((m: any) => {
        const raw = (m?.api_endpoint || m?.path || '').toString().trim();
        const normalized = raw.startsWith('/') ? raw : raw.startsWith('dashboard/') ? `/${raw}` : !raw.includes('/') ? `/dashboard/${raw}` : raw;
        return normalized === route;
      });
      return Number(mod?.price ?? 0);
    };

    return [
      { label: '6 Meses', months: 6, moduleRoute: '/dashboard/qrcode-rg-6m', price: getModulePrice('/dashboard/qrcode-rg-6m') },
      { label: '3 Meses', months: 3, moduleRoute: '/dashboard/qrcode-rg-3m', price: getModulePrice('/dashboard/qrcode-rg-3m') },
      { label: '1 Mês', months: 1, moduleRoute: '/dashboard/qrcode-rg-1m', price: getModulePrice('/dashboard/qrcode-rg-1m') },
    ];
  }, [modules]);

  const selectedOption = periodOptions.find(o => o.months.toString() === selectedPeriod) || periodOptions[0];

  const { discountedPrice: finalPrice, hasDiscount } = hasActiveSubscription && selectedOption.price > 0
    ? calculateSubscriptionDiscount(selectedOption.price)
    : { discountedPrice: selectedOption.price, hasDiscount: false };

  const totalBalance = planBalance + walletBalance;
  const hasSufficientBalance = totalBalance >= finalPrice;

  // Load balances
  const loadBalances = useCallback(() => {
    if (!user) return;
    setPlanBalance(balance.saldo_plano || 0);
    setWalletBalance(balance.saldo || 0);
  }, [user, balance]);

  useEffect(() => {
    if (balance.saldo !== undefined || balance.saldo_plano !== undefined) {
      loadBalances();
    }
  }, [balance, loadBalances]);

  // Load ALL registrations (no module filter)
  const loadRecentRegistrations = useCallback(async () => {
    try {
      setRecentLoading(true);
      const userId = user?.id || '';
      const response = await fetch(`${PHP_API_BASE}/list_users.php?limit=200&offset=0&id_user=${encodeURIComponent(userId)}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setRecentRegistrations(data.data);
      } else {
        setRecentRegistrations([]);
      }
    } catch (error) {
      console.error('Erro ao carregar cadastros:', error);
      setRecentRegistrations([]);
    } finally {
      setRecentLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      reloadApiBalance();
      loadRecentRegistrations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/dashboard');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const openReactivateModal = (registration: RegistroData) => {
    setSelectedRegistration(registration);
    setSelectedPeriod('6');
    setShowReactivateModal(true);
  };

  const handleReactivate = async () => {
    if (!selectedRegistration || !user) return;

    if (!hasSufficientBalance) {
      toast.error('Saldo insuficiente para reativar.');
      return;
    }

    setIsReactivating(true);

    try {
      // 1. Update expiry date on PHP backend (months are added cumulatively)
      const updateResponse = await fetch(`https://api.apipainel.com.br/update-expiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRegistration.id,
          months: selectedOption.months
        })
      });

      let updateResult: any = { success: false };
      try {
        const text = await updateResponse.text();
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          updateResult = JSON.parse(text);
        } else if (updateResponse.ok) {
          updateResult = { success: true };
        }
      } catch {
        if (updateResponse.ok) updateResult = { success: true };
      }

      if (!updateResult.success && !updateResponse.ok) {
        throw new Error(updateResult.error || 'Erro ao reativar cadastro no servidor');
      }

      // 2. Charge balance
      let saldoUsado: 'plano' | 'carteira' | 'misto' = 'carteira';

      if (planBalance >= finalPrice) {
        saldoUsado = 'plano';
        await walletApiService.addBalance(0, -finalPrice, `Reativação QR Code RG ${selectedOption.label} - ${selectedRegistration.full_name}`, 'consulta', undefined, 'plan');
      } else if (planBalance > 0 && totalBalance >= finalPrice) {
        saldoUsado = 'misto';
        const restante = finalPrice - planBalance;
        await walletApiService.addBalance(0, -planBalance, `Reativação QR Code RG ${selectedOption.label} - ${selectedRegistration.full_name} (saldo plano)`, 'consulta', undefined, 'plan');
        await walletApiService.addBalance(0, -restante, `Reativação QR Code RG ${selectedOption.label} - ${selectedRegistration.full_name} (saldo carteira)`, 'consulta', undefined, 'main');
      } else {
        await walletApiService.addBalance(0, -finalPrice, `Reativação QR Code RG ${selectedOption.label} - ${selectedRegistration.full_name}`, 'consulta', undefined, 'main');
      }

      // 3. Record consultation
      const moduleId = 157;
      await consultationApiService.recordConsultation({
        document: selectedRegistration.document_number,
        status: 'completed',
        cost: finalPrice,
        result_data: { reactivation: true, period: selectedOption.months, token: selectedRegistration.token },
        saldo_usado: saldoUsado,
        module_id: moduleId,
        metadata: {
          page_route: location.pathname,
          module_name: 'QR Code RG Reativar',
          module_id: moduleId,
          token: selectedRegistration.token,
          saldo_usado: saldoUsado,
          source: 'qrcode-rg-reativar',
          reactivation_period: selectedOption.months,
          timestamp: new Date().toISOString()
        }
      });

      // Update balance locally
      if (saldoUsado === 'plano') {
        setPlanBalance(prev => Math.max(0, prev - finalPrice));
      } else if (saldoUsado === 'misto') {
        const restante = finalPrice - planBalance;
        setPlanBalance(0);
        setWalletBalance(prev => Math.max(0, prev - restante));
      } else {
        setWalletBalance(prev => Math.max(0, prev - finalPrice));
      }

      await reloadApiBalance();
      window.dispatchEvent(new CustomEvent('balanceRechargeUpdated', {
        detail: { userId: user.id, shouldAnimate: true, amount: finalPrice, method: 'api' }
      }));

      setShowReactivateModal(false);
      await loadRecentRegistrations();

      toast.success('Cadastro reativado com sucesso!', {
        description: `${selectedRegistration.full_name} - ${selectedOption.label}`
      });
    } catch (error: any) {
      console.error('Erro ao reativar:', error);
      toast.error(error.message || 'Erro ao reativar. Tente novamente.');
    } finally {
      setIsReactivating(false);
    }
  };

  if (recentLoading && recentRegistrations.length === 0) {
    return (
      <LoadingScreen
        message="Carregando cadastros..."
        variant="dashboard"
      />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      <div className="w-full">
        <SimpleTitleBar
          title="Reativar QR Code RG"
          subtitle="Reative cadastros expirados escolhendo o período"
          onBack={handleBack}
        />

        <div className="mt-4 md:mt-6">
          {/* Meus Cadastros */}
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
                {recentRegistrations.map((registration) => {
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

                        {/* Dados */}
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

                        {/* Actions */}
                        <div className="flex-shrink-0 flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              toast.info('Use o Gerenciamento Total para excluir cadastros');
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => openReactivateModal(registration)}
                            title="Reativar"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

      {/* Modal de Reativação */}
      <Dialog open={showReactivateModal} onOpenChange={setShowReactivateModal}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Reativar Cadastro
            </DialogTitle>
            <DialogDescription>
              Escolha o período de reativação para <strong>{selectedRegistration?.full_name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Info do cadastro */}
            {selectedRegistration && (
              <div className="flex gap-3 p-3 bg-muted rounded-lg">
                {selectedRegistration.photo_path && (
                  <img
                    src={`https://qr.apipainel.com.br/qrvalidation/${selectedRegistration.photo_path}`}
                    alt="Foto"
                    className="w-14 h-18 object-cover rounded-lg border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{selectedRegistration.full_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{selectedRegistration.document_number}</p>
                  <p className="text-xs text-muted-foreground">Nasc. {formatDate(selectedRegistration.birth_date)}</p>
                </div>
              </div>
            )}

            {/* Seleção de período */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Período de Reativação</Label>
              <RadioGroup value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-2">
                {periodOptions.map((option) => {
                  const { discountedPrice, hasDiscount: optHasDiscount } = hasActiveSubscription && option.price > 0
                    ? calculateSubscriptionDiscount(option.price)
                    : { discountedPrice: option.price, hasDiscount: false };

                  return (
                    <label
                      key={option.months}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPeriod === option.months.toString()
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={option.months.toString()} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </div>
                      <div className="text-right">
                        {optHasDiscount && (
                          <span className="text-[10px] text-muted-foreground line-through block">
                            R$ {option.price.toFixed(2)}
                          </span>
                        )}
                        <span className="text-sm font-bold text-primary">
                          R$ {discountedPrice.toFixed(2)}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Valor final */}
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <span className="text-sm font-medium">Valor da reativação:</span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                R$ {finalPrice.toFixed(2)}
              </span>
            </div>

            {/* Saldo */}
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Saldo do plano: R$ {planBalance.toFixed(2)}</p>
              <p>Saldo da carteira: R$ {walletBalance.toFixed(2)}</p>
            </div>

            {!hasSufficientBalance && (
              <div className="flex items-start gap-2 p-2.5 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive">
                  Saldo insuficiente. Necessário: R$ {finalPrice.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReactivateModal(false)}
              disabled={isReactivating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReactivate}
              disabled={isReactivating || !hasSufficientBalance || finalPrice <= 0}
              className="bg-brand-purple hover:bg-brand-darkPurple"
            >
              {isReactivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reativando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Reativar (R$ {finalPrice.toFixed(2)})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ScrollToTop />
    </div>
  );
};

export default QRCodeRgReativar;
