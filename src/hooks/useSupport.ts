import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cookieUtils } from '@/utils/cookieUtils';

interface SupportTicket {
  subject: string;
  description: string;
  category: 'tecnico' | 'financeiro' | 'consultas' | 'geral' | 'other';
  priority: 'baixa' | 'media' | 'alta' | 'urgente' | 'normal';
}

interface UserTicket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolution?: string;
  satisfaction_rating?: number;
  satisfaction_comment?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export const useSupport = () => {
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getApiUrl = () => {
    const baseUrl = 'https://api.artepuradesign.com.br';
    return `${baseUrl}/support`; // Endpoint correto baseado na estrutura da API
  };

  const getAuthHeaders = () => {
    const sessionToken = cookieUtils.get('session_token');
    
    if (!sessionToken || sessionToken === 'authenticated') {
      throw new Error('Token de sessão inválido');
    }

    return {
      'Authorization': `Bearer ${sessionToken}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchUserTickets = async () => {
    setIsLoadingTickets(true);
    try {
      console.log('🎫 [SUPPORT] Iniciando busca de tickets...');
      const headers = getAuthHeaders();
      console.log('🎫 [SUPPORT] Headers:', headers);
      
      const response = await fetch(getApiUrl(), {
        method: 'GET',
        headers,
      });

      console.log('🎫 [SUPPORT] Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🎫 [SUPPORT] Response data:', data);

      if (data.success) {
        setUserTickets(data.data || []);
        console.log('🎫 [SUPPORT] Tickets carregados:', data.data?.length || 0);
      } else {
        console.error('🎫 [SUPPORT] Erro ao carregar tickets:', data.message);
        toast.error(data.message || 'Erro ao carregar histórico de chamados');
      }
    } catch (error) {
      console.error('🎫 [SUPPORT] Erro ao carregar tickets:', error);
      if (error instanceof Error && error.message.includes('Token de sessão inválido')) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else {
        toast.error('Erro ao carregar histórico de chamados');
      }
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const createTicket = async (ticket: SupportTicket) => {
    if (!ticket.subject || !ticket.description) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return false;
    }

    setIsSubmitting(true);

    try {
      const headers = getAuthHeaders();
      
      // Mapear categorias e prioridades para o formato esperado pelo backend
      const ticketData = {
        ...ticket,
        category: ticket.category === 'other' ? 'geral' : ticket.category,
        priority: ticket.priority === 'normal' ? 'media' : ticket.priority
      };

      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers,
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Chamado aberto com sucesso! Nossa equipe entrará em contato em breve.');
        // Refresh tickets list
        await fetchUserTickets();
        return true;
      } else {
        throw new Error(data.message || 'Erro ao abrir chamado');
      }
    } catch (error) {
      console.error('Erro ao abrir chamado:', error);
      if (error instanceof Error && error.message.includes('Token de sessão inválido')) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else {
        toast.error('Erro ao abrir chamado. Tente novamente ou entre em contato por email.');
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTicketSatisfaction = async (ticketId: number, rating: number, comment?: string) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${getApiUrl()}/${ticketId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          satisfaction_rating: rating,
          satisfaction_comment: comment || ''
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Avaliação enviada com sucesso!');
        // Refresh tickets list
        await fetchUserTickets();
        return true;
      } else {
        throw new Error(data.message || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error('Erro ao enviar avaliação. Tente novamente.');
      return false;
    }
  };

  useEffect(() => {
    // Só buscar tickets se o hook for usado na página de suporte
    const currentPath = window.location.pathname;
    if (currentPath.includes('/suporte')) {
      fetchUserTickets();
    }
  }, []);

  return {
    userTickets,
    isLoadingTickets,
    isSubmitting,
    fetchUserTickets,
    createTicket,
    updateTicketSatisfaction
  };
};