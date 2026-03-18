import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { pageVisitService } from '@/services/pageVisitService';

/**
 * Hook para registrar visitas de página automaticamente.
 * Usar no layout principal ou em páginas específicas.
 */
export const usePageVisitTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const pagePath = location.pathname;
    const pageTitle = document.title;
    const userId = (user as any)?.id;

    pageVisitService.register(pagePath, pageTitle, userId);
  }, [location.pathname, user]);
};
