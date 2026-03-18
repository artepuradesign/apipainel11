
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'assinante' | 'suporte';
  user_role?: 'assinante' | 'suporte' | 'admin';
  plan: string;
  balance: number;
  planBalance?: number;
  isActive: boolean;
  status?: 'ativo' | 'inativo' | 'suspenso' | 'pendente';
  createdAt: string;
  lastLogin?: string;
  cpf?: string;
  phone?: string;
  address?: string;
  notes?: string;
  pixKeys?: string[];
  planStartDate?: string;
  planEndDate?: string;
  planDiscount?: number;
  subscription?: {
    id: number;
    plan_id: number;
    status: 'active' | 'cancelled' | 'expired' | 'suspended';
    starts_at: string;
    ends_at: string;
    auto_renew: boolean;
    plan_name?: string;
  };
}
