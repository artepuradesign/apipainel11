import React from 'react';
import { User, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSubscription } from '@/hooks/useUserSubscription';

const UserInfo = () => {
  const { user, profile } = useAuth();
  const { subscription, planInfo, isLoading } = useUserSubscription();

  if (!user || !profile) {
    return null;
  }

  // Obter plano atual (subscription > planInfo > fallback)
  const currentPlan = subscription?.plan_name || planInfo?.name || user.tipoplano || 'Pré-Pago';
  
  // Só mostrar o plano se não estiver carregando e não for Pré-Pago
  const shouldShowPlan = !isLoading && currentPlan && currentPlan !== 'Pré-Pago';

  return (
    <>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 44 44" 
        fill="currentColor" 
        className="text-gray-600 dark:text-gray-300 w-5 h-5"
      >
        <path fillRule="evenodd" clipRule="evenodd" d="M34.0007 5.99922C30.261 2.25953 25.2886 0.199951 20 0.199951C14.711 0.199951 9.73891 2.25953 5.99922 5.99922C2.25953 9.73891 0.199951 14.711 0.199951 20C0.199951 25.2886 2.25953 30.261 5.99922 34.0007C9.73891 37.7404 14.711 39.8 20 39.8C25.2886 39.8 30.261 37.7404 34.0007 34.0007C37.7404 30.261 39.8 25.2886 39.8 20C39.8 14.711 37.7404 9.73891 34.0007 5.99922ZM10.1262 34.4158C10.9544 29.6477 15.0862 26.1307 20 26.1307C24.914 26.1307 29.0455 29.6477 29.8737 34.4158C27.0624 36.3473 23.6611 37.4796 20 37.4796C16.3388 37.4796 12.9375 36.3473 10.1262 34.4158ZM13.7043 17.5147C13.7043 14.043 16.5285 11.219 20 11.219C23.4714 11.219 26.2956 14.0433 26.2956 17.5147C26.2956 20.9861 23.4714 23.8103 20 23.8103C16.5285 23.8103 13.7043 20.9861 13.7043 17.5147ZM31.8834 32.8064C31.2589 30.5867 30.0187 28.5727 28.2803 26.9996C27.2138 26.0343 25.9998 25.2726 24.6947 24.7357C27.0536 23.197 28.6162 20.535 28.6162 17.5147C28.6162 12.7638 24.7509 8.89871 20 8.89871C15.2491 8.89871 11.384 12.7638 11.384 17.5147C11.384 20.535 12.9466 23.197 15.3052 24.7357C14.0004 25.2726 12.7861 26.034 11.7196 26.9993C9.98152 28.5724 8.741 30.5864 8.11651 32.8061C4.67683 29.6117 2.52026 25.0533 2.52026 20C2.52026 10.3616 10.3616 2.52026 20 2.52026C29.6383 2.52026 37.4796 10.3616 37.4796 20C37.4796 25.0536 35.3231 29.612 31.8834 32.8064Z" fill="currentColor" />
      </svg>
      <div className="flex flex-col space-y-1 text-sm">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-800 dark:text-gray-200">
            ID: {user.id}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
            {profile.full_name}
          </span>
        </div>
      </div>
    </>
  );
};

export default UserInfo;