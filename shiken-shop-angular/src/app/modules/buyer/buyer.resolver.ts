import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

export interface BuyerResolverData {
  user: any;
  ordersSummary: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalSpent: number;
  };
  recentOrders: any[];
  favoriteProducts: any[];
  recommendations: any[];
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BuyerResolver {
  private dataService = inject(DataService);
  private authService = inject(AuthService);

  resolve(): Observable<BuyerResolverData> {
    const currentUser = this.authService.currentUser();
    
    if (!currentUser || currentUser.role !== 'buyer') {
      return of({
        user: null,
        ordersSummary: { totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalSpent: 0 },
        recentOrders: [],
        favoriteProducts: [],
        recommendations: [],
        permissions: []
      });
    }

    return forkJoin({
      user: of(currentUser),
      ordersSummary: this.getOrdersSummary(currentUser.email),
      recentOrders: this.getRecentOrders(currentUser.email),
      favoriteProducts: this.getFavoriteProducts(currentUser.email),
      recommendations: this.getRecommendations(currentUser.email),
      permissions: this.getUserPermissions(currentUser)
    }).pipe(
      catchError(error => {
        console.error('Error in BuyerResolver:', error);
        return of({
          user: currentUser,
          ordersSummary: { totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalSpent: 0 },
          recentOrders: [],
          favoriteProducts: [],
          recommendations: [],
          permissions: ['buyer.dashboard.view']
        });
      })
    );
  }

  private getOrdersSummary(userEmail: string): Observable<any> {
    const orders = this.dataService.orders().filter(order => 
      order.user?.email === userEmail
    );

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    return of({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalSpent
    });
  }

  private getRecentOrders(userEmail: string): Observable<any[]> {
    const orders = this.dataService.orders()
      .filter(order => order.user?.email === userEmail)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return of(orders);
  }

  private getFavoriteProducts(userEmail: string): Observable<any[]> {
    // Por ahora retornamos un array vacío, se implementará en funcionalidades avanzadas
    return of([]);
  }

  private getRecommendations(userEmail: string): Observable<any[]> {
    // Obtener productos recomendados basados en compras anteriores
    const userOrders = this.dataService.orders().filter(order => 
      order.user?.email === userEmail
    );

    if (userOrders.length === 0) {
      // Si no hay compras, mostrar productos populares
      const products = this.dataService.products();
      return of(products.slice(0, 4));
    }

    // Obtener IDs de productos comprados
    const purchasedProductIds = new Set<string>();
    userOrders.forEach(order => {
      order.items.forEach(item => {
        purchasedProductIds.add(item.id);
      });
    });

    // Obtener categorías de productos comprados
    const products = this.dataService.products();
    const purchasedCategories = new Set<string>();
    
    products.forEach(product => {
      if (purchasedProductIds.has(product.id)) {
        purchasedCategories.add(product.category);
      }
    });

    // Recomendar productos de las mismas categorías que no haya comprado
    const recommendations = products
      .filter(product => 
        purchasedCategories.has(product.category) && 
        !purchasedProductIds.has(product.id)
      )
      .slice(0, 4);

    return of(recommendations);
  }

  private getUserPermissions(user: any): Observable<string[]> {
    const buyerPermissions = [
      'buyer.dashboard.view',
      'buyer.purchases.view',
      'buyer.favorites.view',
      'buyer.profile.edit',
      'buyer.orders.create'
    ];

    return of(buyerPermissions);
  }
}

// Export resolver function for Angular 17+
export const BuyerResolverFn: ResolveFn<BuyerResolverData> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<BuyerResolverData> => {
  return inject(BuyerResolver).resolve();
};