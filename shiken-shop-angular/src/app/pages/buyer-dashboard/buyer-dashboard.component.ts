import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';
import { User, Product, Order } from '../../models';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  bgColor: string;
  count?: number;
}

interface CategoryQuick {
  name: string;
  emoji: string;
  route: string;
  gradient: string;
}

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buyer-dashboard.component.html',
  styleUrls: ['./buyer-dashboard.component.scss']
})
export class BuyerDashboardComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private notificationService = inject(NotificationService);

  // Signals for reactive data
  currentUser = this.authService.currentUser;
  orders = this.dataService.orders;
  cart = this.dataService.cart;
  featuredProducts = this.dataService.featuredProducts;

  // Computed properties
  userName = computed(() => {
    const user = this.currentUser();
    return user?.name || user?.fullName || user?.username || 'Usuario';
  });

  cartCount = computed(() => {
    return this.cart().reduce((sum: number, item: any) => sum + item.quantity, 0);
  });

  recentOrders = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    
    return this.orders()
      .filter(order => order.user?.email === user.email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  });

  // Dashboard cards configuration
  readonly dashboardCards = computed<DashboardCard[]>(() => [
    {
      title: 'Mis Compras',
      description: 'Revisa todas tus compras y descargas',
      icon: 'fas fa-shopping-bag',
      route: '/buyer/mis-compras',
      color: 'text-purple-400',
      bgColor: 'bg-purple-600',
      count: this.recentOrders().length
    },
    {
      title: 'Mi Carrito',
      description: 'Finaliza tu compra',
      icon: 'fas fa-shopping-cart',
      route: '/carrito',
      color: 'text-pink-400',
      bgColor: 'bg-pink-600',
      count: this.cartCount()
    },
    {
      title: 'Mi Cuenta',
      description: 'Administra tu perfil y seguridad',
      icon: 'fas fa-user',
      route: '/mi-cuenta',
      color: 'text-blue-400',
      bgColor: 'bg-blue-600'
    }
  ]);

  // Category quick access
  readonly categoryQuickAccess: CategoryQuick[] = [
    {
      name: 'Acción',
      emoji: '🔥',
      route: '/categories/accion',
      gradient: 'from-red-600 to-red-800'
    },
    {
      name: 'RPG',
      emoji: '🐉',
      route: '/categories/rpg',
      gradient: 'from-purple-600 to-purple-800'
    },
    {
      name: 'Estrategia',
      emoji: '🧠',
      route: '/categories/estrategia',
      gradient: 'from-blue-600 to-blue-800'
    },
    {
      name: 'Aventura',
      emoji: '🌍',
      route: '/categories/aventura',
      gradient: 'from-green-600 to-green-800'
    }
  ];

  constructor() {
    // Auth guard - only buyer can access
    if (!this.authService.isBuyer()) {
      this.router.navigate(['/']);
    }
  }

  // Navigation methods
  navigateToCard(route: string): void {
    this.router.navigate([route]);
  }

  navigateToCategory(route: string): void {
    this.router.navigate([route]);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToAccount(): void {
    this.router.navigate(['/mi-cuenta']);
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getOrderStatusText(status: string): string {
    const statusTexts: Record<string, string> = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Completado',
      'cancelled': 'Cancelado'
    };
    return statusTexts[status] || 'Desconocido';
  }

  getOrderStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'pending': 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
      'confirmed': 'bg-blue-500/20 text-blue-200 border-blue-500/30',
      'processing': 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
      'shipped': 'bg-purple-500/20 text-purple-200 border-purple-500/30',
      'delivered': 'bg-green-500/20 text-green-200 border-green-500/30',
      'cancelled': 'bg-red-500/20 text-red-200 border-red-500/30'
    };
    return statusClasses[status] || 'bg-gray-500/20 text-gray-200 border-gray-500/30';
  }

  // Logout
  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}