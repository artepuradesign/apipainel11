
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Crown, User, Eye, Edit, Key, Trash2 } from 'lucide-react';
import type { User as UserType } from "@/types/user";

// Função para obter o label do tipo de usuário
const getRoleLabel = (userRole: string) => {
  switch (userRole) {
    case 'admin': return 'Admin';
    case 'suporte': return 'Suporte';
    case 'assinante': return 'Assinante';
    default: return 'Assinante';
  }
};

// Função para obter a variante do badge baseado no tipo
const getRoleVariant = (userRole: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (userRole) {
    case 'admin': return 'destructive';
    case 'suporte': return 'default';
    default: return 'secondary';
  }
};

// Função para formatar data e hora do último login
const formatLastLogin = (lastLogin: string) => {
  const date = new Date(lastLogin);
  const dateStr = date.toLocaleDateString('pt-BR');
  const timeStr = date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  return `${dateStr} às ${timeStr}`;
};

interface UserListItemProps {
  user: UserType;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onView: (user: UserType) => void;
  onEdit: (user: UserType) => void;
  onResetPassword: (userId: string) => void;
  onDelete: (userId: string) => void;
}

const UserListItem = ({
  user,
  onToggleStatus,
  onView,
  onEdit,
  onResetPassword,
  onDelete
}: UserListItemProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="border rounded-lg p-3 md:p-4">
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
          <div 
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex-shrink-0 cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => navigate(`/dashboard/usuario/${user.id}`)}
            title="Ver detalhes completos"
          >
            {user.role === 'suporte' ? (
              <Crown className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
            ) : (
              <User className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
              <h4 className="font-medium text-sm md:text-base truncate">{user.name}</h4>
              <Badge variant={getRoleVariant((user as any).user_role)} className="text-xs">
                {getRoleLabel((user as any).user_role)}
              </Badge>
              {!user.isActive && (
                <Badge variant="destructive" className="text-xs">Inativo</Badge>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {user.username} • {user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              Plano: {user.plan} • Carteira: R$ {user.balance.toFixed(2)} • Plano: R$ {(user.planBalance || 0).toFixed(2)}
            </p>
            {user.lastLogin && (
              <p className="text-xs text-muted-foreground">
                Último acesso: {formatLastLogin(user.lastLogin)}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:gap-2">
          <div className="flex items-center justify-between md:justify-start space-x-2">
            <Switch
              checked={user.isActive}
              onCheckedChange={(checked) => {
                console.log('🔄 [USER_LIST] Toggle status clicked for user:', user.id, 'new status:', checked);
                onToggleStatus(user.id, checked);
              }}
            />
            <Label className="text-xs md:text-sm">Ativo</Label>
          </div>
          
          <div className="flex gap-1 md:gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                console.log('👁️ [USER_LIST] View button clicked for user:', user.id);
                onView(user);
              }} 
              className="h-8 w-8 p-0"
            >
              <Eye className="h-3 w-3 md:h-4 md:w-4" />
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                console.log('✏️ [USER_LIST] Edit button clicked for user:', user.id);
                onEdit(user);
              }} 
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3 md:h-4 md:w-4" />
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log('🔑 [USER_LIST] Reset password button clicked for user:', user.id);
                onResetPassword(user.id);
              }}
              className="h-8 w-8 p-0"
            >
              <Key className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                console.log('🗑️ [USER_LIST] Delete button clicked for user:', user.id);
                onDelete(user.id);
              }}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserListItem;
