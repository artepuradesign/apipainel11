
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Mail, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Subscriber {
  id: number;
  full_name: string;
  email: string;
  login: string;
  subscription_status: string;
  start_date?: string;
  end_date?: string;
}

interface Plan {
  id: number;
  name: string;
}

interface PlanSubscribersModalProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  planId: number;
  subscribers: Subscriber[];
  availablePlans: Plan[];
  onMigrateAndDelete: (planId: number, targetPlanId: number | string) => Promise<void>;
}

const PlanSubscribersModal: React.FC<PlanSubscribersModalProps> = ({
  open,
  onClose,
  planName,
  planId,
  subscribers,
  availablePlans,
  onMigrateAndDelete,
}) => {
  const [targetPlanId, setTargetPlanId] = useState<string>('');
  const [isMigrating, setIsMigrating] = useState(false);

  // Filtrar apenas assinantes ativos (não cancelados/expirados)
  const activeSubscribers = subscribers.filter(
    (s) => s.subscription_status === 'active' || s.subscription_status === 'ativo'
  );
  const inactiveSubscribers = subscribers.filter(
    (s) => s.subscription_status !== 'active' && s.subscription_status !== 'ativo'
  );

  // Planos disponíveis para migração (excluindo o plano atual)
  const migrationPlans = availablePlans.filter((p) => p.id !== planId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'ativo':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Ativo</Badge>;
      case 'expired':
      case 'expirado':
        return <Badge variant="secondary">Expirado</Badge>;
      case 'cancelled':
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleMigrateAndDelete = async () => {
    if (!targetPlanId) {
      toast.error('Selecione um plano de destino para migrar os usuários');
      return;
    }
    setIsMigrating(true);
    try {
      const targetValue = targetPlanId === 'prepago' ? 'prepago' : parseInt(targetPlanId);
      await onMigrateAndDelete(planId, targetValue);
      onClose();
    } catch (error) {
      console.error('Erro ao migrar e excluir:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {activeSubscribers.length > 0
              ? 'Plano possui assinantes ativos'
              : 'Não é possível excluir o plano'}
          </DialogTitle>
          <DialogDescription>
            {activeSubscribers.length > 0 ? (
              <>
                O plano <strong>"{planName}"</strong> possui{' '}
                <strong>{activeSubscribers.length} assinante(s) ativo(s)</strong>.
                Selecione um plano de destino para migrar os usuários antes de excluir.
              </>
            ) : (
              <>
                O plano <strong>"{planName}"</strong> possui{' '}
                <strong>{inactiveSubscribers.length} assinatura(s) inativa(s)</strong> (canceladas/expiradas).
                Estas não impedem a exclusão.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {activeSubscribers.length > 0 && (
          <>
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Assinantes ativos ({activeSubscribers.length}):</span>
              </div>

              <ScrollArea className="max-h-[200px]">
                <div className="space-y-2">
                  {activeSubscribers.map((sub) => (
                    <div
                      key={`${sub.id}-${sub.subscription_status}`}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {sub.full_name || sub.login || 'Sem nome'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{sub.email || sub.login}</span>
                        </div>
                      </div>
                      <div className="ml-2">
                        {getStatusBadge(sub.subscription_status)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="mt-4 p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Migrar usuários para:
                </span>
              </div>
              <Select value={targetPlanId} onValueChange={setTargetPlanId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o plano de destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prepago">Pré-pago (Padrão)</SelectItem>
                  {migrationPlans.map((plan) => (
                    <SelectItem key={plan.id} value={String(plan.id)}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {inactiveSubscribers.length > 0 && activeSubscribers.length > 0 && (
          <div className="text-xs text-muted-foreground mt-2">
            + {inactiveSubscribers.length} assinatura(s) inativa(s) (não impedem exclusão)
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {activeSubscribers.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleMigrateAndDelete}
              disabled={!targetPlanId || isMigrating}
            >
              {isMigrating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Migrando...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Migrar e Excluir
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSubscribersModal;
