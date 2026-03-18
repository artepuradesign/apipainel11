import React from 'react';
import { formatDateBR } from '@/utils/timezone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, CreditCard, Wallet, Calendar, Shield, FileText } from 'lucide-react';
import type { User as UserType } from "@/types/user";

interface UserDetailsModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsModal = ({ user, isOpen, onClose }: UserDetailsModalProps) => {
  if (!user) return null;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'suporte': return 'Suporte';
      default: return 'Assinante';
    }
  };

  const getRoleVariant = (role: string): "default" | "secondary" | "destructive" => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'suporte': return 'default';
      default: return 'secondary';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return formatDateBR(dateString, { showTime: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Nome e Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/50 rounded-lg">
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate">{user.name}</h3>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getRoleVariant((user as any).user_role || user.role)}>
                {getRoleLabel((user as any).user_role || user.role)}
              </Badge>
              <Badge variant={user.isActive ? 'default' : 'destructive'} className={user.isActive ? 'bg-green-600' : ''}>
                {user.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>

          {/* Informações de Contato */}
          <Card className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{user.phone || 'Não informado'}</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{user.cpf || 'CPF não informado'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Financeiro */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">Saldo Carteira</span>
                </div>
                <p className="text-lg font-bold text-green-600">{formatCurrency(user.balance)}</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-muted-foreground">Saldo Plano</span>
                </div>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(user.planBalance || 0)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Plano e Datas */}
          <Card className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Plano</span>
                </div>
                <Badge variant="outline">{user.plan}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Criado em</span>
                </div>
                <span className="text-sm">{formatDate(user.createdAt)}</span>
              </div>
              {user.lastLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Último acesso</span>
                  </div>
                  <span className="text-sm">{formatDate(user.lastLogin)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          {user.notes && (
            <Card className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2">Observações</p>
                <p className="text-sm">{user.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
