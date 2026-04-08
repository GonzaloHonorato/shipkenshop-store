import { Injectable, inject } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// ===================================
// CUSTOM PRELOADING STRATEGY
// Estrategia personalizada de precarga basada en el rol del usuario
// ===================================

@Injectable({
  providedIn: 'root'
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  private authService = inject(AuthService);

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Verificar si la ruta debe ser precargada
    if (!this.shouldPreload(route)) {
      return of(null);
    }

    // Obtener el delay de precarga de los datos de la ruta
    const preloadDelay = route.data?.['preloadDelay'] || 0;

    // Si hay delay, esperar antes de precargar
    if (preloadDelay > 0) {
      return timer(preloadDelay).pipe(
        mergeMap(() => this.loadRoute(route, load)),
        catchError(error => {
          console.error(`Error preloading route ${route.path}:`, error);
          return of(null);
        })
      );
    }

    return this.loadRoute(route, load);
  }

  private shouldPreload(route: Route): boolean {
    // No precargar si no hay datos de configuración
    if (!route.data) {
      return false;
    }

    // Verificar si la precarga está explícitamente habilitada
    if (route.data['preload'] === false) {
      return false;
    }

    // Verificar si el usuario tiene permisos para acceder a esta ruta
    const currentUser = this.authService.currentUser();
    const requiredPermissions = route.data['permissions'] as string[];

    if (requiredPermissions && requiredPermissions.length > 0 && currentUser) {
      const userPermissions = this.getUserPermissions(currentUser);
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return false;
      }
    }

    // Precargar rutas marcadas como prioritarias
    if (route.data['preload'] === true || route.data['priority'] === 'high') {
      return true;
    }

    // Precargar basado en el rol del usuario
    const userRole = currentUser?.role;
    const routeRoles = route.data['roles'] as string[];

    if (routeRoles && userRole) {
      return routeRoles.includes(userRole);
    }

    // Por defecto, no precargar
    return false;
  }

  private loadRoute(route: Route, load: () => Observable<any>): Observable<any> {
    console.log(`Preloading route: ${route.path}`);
    return load().pipe(
      catchError(error => {
        console.error(`Failed to preload route ${route.path}:`, error);
        return of(null);
      })
    );
  }

  private getUserPermissions(user: any): string[] {
    if (user.role === 'admin') {
      return [
        'admin.dashboard.view',
        'admin.products.view',
        'admin.products.manage',
        'admin.users.view',
        'admin.users.manage',
        'admin.sales.view',
        'admin.sales.reports',
        'admin.settings.manage'
      ];
    }

    if (user.role === 'buyer') {
      return [
        'buyer.dashboard.view',
        'buyer.purchases.view',
        'buyer.favorites.view',
        'buyer.profile.edit',
        'buyer.orders.create'
      ];
    }

    return [];
  }
}

// ===================================
// SELECTIVE PRELOADING STRATEGY
// Estrategia de precarga selectiva basada en condiciones específicas
// ===================================

@Injectable({
  providedIn: 'root'
})
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  private preloadedRoutes: string[] = [];

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Lista de rutas que siempre deben ser precargadas
    const alwaysPreload = [
      'home',
      'categories/accion',
      'categories/rpg',
      'cart'
    ];

    // Lista de rutas que nunca deben ser precargadas
    const neverPreload = [
      'admin/configuracion',
      'buyer/favoritos'
    ];

    const routePath = route.path || '';

    // Verificar si nunca debe ser precargada
    if (neverPreload.some(path => routePath.includes(path))) {
      return of(null);
    }

    // Verificar si siempre debe ser precargada
    if (alwaysPreload.some(path => routePath.includes(path))) {
      return this.loadWithLogging(route, load);
    }

    // Verificar condiciones especiales de la ruta
    if (route.data?.['preloadCondition']) {
      const condition = route.data['preloadCondition'] as () => boolean;
      if (condition && condition()) {
        return this.loadWithLogging(route, load);
      }
    }

    return of(null);
  }

  private loadWithLogging(route: Route, load: () => Observable<any>): Observable<any> {
    const routePath = route.path || 'unknown';
    
    if (this.preloadedRoutes.includes(routePath)) {
      return of(null); // Ya fue precargada
    }

    this.preloadedRoutes.push(routePath);
    console.log(`Selectively preloading: ${routePath}`);

    return load().pipe(
      catchError(error => {
        console.error(`Error preloading ${routePath}:`, error);
        // Remover de la lista si falló
        this.preloadedRoutes = this.preloadedRoutes.filter(p => p !== routePath);
        return of(null);
      })
    );
  }

  getPreloadedRoutes(): string[] {
    return [...this.preloadedRoutes];
  }
}

// ===================================
// NETWORK-AWARE PRELOADING STRATEGY
// Estrategia que considera la conexión de red del usuario
// ===================================

@Injectable({
  providedIn: 'root'
})
export class NetworkAwarePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Verificar si la API de Network Information está disponible
    const connection = (navigator as any).connection;
    
    if (connection) {
      // No precargar en conexiones lentas
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        console.log(`Skipping preload of ${route.path} due to slow connection`);
        return of(null);
      }

      // Precargar solo rutas esenciales en conexiones 3G
      if (connection.effectiveType === '3g') {
        const essentialRoutes = ['home', 'cart', 'dashboard'];
        const routePath = route.path || '';
        
        if (!essentialRoutes.some(path => routePath.includes(path))) {
          return of(null);
        }
      }
    }

    // En conexiones rápidas o si no hay información de red, precargar normalmente
    if (route.data?.['preload'] !== false) {
      console.log(`Network-aware preloading: ${route.path}`);
      return load().pipe(
        catchError(error => {
          console.error(`Network-aware preload failed for ${route.path}:`, error);
          return of(null);
        })
      );
    }

    return of(null);
  }
}