import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, Settings, LogOut, Crown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserProfileDropdownProps {
  onLogout: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ onLogout }) => {
  const { user, profile, isSupport } = useAuth();
  const { subscription, planInfo, isLoading } = useUserSubscription();
  const navigate = useNavigate();

  if (!user || !profile) return null;

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const displayName = profile.full_name || user.email;
  const firstName = displayName.split(' ')[0];
  const lastInitial = displayName.split(' ').length > 1 
    ? displayName.split(' ').pop()?.charAt(0).toUpperCase() + '.' 
    : '';
  const shortName = `${firstName} ${lastInitial}`.trim();

  const currentPlan = subscription?.plan_name || planInfo?.name || user.tipoplano || 'Pré-Pago';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-accent/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col items-start text-left">
            <span className="text-sm font-medium text-foreground leading-tight max-w-[120px] truncate">
              {shortName}
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight flex items-center gap-1">
              {!isLoading && currentPlan !== 'Pré-Pago' && (
                <Crown className="h-3 w-3 text-amber-500" />
              )}
              {isLoading ? '...' : currentPlan}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden lg:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2.5 border-b border-border">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            {currentPlan !== 'Pré-Pago' && <Crown className="h-3 w-3 text-amber-500" />}
            <span className="text-xs font-medium text-primary">{currentPlan}</span>
          </div>
        </div>

        <DropdownMenuItem onClick={() => navigate('/dashboard/dados-pessoais')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/dashboard/configuracoes')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
