import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserRole } from '../models';

/**
 * Guard para rutas administrativas
 * Verifica que el usuario esté autenticado Y tenga rol de administrador
 */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    console.log('👨‍💼 AdminGuard: Verificando acceso admin para', state.url);
    
    // Primero verificar autenticación
    if (!this.authService.isAuthenticated()) {
      console.log('❌ AdminGuard: Usuario no autenticado');
      
      this.notificationService.error(
        'Debes iniciar sesión para acceder al panel administrativo'
      );
      
      // Guardar la URL de destino para redirigir después del login
      const returnUrl = state.url;
      
      return this.router.createUrlTree(['/login'], { 
        queryParams: { returnUrl } 
      });
    }
    
    // Verificar que tenga rol de administrador
    const currentUser = this.authService.currentUser();
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      console.log('❌ AdminGuard: Usuario sin permisos de administrador');
      
      this.notificationService.error(
        'No tienes permisos para acceder al panel administrativo'
      );
      
      // Redirigir según el rol del usuario
      if (currentUser?.role === UserRole.BUYER) {
        return this.router.createUrlTree(['/buyer/dashboard']);
      } else {
        return this.router.createUrlTree(['/']);
      }
    }
    
    console.log('✅ AdminGuard: Acceso autorizado para administrador');
    return true;
  }
}