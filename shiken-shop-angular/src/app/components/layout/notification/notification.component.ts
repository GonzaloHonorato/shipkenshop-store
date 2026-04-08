import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationType } from '../../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-24 right-4 z-50 space-y-2">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div 
          class="notification-toast transform transition-all duration-300 ease-out"
          [class]="getNotificationClasses(notification.type)"
          [style.animation]="'slideInRight 0.3s ease-out'"
        >
          <div class="flex items-center gap-3">
            <!-- Icon -->
            <div class="flex-shrink-0">
              @switch (notification.type) {
                @case ('success') {
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                }
                @case ('error') {
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                }
                @case ('warning') {
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.334 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                }
                @case ('info') {
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
              }
            </div>
            
            <!-- Message -->
            <p class="text-white font-medium text-sm flex-1">{{ notification.message }}</p>
            
            <!-- Close button -->
            <button 
              (click)="notificationService.remove(notification.id)"
              class="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-toast {
      min-width: 300px;
      max-width: 400px;
      padding: 12px 16px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .notification-success {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9));
    }

    .notification-error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));
    }

    .notification-warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9));
    }

    .notification-info {
      background: linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(126, 34, 206, 0.9));
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideOutRight {
      to {
        opacity: 0;
        transform: translateX(100px);
      }
    }

    .notification-toast.removing {
      animation: slideOutRight 0.3s ease-out forwards;
    }
  `]
})
export class NotificationComponent {
  public notificationService = inject(NotificationService);

  getNotificationClasses(type: NotificationType): string {
    const baseClasses = 'notification-toast';
    const typeClasses = {
      [NotificationType.SUCCESS]: 'notification-success',
      [NotificationType.ERROR]: 'notification-error',
      [NotificationType.WARNING]: 'notification-warning',
      [NotificationType.INFO]: 'notification-info'
    };
    
    return `${baseClasses} ${typeClasses[type]}`;
  }
}