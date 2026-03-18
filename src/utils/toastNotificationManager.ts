// Sistema centralizado para gerenciar notificações no toast e evitar duplicações
import { toast } from 'sonner';

interface ToastNotificationData {
  id: number;
  timestamp: number;
  shown: boolean;
}

class ToastNotificationManager {
  private static instance: ToastNotificationManager;
  private readonly STORAGE_KEY = 'shown_toast_notifications';
  private readonly TTL_HOURS = 1; // Notificações "lembradas" por 1 hora (reduzir para evitar acúmulo)

  public static getInstance(): ToastNotificationManager {
    if (!ToastNotificationManager.instance) {
      ToastNotificationManager.instance = new ToastNotificationManager();
    }
    return ToastNotificationManager.instance;
  }

  private getShownNotifications(): Map<number, ToastNotificationData> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return new Map();

      const data = JSON.parse(stored);
      const map = new Map<number, ToastNotificationData>();
      
      // Filtrar notificações expiradas
      const now = Date.now();
      const ttlMs = this.TTL_HOURS * 60 * 60 * 1000;

      Object.entries(data).forEach(([id, value]) => {
        const notificationData = value as ToastNotificationData;
        if (now - notificationData.timestamp < ttlMs) {
          map.set(Number(id), notificationData);
        }
      });

      return map;
    } catch (error) {
      console.warn('Erro ao carregar notificações mostradas:', error);
      return new Map();
    }
  }

  private saveShownNotifications(map: Map<number, ToastNotificationData>): void {
    try {
      const obj: Record<string, ToastNotificationData> = {};
      map.forEach((value, key) => {
        obj[key.toString()] = value;
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.warn('Erro ao salvar notificações mostradas:', error);
    }
  }

  /**
   * Verifica se uma notificação já foi mostrada no toast
   */
  public hasBeenShown(notificationId: number): boolean {
    const shownNotifications = this.getShownNotifications();
    return shownNotifications.has(notificationId);
  }

  /**
   * Marca uma notificação como mostrada no toast
   */
  public markAsShown(notificationId: number): void {
    const shownNotifications = this.getShownNotifications();
    shownNotifications.set(notificationId, {
      id: notificationId,
      timestamp: Date.now(),
      shown: true
    });
    this.saveShownNotifications(shownNotifications);
  }

  /**
   * Remove uma notificação da lista de mostradas (para quando é marcada como lida)
   */
  public removeFromShown(notificationId: number): void {
    const shownNotifications = this.getShownNotifications();
    if (shownNotifications.has(notificationId)) {
      shownNotifications.delete(notificationId);
      this.saveShownNotifications(shownNotifications);
    }
  }

  /**
   * Mostra uma notificação no toast apenas se ainda não foi mostrada
   */
  public showToastOnce(
    notificationId: number,
    type: 'success' | 'info' | 'warning' | 'error',
    title: string,
    description?: string,
    onMarkAsRead?: () => void,
    duration = 8000
  ): boolean {
    if (this.hasBeenShown(notificationId)) {
      console.log(`🔔 Notificação ${notificationId} já foi mostrada no toast, pulando...`);
      return false;
    }

    const toastConfig = {
      description,
      duration,
      ...(onMarkAsRead && {
        action: {
          label: 'Marcar como lida',
          onClick: () => {
            onMarkAsRead();
            this.removeFromShown(notificationId);
          }
        }
      })
    };

    switch (type) {
      case 'success':
        toast.success(title, toastConfig);
        break;
      case 'info':
        toast.info(title, toastConfig);
        break;
      case 'warning':
        toast.warning(title, toastConfig);
        break;
      case 'error':
        toast.error(title, toastConfig);
        break;
    }

    this.markAsShown(notificationId);
    console.log(`🔔 Notificação ${notificationId} mostrada no toast pela primeira vez`);
    return true;
  }

  /**
   * Limpa notificações expiradas do storage
   */
  public cleanup(): void {
    const shownNotifications = this.getShownNotifications();
    this.saveShownNotifications(shownNotifications); // Isso já remove as expiradas
    console.log('🔔 Limpeza de notificações expiradas concluída');
  }
}

export const toastNotificationManager = ToastNotificationManager.getInstance();