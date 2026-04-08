import { Injectable, signal } from '@angular/core';

// ===================================
// NOTIFICATION TYPES
// ===================================
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning'
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  autoClose?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // ===================================
  // REACTIVE STATE
  // ===================================
  private notificationsSignal = signal<Notification[]>([]);
  public readonly notifications = this.notificationsSignal.asReadonly();

  // ===================================
  // NOTIFICATION METHODS
  // ===================================

  show(message: string, type: NotificationType = NotificationType.INFO, duration = 3000): void {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type,
      duration,
      autoClose: duration > 0
    };

    // Agregar notificación
    const currentNotifications = this.notificationsSignal();
    this.notificationsSignal.set([...currentNotifications, notification]);

    // Auto-close si está configurado
    if (notification.autoClose) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }

  success(message: string, duration = 3000): void {
    this.show(message, NotificationType.SUCCESS, duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, NotificationType.ERROR, duration);
  }

  info(message: string, duration = 3000): void {
    this.show(message, NotificationType.INFO, duration);
  }

  warning(message: string, duration = 4000): void {
    this.show(message, NotificationType.WARNING, duration);
  }

  remove(id: string): void {
    const currentNotifications = this.notificationsSignal();
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSignal.set(filteredNotifications);
  }

  clear(): void {
    this.notificationsSignal.set([]);
  }

  // ===================================
  // UTILITY METHODS
  // ===================================
  
  private generateId(): string {
    return 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}