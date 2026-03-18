
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Calendar, Clock, Wallet, User as UserIcon, Mail, CreditCard, Percent, FileText, Save, X, UserPlus, ShieldCheck } from 'lucide-react';
import { getFullApiUrl } from '@/utils/apiHelper';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getDiscount } from '@/utils/planUtils';

interface Plan {
  id: number;
  name: string;
  slug: string;
  price: number;
  priceFormatted: string;
  discount_percentage?: number;
  duration_days?: number;
}

export interface AddUserExtraData {
  planBalance: number;
  planStartDate: string;
  planEndDate: string;
  planDiscount: number;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  newUser: {
    username: string;
    name: string;
    email: string;
    role: 'assinante' | 'suporte';
    plan: string;
    balance: number;
    cpf: string;
    phone: string;
    address: string;
    notes: string;
    status: 'ativo' | 'inativo' | 'suspenso' | 'pendente';
  };
  setNewUser: (user: any) => void;
  onSubmit: (extraData: AddUserExtraData) => void;
}

const AddUserModal = ({ isOpen, onClose, newUser, setNewUser, onSubmit }: AddUserModalProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [addPlanBalance, setAddPlanBalance] = useState(false);
  const [addPlanDays, setAddPlanDays] = useState(false);
  const [selectedPlanPrice, setSelectedPlanPrice] = useState(0);
  const [selectedPlanDays, setSelectedPlanDays] = useState(0);
  const [customDays, setCustomDays] = useState(0);
  const [planDiscount, setPlanDiscount] = useState(0);
  const [planStartDate, setPlanStartDate] = useState('');
  const [planEndDate, setPlanEndDate] = useState('');
  const [planBalance, setPlanBalance] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      setAddPlanBalance(false);
      setAddPlanDays(false);
      setSelectedPlanPrice(0);
      setSelectedPlanDays(0);
      setCustomDays(0);
      setPlanDiscount(0);
      setPlanStartDate('');
      setPlanEndDate('');
      setPlanBalance(0);
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await fetch(getFullApiUrl('/plans/active'));
      const result = await response.json();
      if (result.success && result.data) {
        setPlans(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const recalcEndDate = (days: number) => {
    if (days > 0) {
      const today = new Date();
      setPlanStartDate(format(today, 'yyyy-MM-dd'));
      setPlanEndDate(format(new Date(today.getTime() + days * 86400000), 'yyyy-MM-dd'));
    } else {
      setPlanStartDate('');
      setPlanEndDate('');
    }
  };

  const handlePlanChange = (value: string) => {
    const selectedPlan = plans.find(p => p.name === value);
    const discount = selectedPlan?.discount_percentage ?? getDiscount(value);
    const price = selectedPlan?.price || 0;
    const days = selectedPlan?.duration_days || 0;
    setSelectedPlanPrice(price);
    setSelectedPlanDays(days);
    setCustomDays(days);
    setPlanDiscount(discount);

    const newBalance = addPlanBalance && price > 0 ? price : 0;
    setPlanBalance(newBalance);

    if (addPlanDays && days > 0) {
      recalcEndDate(days);
    } else {
      setPlanStartDate('');
      setPlanEndDate('');
    }

    setNewUser({ ...newUser, plan: value });
  };

  const handleToggleAddPlanBalance = (checked: boolean) => {
    setAddPlanBalance(checked);
    if (checked) {
      setPlanBalance(selectedPlanPrice > 0 ? selectedPlanPrice : 0);
    }
  };

  const handleToggleAddPlanDays = (checked: boolean) => {
    setAddPlanDays(checked);
    if (checked) {
      const days = customDays > 0 ? customDays : 30;
      setCustomDays(days);
      recalcEndDate(days);
    } else {
      setPlanStartDate('');
      setPlanEndDate('');
    }
  };

  const handleCustomDaysChange = (value: number) => {
    setCustomDays(value);
    if (value > 0) {
      recalcEndDate(value);
    } else {
      setPlanStartDate('');
      setPlanEndDate('');
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSubmit = () => {
    onSubmit({
      planBalance,
      planStartDate,
      planEndDate,
      planDiscount,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border bg-muted/30">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Novo Usuário
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">Preencha os dados para criar um novo usuário</p>
        </DialogHeader>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Seção: Dados Pessoais */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dados Pessoais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-username" className="text-xs flex items-center gap-1.5">
                  <UserIcon className="h-3 w-3" /> Nome de Usuário *
                </Label>
                <Input
                  id="add-username"
                  className="h-9 text-sm"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Ex: joao123"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-name" className="text-xs flex items-center gap-1.5">
                  <UserIcon className="h-3 w-3" /> Nome Completo *
                </Label>
                <Input
                  id="add-name"
                  className="h-9 text-sm"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>
            </div>
          </div>

          {/* Seção: Contato */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contato</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-email" className="text-xs flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> E-mail *
                </Label>
                <Input
                  id="add-email"
                  type="email"
                  className="h-9 text-sm"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Ex: joao@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-cpf" className="text-xs flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3" /> CPF
                </Label>
                <Input
                  id="add-cpf"
                  className="h-9 text-sm"
                  value={newUser.cpf}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setNewUser({ ...newUser, cpf: value });
                  }}
                  placeholder="Ex: 12345678900"
                  maxLength={11}
                />
              </div>
            </div>
          </div>

          {/* Seção: Financeiro */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Financeiro</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-balance" className="text-xs flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3" /> Saldo da Carteira
                </Label>
                <Input
                  id="add-balance"
                  type="number"
                  step="0.01"
                  className="h-9 text-sm"
                  value={newUser.balance}
                  onChange={(e) => setNewUser({ ...newUser, balance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-plan-balance" className="text-xs flex items-center gap-1.5">
                  <Wallet className="h-3 w-3" /> Saldo do Plano
                </Label>
                <Input
                  id="add-plan-balance"
                  type="number"
                  step="0.01"
                  className="h-9 text-sm"
                  value={planBalance}
                  onChange={(e) => setPlanBalance(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Seção: Plano */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Plano</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-plan" className="text-xs">Plano</Label>
                {loadingPlans ? (
                  <div className="flex items-center gap-2 h-9 px-3 border rounded-md bg-muted">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs text-muted-foreground">Carregando...</span>
                  </div>
                ) : (
                  <Select value={newUser.plan} onValueChange={handlePlanChange}>
                    <SelectTrigger id="add-plan" className="h-9 text-sm">
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.name}>
                          {plan.name} - {plan.priceFormatted}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-plan-discount" className="text-xs flex items-center gap-1.5">
                  <Percent className="h-3 w-3" /> Desconto (%)
                </Label>
                <Input
                  id="add-plan-discount"
                  type="number"
                  min="0"
                  max="100"
                  className="h-9 text-sm"
                  value={planDiscount}
                  onChange={(e) => setPlanDiscount(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              <Label htmlFor="add-role" className="text-xs">Tipo de Usuário</Label>
              <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger id="add-role" className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assinante">Assinante</SelectItem>
                  <SelectItem value="suporte">Suporte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Switches: Adicionar valor e dias */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border bg-muted/40">
                <div className="min-w-0">
                  <Label className="text-xs font-medium block">Adicionar valor ao saldo</Label>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {selectedPlanPrice > 0 ? `Plano: ${formatCurrency(selectedPlanPrice)}` : 'Valor manual'}
                  </p>
                </div>
                <Switch
                  checked={addPlanBalance}
                  onCheckedChange={handleToggleAddPlanBalance}
                />
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border bg-muted/40">
                <div className="min-w-0">
                  <Label className="text-xs font-medium block">Adicionar dias</Label>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {selectedPlanDays > 0 ? `Plano: ${selectedPlanDays} dias` : 'Dias manual'}
                  </p>
                </div>
                <Switch
                  checked={addPlanDays}
                  onCheckedChange={handleToggleAddPlanDays}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Início
                </Label>
                <div className="h-9 text-sm px-3 flex items-center rounded-md border bg-muted text-foreground">
                  {planStartDate ? format(new Date(planStartDate), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Término
                </Label>
                <div className="h-9 text-sm px-3 flex items-center rounded-md border bg-muted text-foreground">
                  {planEndDate ? format(new Date(planEndDate), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Dias
                </Label>
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-sm font-semibold text-primary"
                  value={customDays}
                  onChange={(e) => handleCustomDaysChange(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Seção: Observações */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Observações</h3>
            <div className="space-y-1.5">
              <Label htmlFor="add-notes" className="text-xs flex items-center gap-1.5">
                <FileText className="h-3 w-3" /> Notas
              </Label>
              <Input
                id="add-notes"
                className="h-9 text-sm"
                value={newUser.notes}
                onChange={(e) => setNewUser({ ...newUser, notes: e.target.value })}
                placeholder="Observações sobre o usuário..."
              />
            </div>
          </div>

          {/* Seção: Status */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status do Usuário</h3>
            <div className="space-y-1.5">
              <Label htmlFor="add-status" className="text-xs flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> Status
              </Label>
              <Select
                value={newUser.status}
                onValueChange={(value) => setNewUser({ ...newUser, status: value as any })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">✅ Ativo</SelectItem>
                  <SelectItem value="inativo">⛔ Inativo</SelectItem>
                  <SelectItem value="suspenso">⚠️ Suspenso</SelectItem>
                  <SelectItem value="pendente">⏳ Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border bg-muted/30">
          <Button size="sm" variant="outline" onClick={onClose} className="gap-1.5">
            <X className="h-3.5 w-3.5" />
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Criar Usuário
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
