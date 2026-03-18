
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

interface Endpoint {
  method: string;
  endpoint: string;
  description: string;
  params: string;
  response: string;
  tier?: string;
}

const endpoints: Endpoint[] = [
  // Authentication Endpoints
  {
    method: 'POST',
    endpoint: '/auth/login',
    description: 'Realizar login no sistema',
    params: 'login, password, two_factor_code (opcional)',
    response: 'access_token, refresh_token, expires_in, user_data'
  },
  {
    method: 'POST',
    endpoint: '/auth/register',
    description: 'Registrar novo usuário',
    params: 'login, email, password, full_name, cpf, telefone, referral_code (opcional)',
    response: 'user_id, status, activation_token, welcome_bonus'
  },
  {
    method: 'POST',
    endpoint: '/auth/refresh',
    description: 'Renovar token de acesso',
    params: 'refresh_token',
    response: 'access_token, refresh_token, expires_in'
  },
  {
    method: 'POST',
    endpoint: '/auth/logout',
    description: 'Realizar logout e invalidar tokens',
    params: 'Authorization header',
    response: 'success, message'
  },

  // CPF Consultation Endpoints
  {
    method: 'GET',
    endpoint: '/consultation/cpf/{cpf}/basic',
    description: 'Consultar dados básicos do CPF',
    params: 'cpf (11 dígitos), Authorization header',
    response: 'dados_pessoais, situacao_cpf, genero, data_nascimento',
    tier: 'Básico - R$ 2,50'
  },
  {
    method: 'GET',
    endpoint: '/consultation/cpf/{cpf}/complete',
    description: 'Consultar dados completos do CPF',
    params: 'cpf (11 dígitos), Authorization header',
    response: 'dados_pessoais, endereco, telefones, emails, parentes',
    tier: 'Completo - R$ 5,00'
  },
  {
    method: 'GET',
    endpoint: '/consultation/cpf/{cpf}/premium',
    description: 'Consultar dados premium do CPF',
    params: 'cpf (11 dígitos), Authorization header',
    response: 'dados_completos, score_credito, relacionamentos, bens, restricoes, renda_estimada',
    tier: 'Premium - R$ 10,00'
  },

  // CNPJ Consultation Endpoints
  {
    method: 'GET',
    endpoint: '/consultation/cnpj/{cnpj}/basic',
    description: 'Consultar dados básicos do CNPJ',
    params: 'cnpj (14 dígitos), Authorization header',
    response: 'dados_empresa, situacao_cnpj, atividade_principal, data_abertura',
    tier: 'Básico - R$ 3,00'
  },
  {
    method: 'GET',
    endpoint: '/consultation/cnpj/{cnpj}/complete',
    description: 'Consultar dados completos do CNPJ',
    params: 'cnpj (14 dígitos), Authorization header',
    response: 'dados_empresa, endereco, quadro_societario, filiais, contatos',
    tier: 'Completo - R$ 6,00'
  },
  {
    method: 'GET',
    endpoint: '/consultation/cnpj/{cnpj}/premium',
    description: 'Consultar dados premium do CNPJ',
    params: 'cnpj (14 dígitos), Authorization header',
    response: 'dados_completos, historico_financeiro, processos_judiciais, certidoes, participacoes',
    tier: 'Premium - R$ 12,00'
  },

  // Vehicle Consultation Endpoints
  {
    method: 'GET',
    endpoint: '/consultation/vehicle/{placa}/basic',
    description: 'Consultar dados básicos do veículo',
    params: 'placa (formato ABC1234), Authorization header',
    response: 'dados_veiculo, marca, modelo, ano, cor, combustivel',
    tier: 'Básico - R$ 4,00'
  },
  {
    method: 'GET',
    endpoint: '/consultation/vehicle/{placa}/complete',
    description: 'Consultar dados completos do veículo',
    params: 'placa (formato ABC1234), Authorization header',
    response: 'dados_veiculo, proprietario, debitos, restricoes, licenciamento',
    tier: 'Completo - R$ 8,00'
  },
  {
    method: 'GET',
    endpoint: '/consultation/vehicle/{placa}/premium',
    description: 'Consultar dados premium do veículo',
    params: 'placa (formato ABC1234), Authorization header',
    response: 'dados_completos, historico_proprietarios, recalls, seguro, leiloes',
    tier: 'Premium - R$ 15,00'
  },

  // User Management
  {
    method: 'GET',
    endpoint: '/users',
    description: 'Listar usuários',
    params: 'limit, offset, search, status, Authorization header',
    response: 'users[], pagination, filters'
  },
  {
    method: 'GET',
    endpoint: '/users/{id}',
    description: 'Obter usuário específico',
    params: 'user_id, Authorization header',
    response: 'user_data, subscription, balance, usage_stats'
  },
  {
    method: 'POST',
    endpoint: '/users',
    description: 'Criar novo usuário',
    params: 'user_data, Authorization header',
    response: 'created_user, welcome_bonus'
  },
  {
    method: 'PUT',
    endpoint: '/users/{id}',
    description: 'Atualizar usuário',
    params: 'user_id, updates, Authorization header',
    response: 'updated_user, changes_made'
  },

  // Plans Management
  {
    method: 'GET',
    endpoint: '/planos',
    description: 'Listar planos disponíveis',
    params: 'ativo (opcional), Authorization header',
    response: 'plans[], features, pricing, discounts'
  },
  {
    method: 'GET',
    endpoint: '/planos/{id}',
    description: 'Obter plano específico',
    params: 'plan_id, Authorization header',
    response: 'plan_data, features, pricing'
  },
  {
    method: 'POST',
    endpoint: '/planos',
    description: 'Criar novo plano',
    params: 'plan_data, Authorization header',
    response: 'created_plan'
  },

  // Modules Management
  {
    method: 'GET',
    endpoint: '/modulos',
    description: 'Listar módulos disponíveis',
    params: 'categoria (opcional), ativo (opcional), Authorization header',
    response: 'modules[], categories, configurations'
  },
  {
    method: 'GET',
    endpoint: '/modulos/{id}',
    description: 'Obter módulo específico',
    params: 'module_id, Authorization header',
    response: 'module_data, configurations, statistics'
  },
  {
    method: 'POST',
    endpoint: '/modulos',
    description: 'Criar novo módulo',
    params: 'module_data, Authorization header',
    response: 'created_module'
  },

  // Panels Management
  {
    method: 'GET',
    endpoint: '/paineis',
    description: 'Listar painéis disponíveis',
    params: 'user_id (opcional), Authorization header',
    response: 'panels[], themes, configurations'
  },
  {
    method: 'GET',
    endpoint: '/paineis/{id}',
    description: 'Obter painel específico',
    params: 'panel_id, Authorization header',
    response: 'panel_data, modules, theme, configurations'
  },
  {
    method: 'POST',
    endpoint: '/paineis',
    description: 'Criar novo painel',
    params: 'panel_data, Authorization header',
    response: 'created_panel'
  }
];

const EndpointsDocumentation = () => {
  const groupedEndpoints = endpoints.reduce((acc, endpoint) => {
    const category = endpoint.endpoint.split('/')[1] || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(endpoint);
    return acc;
  }, {} as Record<string, Endpoint[]>);

  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      auth: 'Autenticação',
      consultation: 'Consultas',
      users: 'Usuários',
      planos: 'Planos',
      modulos: 'Módulos',
      paineis: 'Painéis'
    };
    return titles[category] || 'Outros';
  };

  const baseUrl = 'https://api.artepuradesign.com.br/api';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-600" />
          Endpoints da API - Documentação Completa
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Documentação atualizada e completa dos endpoints disponíveis na API
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Informações da API */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              🔗 Informações da API
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <p>• <strong>Base URL:</strong> <code className="bg-white dark:bg-gray-700 px-2 py-1 rounded">{baseUrl}</code></p>
              <p>• <strong>Autenticação:</strong> <code className="bg-white dark:bg-gray-700 px-2 py-1 rounded">Bearer bG92YWJsZS5kZXY=</code></p>
              <p>• <strong>Content-Type:</strong> <code className="bg-white dark:bg-gray-700 px-2 py-1 rounded">application/json</code></p>
              <p>• <strong>Rate Limit:</strong> 120 requisições por minuto por usuário</p>
              <p>• <strong>Timeout:</strong> 30 segundos por requisição</p>
            </div>
          </div>

          {Object.entries(groupedEndpoints).map(([category, categoryEndpoints]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                {getCategoryTitle(category)}
              </h3>
              <div className="space-y-4">
                {categoryEndpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded flex-1 min-w-0">
                        {baseUrl}{endpoint.endpoint}
                      </code>
                      {endpoint.tier && (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          {endpoint.tier}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {endpoint.description}
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                      <div>
                        <strong className="text-blue-600 dark:text-blue-400">Parâmetros:</strong>
                        <br />
                        <span className="text-gray-600 dark:text-gray-400">{endpoint.params}</span>
                      </div>
                      <div>
                        <strong className="text-green-600 dark:text-green-400">Resposta:</strong>
                        <br />
                        <span className="text-gray-600 dark:text-gray-400">{endpoint.response}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EndpointsDocumentation;
