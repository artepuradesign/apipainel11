
// Types and interfaces for the user system
export interface User {
  id: number;
  login: string;
  email: string;
  senhaalfa?: string;
  cpf?: string;
  cnpj?: string;
  senha4?: string;
  senha6?: string;
  senha8?: string;
  full_name: string;
  data_nascimento?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  indicador_id?: number;
  codigo_indicacao?: string; // Added this missing property
  tipoplano: string;
  data_inicio?: string;
  data_fim?: string;
  user_role: 'assinante' | 'suporte';
  status: 'ativo' | 'inativo' | 'suspenso' | 'pendente';
  saldo: number;
  saldo_atualizado: boolean;
  aceite_termos: boolean;
  ultimo_login?: string;
  created_at: string;
  updated_at: string;
  tipo_pessoa?: 'fisica' | 'juridica';
}

export interface ServiceResponse {
  success: boolean;
  message: string;
}
