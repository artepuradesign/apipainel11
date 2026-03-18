import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/apiConfig';

export interface User {
  id: number;
  username: string;
  nome?: string;
  email?: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/users-list`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar usuários');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setUsers(result.data);
        } else {
          setError(result.message || 'Erro ao carregar usuários');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, isLoading, error };
};
