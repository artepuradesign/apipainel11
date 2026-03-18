import { useState, useEffect } from 'react';
import { newsletterService } from '@/services/newsletterService';

interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
  loading: boolean;
  error: string | null;
}

export const useNewsletterStats = () => {
  const [stats, setStats] = useState<NewsletterStats>({
    total: 0,
    active: 0,
    unsubscribed: 0,
    loading: true,
    error: null
  });

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      const statsData = await newsletterService.getStats();
      setStats({
        total: statsData.total,
        active: statsData.active,
        unsubscribed: statsData.unsubscribed,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar estatísticas'
      }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { ...stats, refetch: fetchStats };
};