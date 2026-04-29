import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { NotificationService } from '../../../services/notification.service';
import { User, UserRole } from '../../../models';

const adminUser: User = { name: 'Admin', email: 'admin@test.com', password: '', role: UserRole.ADMIN, active: true, registeredAt: '2024-01-01' };
const buyerUser: User = { name: 'Buyer', email: 'buyer@test.com', password: '', role: UserRole.BUYER, active: true, registeredAt: '2024-01-01' };

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let isAuthenticatedSignal: ReturnType<typeof signal<boolean>>;
  let currentUserSignal: ReturnType<typeof signal<User | null>>;
  let cartCountSignal: ReturnType<typeof signal<number>>;

  beforeEach(async () => {
    isAuthenticatedSignal = signal<boolean>(false);
    currentUserSignal = signal<User | null>(null);
    cartCountSignal = signal(0);

    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    authSpy.isAuthenticated = isAuthenticatedSignal;
    authSpy.currentUser = currentUserSignal;

    const dataServiceSpy = jasmine.createSpyObj('DataService', ['loadProductsFromApi']);
    Object.defineProperty(dataServiceSpy, 'cartCount', { get: () => cartCountSignal });

    const notifSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: NotificationService, useValue: notifSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isAuthenticated computed', () => {
    it('should return false when not authenticated', () => {
      expect(component.isAuthenticated()).toBeFalse();
    });

    it('should return true when authenticated', () => {
      isAuthenticatedSignal.set(true);
      expect(component.isAuthenticated()).toBeTrue();
    });
  });

  describe('userName computed', () => {
    it('should return name when user has name', () => {
      currentUserSignal.set(buyerUser);
      expect(component.userName()).toBe('Buyer');
    });

    it('should return email prefix when user has no name', () => {
      currentUserSignal.set({ ...buyerUser, name: '' });
      expect(component.userName()).toBe('buyer');
    });

    it('should return "Usuario" when no user', () => {
      currentUserSignal.set(null);
      expect(component.userName()).toBe('Usuario');
    });
  });

  describe('userInitial computed', () => {
    it('should return uppercase first letter of userName', () => {
      currentUserSignal.set(buyerUser);
      expect(component.userInitial()).toBe('B');
    });
  });

  describe('cartCount computed', () => {
    it('should reflect cart count signal', () => {
      cartCountSignal.set(3);
      expect(component.cartCount()).toBe(3);
    });
  });

  describe('dashboardRoute computed', () => {
    it('should return /admin/dashboard for admin user', () => {
      currentUserSignal.set(adminUser);
      expect(component.dashboardRoute()).toBe('/admin/dashboard');
    });

    it('should return /buyer/dashboard for non-admin user', () => {
      currentUserSignal.set(buyerUser);
      expect(component.dashboardRoute()).toBe('/buyer/dashboard');
    });

    it('should return /buyer/dashboard when no user', () => {
      currentUserSignal.set(null);
      expect(component.dashboardRoute()).toBe('/buyer/dashboard');
    });
  });

  describe('toggleMobileMenu()', () => {
    it('should toggle mobile menu open', () => {
      expect(component.isMobileMenuOpen()).toBeFalse();
      component.toggleMobileMenu();
      expect(component.isMobileMenuOpen()).toBeTrue();
      component.toggleMobileMenu();
      expect(component.isMobileMenuOpen()).toBeFalse();
    });
  });

  describe('closeMobileMenu()', () => {
    it('should close mobile menu', () => {
      component.toggleMobileMenu();
      component.closeMobileMenu();
      expect(component.isMobileMenuOpen()).toBeFalse();
    });
  });

  describe('handleLogout()', () => {
    it('should call logout and navigate to /home when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const authSvc = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      component.handleLogout();
      expect(authSvc.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
      expect(notificationService.success).toHaveBeenCalled();
    });

    it('should not logout when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const authSvc = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      component.handleLogout();
      expect(authSvc.logout).not.toHaveBeenCalled();
    });
  });
});
