// Serviço para consumir depoimentos da API externa
import { API_BASE_URL, getSimpleHeaders } from '@/config/apiConfig';

export interface ExternalTestimonial {
  id: number;
  name: string;
  message: string;
  rating: number;
  avatar?: string | null;
  position?: string | null;
  company?: string | null;
  status: 'ativo' | 'inativo' | 'pendente';
  featured: boolean;
  display_order: number;
  user_id?: number | null;
  approved_by?: number | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

class TestimonialsApiService {
  private baseUrl = API_BASE_URL;

  async fetchActiveTestimonials(): Promise<ExternalTestimonial[]> {
    try {
      console.log('🔄 [TESTIMONIALS_API] Buscando depoimentos ativos da API externa...');
      console.log('🔗 [TESTIMONIALS_API] URL completa:', `${this.baseUrl}/testimonials/active`);
      
      const response = await fetch(`${this.baseUrl}/testimonials/active`, {
        method: 'GET',
        headers: getSimpleHeaders()
      });

      console.log('📡 [TESTIMONIALS_API] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [TESTIMONIALS_API] Erro HTTP:', errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ [TESTIMONIALS_API] Dados recebidos:', {
        success: data.success,
        count: data.data ? data.data.length : 0,
        testimonials: data.data
      });

      if (!data.success || !data.data) {
        throw new Error('Resposta inválida da API');
      }

      const testimonials = data.data
        .filter((testimonial: ExternalTestimonial) => testimonial.status === 'ativo')
        .sort((a: ExternalTestimonial, b: ExternalTestimonial) => {
          // Primeiro por featured, depois por display_order, depois por data
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.display_order !== b.display_order) {
            return a.display_order - b.display_order;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      console.log('✅ [TESTIMONIALS_API] Depoimentos processados:', testimonials.length);
      return testimonials;

    } catch (error) {
      console.error('❌ [TESTIMONIALS_API] Erro ao buscar depoimentos:', error);
      
      // Em caso de erro, retornar array vazio ao invés de quebrar a aplicação
      console.log('⚠️ [TESTIMONIALS_API] Retornando array vazio devido ao erro');
      return [];
    }
  }

  async createTestimonial(testimonialData: {
    name: string;
    message: string;
    rating: number;
    position?: string;
    company?: string;
    avatar?: string;
  }): Promise<boolean> {
    try {
      console.log('🔄 [TESTIMONIALS_API] Criando novo depoimento...');
      
      const response = await fetch(`${this.baseUrl}/testimonials`, {
        method: 'POST',
        headers: getSimpleHeaders(),
        body: JSON.stringify(testimonialData)
      });

      console.log('📡 [TESTIMONIALS_API] Resposta da criação:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [TESTIMONIALS_API] Erro ao criar depoimento:', errorText);
        return false;
      }

      const result = await response.json();
      console.log('✅ [TESTIMONIALS_API] Depoimento criado com sucesso:', result);
      
      return result.success === true;
      
    } catch (error) {
      console.error('❌ [TESTIMONIALS_API] Erro ao criar depoimento:', error);
      return false;
    }
  }
}

export const testimonialsApiService = new TestimonialsApiService();