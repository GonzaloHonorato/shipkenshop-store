import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { NotificationService, NotificationType } from '../../services/notification.service';
import { User, UserRole } from '../../models';

interface UserStats {
  totalUsers: number;
  totalBuyers: number;
  totalAdmins: number;
}

interface UserFilters {
  search: string;
  role: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private notificationService = inject(NotificationService);

  // Signals for reactive data
  users = this.dataService.users;
  orders = this.dataService.orders;
  currentUser = this.authService.currentUser;

  // Local state signals
  searchTerm = signal('');
  selectedRole = signal('');
  selectedUser = signal<User | null>(null);
  showModal = signal(false);

  // Computed statistics
  userStats = computed<UserStats>(() => {
    const allUsers = this.users();
    return {
      totalUsers: allUsers.length,
      totalBuyers: allUsers.filter(u => u.role === 'buyer').length,
      totalAdmins: allUsers.filter(u => u.role === 'admin').length
    };
  });

  // Computed filtered users
  filteredUsers = computed(() => {
    const users = this.users();
    const search = this.searchTerm().toLowerCase();
    const role = this.selectedRole();

    return users.filter(user => {
      const userName = user.name || user.fullName || user.username || '';
      const matchesSearch = !search || 
        userName.toLowerCase().includes(search) || 
        user.email.toLowerCase().includes(search);
      
      const matchesRole = !role || user.role === role;
      
      return matchesSearch && matchesRole;
    });
  });

  // Computed user details
  selectedUserDetails = computed(() => {
    const user = this.selectedUser();
    if (!user) return null;

    const userOrders = this.orders().filter(order => order.user?.email === user.email);
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);

    return {
      user,
      ordersCount: userOrders.length,
      totalSpent,
      registerDate: user.registeredAt ? new Date(user.registeredAt) : null
    };
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

  updateRoleFilter(role: string): void {
    this.selectedRole.set(role);
  }

  // User actions
  viewUser(user: User): void {
    this.selectedUser.set(user);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedUser.set(null);
  }

  async changeUserRole(newRole: string): Promise<void> {
    const user = this.selectedUser();
    const current = this.currentUser();
    
    if (!user || !current) return;

    // Prevent user from changing their own role
    if (current.email === user.email) {
      this.notificationService.show('No puedes cambiar tu propio rol', NotificationType.ERROR);
      return;
    }

    // Validate role
    if (newRole !== 'admin' && newRole !== 'buyer') {
      this.notificationService.show('Rol inválido', NotificationType.ERROR);
      return;
    }

    try {
      const success = await this.dataService.updateUserRole(user.email, newRole as UserRole);
      if (success) {
        this.notificationService.show('Rol actualizado correctamente', NotificationType.SUCCESS);
        this.closeModal();
      } else {
        this.notificationService.show('Error al actualizar el rol', NotificationType.ERROR);
      }
    } catch (error) {
      this.notificationService.show('Error al actualizar el rol', NotificationType.ERROR);
    }
  }

  // Utility methods
  getUserInitial(user: User): string {
    const name = user.name || user.fullName || user.username || user.email;
    return name.charAt(0).toUpperCase();
  }

  getUserDisplayName(user: User): string {
    return user.name || user.fullName || user.username || 'Usuario';
  }

  formatDate(date: Date | null): string {
    if (!date) return 'N/A';
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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