// Utility para forçar refresh das notificações globalmente
export let notificationRefreshCallback: (() => void) | null = null;

export const setNotificationRefreshCallback = (callback: () => void) => {
  console.log('🔔 Setting notification refresh callback');
  notificationRefreshCallback = callback;
};

export const refreshNotifications = () => {
  console.log('🔔 Refreshing notifications manually');
  if (notificationRefreshCallback) {
    notificationRefreshCallback();
  } else {
    console.warn('🔔 No notification refresh callback set');
  }
};

// Função para limpar notificações mostradas após um tempo
export const clearShownNotifications = (setShownNotifications: React.Dispatch<React.SetStateAction<Set<number>>>) => {
  // Limpar notificações mostradas depois de 30 minutos
  setTimeout(() => {
    console.log('🔔 Clearing shown notifications cache');
    setShownNotifications(new Set());
  }, 30 * 60 * 1000); // 30 minutos
};