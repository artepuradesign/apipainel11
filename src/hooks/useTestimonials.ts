// Hook para gerenciar depoimentos da API externa
import { useState, useEffect } from 'react';
import { testimonialsApiService, ExternalTestimonial } from '@/services/testimonialsApiService';
import { toast } from 'sonner';

export interface TestimonialData {
  id: number;
  name: string;
  company: string;
  message: string;
  rating: number;
  status: string;
  position?: string;
  avatar?: string;
  created_at: string;
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [USE_TESTIMONIALS] Carregando depoimentos...');
      console.log('🔗 [USE_TESTIMONIALS] URL da API:', 'https://api.artepuradesign.com.br/testimonials/active');
      const externalTestimonials = await testimonialsApiService.fetchActiveTestimonials();
      
      // Converter para o formato esperado pelo componente
      const formattedTestimonials: TestimonialData[] = externalTestimonials.map((testimonial: ExternalTestimonial) => ({
        id: testimonial.id,
        name: testimonial.name,
        company: testimonial.company || 'Empresa não informada',
        message: testimonial.message,
        rating: testimonial.rating,
        status: testimonial.status,
        position: testimonial.position || undefined,
        avatar: testimonial.avatar || undefined,
        created_at: testimonial.created_at
      }));

      console.log('✅ [USE_TESTIMONIALS] Depoimentos formatados:', formattedTestimonials.length);
      setTestimonials(formattedTestimonials);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar depoimentos';
      console.error('❌ [USE_TESTIMONIALS] Erro:', errorMessage);
      setError(errorMessage);
      
      // Não mostrar toast de erro automaticamente para não incomodar o usuário
      // O componente pode decidir se quer mostrar ou não
      
    } finally {
      setLoading(false);
    }
  };

  const createTestimonial = async (testimonialData: {
    name: string;
    message: string;
    rating: number;
    position?: string;
    company?: string;
    avatar?: string;
  }) => {
    try {
      console.log('🔄 [USE_TESTIMONIALS] Criando depoimento...');
      const success = await testimonialsApiService.createTestimonial(testimonialData);
      
      if (success) {
        toast.success('Depoimento enviado com sucesso! Será analisado antes de ser publicado.');
        // Recarregar a lista de depoimentos
        await loadTestimonials();
        return true;
      } else {
        toast.error('Erro ao enviar depoimento. Tente novamente.');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar depoimento';
      console.error('❌ [USE_TESTIMONIALS] Erro ao criar:', errorMessage);
      toast.error('Erro ao enviar depoimento. Tente novamente.');
      return false;
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  return {
    testimonials,
    loading,
    error,
    loadTestimonials,
    createTestimonial
  };
}