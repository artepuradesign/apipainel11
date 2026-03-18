
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseSessionTimeoutProps {
  timeoutMinutes?: number;
}

export const useSessionTimeout = ({ 
  timeoutMinutes = 30 // 30 minutos de sessão
}: UseSessionTimeoutProps = {}) => {
  const { user, signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    // Limpar timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Só configurar timeout se usuário estiver logado
    if (!user) return;

    console.log('🔄 [SESSION_TIMEOUT] Timeout resetado para 30 minutos');

    // Atualizar timestamp de última atividade
    const currentUserId = localStorage.getItem('current_user_id');
    if (currentUserId) {
      localStorage.setItem(`last_activity_${currentUserId}`, Date.now().toString());
    }

    // Configurar logout automático (30 minutos)
    timeoutRef.current = setTimeout(() => {
      if (user) {
        console.log('⏰ [SESSION_TIMEOUT] Sessão expirada após 30 minutos de inatividade');
        signOut();
      }
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    if (!user) {
      // Limpar timeout se usuário não estiver logado
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Configurar timeout inicial
    resetTimeout();

    // Eventos que indicam atividade do usuário
    const activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Throttle para evitar muitas chamadas
    let isThrottled = false;
    const handleActivity = () => {
      if (!isThrottled && user) {
        isThrottled = true;
        resetTimeout();
        
        setTimeout(() => {
          isThrottled = false;
        }, 1000); // Throttle de 1 segundo
      }
    };

    // Adicionar listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, timeoutMinutes]);

  return { resetTimeout };
};
