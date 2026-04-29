import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { User, UserRole } from '../models';

const adminUser: User = { name: 'Admin', email: 'admin@test.com', password: '', role: UserRole.ADMIN, active: true, registeredAt: '2024-01-01' };
const buyerUser: User = { name: 'Buyer', email: 'buyer@test.com', password: '', role: UserRole.BUYER, active: true, registeredAt: '2024-01-01' };

function mockRoute(roles?: UserRole[]): ActivatedRouteSnapshot {
  return { data: roles ? { roles } : {} } as unknown as ActivatedRouteSnapshot;
}
const mockState = (url: string) => ({ url } as RouterStateSnapshot);

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let router: jasmine.SpyObj<Router>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let isAuthenticatedFn: jasmine.Spy;
  let currentUserFn: jasmine.Spy;

  beforeEach(() => {
    isAuthenticatedFn = jasmine.createSpy('isAuthenticated').and.returnValue(true);
    currentUserFn = jasmine.createSpy('currentUser').and.returnValue(adminUser);

    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'currentUser']);
    authSpy.isAuthenticated = isAuthenticatedFn;
    authSpy.currentUser = currentUserFn;

    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    routerSpy.createUrlTree.and.callFake((commands: any[]) => ({ urlTree: commands[0] } as any));

    const notifSpy = jasmine.createSpyObj('NotificationService', ['info', 'error', 'success', 'warning']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notifSpy }
      ]
    });

    guard = TestBed.inject(RoleGuard);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect unauthenticated user to login', () => {
    isAuthenticatedFn.and.returnValue(false);
    guard.canActivate(mockRoute([UserRole.ADMIN]), mockState('/admin'));
    expect(router.createUrlTree).toHaveBeenCalledWith(
      ['/login'],
      jasmine.objectContaining({ queryParams: { returnUrl: '/admin' } })
    );
  });

  it('should allow access when no roles are required', () => {
    guard.canActivate(mockRoute([]), mockState('/some-page'));
    expect(guard.canActivate(mockRoute([]), mockState('/some-page'))).toBeTrue();
  });

  it('should allow access when user has required role', () => {
    currentUserFn.and.returnValue(adminUser);
    const result = guard.canActivate(mockRoute([UserRole.ADMIN]), mockState('/admin'));
    expect(result).toBeTrue();
  });

  it('should redirect admin to /admin/dashboard when lacking required role', () => {
    currentUserFn.and.returnValue(adminUser);
    guard.canActivate(mockRoute([UserRole.BUYER]), mockState('/buyer'));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should redirect buyer to /buyer/dashboard when lacking required role', () => {
    currentUserFn.and.returnValue(buyerUser);
    guard.canActivate(mockRoute([UserRole.ADMIN]), mockState('/admin'));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/buyer/dashboard']);
  });

  it('should redirect to / when user has no known role and lacks permission', () => {
    const unknownUser = { ...buyerUser, role: 'unknown' as UserRole };
    currentUserFn.and.returnValue(unknownUser);
    guard.canActivate(mockRoute([UserRole.ADMIN]), mockState('/admin'));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
  });

  it('should show error notification when user lacks permissions', () => {
    currentUserFn.and.returnValue(buyerUser);
    guard.canActivate(mockRoute([UserRole.ADMIN]), mockState('/admin'));
    expect(notificationService.error).toHaveBeenCalled();
  });

  it('should allow access when route has no data and no roles configured', () => {
    const routeNoData = { data: {} } as unknown as ActivatedRouteSnapshot;
    const result = guard.canActivate(routeNoData, mockState('/page'));
    expect(result).toBeTrue();
  });
});
