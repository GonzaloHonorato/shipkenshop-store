import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { User, UserRole } from '../models';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const mockRoute = {} as ActivatedRouteSnapshot;

  function buildState(url: string): RouterStateSnapshot {
    return { url } as RouterStateSnapshot;
  }

  function buildUser(role: UserRole): User {
    return {
      name: role === UserRole.ADMIN ? 'Admin User' : 'Buyer User',
      email: role === UserRole.ADMIN ? 'admin@test.com' : 'buyer@test.com',
      password: '',
      role,
      active: true,
      registeredAt: '2024-01-01'
    };
  }

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'currentUser']);
    const routerSpy = jasmine.createSpyObj('Router', [
      'createUrlTree',
      'navigate',
      'serializeUrl'
    ]);
    const notifSpy = jasmine.createSpyObj('NotificationService', [
      'error', 'success', 'info', 'warning'
    ]);

    routerSpy.createUrlTree.and.callFake((commands: any[]) => {
      return { toString: () => commands.join('/') } as unknown as UrlTree;
    });

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notifSpy }
      ]
    });

    guard = TestBed.inject(AdminGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  // ===================================
  // Admin autenticado
  // ===================================

  describe('authenticated admin', () => {
    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(true);
      authService.currentUser.and.returnValue(buildUser(UserRole.ADMIN));
    });

    it('should return true for authenticated admin', () => {
      const result = guard.canActivate(mockRoute, buildState('/admin/dashboard'));
      expect(result).toBeTrue();
    });

    it('should NOT redirect admin', () => {
      guard.canActivate(mockRoute, buildState('/admin/dashboard'));
      expect(router.createUrlTree).not.toHaveBeenCalled();
    });

    it('should NOT show error notification to admin', () => {
      guard.canActivate(mockRoute, buildState('/admin/dashboard'));
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

    it('should redirect to /login when not authenticated', () => {
      guard.canActivate(mockRoute, buildState('/admin/dashboard'));
      expect(router.createUrlTree).toHaveBeenCalledWith(
        ['/login'],
        jasmine.objectContaining({ queryParams: { returnUrl: '/admin/dashboard' } })
      );
    });

    it('should show error notification', () => {
      guard.canActivate(mockRoute, buildState('/admin/dashboard'));
      expect(notificationService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('should NOT return true', () => {
      const result = guard.canActivate(mockRoute, buildState('/admin/dashboard'));
      expect(result).not.toBeTrue();
    });
  });

  // ===================================
  // Buyer intentando acceder a admin
  // ===================================

  describe('buyer trying to access admin', () => {
    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(true);
      authService.currentUser.and.returnValue(buildUser(UserRole.BUYER));
    });

    it('should redirect buyer to /buyer/dashboard', () => {
      guard.canActivate(mockRoute, buildState('/admin/products'));
      expect(router.createUrlTree).toHaveBeenCalledWith(['/buyer/dashboard']);
    });

    it('should show error notification to buyer', () => {
      guard.canActivate(mockRoute, buildState('/admin/products'));
      expect(notificationService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('should NOT return true for buyer', () => {
      const result = guard.canActivate(mockRoute, buildState('/admin/products'));
      expect(result).not.toBeTrue();
    });
  });

  // ===================================
  // Usuario con role null / sin currentUser
  // ===================================

  describe('authenticated but no valid role', () => {
    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(true);
      authService.currentUser.and.returnValue(null);
    });

    it('should redirect to / when currentUser is null', () => {
      guard.canActivate(mockRoute, buildState('/admin/dashboard'));
      expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
    });

    it('should show error notification', () => {
      guard.canActivate(mockRoute, buildState('/admin/dashboard'));
      expect(notificationService.error).toHaveBeenCalled();
    });
  });

  // ===================================
  // Diferentes rutas admin
  // ===================================

  describe('different admin routes', () => {
    it('should allow admin to /admin/products', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.currentUser.and.returnValue(buildUser(UserRole.ADMIN));
      const result = guard.canActivate(mockRoute, buildState('/admin/products'));
      expect(result).toBeTrue();
    });

    it('should allow admin to /admin/users', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.currentUser.and.returnValue(buildUser(UserRole.ADMIN));
      const result = guard.canActivate(mockRoute, buildState('/admin/users'));
      expect(result).toBeTrue();
    });

    it('should deny buyer access to /admin/sales', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.currentUser.and.returnValue(buildUser(UserRole.BUYER));
      const result = guard.canActivate(mockRoute, buildState('/admin/sales'));
      expect(result).not.toBeTrue();
    });
  });
});
