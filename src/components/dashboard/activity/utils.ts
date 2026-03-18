
import { ActivityItem } from './types';

export const loadRecentActivity = (): ActivityItem[] => {
  const activities: ActivityItem[] = [];
  
  // Carregar usuários cadastrados recentemente
  const users = JSON.parse(localStorage.getItem('system_users') || '[]');
  users.forEach((user: any) => {
    if (user.created_at) {
      const userCreationTime = new Date(user.created_at);
      const hoursSinceCreation = (Date.now() - userCreationTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCreation <= 24) { // Últimas 24 horas
        activities.push({
          id: parseInt(user.id) * 1000,
          type: 'new_user',
          user: user.name || user.full_name || user.username || 'Usuário',
          time: formatTimeAgo(userCreationTime),
          timestamp: userCreationTime.getTime()
        });
      }
    }
  });

  // Carregar recargas recentes do caixa central
  const transactions = JSON.parse(localStorage.getItem('central_cash_transactions') || '[]');
  transactions.slice(0, 10).forEach((transaction: any) => {
    const transactionTime = new Date(transaction.date);
    const hoursSinceTransaction = (Date.now() - transactionTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceTransaction <= 24) {
      const user = users.find((u: any) => u.id === transaction.user_id);
      const userName = user ? (user.name || user.full_name || user.username || 'Usuário') : 'Usuário';
      
      if (transaction.type === 'recarga') {
        activities.push({
          id: parseInt(transaction.id.replace('cash_', '')),
          type: 'recharge',
          user: userName,
          time: formatTimeAgo(transactionTime),
          timestamp: transactionTime.getTime(),
          amount: transaction.amount
        });
      }
    }
  });

  // Carregar consultas recentes
  users.forEach((user: any) => {
    const userHistory = JSON.parse(localStorage.getItem(`consultation_history_${user.id}`) || '[]');
    userHistory.slice(0, 5).forEach((consultation: any) => {
      const consultationTime = new Date(consultation.timestamp || consultation.date);
      const hoursSinceConsultation = (Date.now() - consultationTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceConsultation <= 24) {
        activities.push({
          id: Date.now() + Math.random(),
          type: 'consultation',
          user: user.name || user.full_name || user.username || 'Usuário',
          time: formatTimeAgo(consultationTime),
          timestamp: consultationTime.getTime()
        });
      }
    });
  });

  // Verificar usuários online (logados nas últimas 2 horas)
  users.forEach((user: any) => {
    const lastLogin = localStorage.getItem(`last_login_${user.id}`);
    if (lastLogin) {
      const loginTime = new Date(lastLogin);
      const hoursSinceLogin = (Date.now() - loginTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLogin <= 2) {
        activities.push({
          id: parseInt(user.id) * 2000,
          type: 'user_online',
          user: user.name || user.full_name || user.username || 'Usuário',
          time: 'Online agora',
          timestamp: Date.now()
        });
      }
    }
  });

  // Ordenar por mais recente e limitar a 20 itens
  activities.sort((a, b) => {
    if (a.time === 'Online agora') return -1;
    if (b.time === 'Online agora') return 1;
    return b.timestamp - a.timestamp;
  });

  return activities.slice(0, 20);
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Agora mesmo';
  if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h atrás`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d atrás`;
};
