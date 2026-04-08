import { inject, Injectable } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

// ===================================
// SMART REDIRECTION GUARD
// Guard inteligente que redirige según el rol del usuario
// ===================================

@Injectable({
  providedIn: 'root'
})
export class SmartRedirectGuard {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.authState$.pipe(
      map(authState => {
        // Si el usuario no está autenticado, redirigir a login
        if (!authState.isAuthenticated || !authState.user) {
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url }
          });
          return false;
        }

        // Obtener la ruta de destino deseada
        const targetPath = route.data?.['targetPath'] as string;
        const userRole = authState.user.role;

        // Redirecciones inteligentes basadas en el rol
        if (targetPath) {
          // Si es un admin tratando de acceder a rutas de buyer
          if (userRole === 'admin' && targetPath.includes('buyer')) {
            this.router.navigate(['/admin/dashboard']);
            return false;
          }

          // Si es un buyer tratando de acceder a rutas de admin
          if (userRole === 'buyer' && targetPath.includes('admin')) {
            this.router.navigate(['/buyer/dashboard']);
            return false;
          }
        }

        // Si el usuario ya está autenticado y trata de acceder a login/register
        const publicAuthRoutes = ['/login', '/register', '/forgot-password'];
        if (publicAuthRoutes.includes(state.url)) {
          // Redirigir al dashboard correspondiente según el rol
          if (userRole === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (userRole === 'buyer') {
            this.router.navigate(['/buyer/dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
          return false;
        }

        return true;
      })
    );
  }
}

// ===================================
// PERMISSION GUARD
// Guard para verificar permisos específicos
// ===================================

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.authState$.pipe(
      map(authState => {
        if (!authState.isAuthenticated || !authState.user) {
          this.router.navigate(['/login']);
          return false;
        }

        const requiredPermissions = route.data?.['permissions'] as string[];
        if (!requiredPermissions || requiredPermissions.length === 0) {
          return true;
        }

        // Verificar permisos del usuario
        const userPermissions = this.getUserPermissions(authState.user);
        const hasPermission = requiredPermissions.some(permission => 
          userPermissions.includes(permission)
        );

        if (!hasPermission) {
          // Redirigir a página de acceso denegado o dashboard
          if (authState.user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (authState.user.role === 'buyer') {
            this.router.navigate(['/buyer/dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
          return false;
        }

        return true;
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
// ROUTE DATA GUARD
// Guard para verificar datos específicos de la ruta
// ===================================

@Injectable({
  providedIn: 'root'
})
export class RouteDataGuard {
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiredData = route.data?.['requiredData'] as string[];
    
    if (!requiredData) {
      return true;
    }

    // Verificar si todos los datos requeridos están presentes
    const hasAllData = requiredData.every(dataKey => {
      return route.data?.[dataKey] !== undefined;
    });

    if (!hasAllData) {
      console.error('Missing required route data:', requiredData);
      this.router.navigate(['/404']);
      return false;
    }

    return true;
  }
}

// ===================================
// FUNCTIONAL GUARDS (Angular 17+)
// Versiones funcionales de los guards para Angular 17+
// ===================================

export const SmartRedirectGuardFn: CanActivateFn = (route, state) => {
  return inject(SmartRedirectGuard).canActivate(route, state);
};

export const PermissionGuardFn: CanActivateFn = (route, state) => {
  return inject(PermissionGuard).canActivate(route, state);
};

export const RouteDataGuardFn: CanActivateFn = (route, state) => {
  return inject(RouteDataGuard).canActivate(route, state);
};