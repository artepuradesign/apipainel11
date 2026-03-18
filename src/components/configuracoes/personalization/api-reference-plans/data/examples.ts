
export const integrationExample = `// Integração com API Externa - Exemplo Prático
const apiConfig = {
  baseUrl: 'https://artepuradesign.com.br/api',
  apiKey: 'sua-api-key-aqui'
};

// Função para buscar planos da API externa
async function fetchPlansFromExternalAPI() {
  try {
    const response = await fetch(\`\${apiConfig.baseUrl}/plans/public\`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiConfig.apiKey}\`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('Planos encontrados:', data.data);
      return data.data;
    } else {
      throw new Error(data.message || 'Erro desconhecido');
    }
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    throw error;
  }
}

// Exemplo de uso em React
function PlansComponent() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        const plansData = await fetchPlansFromExternalAPI();
        setPlans(plansData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar planos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  if (loading) return <div>Carregando planos...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map(plan => (
        <div key={plan.id} className="p-4 border rounded-lg">
          <h3 className="font-bold">{plan.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {plan.description}
          </p>
          <div className="text-lg font-bold mt-2">{plan.priceFormatted}</div>
          <ul className="mt-2 text-sm">
            {plan.features.map((feature, index) => (
              <li key={index}>• {feature}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}`;
