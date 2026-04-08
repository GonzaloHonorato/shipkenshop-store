import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserRole } from '../models';

/**
 * Guard para rutas de comprador
 * Verifica que el usuario esté autenticado Y tenga rol de comprador
 */
@Injectable({
  providedIn: 'root'
})
export class BuyerGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    console.log('🛒 BuyerGuard: Verificando acceso buyer para', state.url);
    
    // Primero verificar autenticación
    if (!this.authService.isAuthenticated()) {
      console.log('❌ BuyerGuard: Usuario no autenticado');
      
      this.notificationService.error(
        'Debes iniciar sesión para acceder a tu panel de comprador'
      );
      
      // Guardar la URL de destino para redirigir después del login
      const returnUrl = state.url;
      
      return this.router.createUrlTree(['/login'], { 
        queryParams: { returnUrl } 
      });
    }
    
    // Verificar que tenga rol de comprador
    const currentUser = this.authService.currentUser();
    if (!currentUser || currentUser.role !== UserRole.BUYER) {
      console.log('❌ BuyerGuard: Usuario sin permisos de comprador');
      
      this.notificationService.error(
        'No tienes permisos para acceder al panel de comprador'
      );
      
      // Redirigir según el rol del usuario
      if (currentUser?.role === UserRole.ADMIN) {
        return this.router.createUrlTree(['/admin/dashboard']);
      } else {
        return this.router.createUrlTree(['/']);
      }
    }
    
    console.log('✅ BuyerGuard: Acceso autorizado para comprador');
    return true;
  }
}