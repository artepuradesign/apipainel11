
import { useState, useEffect } from 'react';
import { ActivityItem } from './types';

export const useActivities = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  const loadActivities = () => {
    const allActivities: ActivityItem[] = [];
    
    // Carregar usuários cadastrados
    const users = JSON.parse(localStorage.getItem('system_users') || '[]');
    users.forEach((user: any) => {
      if (user.created_at) {
        const userCreationTime = new Date(user.created_at);
        const hoursSinceCreation = (Date.now() - userCreationTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceCreation <= 24) {
          allActivities.push({
            id: parseInt(user.id) * 1000,
            type: 'new_user',
            user: user.full_name || user.name || user.login || 'Usuário',
            time: formatTimeAgo(userCreationTime),
            timestamp: userCreationTime.getTime()
          });
        }
      }
    });

    // Carregar recargas recentes
    const transactions = JSON.parse(localStorage.getItem('central_cash_transactions') || '[]');
    transactions.forEach((transaction: any) => {
      const transactionTime = new Date(transaction.date);
      const hoursSinceTransaction = (Date.now() - transactionTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceTransaction <= 24 && transaction.type === 'recarga') {
        const user = users.find((u: any) => u.id === transaction.user_id);
        const userName = user ? (user.full_name || user.name || user.login || 'Usuário') : 'Usuário';
        
        allActivities.push({
          id: parseInt(transaction.id.replace('cash_', '')),
          type: 'recharge',
          user: userName,
          time: formatTimeAgo(transactionTime),
          timestamp: transactionTime.getTime(),
          amount: transaction.amount
        });
      }
    });

    // Carregar consultas recentes
    users.forEach((user: any) => {
      const userHistory = JSON.parse(localStorage.getItem(`consultation_history_${user.id}`) || '[]');
      userHistory.slice(0, 5).forEach((consultation: any) => {
        const consultationTime = new Date(consultation.timestamp || consultation.date);
        const hoursSinceConsultation = (Date.now() - consultationTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceConsultation <= 24) {
          allActivities.push({
            id: Date.now() + Math.random(),
            type: 'consultation',
            user: user.full_name || user.name || user.login || 'Usuário',
            time: formatTimeAgo(consultationTime),
            timestamp: consultationTime.getTime()
          });
        }
      });
    });

    // Verificar usuários online
    users.forEach((user: any) => {
      const lastLogin = localStorage.getItem(`last_login_${user.id}`);
      if (lastLogin) {
        const loginTime = new Date(lastLogin);
        const hoursSinceLogin = (Date.now() - loginTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLogin <= 2) {
          allActivities.push({
            id: parseInt(user.id) * 2000,
            type: 'user_online',
            user: user.full_name || user.name || user.login || 'Usuário',
            time: 'Online agora',
            timestamp: Date.now()
          });
        }
      }
    });

    // Ordenar por timestamp (mais recente primeiro)
    allActivities.sort((a, b) => b.timestamp - a.timestamp);
    setActivities(allActivities);
  };

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const filterActivities = (type: string) => {
    if (type === 'all') return activities;
    return activities.filter(activity => activity.type === type);
  };

  return {
    activities,
    filterActivities
  };
};
