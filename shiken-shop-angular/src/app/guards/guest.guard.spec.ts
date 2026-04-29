import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GuestGuard } from './guest.guard';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { User, UserRole } from '../models';

const adminUser: User = { name: 'Admin', email: 'admin@test.com', password: '', role: UserRole.ADMIN, active: true, registeredAt: '2024-01-01' };
const buyerUser: User = { name: 'Buyer', email: 'buyer@test.com', password: '', role: UserRole.BUYER, active: true, registeredAt: '2024-01-01' };
const mockRoute = {} as ActivatedRouteSnapshot;
const mockState = (url: string) => ({ url } as RouterStateSnapshot);

describe('GuestGuard', () => {
  let guard: GuestGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let isAuthenticatedFn: jasmine.Spy;
  let currentUserFn: jasmine.Spy;

  beforeEach(() => {
    isAuthenticatedFn = jasmine.createSpy('isAuthenticated').and.returnValue(false);
    currentUserFn = jasmine.createSpy('currentUser').and.returnValue(null);

    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'currentUser']);
    authSpy.isAuthenticated = isAuthenticatedFn;
    authSpy.currentUser = currentUserFn;

    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    routerSpy.createUrlTree.and.callFake((commands: any[]) => ({ urlTree: commands[0] } as any));

    const notifSpy = jasmine.createSpyObj('NotificationService', ['info', 'error', 'success', 'warning']);

    TestBed.configureTestingModule({
      providers: [
        GuestGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notifSpy }
      ]
    });

    guard = TestBed.inject(GuestGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is not authenticated', () => {
    isAuthenticatedFn.and.returnValue(false);
    const result = guard.canActivate(mockRoute, mockState('/login'));
    expect(result).toBeTrue();
  });

  it('should redirect admin to /admin/dashboard when already authenticated', () => {
    isAuthenticatedFn.and.returnValue(true);
    currentUserFn.and.returnValue(adminUser);
    guard.canActivate(mockRoute, mockState('/login'));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should redirect buyer to /buyer/dashboard when already authenticated', () => {
    isAuthenticatedFn.and.returnValue(true);
    currentUserFn.and.returnValue(buyerUser);
    guard.canActivate(mockRoute, mockState('/login'));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/buyer/dashboard']);
  });

  it('should redirect to / when authenticated user has no known role', () => {
    const unknownUser = { ...buyerUser, role: 'unknown' as UserRole };
    isAuthenticatedFn.and.returnValue(true);
    currentUserFn.and.returnValue(unknownUser);
    guard.canActivate(mockRoute, mockState('/login'));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
  });

  it('should show info notification when already authenticated', () => {
    isAuthenticatedFn.and.returnValue(true);
    currentUserFn.and.returnValue(buyerUser);
    guard.canActivate(mockRoute, mockState('/login'));
    expect(notificationService.info).toHaveBeenCalled();
  });

  it('should use Usuario fallback when authenticated user has no name', () => {
    const noNameUser = { ...buyerUser, name: '' };
    isAuthenticatedFn.and.returnValue(true);
    currentUserFn.and.returnValue(noNameUser);
    guard.canActivate(mockRoute, mockState('/login'));
    expect(notificationService.info).toHaveBeenCalledWith('Ya tienes una sesión activa, Usuario');
  });
});
