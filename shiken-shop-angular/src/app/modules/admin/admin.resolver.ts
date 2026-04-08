import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

export interface AdminResolverData {
  user: any;
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  recentActivity: any[];
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminResolver {
  private dataService = inject(DataService);
  private authService = inject(AuthService);

  resolve(): Observable<AdminResolverData> {
    const currentUser = this.authService.currentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return of({
        user: null,
        stats: { totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 },
        recentActivity: [],
        permissions: []
      });
    }

    return forkJoin({
      user: of(currentUser),
      stats: this.getAdminStats(),
      recentActivity: this.getRecentActivity(),
      permissions: this.getUserPermissions(currentUser)
    }).pipe(
      catchError(error => {
        console.error('Error in AdminResolver:', error);
        return of({
          user: currentUser,
          stats: { totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 },
          recentActivity: [],
          permissions: ['admin.dashboard.view']
        });
      })
    );
  }

  private getAdminStats(): Observable<any> {
    const users = this.dataService.users();
    const products = this.dataService.products();
    const orders = this.dataService.orders();

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    return of({
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: totalRevenue
    });
  }

  private getRecentActivity(): Observable<any[]> {
    const orders = this.dataService.orders();
    const recentOrders = orders
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(order => ({
        type: 'order',
        description: `Nueva orden #${order.orderNumber} por $${order.total.toFixed(2)}`,
        date: order.date,
        user: order.user?.email || 'Usuario desconocido'
      }));

    return of(recentOrders);
  }

  private getUserPermissions(user: any): Observable<string[]> {
    const adminPermissions = [
      'admin.dashboard.view',
      'admin.products.view',
      'admin.products.manage',
      'admin.users.view',
      'admin.users.manage',
      'admin.sales.view',
      'admin.sales.reports',
      'admin.settings.manage'
    ];

    return of(adminPermissions);
  }
}

// Export resolver function for Angular 17+
export const AdminResolverFn: ResolveFn<AdminResolverData> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<AdminResolverData> => {
  return inject(AdminResolver).resolve();
};