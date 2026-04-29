import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const mockRoute = {} as ActivatedRouteSnapshot;

  function buildState(url: string): RouterStateSnapshot {
    return { url } as RouterStateSnapshot;
  }

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', [
      'createUrlTree',
      'navigate',
      'serializeUrl'
    ]);
    const notifSpy = jasmine.createSpyObj('NotificationService', [
      'error', 'success', 'info', 'warning'
    ]);

    routerSpy.createUrlTree.and.callFake((commands: any[], extras: any) => {
      return { toString: () => commands.join('/') } as unknown as UrlTree;
    });

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notifSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  // ===================================
  // Usuario autenticado
  // ===================================

  describe('authenticated user', () => {
    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(true);
    });

    it('should return true when user is authenticated', () => {
      const result = guard.canActivate(mockRoute, buildState('/dashboard'));
      expect(result).toBeTrue();
    });

    it('should NOT call createUrlTree when authenticated', () => {
      guard.canActivate(mockRoute, buildState('/dashboard'));
      expect(router.createUrlTree).not.toHaveBeenCalled();
    });

    it('should NOT show error notification when authenticated', () => {
      guard.canActivate(mockRoute, buildState('/dashboard'));
      expect(notificationService.error).not.toHaveBeenCalled();
    });
  });

  // ===================================
  // Usuario no autenticado
  // ===================================

  describe('unauthenticated user', () => {
    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(false);
    });

    it('should NOT return true when user is not authenticated', () => {
      const result = guard.canActivate(mockRoute, buildState('/protected'));
      expect(result).not.toBeTrue();
    });

    it('should redirect to /login when not authenticated', () => {
      guard.canActivate(mockRoute, buildState('/protected'));
      expect(router.createUrlTree).toHaveBeenCalledWith(
        ['/login'],
        jasmine.objectContaining({ queryParams: { returnUrl: '/protected' } })
      );
    });

    it('should pass the returnUrl as query parameter', () => {
      guard.canActivate(mockRoute, buildState('/buyer/profile'));
      expect(router.createUrlTree).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/buyer/profile' } }
      );
    });

    it('should show an error notification', () => {
      guard.canActivate(mockRoute, buildState('/protected'));
      expect(notificationService.error).toHaveBeenCalledWith(
        jasmine.any(String)
      );
    });

    it('should return a UrlTree (not boolean)', () => {
      const result = guard.canActivate(mockRoute, buildState('/protected'));
      expect(typeof result).not.toBe('boolean');
    });
  });

  // ===================================
  // Diferentes rutas
  // ===================================

  describe('different protected routes', () => {
    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(false);
    });

    it('should preserve /admin returnUrl', () => {
      guard.canActivate(mockRoute, buildState('/admin/dashboard'));
      expect(router.createUrlTree).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/admin/dashboard' } }
      );
    });

    it('should preserve /cart returnUrl', () => {
      guard.canActivate(mockRoute, buildState('/cart'));
      expect(router.createUrlTree).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/cart' } }
      );
    });
  });
});
