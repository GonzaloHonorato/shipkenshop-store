import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserRole } from '../models';

/**
 * Guard para páginas de invitado (login, registro)
 * Verifica que el usuario NO esté autenticado
 * Si ya está autenticado, redirige a su dashboard correspondiente
 */
@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    console.log('👤 GuestGuard: Verificando acceso de invitado para', state.url);
    
    // Verificar si el usuario ya está autenticado
    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.currentUser();
      
      console.log('❌ GuestGuard: Usuario ya autenticado, redirigiendo...');
      
      this.notificationService.info(
        `Ya tienes una sesión activa, ${currentUser?.name || 'Usuario'}`
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
    
    console.log('✅ GuestGuard: Usuario no autenticado, permitiendo acceso');
    return true;
  }
}