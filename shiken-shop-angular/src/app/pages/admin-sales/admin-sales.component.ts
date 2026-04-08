import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { NotificationService, NotificationType } from '../../services/notification.service';
import { Order, OrderStatus } from '../../models';

interface SalesStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

interface SalesFilters {
  search: string;
  status: OrderStatus | '';
  sortBy: string;
}

@Component({
  selector: 'app-admin-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sales.component.html',
  styleUrls: ['./admin-sales.component.scss']
})
export class AdminSalesComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private notificationService = inject(NotificationService);

  // Signals for reactive data
  orders = this.dataService.orders;
  currentUser = this.authService.currentUser;

  // Local state signals
  searchTerm = signal('');
  selectedStatus = signal<OrderStatus | ''>('');
  sortBy = signal('date-desc');
  selectedOrder = signal<Order | null>(null);
  showModal = signal(false);
  isLoading = signal(false);

  // Enum for templates
  readonly OrderStatus = OrderStatus;

  // Computed statistics
  salesStats = computed<SalesStats>(() => {
    const allOrders = this.orders();
    const totalSales = allOrders.reduce((sum, order) => sum + order.total, 0);
    
    return {
      totalSales,
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === OrderStatus.PENDING).length,
      completedOrders: allOrders.filter(o => o.status === OrderStatus.DELIVERED).length,
      cancelledOrders: allOrders.filter(o => o.status === OrderStatus.CANCELLED).length
    };
  });

  // Computed filtered and sorted orders
  filteredOrders = computed(() => {
    const orders = this.orders();
    const search = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();
    const sort = this.sortBy();

    // Filter orders
    let filtered = orders.filter(order => {
      const matchesSearch = !search || 
        order.orderNumber.toLowerCase().includes(search) ||
        (order.user?.email || '').toLowerCase().includes(search) ||
        (order.user?.name || '').toLowerCase().includes(search);
      
      const matchesStatus = !status || order.status === status;
      
      return matchesSearch && matchesStatus;
    });

    // Sort orders
    filtered.sort((a, b) => {
      switch (sort) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'total-desc':
          return b.total - a.total;
        case 'total-asc':
          return a.total - b.total;
        default:
          return 0;
      }
    });

    return filtered;
  });

  constructor() {
    // Auth guard - only admin can access
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
    }
  }

  // Filter methods
  updateSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  updateStatusFilter(status: OrderStatus | ''): void {
    this.selectedStatus.set(status);
  }

  updateSortBy(sortBy: string): void {
    this.sortBy.set(sortBy);
  }

  // Order actions
  viewOrder(order: Order): void {
    this.selectedOrder.set(order);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedOrder.set(null);
  }

  async updateOrderStatus(newStatus: OrderStatus | string): Promise<void> {
    const order = this.selectedOrder();
    if (!order) return;

    this.isLoading.set(true);

    try {
      // Convert string to OrderStatus if needed
      const statusValue = typeof newStatus === 'string' ? newStatus as OrderStatus : newStatus;
      
      // Update order status via DataService
      const success = await this.dataService.updateOrderStatus(order.orderNumber, statusValue);
      
      if (success) {
        this.notificationService.show('Estado de orden actualizado correctamente', NotificationType.SUCCESS);
        this.closeModal();
      } else {
        this.notificationService.show('Error al actualizar el estado de la orden', NotificationType.ERROR);
      }
    } catch (error) {
      this.notificationService.show('Error al actualizar el estado de la orden', NotificationType.ERROR);
    } finally {
      this.isLoading.set(false);
    }
  }

  updateOrderStatusFromSelect(selectElement: HTMLSelectElement): void {
    this.updateOrderStatus(selectElement.value as OrderStatus);
  }

  // Utility methods
  getStatusBadgeClass(status: OrderStatus): string {
    const statusClasses = {
      [OrderStatus.PENDING]: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
      [OrderStatus.CONFIRMED]: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
      [OrderStatus.PROCESSING]: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
      [OrderStatus.SHIPPED]: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
      [OrderStatus.DELIVERED]: 'bg-green-500/20 text-green-200 border-green-500/30',
      [OrderStatus.CANCELLED]: 'bg-red-500/20 text-red-200 border-red-500/30'
    };
    return statusClasses[status] || 'bg-gray-500/20 text-gray-200 border-gray-500/30';
  }

  getStatusText(status: OrderStatus): string {
    const statusTexts = {
      [OrderStatus.PENDING]: 'Pendiente',
      [OrderStatus.CONFIRMED]: 'Confirmado',
      [OrderStatus.PROCESSING]: 'Procesando',
      [OrderStatus.SHIPPED]: 'Enviado',
      [OrderStatus.DELIVERED]: 'Completado',
      [OrderStatus.CANCELLED]: 'Cancelado'
    };
    return statusTexts[status] || 'Desconocido';
  }

  getOrderItems(order: Order): { count: number; totalItems: number } {
    const count = order.items.length;
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    return { count, totalItems };
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDetailedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Navigation
  navigateToDashboard(): void {
    this.router.navigate(['/admin']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}