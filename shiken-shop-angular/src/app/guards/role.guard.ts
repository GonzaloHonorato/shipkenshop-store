import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserRole } from '../models';

/**
 * Guard flexible que permite especificar roles requeridos por ruta
 * Uso en las rutas: canActivate: [RoleGuard], data: { roles: [UserRole.ADMIN, UserRole.BUYER] }
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    console.log('🎭 RoleGuard: Verificando roles para', state.url);
    
    // Primero verificar autenticación
    if (!this.authService.isAuthenticated()) {
      console.log('❌ RoleGuard: Usuario no autenticado');
      
      this.notificationService.error(
        'Debes iniciar sesión para acceder a esta página'
      );
      
      const returnUrl = state.url;
      return this.router.createUrlTree(['/login'], { 
        queryParams: { returnUrl } 
      });
    }
    
    // Obtener roles permitidos desde la configuración de la ruta
    const allowedRoles = route.data?.['roles'] as UserRole[] || [];
    
    // Si no se especificaron roles, permitir acceso a cualquier usuario autenticado
    if (allowedRoles.length === 0) {
      console.log('✅ RoleGuard: Sin restricciones de rol, usuario autenticado');
      return true;
    }
    
    const currentUser = this.authService.currentUser();
    
    // Verificar si el usuario tiene uno de los roles permitidos
    if (!currentUser || !allowedRoles.includes(currentUser.role as UserRole)) {
      console.log('❌ RoleGuard: Usuario sin el rol necesario');
      
      this.notificationService.error(
        'No tienes permisos para acceder a esta página'
      );
      
      // Redirigir según el rol del usuario
      if (currentUser?.role === UserRole.ADMIN) {
        return this.router.createUrlTree(['/admin/dashboard']);
      } else if (currentUser?.role === UserRole.BUYER) {
        return this.router.createUrlTree(['/buyer/dashboard']);
      } else {
        return this.router.createUrlTree(['/']);
      }
    }
    
    console.log('✅ RoleGuard: Usuario tiene rol permitido:', currentUser.role);
    return true;
  }
}