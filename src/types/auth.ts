
export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  user_role: 'assinante' | 'suporte' | 'admin';
  aceite_termos: boolean;
  indicador_id?: number;
  codigo_indicacao_usado?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiUser {
  id: number;
  login: string;
  email: string;
  full_name: string;
  user_role: 'assinante' | 'suporte' | 'admin';
  saldo: number;
  saldo_plano?: number;
  status: string;
  tipoplano: string;
  codigo_indicacao?: string;
  cpf?: string;
  cnpj?: string;
  data_nascimento?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  aceite_termos?: boolean;
  email_verificado?: boolean;
  telefone_verificado?: boolean;
  ultimo_login?: string;
  created_at?: string;
  updated_at?: string;
  data_inicio?: string;
  data_fim?: string;
  premium_enabled?: boolean | number;
}

export interface AuthUser {
  id: string;
  login: string;
  email: string;
  full_name: string;
  user_role: 'assinante' | 'suporte' | 'admin';
  saldo: number;
  saldo_plano?: number;
  status: string;
  tipoplano: string;
  codigo_indicacao?: string;
  cpf?: string;
  cnpj?: string;
  data_nascimento?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  aceite_termos?: boolean;
  email_verificado?: boolean;
  telefone_verificado?: boolean;
  ultimo_login?: string;
  created_at?: string;
  updated_at?: string;
  data_inicio?: string;
  data_fim?: string;
  premium_enabled?: boolean | number;
}

export interface AuthApiResponse {
  success: boolean;
  data?: {
    user: ApiUser;
    token: string;
    session_token?: string;
    expires_in: number;
    session_id?: number;
    auto_login?: boolean;
    referral_bonus?: {
      amount: number;
      referrer_bonus: number;
      referrer_name?: string;
    };
  };
  message?: string;
  error?: string;
  statusCode?: string;
}
