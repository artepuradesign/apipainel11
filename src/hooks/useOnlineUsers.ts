
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface OnlineUser {
  id: string;
  name: string;
  loginTime: string;
  isCurrentUser: boolean;
}

export const useOnlineUsers = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  const updateOnlineStatus = () => {
    if (!user) return;

    const now = new Date().toISOString();
    const currentTime = Date.now();
    
    // Marcar usuário atual como online
    localStorage.setItem(`user_online_${user.id}`, now);
    localStorage.setItem(`last_activity_${user.id}`, currentTime.toString());

    // Pegar todos os usuários do sistema
    const systemUsers = JSON.parse(localStorage.getItem('system_users') || '[]');
    const activeUsers: OnlineUser[] = [];

    systemUsers.forEach((systemUser: any) => {
      const lastActivity = localStorage.getItem(`last_activity_${systemUser.id}`);
      const userOnlineTime = localStorage.getItem(`user_online_${systemUser.id}`);
      
      if (lastActivity && userOnlineTime) {
        const lastActivityTime = parseInt(lastActivity);
        const timeDiff = currentTime - lastActivityTime;
        
        // Considerar online se última atividade foi há menos de 2 minutos
        if (timeDiff < 2 * 60 * 1000) {
          activeUsers.push({
            id: systemUser.id,
            name: systemUser.full_name || systemUser.name || systemUser.login || 'Usuário',
            loginTime: userOnlineTime,
            isCurrentUser: systemUser.id === user.id
          });
        } else {
          // Remover usuário offline
          localStorage.removeItem(`user_online_${systemUser.id}`);
          localStorage.removeItem(`last_activity_${systemUser.id}`);
        }
      }
    });

    // Ordenar por horário de login (mais recente primeiro)
    activeUsers.sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());
    
    setOnlineUsers(activeUsers);
  };

  const handleUserActivity = () => {
    if (user) {
      localStorage.setItem(`last_activity_${user.id}`, Date.now().toString());
    }
  };

  useEffect(() => {
    if (user) {
      updateOnlineStatus();
      
      // Atualizar status a cada 30 segundos
      const statusInterval = setInterval(updateOnlineStatus, 30000);
      
      // Detectar atividade do usuário
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, true);
      });

      // Marcar como offline ao sair
      const handleBeforeUnload = () => {
        localStorage.removeItem(`user_online_${user.id}`);
        localStorage.removeItem(`last_activity_${user.id}`);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        clearInterval(statusInterval);
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity, true);
        });
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        // Limpar status ao desmontar
        if (user) {
          localStorage.removeItem(`user_online_${user.id}`);
          localStorage.removeItem(`last_activity_${user.id}`);
        }
      };
    }
  }, [user]);

  const formatLoginTime = (loginTime: string) => {
    const time = new Date(loginTime);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    return time.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    onlineUsers,
    formatLoginTime,
    totalOnline: onlineUsers.length
  };
};
