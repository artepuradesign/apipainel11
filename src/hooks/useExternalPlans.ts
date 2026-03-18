
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/api';

export interface ExternalPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceFormatted: string;
  duration_days: number;
  consultation_limit: number;
  max_consultations: number;
  max_api_calls: number;
  features: string[];
  modules_included: string[];
  category: string;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  theme: any;
  theme_colors: any;
  card_theme: string;
  card_suit: string;
  cardSuit: string;
  card_type: string;
  cardType: string;
  cardTheme: string;
  discount_percentage: number;
  discountPercentage: number;
  created_at: string;
  updated_at: string;
}

export const useExternalPlans = () => {
  const [plans, setPlans] = useState<ExternalPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 [EXTERNAL_PLANS] Buscando planos da API (via api.php)...');
      
      // Busca a URL da API do backend PHP (api.php)
      const apiUrl = getApiUrl('/plans/active');
      console.log('📡 [EXTERNAL_PLANS] URL obtida do api.php:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📡 [EXTERNAL_PLANS] Resposta da API:', {
        url: apiUrl,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('📊 [EXTERNAL_PLANS] Dados recebidos:', data);

      if (data.success && Array.isArray(data.data)) {
        const processedPlans = data.data.map((plan: any) => ({
          ...plan,
          max_consultations: plan.consultation_limit || plan.max_consultations || 0,
          max_api_calls: plan.consultation_limit || plan.max_api_calls || 0,
          priceFormatted: plan.priceFormatted || `R$ ${plan.price.toFixed(2).replace('.', ',')}`,
          features: Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? JSON.parse(plan.features) : []),
          modules_included: Array.isArray(plan.modules_included) ? plan.modules_included : (plan.features || []),
          cardSuit: plan.card_suit || plan.cardSuit || '♠',
          cardType: plan.card_type || plan.cardType || 'queen',
          cardTheme: plan.card_theme || plan.cardTheme || 'default',
          discountPercentage: plan.discount_percentage || plan.discountPercentage || 0
        }));

        setPlans(processedPlans);
        console.log('✅ [EXTERNAL_PLANS] Planos processados:', processedPlans.length);
      } else if (Array.isArray(data)) {
        // Caso a API retorne diretamente um array
        const processedPlans = data.map((plan: any) => ({
          ...plan,
          max_consultations: plan.consultation_limit || plan.max_consultations || 0,
          max_api_calls: plan.consultation_limit || plan.max_api_calls || 0,
          priceFormatted: plan.priceFormatted || `R$ ${plan.price.toFixed(2).replace('.', ',')}`,
          features: Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? JSON.parse(plan.features) : []),
          modules_included: Array.isArray(plan.modules_included) ? plan.modules_included : (plan.features || []),
          cardSuit: plan.card_suit || plan.cardSuit || '♠',
          cardType: plan.card_type || plan.cardType || 'queen',
          cardTheme: plan.card_theme || plan.cardTheme || 'default',
          discountPercentage: plan.discount_percentage || plan.discountPercentage || 0
        }));

        setPlans(processedPlans);
        console.log('✅ [EXTERNAL_PLANS] Planos processados (formato direto):', processedPlans.length);
      } else {
        console.error('❌ [EXTERNAL_PLANS] Formato de resposta inválido:', data);
        setError('Formato de resposta da API inválido');
        setPlans([]);
      }
    } catch (error) {
      console.error('❌ [EXTERNAL_PLANS] Erro ao buscar planos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar planos';
      setError(errorMessage);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetchPlans = () => {
    fetchPlans();
  };

  useEffect(() => {
    console.log('🚀 [EXTERNAL_PLANS] Hook inicializado, buscando planos...');
    fetchPlans();
  }, []);

  return {
    plans,
    isLoading,
    error,
    refetchPlans
  };
};
