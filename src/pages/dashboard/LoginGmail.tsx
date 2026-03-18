import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Mail, ShoppingCart, CheckCircle, Loader2, AlertCircle, Clock, Pencil, Trash2, Plus, Eye, EyeOff, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { loginGmailService, type LoginGmailItem, type LoginGmailCompra, type LoginProvedor } from '@/services/loginGmailService';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';
import { useApiModules } from '@/hooks/useApiModules';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { centralCashApiService } from '@/services/centralCashApiService';

interface LoginFormData {
  email: string;
  senha: string;
  provedor: string;
  cpf: string;
  saldo: string;
  pontos: string;
  status: string;
  observacao: string;
}

const emptyForm: LoginFormData = {
  email: '',
  senha: '',
  provedor: 'gmail',
  cpf: '',
  saldo: '0',
  pontos: '0',
  status: 'virgem',
  observacao: '',
};

const STATUS_OPTIONS = [
  { value: 'vendida', label: 'Vendida' },
  { value: 'virgem', label: 'Virgem' },
  { value: 'criada', label: 'Criada' },
  { value: 'usada', label: 'Usada' },
  { value: 'erro', label: 'Erro' },
];

const LoginGmail = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isAdmin = profile?.user_role === 'admin' || profile?.user_role === 'suporte';
  const { balance, loadBalance: reloadBalance } = useWalletBalance();
  const { modules } = useApiModules();
  const {
    hasActiveSubscription,
    subscription,
    discountPercentage,
    calculateDiscountedPrice: calculateSubscriptionDiscount,
  } = useUserSubscription();

  const currentModule = useMemo(() => {
    return (modules || []).find((m: any) => m.id === 163) || null;
  }, [modules]);

  const modulePrice = useMemo(() => {
    return Number(currentModule?.price ?? 2);
  }, [currentModule]);

  const userPlan = hasActiveSubscription && subscription
    ? subscription.plan_name
    : (user ? localStorage.getItem(`user_plan_${user.id}`) || 'Pré-Pago' : 'Pré-Pago');

  const { discountedPrice: finalPrice, hasDiscount } = hasActiveSubscription
    ? calculateSubscriptionDiscount(modulePrice)
    : { discountedPrice: modulePrice, hasDiscount: false };

  const discount = hasDiscount ? discountPercentage : 0;
  const originalPrice = modulePrice;

  const [logins, setLogins] = useState<LoginGmailItem[]>([]);
  const [compras, setCompras] = useState<LoginGmailCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [comprasLoading, setComprasLoading] = useState(true);
  const [selectedLogins, setSelectedLogins] = useState<Set<number>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [visibleCompras, setVisibleCompras] = useState<Set<number>>(new Set());
  const [desiredQuantity, setDesiredQuantity] = useState(1);

  // Admin modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingLogin, setEditingLogin] = useState<LoginGmailItem | null>(null);
  const [deletingLogin, setDeletingLogin] = useState<LoginGmailItem | null>(null);
  const [formData, setFormData] = useState<LoginFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [provedores, setProvedores] = useState<LoginProvedor[]>([]);

  const walletBalance = balance.saldo || 0;
  const planBalance = balance.saldo_plano || 0;
  const totalBalance = walletBalance + planBalance;

  const selectedCount = selectedLogins.size;
  const totalPurchasePrice = selectedCount * finalPrice;

  const loadLogins = useCallback(async () => {
    try {
      setLoading(true);
      const result = await loginGmailService.listLogins({ limit: 100 });
      if (result.success && result.data) {
        setLogins(result.data.data || []);
      } else {
        setLogins([]);
      }
    } catch {
      setLogins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCompras = useCallback(async () => {
    try {
      setComprasLoading(true);
      const result = await loginGmailService.minhasCompras({ limit: 100 });
      if (result.success && result.data) {
        setCompras(result.data.data || []);
      } else {
        setCompras([]);
      }
    } catch {
      setCompras([]);
    } finally {
      setComprasLoading(false);
    }
  }, []);

  const loadProvedores = useCallback(async () => {
    try {
      const result = await loginGmailService.listProvedores();
      if (result.success && result.data) {
        setProvedores(Array.isArray(result.data) ? result.data : []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadLogins();
    loadCompras();
    loadProvedores();
    reloadBalance();
  }, [user, loadLogins, loadCompras, loadProvedores, reloadBalance]);

  const toggleLoginSelection = (loginId: number) => {
    setSelectedLogins(prev => {
      const next = new Set(prev);
      if (next.has(loginId)) next.delete(loginId);
      else next.add(loginId);
      return next;
    });
  };

  const handleBulkPurchase = () => {
    if (selectedCount === 0) {
      toast.error('Selecione pelo menos um login para comprar.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleQuantityPurchase = () => {
    if (desiredQuantity <= 0) {
      toast.error('Selecione pelo menos 1 email.');
      return;
    }
    if (desiredQuantity > availableLogins.length) {
      toast.error(`Apenas ${availableLogins.length} email(s) disponível(is).`);
      return;
    }
    const totalCost = desiredQuantity * finalPrice;
    if (totalBalance < totalCost) {
      toast.error('Saldo insuficiente para esta compra.');
      return;
    }
    const selected = new Set(availableLogins.slice(0, desiredQuantity).map(l => l.id));
    setSelectedLogins(selected);
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (selectedCount === 0) return;
    setIsPurchasing(true);

    const loginIds = Array.from(selectedLogins);
    let successCount = 0;
    let errorMsg = '';

    for (const loginId of loginIds) {
      try {
        const walletType = planBalance >= finalPrice ? 'plan' : 'main';
        const result = await loginGmailService.comprar(loginId, walletType);
        if (result.success && result.data) {
          successCount++;
        } else {
          errorMsg = result.error || 'Erro ao adquirir login';
        }
      } catch {
        errorMsg = 'Erro ao processar compra';
      }
    }

    if (successCount > 0) {
      centralCashApiService.addTransaction(
        'compra_modulo',
        successCount * finalPrice,
        `Compra de ${successCount} login(s) Gmail`,
        user?.id ? Number(user.id) : undefined,
        { module_name: 'Login Gmail' }
      ).catch(err => console.warn('Erro ao registrar no caixa central:', err));

      toast.success(`${successCount} login(s) adquirido(s) com sucesso!`);
      setSelectedLogins(new Set());
      setShowConfirmModal(false);
      await Promise.all([loadLogins(), loadCompras(), reloadBalance()]);
    }
    if (errorMsg && successCount < loginIds.length) {
      toast.error(errorMsg);
    }

    setIsPurchasing(false);
  };

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const toggleCompraVisibility = (id: number) => {
    setVisibleCompras(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const maskEmail = (email: string) => {
    const [user, domain] = email.split('@');
    if (!domain) return '***@***';
    const visible = user.slice(0, Math.min(4, Math.floor(user.length / 2)));
    return `${visible}***@${domain}`;
  };

  const formatPrice = (value: number) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`;

  // Admin handlers
  const handleOpenCreate = () => {
    setFormData(emptyForm);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (login: LoginGmailItem) => {
    setEditingLogin(login);
    setFormData({
      email: login.email || '',
      senha: login.senha || '',
      provedor: login.provedor || 'gmail',
      cpf: login.cpf || '',
      saldo: String(login.saldo ?? 0),
      pontos: String(login.pontos ?? 0),
      status: login.status || 'virgem',
      observacao: login.observacao || '',
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (login: LoginGmailItem) => {
    setDeletingLogin(login);
    setShowDeleteModal(true);
  };

  const handleCreate = async () => {
    if (!formData.email || !formData.senha) {
      toast.error('Email e senha são obrigatórios');
      return;
    }
    setIsSaving(true);
    try {
      const result = await loginGmailService.criar({
        email: formData.email,
        senha: formData.senha,
        provedor: formData.provedor || 'gmail',
        cpf: formData.cpf || undefined,
        saldo: parseFloat(formData.saldo) || 0,
        pontos: parseInt(formData.pontos) || 0,
        status: formData.status || 'virgem',
        observacao: formData.observacao || undefined,
      });
      if (result.success) {
        toast.success('Login criado com sucesso!');
        setShowCreateModal(false);
        loadLogins();
      } else {
        toast.error(result.error || 'Erro ao criar login');
      }
    } catch {
      toast.error('Erro ao criar login');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingLogin) return;
    setIsSaving(true);
    try {
      const result = await loginGmailService.atualizar({
        id: editingLogin.id,
        email: formData.email,
        senha: formData.senha,
        provedor: formData.provedor,
        cpf: formData.cpf || null,
        saldo: parseFloat(formData.saldo) || 0,
        pontos: parseInt(formData.pontos) || 0,
        status: formData.status,
        observacao: formData.observacao || null,
      });
      if (result.success) {
        toast.success('Login atualizado com sucesso!');
        setShowEditModal(false);
        setEditingLogin(null);
        loadLogins();
      } else {
        toast.error(result.error || 'Erro ao atualizar login');
      }
    } catch {
      toast.error('Erro ao atualizar login');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLogin) return;
    setIsSaving(true);
    try {
      const result = await loginGmailService.excluir(deletingLogin.id);
      if (result.success) {
        toast.success('Login excluído com sucesso!');
        setShowDeleteModal(false);
        setDeletingLogin(null);
        loadLogins();
      } else {
        toast.error(result.error || 'Erro ao excluir login');
      }
    } catch {
      toast.error('Erro ao excluir login');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderFormFields = () => (
    <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="usuario@gmail.com" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="senha">Senha *</Label>
        <Input id="senha" value={formData.senha} onChange={e => updateField('senha', e.target.value)} placeholder="Senha do email" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="provedor">Provedor</Label>
        <Select value={formData.provedor} onValueChange={v => updateField('provedor', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o provedor" />
          </SelectTrigger>
          <SelectContent>
            {provedores.length > 0 ? (
              provedores.map(p => (
                <SelectItem key={p.id} value={p.slug}>{p.nome}</SelectItem>
              ))
            ) : (
              <>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="hotmail">Hotmail</SelectItem>
                <SelectItem value="renner">Renner</SelectItem>
                <SelectItem value="azul">Azul</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="cpf">CPF</Label>
        <Input id="cpf" value={formData.cpf} onChange={e => updateField('cpf', e.target.value)} placeholder="000.000.000-00" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="saldo">Saldo</Label>
          <Input id="saldo" type="number" step="0.01" value={formData.saldo} onChange={e => updateField('saldo', e.target.value)} placeholder="0.00" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pontos">Pontos</Label>
          <Input id="pontos" type="number" value={formData.pontos} onChange={e => updateField('pontos', e.target.value)} placeholder="0" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={v => updateField('status', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="observacao">Observação</Label>
        <Textarea id="observacao" value={formData.observacao} onChange={e => updateField('observacao', e.target.value)} placeholder="Observações adicionais" rows={2} />
      </div>
    </div>
  );

  const availableLogins = logins.filter(l => !l.comprado).slice(0, 9);
  const purchasedLogins = logins.filter(l => l.comprado);

  return (
    <div className="space-y-3 px-1 sm:px-0">
      <SimpleTitleBar
        title="Login Gmail"
        subtitle="Logins de email Gmail disponíveis"
        onBack={() => navigate('/dashboard')}
        icon={<Mail className="h-5 w-5" />}
        right={
          isAdmin ? (
            <Button
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={handleOpenCreate}
              title="Novo Login"
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : undefined
        }
      />

      {/* Card de Compra */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="relative bg-gradient-to-br from-red-50/50 via-white to-orange-50/30 dark:from-gray-800/50 dark:via-gray-800 dark:to-red-900/20 rounded-lg border border-red-100/50 dark:border-red-800/30 shadow-sm transition-all duration-300">
            {hasDiscount && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-2.5 py-1 text-xs font-bold shadow-lg">
                  {discount}% OFF
                </Badge>
              </div>
            )}
            <div className="relative p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-1 h-10 bg-gradient-to-b from-red-500 to-orange-500 rounded-full flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                      Plano Ativo
                    </p>
                    <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                      {hasActiveSubscription ? subscription?.plan_name : userPlan}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  {hasDiscount && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                      R$ {originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent whitespace-nowrap">
                    R$ {finalPrice.toFixed(2)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">/un</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Disponíveis para compra:</span>
            <Badge variant="outline" className="text-sm font-semibold">
              {availableLogins.length} email(s)
            </Badge>
          </div>

          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-sm">Quantidade de emails</Label>
            <div className="flex items-center gap-3">
              <Input
                id="quantity"
                type="number"
                inputMode="numeric"
                min={1}
                max={availableLogins.length || 1}
                value={desiredQuantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setDesiredQuantity(Math.min(Math.max(val, 0), availableLogins.length || 1));
                }}
                className="w-20 text-center font-semibold text-lg"
              />
              <Slider
                value={[desiredQuantity]}
                onValueChange={(v) => setDesiredQuantity(v[0])}
                min={1}
                max={Math.max(availableLogins.length, 1)}
                step={1}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
            <span className="text-sm font-medium text-muted-foreground">Total:</span>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(desiredQuantity * finalPrice)}
            </span>
          </div>

          <Button
            onClick={handleQuantityPurchase}
            disabled={loading || desiredQuantity <= 0 || availableLogins.length === 0 || totalBalance < desiredQuantity * finalPrice}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Realizar Compra
          </Button>

          {totalBalance < desiredQuantity * finalPrice && desiredQuantity > 0 && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-2 rounded text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Saldo insuficiente. Disponível: {formatPrice(totalBalance)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Logins */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando logins...</span>
        </div>
      ) : logins.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum login disponível no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {availableLogins.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {availableLogins.map((login) => {
                const isSelected = selectedLogins.has(login.id);
                return (
                  <Card
                    key={login.id}
                    className={`bg-card border-border hover:shadow-lg transition-all overflow-hidden ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleLoginSelection(login.id)}
                            className="flex-shrink-0"
                          />
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                          </div>
                          {login.status && (
                            <Badge className="bg-green-600 text-white border-0 text-xs capitalize">
                              {login.status}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isAdmin && (
                            <>
                              <Button size="icon" variant="ghost" className="h-6 w-6 sm:h-7 sm:w-7" onClick={(e) => { e.stopPropagation(); handleOpenEdit(login); }}>
                                <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleOpenDelete(login); }}>
                                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0"
                            onClick={(e) => { e.stopPropagation(); toggleLoginSelection(login.id); if (!isSelected) { setSelectedLogins(new Set([login.id])); setShowConfirmModal(true); } }}
                            title="Comprar"
                          >
                            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 rounded-md p-1.5 sm:p-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">Email:</span>
                        <span className="text-sm sm:text-base font-mono flex-1 truncate">{login.email}</span>
                      </div>
                      {isAdmin && login.cpf && (
                        <div className="text-[10px]">
                          <div className="bg-muted/50 rounded px-1.5 py-1 inline-block">
                            <span className="text-muted-foreground">CPF:</span>
                            <span className="ml-1 font-medium">{login.cpf}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Minhas Compras */}
          {purchasedLogins.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Minhas Compras
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {purchasedLogins.map((login) => {
                  const compra = compras.find(c => c.login_id === login.id);
                  return (
                    <Card
                      key={login.id}
                      className="bg-card border-border hover:shadow-lg transition-all overflow-hidden ring-2 ring-green-500/30"
                    >
                      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                            </div>
                            <Badge className="bg-green-500/90 text-white border-0 text-xs">
                              <CheckCircle className="h-3 w-3 mr-0.5" />
                              Adquirido
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {compra && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(compra.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                            {compra && (
                              <Badge variant="outline" className="text-xs font-semibold">
                                {formatPrice(compra.preco_pago)}
                              </Badge>
                            )}
                            {isAdmin && (
                              <>
                                <Button size="icon" variant="ghost" className="h-6 w-6 sm:h-7 sm:w-7" onClick={(e) => { e.stopPropagation(); handleOpenEdit(login); }}>
                                  <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleOpenDelete(login); }}>
                                  <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 rounded-md p-1.5 sm:p-2">
                          <span className="text-xs sm:text-sm text-muted-foreground">Email:</span>
                          <span className="text-sm sm:text-base font-mono flex-1 truncate">{login.email}</span>
                          <Button size="icon" variant="ghost" className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" onClick={(e) => { e.stopPropagation(); copyToClipboard(login.email, 'Email'); }} title="Copiar email">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 rounded-md p-1.5 sm:p-2">
                          <span className="text-xs sm:text-sm text-muted-foreground">Senha:</span>
                          <span className="text-sm sm:text-base font-mono flex-1 truncate">
                            {visiblePasswords.has(login.id) ? login.senha : '••••••••'}
                          </span>
                          <div className="flex gap-0.5">
                            <Button size="icon" variant="ghost" className="h-5 w-5 sm:h-6 sm:w-6" onClick={(e) => { e.stopPropagation(); togglePasswordVisibility(login.id); }}>
                              {visiblePasswords.has(login.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-5 w-5 sm:h-6 sm:w-6" onClick={(e) => { e.stopPropagation(); copyToClipboard(login.senha, 'Senha'); }}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Histórico */}
      {compras.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Histórico de Compras
          </h3>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Valor</TableHead>
                    <TableHead className="text-xs">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compras.slice(0, 10).map((compra) => (
                    <TableRow key={compra.id}>
                      <TableCell className="text-xs font-mono truncate max-w-[150px]">{compra.email || '-'}</TableCell>
                      <TableCell className="text-xs font-semibold">{formatPrice(compra.preco_pago)}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(compra.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Confirmação de Compra */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Confirmar Compra
            </DialogTitle>
            <DialogDescription>
              Revise os detalhes antes de confirmar a aquisição.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="max-h-[200px] overflow-y-auto space-y-1.5">
              {Array.from(selectedLogins).map(id => {
                const login = logins.find(l => l.id === id);
                if (!login) return null;
                return (
                  <div key={id} className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
                    <Mail className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm font-medium truncate flex-1">{login.email}</span>
                    <Badge variant="outline" className="text-[10px] flex-shrink-0">{login.provedor}</Badge>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantidade:</span>
                <span className="font-semibold">{selectedCount} login(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço unitário:</span>
                <span className="font-semibold">{formatPrice(finalPrice)}</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Desconto:</span>
                  <span className="font-semibold text-green-600">{discount}%</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground font-medium">Total:</span>
                <span className="font-bold text-foreground">{formatPrice(totalPurchasePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo disponível:</span>
                <span className={`font-semibold ${totalBalance >= totalPurchasePrice ? 'text-green-600' : 'text-destructive'}`}>
                  {formatPrice(totalBalance)}
                </span>
              </div>
              {totalBalance < totalPurchasePrice && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-2 rounded">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-xs">Saldo insuficiente para esta compra.</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isPurchasing}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              disabled={isPurchasing || selectedCount === 0 || totalBalance < totalPurchasePrice}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar ({selectedCount})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Criar Login */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Novo Login Gmail
            </DialogTitle>
            <DialogDescription>Preencha os dados do novo login.</DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : 'Criar Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Login */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Editar Login
            </DialogTitle>
            <DialogDescription>Atualize os dados do login.</DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Excluir Login
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o login "{deletingLogin?.email}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isSaving}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Excluindo...</> : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginGmail;
