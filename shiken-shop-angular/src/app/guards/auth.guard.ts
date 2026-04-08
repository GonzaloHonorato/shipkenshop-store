import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guard principal de autenticación
 * Verifica que el usuario esté autenticado para acceder a rutas protegidas
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    console.log('🔐 AuthGuard: Verificando autenticación para', state.url);
    
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      console.log('❌ AuthGuard: Usuario no autenticado');
      
      this.notificationService.error(
        'Debes iniciar sesión para acceder a esta página'
      );
      
      // Guardar la URL de destino para redirigir después del login
      const returnUrl = state.url;
      
      // Redirigir a login con returnUrl
      return this.router.createUrlTree(['/login'], { 
        queryParams: { returnUrl } 
      });
    }
    
    console.log('✅ AuthGuard: Usuario autenticado');
    return true;
  }
}