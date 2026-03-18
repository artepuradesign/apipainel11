
export const plansEndpoints = [
  {
    method: 'GET',
    endpoint: '/api/plans/public',
    description: 'Lista todos os planos públicos disponíveis',
    auth: false,
    parameters: []
  },
  {
    method: 'GET', 
    endpoint: '/api/plans/{id}',
    description: 'Obtém detalhes de um plano específico',
    auth: false,
    parameters: [
      { name: 'id', type: 'integer', description: 'ID do plano' }
    ]
  },
  {
    method: 'POST',
    endpoint: '/api/plans/subscribe',
    description: 'Assinar um plano específico',
    auth: true,
    parameters: [
      { name: 'plan_id', type: 'integer', description: 'ID do plano para assinatura' },
      { name: 'payment_method', type: 'string', description: 'Método de pagamento' }
    ]
  }
];
