import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { API_BASE_URL, getSimpleHeaders } from '@/config/apiConfig';

export interface AdminTestimonial {
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

export function useAdminTestimonials() {
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [ADMIN_TESTIMONIALS] Carregando todos os depoimentos...');
      
      const response = await fetch(`${API_BASE_URL}/testimonials`, {
        method: 'GET',
        headers: getSimpleHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error('Resposta inválida da API');
      }

      console.log('✅ [ADMIN_TESTIMONIALS] Depoimentos carregados:', data.data.length);
      setTestimonials(data.data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar depoimentos';
      console.error('❌ [ADMIN_TESTIMONIALS] Erro:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTestimonialStatus = async (id: number, status: 'ativo' | 'inativo' | 'pendente') => {
    try {
      console.log(`🔄 [ADMIN_TESTIMONIALS] Atualizando status do depoimento ${id} para ${status}...`);
      
      const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'PUT',
        headers: getSimpleHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [ADMIN_TESTIMONIALS] Status atualizado com sucesso');
        // Atualizar o estado local
        setTestimonials(prev => 
          prev.map(testimonial => 
            testimonial.id === id 
              ? { ...testimonial, status, updated_at: new Date().toISOString() }
              : testimonial
          )
        );
        return true;
      } else {
        throw new Error('Falha ao atualizar status');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status';
      console.error('❌ [ADMIN_TESTIMONIALS] Erro:', errorMessage);
      return false;
    }
  };

  const deleteTestimonial = async (id: number) => {
    try {
      console.log(`🔄 [ADMIN_TESTIMONIALS] Deletando depoimento ${id}...`);
      
      const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'DELETE',
        headers: getSimpleHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [ADMIN_TESTIMONIALS] Depoimento deletado com sucesso');
        // Remover do estado local
        setTestimonials(prev => prev.filter(testimonial => testimonial.id !== id));
        return true;
      } else {
        throw new Error('Falha ao deletar depoimento');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar depoimento';
      console.error('❌ [ADMIN_TESTIMONIALS] Erro:', errorMessage);
      return false;
    }
  };

  const createTestimonial = async (testimonialData: {
    name: string;
    message: string;
    rating: number;
    position?: string;
    company?: string;
    avatar?: string;
    status?: 'ativo' | 'inativo' | 'pendente';
  }) => {
    try {
      console.log('🔄 [ADMIN_TESTIMONIALS] Criando novo depoimento...');
      
      const response = await fetch(`${API_BASE_URL}/testimonials`, {
        method: 'POST',
        headers: getSimpleHeaders(),
        body: JSON.stringify({
          ...testimonialData,
          status: testimonialData.status || 'pendente'
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [ADMIN_TESTIMONIALS] Depoimento criado com sucesso');
        // Recarregar a lista
        await loadTestimonials();
        return true;
      } else {
        throw new Error('Falha ao criar depoimento');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar depoimento';
      console.error('❌ [ADMIN_TESTIMONIALS] Erro:', errorMessage);
      return false;
    }
  };

  const approveTestimonial = async (id: number) => {
    const success = await updateTestimonialStatus(id, 'ativo');
    if (success) {
      toast.success('Depoimento aprovado com sucesso! Agora será exibido na página inicial.');
    } else {
      toast.error('Erro ao aprovar depoimento. Tente novamente.');
    }
    return success;
  };

  const rejectTestimonial = async (id: number) => {
    const success = await updateTestimonialStatus(id, 'inativo');
    if (success) {
      toast.success('Depoimento rejeitado com sucesso!');
    } else {
      toast.error('Erro ao rejeitar depoimento. Tente novamente.');
    }
    return success;
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  // Estatísticas
  const pendingCount = testimonials.filter(t => t.status === 'pendente').length;
  const approvedCount = testimonials.filter(t => t.status === 'ativo').length;
  const rejectedCount = testimonials.filter(t => t.status === 'inativo').length;

  return {
    testimonials,
    loading,
    error,
    loadTestimonials,
    createTestimonial,
    approveTestimonial,
    rejectTestimonial,
    deleteTestimonial,
    updateTestimonialStatus,
    // Estatísticas
    pendingCount,
    approvedCount,
    rejectedCount
  };
}