import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';
import { User, UserRole, Order, OrderStatus, Product } from '../../models';

const adminUser: User = { name: 'Admin', email: 'admin@test.com', password: '', role: UserRole.ADMIN, active: true, registeredAt: '2024-01-01' };

const mockProduct = {
  id: 'p1', name: 'Game', description: '', price: 29990, originalPrice: 39990,
  discount: 25, category: 'accion', platform: ['PC'],
  image: '', rating: 4.5, reviews: 10, stock: 5, featured: true, active: true,
  releaseDate: '2024-01-01', developer: 'Dev', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-01'
} as unknown as Product;

const mockOrder = {
  orderNumber: 'ORD-001', items: [], user: {},
  status: OrderStatus.DELIVERED, total: 29990,
  date: '2024-01-01', createdAt: '2024-01-01', updatedAt: '2024-01-01'
} as unknown as Order;

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let router: Router;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let isAdminFn: jasmine.Spy;
  let currentUserSignal: ReturnType<typeof signal<User | null>>;
  let productsSignal: ReturnType<typeof signal<Product[]>>;
  let usersSignal: ReturnType<typeof signal<User[]>>;
  let ordersSignal: ReturnType<typeof signal<Order[]>>;

  beforeEach(async () => {
    productsSignal = signal([mockProduct]);
    usersSignal = signal([adminUser, { ...adminUser, role: UserRole.BUYER, email: 'buyer@test.com' }]);
    ordersSignal = signal([mockOrder]);
    isAdminFn = jasmine.createSpy('isAdmin').and.returnValue(true);
    currentUserSignal = signal<User | null>(adminUser);

    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    authSpy.isAdmin = isAdminFn;
    authSpy.currentUser = currentUserSignal;

    const dataServiceSpy = jasmine.createSpyObj('DataService', ['loadProductsFromApi']);
    Object.defineProperty(dataServiceSpy, 'products', { get: () => productsSignal });
    Object.defineProperty(dataServiceSpy, 'users', { get: () => usersSignal });
    Object.defineProperty(dataServiceSpy, 'orders', { get: () => ordersSignal });

    const notifSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: NotificationService, useValue: notifSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect non-admin on init', () => {
    isAdminFn.and.returnValue(false);
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  describe('userName computed', () => {
    it('should return user name', () => {
      expect(component.userName()).toBe('Admin');
    });

    it('should return Administrador when no user', () => {
      currentUserSignal.set(null);
      expect(component.userName()).toBe('Administrador');
    });
  });

  describe('formatCurrency()', () => {
    it('should format amount as CLP currency', () => {
      expect(component.formatCurrency(29990)).toContain('29');
    });
  });

  describe('formatNumber()', () => {
    it('should format number as string', () => {
      expect(typeof component.formatNumber(1000)).toBe('string');
    });
  });

  describe('getStatCardClasses()', () => {
    it('should return CSS classes with blue for index 0', () => {
      expect(component.getStatCardClasses(0)).toContain('blue');
    });

    it('should cycle through colors', () => {
      expect(component.getStatCardClasses(4)).toContain('blue');
    });
  });

  describe('navigateToSection()', () => {
    it('should navigate to /admin/productos', () => {
      component.navigateToSection('/admin/productos');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/productos']);
    });

    it('should navigate to /admin/usuarios', () => {
      component.navigateToSection('/admin/usuarios');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/usuarios']);
    });

    it('should navigate to /admin/ventas', () => {
      component.navigateToSection('/admin/ventas');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/ventas']);
    });

    it('should show info for unimplemented admin routes', () => {
      component.navigateToSection('/admin/other');
      expect(notificationService.info).toHaveBeenCalled();
    });

    it('should not navigate for non-admin routes', () => {
      const navCount = (router.navigate as jasmine.Spy).calls.count();
      component.navigateToSection('/other/route');
      expect((router.navigate as jasmine.Spy).calls.count()).toBe(navCount);
    });
  });

  describe('navigateToHome()', () => {
    it('should navigate to /', () => {
      component.navigateToHome();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('navigateToProfile()', () => {
    it('should navigate to /mi-cuenta', () => {
      component.navigateToProfile();
      expect(router.navigate).toHaveBeenCalledWith(['/mi-cuenta']);
    });
  });

  describe('onLogout()', () => {
    it('should call logout when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const authSvc = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      component.onLogout();
      expect(authSvc.logout).toHaveBeenCalled();
    });

    it('should not logout when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const authSvc = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      component.onLogout();
      expect(authSvc.logout).not.toHaveBeenCalled();
    });
  });

  describe('refreshDashboard()', () => {
    it('should show info notification', () => {
      component.refreshDashboard();
      expect(notificationService.info).toHaveBeenCalled();
    });
  });

  it('should load stats with order using date field instead of createdAt', () => {
    const orderWithDate = {
      ...mockOrder as any,
      createdAt: undefined,
      date: '2024-01-01',
      total: undefined
    } as unknown as Order;
    const orderWithCreatedAt = {
      ...mockOrder as any,
      orderNumber: 'ORD-002',
      createdAt: '2024-02-01',
      total: 5000
    } as unknown as Order;
    ordersSignal.set([orderWithDate, orderWithCreatedAt]);
    expect(() => component.ngOnInit()).not.toThrow();
  });
});
