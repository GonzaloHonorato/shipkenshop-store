import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';
import { User, Product, Order } from '../../models';

// ===================================
// ADMIN DASHBOARD COMPONENT
// ===================================

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  activeUsers: number;
  recentOrders: Order[];
}

interface ManagementCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // ===================================
  // REACTIVE STATE
  // ===================================
  
  // State signals
  readonly isLoading = signal(true);
  readonly stats = signal<DashboardStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    activeUsers: 0,
    recentOrders: []
  });

  // Computed properties
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly userName = computed(() => {
    const user = this.currentUser();
    return user?.name || 'Administrador';
  });

  // Management cards configuration
  readonly managementCards: ManagementCard[] = [
    {
      title: 'Productos',
      description: 'Agregar, editar y eliminar productos del catálogo',
      icon: 'fas fa-box',
      route: '/admin/productos',
      color: 'text-blue-400',
      bgColor: 'bg-blue-600'
    },
    {
      title: 'Ventas',
      description: 'Historial de ventas, estadísticas y reportes',
      icon: 'fas fa-chart-bar',
      route: '/admin/ventas',
      color: 'text-green-400',
      bgColor: 'bg-green-600'
    },
    {
      title: 'Usuarios',
      description: 'Ver y administrar cuentas de usuarios',
      icon: 'fas fa-users',
      route: '/admin/usuarios',
      color: 'text-purple-400',
      bgColor: 'bg-purple-600'
    }
  ];

  // ===================================
  // LIFECYCLE
  // ===================================

  ngOnInit(): void {
    console.log('👑 Admin Dashboard - Inicializando...');
    
    // Verify admin access
    if (!this.authService.isAdmin()) {
      this.notificationService.error('Acceso denegado: Se requieren permisos de administrador');
      this.router.navigate(['/']);
      return;
    }

    // Ensure data is loaded from API
    this.dataService.loadProductsFromApi();
    this.loadDashboardData();
  }

  // ===================================
  // DATA LOADING
  // ===================================

  private loadDashboardData(): void {
    this.isLoading.set(true);
    
    try {
      const products = this.dataService.products();
      const users = this.dataService.users();
      const orders = this.dataService.orders();

      console.log('📦 Productos cargados:', products.length, products);
      console.log('👥 Usuarios cargados:', users.length, users);
      console.log('🛒 Órdenes cargadas:', orders.length, orders);

      // Calculate statistics
      const activeProducts = products.filter(p => p.active).length;
      const totalUsers = users.length;
      const buyerUsers = users.filter(u => u.role === 'buyer').length;
      const adminUsers = users.filter(u => u.role === 'admin').length;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
        .slice(0, 5);

      // Update stats
      const statsData = {
        totalProducts: products.length,
        totalUsers,
        totalOrders,
        totalRevenue,
        activeProducts,
        activeUsers: buyerUsers, // Changed to show buyer users specifically
        recentOrders,
        // Additional helpful stats
        adminUsers,
        buyerUsers
      };

      this.stats.set(statsData);

      console.log('📊 Estadísticas calculadas:', {
        productos: `${products.length} total, ${activeProducts} activos`,
        usuarios: `${totalUsers} total, ${buyerUsers} compradores, ${adminUsers} admins`,
        ordenes: `${totalOrders} total`,
        ingresos: `$${totalRevenue}`,
        ordenesRecientes: recentOrders.length
      });
      
    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
      this.notificationService.error('Error al cargar las estadísticas del dashboard');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ===================================
  // UTILITY METHODS
  // ===================================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-CL').format(num);
  }

  getStatCardClasses(index: number): string {
    const colors = [
      'from-blue-600 to-blue-800',
      'from-purple-600 to-purple-800', 
      'from-green-600 to-green-800',
      'from-yellow-600 to-yellow-800'
    ];
    return `bg-gradient-to-br ${colors[index % colors.length]}`;
  }

  // ===================================
  // NAVIGATION
  // ===================================

  navigateToSection(route: string): void {
    if (route.startsWith('/admin/')) {
      // Check which route is available
      if (route === '/admin/productos' || route === '/admin/usuarios' || route === '/admin/ventas') {
        this.router.navigate([route]);
      } else {
        // TODO: Uncomment when other admin routes are implemented
        this.notificationService.info(`Próximamente: ${route}`);
      }
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/mi-cuenta']);
  }

  // ===================================
  // AUTHENTICATION
  // ===================================

  onLogout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      console.log('👑 Admin cerrando sesión...');
      this.authService.logout();
    }
  }

  // ===================================
  // REFRESH DATA
  // ===================================

  refreshDashboard(): void {
    this.notificationService.info('Actualizando estadísticas...');
    this.loadDashboardData();
  }
}