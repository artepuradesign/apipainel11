// Serviço para consumir a API externa de planos
import { getApiUrl } from '@/config/api';

export interface ExternalPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceFormatted: string;
  original_price?: number;
  duration_days: number;
  max_consultations: number;
  max_api_calls: number;
  features: string[];
  modules_included: string[];
  badge?: string;
  is_popular: boolean;
  is_active: boolean;
  category: string;
  sort_order: number;
  theme?: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    cardTheme: string;
    gradient: string;
  };
  highlight?: boolean;
  order?: number;
  cardSuit?: string;
  cardType?: string;
  discountPercentage?: number;
}

class ExternalApiService {
  async fetchPlans(): Promise<ExternalPlan[]> {
    try {
      console.log('🔄 Buscando planos da API (via api.php)...');
      
      // Busca a URL da API do backend PHP (api.php)
      const apiUrl = getApiUrl('/plans/active');
      console.log('📡 URL obtida do api.php:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('📡 Resposta da API:', {
        url: apiUrl,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        console.log('✅ Planos obtidos da API externa:', data.data.length);
        return this.formatPlansForUI(data.data);
      } else if (Array.isArray(data)) {
        // Caso a API retorne diretamente um array
        console.log('✅ Planos obtidos da API externa (formato direto):', data.length);
        return this.formatPlansForUI(data);
      } else {
        console.error('❌ Formato inesperado da API:', data);
        throw new Error('Formato de resposta inválido da API');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar planos da API externa:', error);
      throw error;
    }
  }

  private formatPlansForUI(plans: any[]): ExternalPlan[] {
    return plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug || this.generateSlug(plan.name),
      description: plan.description || 'Plano configurado pela administração',
      price: parseFloat(plan.price),
      priceFormatted: `R$ ${parseFloat(plan.price).toFixed(2).replace('.', ',')}`,
      original_price: plan.original_price ? parseFloat(plan.original_price) : undefined,
      duration_days: plan.duration_days || 30,
      max_consultations: plan.max_consultations || -1,
      max_api_calls: plan.max_api_calls || -1,
      features: this.parseJsonField(plan.features) || [],
      modules_included: this.parseJsonField(plan.modules_included) || [],
      badge: plan.badge,
      is_popular: Boolean(plan.is_popular),
      is_active: plan.is_active !== false,
      category: plan.category || 'basic',
      sort_order: plan.sort_order || 0,
      theme: this.getThemeByCategory(plan.category),
      highlight: Boolean(plan.is_popular),
      order: plan.sort_order || 0,
      cardSuit: this.getCategoryCardSuit(plan.category),
      cardType: this.getCategoryCardType(plan.category),
      discountPercentage: plan.original_price ? 
        Math.round(((parseFloat(plan.original_price) - parseFloat(plan.price)) / parseFloat(plan.original_price)) * 100) : 0
    }));
  }

  private parseJsonField(field: any): string[] {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [field];
      }
    }
    return [];
  }

  private getThemeByCategory(category: string) {
    const themes: { [key: string]: any } = {
      'basic': {
        colors: {
          primary: '#8B5CF6',
          secondary: '#7C3AED',
          accent: '#A855F7'
        },
        cardTheme: 'purple-gradient',
        gradient: 'purple'
      },
      'premium': {
        colors: {
          primary: '#1F2937',
          secondary: '#374151',
          accent: '#6B7280'
        },
        cardTheme: 'dark-gradient',
        gradient: 'dark'
      },
      'king': {
        colors: {
          primary: '#1F2937',
          secondary: '#374151',
          accent: '#6B7280'
        },
        cardTheme: 'dark-gradient',
        gradient: 'dark'
      },
      'enterprise': {
        colors: {
          primary: '#059669',
          secondary: '#047857',
          accent: '#10B981'
        },
        cardTheme: 'green-gradient',
        gradient: 'green'
      }
    };
    return themes[category] || themes['basic'];
  }

  private generateSlug(name: string): string {
    return name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private getCategoryCardSuit(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'basic': '♦', // Ouros - Rainhas  
      'premium': '♠', // Espadas - Reis
      'king': '♠', // Espadas - Reis
      'enterprise': '♣' // Paus
    };
    return categoryMap[category] || '♦';
  }

  private getCategoryCardType(category: string): string {
    const typeMap: { [key: string]: string } = {
      'basic': 'queen',
      'premium': 'king', 
      'king': 'king',
      'enterprise': 'ace'
    };
    return typeMap[category] || 'queen';
  }
}

export const externalApiService = new ExternalApiService();
