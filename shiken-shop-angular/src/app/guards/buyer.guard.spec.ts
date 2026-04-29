import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BuyerGuard } from './buyer.guard';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { User, UserRole } from '../models';

const adminUser: User = { name: 'Admin', email: 'admin@test.com', password: '', role: UserRole.ADMIN, active: true, registeredAt: '2024-01-01' };
const buyerUser: User = { name: 'Buyer', email: 'buyer@test.com', password: '', role: UserRole.BUYER, active: true, registeredAt: '2024-01-01' };
const mockRoute = {} as ActivatedRouteSnapshot;
const mockState = (url: string) => ({ url } as RouterStateSnapshot);

describe('BuyerGuard', () => {
  let guard: BuyerGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let isAuthenticatedFn: jasmine.Spy;
  let currentUserFn: jasmine.Spy;

  beforeEach(() => {
    isAuthenticatedFn = jasmine.createSpy('isAuthenticated').and.returnValue(true);
    currentUserFn = jasmine.createSpy('currentUser').and.returnValue(buyerUser);

    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'currentUser']);
    authSpy.isAuthenticated = isAuthenticatedFn;
    authSpy.currentUser = currentUserFn;

    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    routerSpy.createUrlTree.and.callFake((commands: any[]) => ({ urlTree: commands[0] } as any));

    const notifSpy = jasmine.createSpyObj('NotificationService', ['info', 'error', 'success', 'warning']);

    TestBed.configureTestingModule({
      providers: [
        BuyerGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notifSpy }
      ]
    });

    guard = TestBed.inject(BuyerGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow buyer access', () => {
    const result = guard.canActivate(mockRoute, mockState('/buyer/dashboard'));
    expect(result).toBeTrue();
  });

  it('should redirect unauthenticated user to login', () => {
    isAuthenticatedFn.and.returnValue(false);
    guard.canActivate(mockRoute, mockState('/buyer/dashboard'));
    expect(router.createUrlTree).toHaveBeenCalledWith(
      ['/login'],
      jasmine.objectContaining({ queryParams: { returnUrl: '/buyer/dashboard' } })
    );
  });

  it('should show error when unauthenticated', () => {
    isAuthenticatedFn.and.returnValue(false);
    guard.canActivate(mockRoute, mockState('/buyer/dashboard'));
    expect(notificationService.error).toHaveBeenCalled();
  });

  it('should redirect admin to /admin/dashboard when trying to access buyer route', () => {
    currentUserFn.and.returnValue(adminUser);
    guard.canActivate(mockRoute, mockState('/buyer/dashboard'));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should redirect unknown role to / when trying to access buyer route', () => {
    currentUserFn.and.returnValue({ ...buyerUser, role: 'unknown' as UserRole });
    guard.canActivate(mockRoute, mockState('/buyer/dashboard'));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
  });

  it('should show error when user lacks buyer permissions', () => {
    currentUserFn.and.returnValue(adminUser);
    guard.canActivate(mockRoute, mockState('/buyer/dashboard'));
    expect(notificationService.error).toHaveBeenCalled();
  });
});
