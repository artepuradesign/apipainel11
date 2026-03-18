import { cookieUtils } from '@/utils/cookieUtils';
import { apiRequest, getApiUrl } from '@/config/api';

export interface BaseCpf {
  id?: number;
  ref?: string;
  cpf: string;
  nome?: string;
  data_nascimento?: string;
  sexo?: string;
  situacao_cpf?: string;
  mae?: string;
  pai?: string;
  naturalidade?: string;
  uf_naturalidade?: string;
  cor?: string;
  cns?: string;
  estado_civil?: string;
  escolaridade?: string;
  passaporte?: string;
  nit?: string;
  ctps?: string;
  titulo_eleitor?: string;
  zona?: string;
  secao?: string;
  nsu?: string;
  pis?: string;
  aposentado?: string;
  tipo_emprego?: string;
  cbo?: string;
  poder_aquisitivo?: string;
  renda?: string;
  fx_poder_aquisitivo?: string;
  csb8?: number;
  csb8_faixa?: string;
  csba?: number;
  csba_faixa?: string;
  data_obito?: string;
  foto?: string;
  foto2?: string;
  photo?: string;
  photo2?: string;
  photo3?: string;
  photo4?: string;
  ultima_atualizacao?: string;
  fonte_dados?: string;
  qualidade_dados?: number;
  score?: number;
  created_at?: string;
  updated_at?: string;
  
  // Campos removidos da tabela mas mantidos na interface para compatibilidade temporária
  // TODO: Remover após atualizar todos os componentes para usar tabelas relacionadas
  rg?: string;
  orgao_emissor?: string;
  uf_emissao?: string;
  cnh?: string;
  dt_expedicao_cnh?: string;
  email?: string;
  email_pessoal?: string;
  email_score?: string;
  senha_email?: string;
  telefone?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf_endereco?: string;
  
  // Dados relacionados (arrays)
  telefones?: any[];
  emails?: any[];
  enderecos?: any[];
  parentes?: any[];
  empresas_socio?: any[];
  historico_veiculos?: any[];
  
  // Outros campos da API
  nivel_consulta?: string;
  situacao_receita?: string;
  status_receita_federal?: string;
  percentual_participacao_societaria?: number;
  foto_rosto_rg?: string;
  foto_rosto_cnh?: string;
  foto_doc_rg?: string;
  foto_doc_cnh?: string;
  vacinas_covid?: any[];
  cnpj_mei?: string;
  dividas_ativas?: any[];
  auxilio_emergencial?: any[];
  rais_historico?: any[];
  inss_dados?: any[];
  operadora_vivo?: any[];
  operadora_claro?: any[];
  operadora_tim?: any[];
  senhas_vazadas_email?: any[];
  senhas_vazadas_cpf?: any[];
  cloud_cpf?: any[];
  cloud_email?: any[];
}

export interface BaseCpfListResponse {
  data: BaseCpf[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function apiRequestBaseCpf<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    let sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
    
    // Fallback para localStorage se os cookies não estiverem disponíveis
    if (!sessionToken) {
      sessionToken = localStorage.getItem('session_token') || localStorage.getItem('api_session_token');
    }
    
    if (!sessionToken) {
      console.error('❌ [BASE_CPF_API] Token de sessão não encontrado');
      return {
        success: false,
        error: 'Token de autorização não encontrado. Faça login novamente.'
      };
    }

    console.log('🌐 [BASE_CPF_API] Requisição para:', endpoint);

    // Usa a função apiRequest centralizada que já tem cache e gerenciamento de conexões
    const response = await apiRequest<any>(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        ...options.headers,
      },
    });

    console.log('✅ [BASE_CPF_API] Response recebida');
    return response as ApiResponse<T>;
  } catch (error) {
    console.error('❌ [BASE_CPF_API] Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export const baseCpfService = {
  // Listar todos os CPFs
  async getAll(page: number = 1, limit: number = 50, search: string = '') {
    console.log('📋 [BASE_CPF_API] Buscando lista de CPFs');
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    return apiRequestBaseCpf<BaseCpfListResponse>(`/base-cpf/all?${params}`);
  },

  // Buscar CPF por ID
  async getById(id: number) {
    console.log('🔍 [BASE_CPF_API] Buscando CPF por ID:', id);
    
    return apiRequestBaseCpf<BaseCpf>(`/base-cpf/${id}`);
  },

  // Buscar CPF por número do CPF
  async getByCpf(cpf: string) {
    console.log('🔍 [BASE_CPF_API] Buscando CPF por número:', cpf);
    
    return apiRequestBaseCpf<BaseCpf>(`/base-cpf/by-cpf?cpf=${encodeURIComponent(cpf)}`);
  },

  // Criar novo CPF
  async create(data: Omit<BaseCpf, 'id' | 'created_at' | 'updated_at'>) {
    console.log('➕ [BASE_CPF_API] Criando novo CPF:', data.cpf);
    
    return apiRequestBaseCpf<{ id: number; message: string }>('/base-cpf', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar CPF existente
  async update(id: number, data: Partial<BaseCpf>) {
    console.log('✏️ [BASE_CPF_API] Atualizando CPF:', id);
    
    return apiRequestBaseCpf<{ id: number; message: string }>(`/base-cpf/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar CPF
  async delete(id: number) {
    console.log('🗑️ [BASE_CPF_API] Deletando CPF:', id);
    
    return apiRequestBaseCpf<{ id: number; message: string }>(`/base-cpf/${id}`, {
      method: 'DELETE',
    });
  },

  // Upload de foto para CPF
  async uploadPhoto(cpf: string, file: File, type: 'foto' | 'foto2' = 'foto') {
    console.log('📸 [BASE_CPF_API] Fazendo upload de foto para CPF:', cpf);
    
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('cpf', cpf.replace(/\D/g, ''));
    formData.append('type', type);

    return apiRequestBaseCpf<{ filename: string; photo_url: string; message: string }>('/upload-photo', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },

  // Buscar score por CPF
  async getScoreByCpf(cpf: string) {
    console.log('📊 [BASE_CPF_API] Buscando score para CPF:', cpf);
    
    return apiRequestBaseCpf<{ score: number; updated_at: string }>(`/base-cpf/score?cpf=${encodeURIComponent(cpf)}`);
  },

  // Atualizar score de um CPF
  async updateScore(cpf: string, score: number) {
    console.log('📈 [BASE_CPF_API] Atualizando score do CPF:', cpf, 'Score:', score);
    
    return apiRequestBaseCpf<{ message: string; score: number; updated_at: string }>('/base-cpf/score', {
      method: 'PUT',
      body: JSON.stringify({ 
        cpf: cpf.replace(/\D/g, ''),
        score: score 
      }),
    });
  },

  // Calcular score automaticamente baseado nos dados do CPF
  async calculateScore(cpf: string) {
    console.log('🤖 [BASE_CPF_API] Calculando score automaticamente para CPF:', cpf);
    
    return apiRequestBaseCpf<{ score: number; factors: string[]; message: string }>(`/base-cpf/calculate-score?cpf=${encodeURIComponent(cpf)}`);
  },

  // Buscar histórico de scores de um CPF
  async getScoreHistory(cpf: string) {
    console.log('📈 [BASE_CPF_API] Buscando histórico de scores para CPF:', cpf);
    
    return apiRequestBaseCpf<{ history: Array<{ score: number; date: string; reason?: string }> }>(`/base-cpf/score/history?cpf=${encodeURIComponent(cpf)}`);
  }
};