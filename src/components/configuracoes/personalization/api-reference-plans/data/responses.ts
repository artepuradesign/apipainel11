
export const responseExamples = {
  success: `{
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
}`,
  error: `{
  "success": false,
  "message": "API key inválida",
  "error": "INVALID_API_KEY",
  "timestamp": "2024-01-15T10:30:00Z"
}`
};
