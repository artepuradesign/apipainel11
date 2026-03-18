
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Link } from 'lucide-react';
import { phpIntegrationExample } from './data/integration';

interface IntegrationTabProps {
  copiedCode: string | null;
  copyToClipboard: (text: string, type: string) => void;
}

export const IntegrationTab = ({ copiedCode, copyToClipboard }: IntegrationTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-green-600" />
            Integração com API Externa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🔗 Conectando com artepuradesign.com.br
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Esta implementação conecta diretamente com a API externa usando os arquivos PHP existentes no projeto.
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded p-3 mb-3">
                <h4 className="font-medium mb-2">Configuração Base:</h4>
                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
{`// Frontend JavaScript
const API_CONFIG = {
  baseUrl: 'https://artepuradesign.com.br/api',
  apiKey: 'sua-api-key-aqui',
  timeout: 30000
};`}
                </pre>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded p-3">
                <h4 className="font-medium mb-2">Exemplo de Uso - Buscar Planos:</h4>
                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
{`// Frontend JavaScript
const fetchPlans = async () => {
  try {
    const response = await fetch(\`\${API_CONFIG.baseUrl}/plans/public\`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${API_CONFIG.apiKey}\`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar planos');
    }
    
    const data = await response.json();
    console.log('Planos encontrados:', data);
    return data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};`}
                </pre>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ Estrutura de Resposta da API
              </h3>
              <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto">
{`{
  "success": true,
  "message": "Planos encontrados com sucesso",
  "data": [
    {
      "id": 1,
      "name": "Rainha de Ouros",
      "description": "Plano básico ideal para iniciantes",
      "price": 29.90,
      "priceFormatted": "R$ 29,90",
      "features": [
        "1.000 consultas/mês",
        "Suporte básico",
        "API REST"
      ],
      "consultationLimit": 1000,
      "status": "ativo",
      "theme": {
        "colors": {
          "primary": "#8B5CF6",
          "secondary": "#7C3AED",
          "accent": "#A855F7"
        },
        "cardTheme": "purple-gradient",
        "gradient": "purple"
      },
      "highlight": false,
      "order": 1,
      "cardSuit": "diamonds",
      "cardType": "queen",
      "discountPercentage": 10
    }
  ]
}`}
              </pre>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                🔧 Implementação PHP
              </h3>
              <div className="flex justify-end mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(phpIntegrationExample, 'php')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copiedCode === 'php' ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              <ScrollArea className="h-64">
                <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto">
                  {phpIntegrationExample}
                </pre>
              </ScrollArea>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚡ Endpoints Disponíveis
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• <code>GET /api/plans/public</code> - Lista todos os planos públicos</li>
                <li>• <code>GET /api/plans/:id</code> - Busca plano específico por ID</li>
                <li>• <code>POST /api/plans/subscribe</code> - Assinar plano (requer autenticação)</li>
                <li>• <code>POST /api/plans/cancel</code> - Cancelar assinatura (requer autenticação)</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                📋 Como Implementar
              </h3>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                <li>Configure a URL base da API externa no frontend</li>
                <li>Implemente as funções de requisição HTTP</li>
                <li>Trate as respostas da API conforme a estrutura documentada</li>
                <li>Implemente tratamento de erros adequado</li>
                <li>Teste a integração com os endpoints disponíveis</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
