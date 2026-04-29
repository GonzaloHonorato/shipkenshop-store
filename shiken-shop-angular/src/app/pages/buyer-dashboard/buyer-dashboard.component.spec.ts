import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { BuyerDashboardComponent } from './buyer-dashboard.component';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';
import { User, UserRole, Order, OrderStatus } from '../../models';

const buyerUser: User = { name: 'Buyer', email: 'buyer@test.com', password: '', role: UserRole.BUYER, active: true, registeredAt: '2024-01-01' };

const mockOrder = {
  orderNumber: 'ORD-001',
  items: [],
  user: { email: 'buyer@test.com', name: 'Buyer' },
  status: OrderStatus.DELIVERED,
  total: 29990,
  date: '2024-01-01',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
} as unknown as Order;

describe('BuyerDashboardComponent', () => {
  let component: BuyerDashboardComponent;
  let fixture: ComponentFixture<BuyerDashboardComponent>;
  let router: Router;
  let currentUserSignal: ReturnType<typeof signal<User | null>>;
  let isBuyerFn: jasmine.Spy;
  let ordersSignal: ReturnType<typeof signal<Order[]>>;
  let cartSignal: ReturnType<typeof signal<any[]>>;
  let featuredSignal: ReturnType<typeof signal<any[]>>;

  beforeEach(async () => {
    ordersSignal = signal([mockOrder]);
    cartSignal = signal([{ quantity: 2 }]);
    featuredSignal = signal([]);
    currentUserSignal = signal<User | null>(buyerUser);
    isBuyerFn = jasmine.createSpy('isBuyer').and.returnValue(true);

    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    authSpy.currentUser = currentUserSignal;
    authSpy.isBuyer = isBuyerFn;

    const dataServiceSpy = jasmine.createSpyObj('DataService', ['loadProductsFromApi']);
    Object.defineProperty(dataServiceSpy, 'orders', { get: () => ordersSignal });
    Object.defineProperty(dataServiceSpy, 'cart', { get: () => cartSignal });
    Object.defineProperty(dataServiceSpy, 'featuredProducts', { get: () => featuredSignal });

    const notifSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [BuyerDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: NotificationService, useValue: notifSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BuyerDashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('userName computed', () => {
    it('should return user name', () => {
      expect(component.userName()).toBe('Buyer');
    });

    it('should fallback to Usuario when no user', () => {
      currentUserSignal.set(null);
      expect(component.userName()).toBe('Usuario');
    });
  });

  describe('cartCount computed', () => {
    it('should sum up cart item quantities', () => {
      cartSignal.set([{ quantity: 2 }, { quantity: 3 }]);
      expect(component.cartCount()).toBe(5);
    });

    it('should return 0 for empty cart', () => {
      cartSignal.set([]);
      expect(component.cartCount()).toBe(0);
    });
  });

  describe('recentOrders computed', () => {
    it('should return orders for current user', () => {
      expect(component.recentOrders().length).toBe(1);
    });

    it('should return empty when no user', () => {
      currentUserSignal.set(null);
      expect(component.recentOrders().length).toBe(0);
    });

    it('should limit to 3 most recent orders', () => {
      const manyOrders = Array.from({ length: 5 }, (_, i) => ({
        ...mockOrder as any,
        orderNumber: `ORD-00${i}`,
        createdAt: `2024-01-0${i + 1}`
      })) as unknown as Order[];
      ordersSignal.set(manyOrders);
      expect(component.recentOrders().length).toBe(3);
    });
  });

  describe('getOrderStatusText()', () => {
    it('should return correct status text for known statuses', () => {
      expect(component.getOrderStatusText('pending')).toBe('Pendiente');
      expect(component.getOrderStatusText('confirmed')).toBe('Confirmado');
      expect(component.getOrderStatusText('delivered')).toBe('Completado');
      expect(component.getOrderStatusText('cancelled')).toBe('Cancelado');
    });

    it('should return Desconocido for unknown status', () => {
      expect(component.getOrderStatusText('unknown')).toBe('Desconocido');
    });
  });

  describe('getOrderStatusClass()', () => {
    it('should return CSS class for pending status', () => {
      expect(component.getOrderStatusClass('pending')).toContain('yellow');
    });

    it('should return CSS class for delivered status', () => {
      expect(component.getOrderStatusClass('delivered')).toContain('green');
    });

    it('should return default CSS class for unknown status', () => {
      expect(component.getOrderStatusClass('unknown')).toContain('gray');
    });
  });

  describe('formatCurrency()', () => {
    it('should format amount as currency string', () => {
      expect(typeof component.formatCurrency(29990)).toBe('string');
    });
  });

  describe('formatDate()', () => {
    it('should format date string', () => {
      expect(typeof component.formatDate('2024-01-15')).toBe('string');
    });
  });

  describe('navigation methods', () => {
    it('navigateToCard should navigate to given route', () => {
      component.navigateToCard('/buyer/mis-compras');
      expect(router.navigate).toHaveBeenCalledWith(['/buyer/mis-compras']);
    });

    it('navigateToCategory should navigate to given route', () => {
      component.navigateToCategory('/categories/accion');
      expect(router.navigate).toHaveBeenCalledWith(['/categories/accion']);
    });

    it('navigateToHome should navigate to /', () => {
      component.navigateToHome();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('navigateToAccount should navigate to /mi-cuenta', () => {
      component.navigateToAccount();
      expect(router.navigate).toHaveBeenCalledWith(['/mi-cuenta']);
    });
  });

  describe('logout()', () => {
    it('should call logout when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const authSvc = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      component.logout();
      expect(authSvc.logout).toHaveBeenCalled();
    });

    it('should not logout when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const authSvc = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      component.logout();
      expect(authSvc.logout).not.toHaveBeenCalled();
    });
  });
});

describe('BuyerDashboardComponent - non-buyer redirect', () => {
  it('should navigate to / when user is not a buyer', async () => {
    const isBuyerFalse = jasmine.createSpy('isBuyer').and.returnValue(false);
    const currentUserSig = signal<User | null>(null);
    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    authSpy.currentUser = currentUserSig;
    authSpy.isBuyer = isBuyerFalse;

    const dataSpy = jasmine.createSpyObj('DataService', ['loadProductsFromApi']);
    Object.defineProperty(dataSpy, 'orders', { get: () => signal([]) });
    Object.defineProperty(dataSpy, 'cart', { get: () => signal([]) });
    Object.defineProperty(dataSpy, 'featuredProducts', { get: () => signal([]) });

    const notifSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [BuyerDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: DataService, useValue: dataSpy },
        { provide: NotificationService, useValue: notifSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const r = TestBed.inject(Router);
    const navSpy = spyOn(r, 'navigate').and.returnValue(Promise.resolve(true));
    const f = TestBed.createComponent(BuyerDashboardComponent);
    f.detectChanges();
    expect(navSpy).toHaveBeenCalledWith(['/']);
  });
});
