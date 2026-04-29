import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { CartComponent } from './cart.component';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CartItem, User, UserRole } from '../../models';

const mockUser: User = {
  name: 'Test User',
  email: 'test@example.com',
  password: '',
  role: UserRole.BUYER,
  active: true,
  registeredAt: '2024-01-01'
};

const mockCartItem: CartItem = {
  id: 'prod-1',
  name: 'Test Game',
  price: 29990,
  originalPrice: 39990,
  discount: 25,
  image: 'https://example.com/game.jpg',
  quantity: 2,
  maxStock: 10
};

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let dataService: jasmine.SpyObj<DataService>;
  let authService: jasmine.SpyObj<AuthService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  // Signals compartidos entre tests
  let cartSignal: ReturnType<typeof signal<CartItem[]>>;
  let cartCountSignal: ReturnType<typeof signal<number>>;
  let isAuthenticatedFn: jasmine.Spy;
  let currentUserFn: jasmine.Spy;

  beforeEach(async () => {
    cartSignal = signal<CartItem[]>([]);
    cartCountSignal = signal<number>(0);

    const dataServiceSpy = jasmine.createSpyObj('DataService', [
      'updateCartItemHTTP',
      'removeFromCartHTTP',
      'clearCartHTTP',
      'createOrderHTTP'
    ]);

    // Asignar signals como propiedades del spy
    Object.defineProperty(dataServiceSpy, 'cart', { get: () => cartSignal, configurable: true });
    Object.defineProperty(dataServiceSpy, 'cartCount', { get: () => cartCountSignal, configurable: true });

    dataServiceSpy.updateCartItemHTTP.and.returnValue(Promise.resolve(true));
    dataServiceSpy.removeFromCartHTTP.and.returnValue(Promise.resolve(true));
    dataServiceSpy.clearCartHTTP.and.returnValue(Promise.resolve(true));
    dataServiceSpy.createOrderHTTP.and.returnValue(Promise.resolve({
      orderNumber: 'ORD-001',
      items: [],
      userId: 'test@example.com',
      status: 'pending',
      subtotal: 0,
      discount: 0,
      total: 0,
      shippingAddress: {},
      paymentMethod: 'card',
      createdAt: '2024-01-01'
    } as any));

    isAuthenticatedFn = jasmine.createSpy('isAuthenticated').and.returnValue(true);
    currentUserFn = jasmine.createSpy('currentUser').and.returnValue(mockUser);

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'currentUser']);
    authServiceSpy.isAuthenticated = isAuthenticatedFn;
    authServiceSpy.currentUser = currentUserFn;

    const notifSpy = jasmine.createSpyObj('NotificationService', [
      'success', 'error', 'warning', 'info'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', [
      'navigate', 'createUrlTree', 'serializeUrl'
    ]);
    routerSpy.createUrlTree.and.returnValue({} as any);
    routerSpy.serializeUrl.and.returnValue('/mocked-url');

    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notifSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ===================================
  // ngOnInit
  // ===================================

  it('should initialize without errors', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  // ===================================
  // isEmpty computed
  // ===================================

  describe('isEmpty', () => {
    it('should be true when cart is empty', () => {
      cartSignal.set([]);
      expect(component.isEmpty()).toBeTrue();
    });

    it('should be false when cart has items', () => {
      cartSignal.set([mockCartItem]);
      expect(component.isEmpty()).toBeFalse();
    });
  });

  // ===================================
  // cartSummary computed
  // ===================================

  describe('cartSummary', () => {
    it('should return zeros for empty cart', () => {
      cartSignal.set([]);
      const summary = component.cartSummary();
      expect(summary.subtotal).toBe(0);
      expect(summary.totalItems).toBe(0);
      expect(summary.total).toBe(0);
      expect(summary.totalDiscount).toBe(0);
    });

    it('should calculate subtotal correctly', () => {
      cartSignal.set([mockCartItem]);
      const summary = component.cartSummary();
      expect(summary.subtotal).toBe(mockCartItem.price * mockCartItem.quantity); // 59980
    });

    it('should calculate totalItems correctly', () => {
      cartSignal.set([mockCartItem, { ...mockCartItem, id: 'prod-2', quantity: 1 }]);
      const summary = component.cartSummary();
      expect(summary.totalItems).toBe(3); // 2 + 1
    });

    it('should calculate discount when originalPrice > price', () => {
      cartSignal.set([mockCartItem]); // discount = 25%, originalPrice = 39990
      const summary = component.cartSummary();
      expect(summary.totalDiscount).toBeGreaterThan(0);
    });

    it('should not count discount when price equals originalPrice', () => {
      const noDiscountItem: CartItem = { ...mockCartItem, originalPrice: mockCartItem.price };
      cartSignal.set([noDiscountItem]);
      const summary = component.cartSummary();
      expect(summary.totalDiscount).toBe(0);
    });
  });

  // ===================================
  // formatPrice()
  // ===================================

  describe('formatPrice()', () => {
    it('should format price in CLP format', () => {
      const formatted = component.formatPrice(29990);
      expect(formatted).toContain('29');
      expect(formatted).toContain('990');
    });

    it('should handle zero price', () => {
      const formatted = component.formatPrice(0);
      expect(formatted).toBeTruthy();
    });
  });

  // ===================================
  // getDiscountPercent()
  // ===================================

  describe('getDiscountPercent()', () => {
    it('should calculate discount percentage correctly', () => {
      const percent = component.getDiscountPercent(mockCartItem);
      expect(percent).toBe(25);
    });

    it('should return 0 when originalPrice equals price', () => {
      const noDiscountItem: CartItem = { ...mockCartItem, originalPrice: mockCartItem.price };
      expect(component.getDiscountPercent(noDiscountItem)).toBe(0);
    });

    it('should return 0 when originalPrice is less than price', () => {
      const item: CartItem = { ...mockCartItem, originalPrice: mockCartItem.price - 100 };
      expect(component.getDiscountPercent(item)).toBe(0);
    });
  });

  // ===================================
  // goToCategories()
  // ===================================

  describe('goToCategories()', () => {
    it('should navigate to /', () => {
      component.goToCategories();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  // ===================================
  // goToProduct()
  // ===================================

  describe('goToProduct()', () => {
    it('should not throw when called', () => {
      expect(() => component.goToProduct('prod-1')).not.toThrow();
    });
  });

  // ===================================
  // closeCheckoutModal()
  // ===================================

  describe('closeCheckoutModal()', () => {
    it('should set showCheckoutModal to false', () => {
      component.showCheckoutModal.set(true);
      component.closeCheckoutModal();
      expect(component.showCheckoutModal()).toBeFalse();
    });

    it('should navigate to /', () => {
      component.closeCheckoutModal();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  // ===================================
  // processCheckout()
  // ===================================

  describe('processCheckout()', () => {
    it('should show warning when cart is empty', () => {
      cartSignal.set([]);
      component.processCheckout();
      expect(notificationService.warning).toHaveBeenCalledWith('Tu carrito está vacío');
    });

    it('should redirect to login when user not authenticated', () => {
      cartSignal.set([mockCartItem]);
      isAuthenticatedFn.and.returnValue(false);
      component.processCheckout();
      expect(router.navigate).toHaveBeenCalledWith(
        ['/login'],
        jasmine.objectContaining({ queryParams: { returnUrl: '/cart' } })
      );
    });

    it('should show info when redirecting to login', () => {
      cartSignal.set([mockCartItem]);
      isAuthenticatedFn.and.returnValue(false);
      component.processCheckout();
      expect(notificationService.info).toHaveBeenCalled();
    });

    it('should set isProcessingCheckout to true when processing', fakeAsync(() => {
      cartSignal.set([mockCartItem]);
      isAuthenticatedFn.and.returnValue(true);
      currentUserFn.and.returnValue(mockUser);

      component.processCheckout();
      expect(component.isProcessingCheckout()).toBeTrue();

      tick(2000);
    }));

    it('should complete order after 2 seconds', fakeAsync(async () => {
      cartSignal.set([mockCartItem]);
      isAuthenticatedFn.and.returnValue(true);
      currentUserFn.and.returnValue(mockUser);

      component.processCheckout();
      tick(2000);
      await Promise.resolve(); // flush async operations

      expect(dataService.createOrderHTTP).toHaveBeenCalled();
    }));
  });

  // ===================================
  // increaseQuantity()
  // ===================================

  describe('increaseQuantity()', () => {
    it('should call updateCartItemHTTP when item quantity < maxStock', async () => {
      cartSignal.set([{ ...mockCartItem, quantity: 1, maxStock: 10 }]);
      await component.increaseQuantity(0);
      expect(dataService.updateCartItemHTTP).toHaveBeenCalledWith(
        mockUser.email, mockCartItem.id, 2
      );
    });

    it('should show warning when max stock reached', async () => {
      cartSignal.set([{ ...mockCartItem, quantity: 10, maxStock: 10 }]);
      await component.increaseQuantity(0);
      expect(notificationService.warning).toHaveBeenCalledWith('Stock máximo alcanzado');
    });

    it('should show warning when user is not logged in', async () => {
      cartSignal.set([mockCartItem]);
      currentUserFn.and.returnValue(null);
      await component.increaseQuantity(0);
      expect(notificationService.warning).toHaveBeenCalled();
    });
  });

  // ===================================
  // decreaseQuantity()
  // ===================================

  describe('decreaseQuantity()', () => {
    it('should call updateCartItemHTTP when quantity > 1', async () => {
      cartSignal.set([{ ...mockCartItem, quantity: 3 }]);
      await component.decreaseQuantity(0);
      expect(dataService.updateCartItemHTTP).toHaveBeenCalledWith(
        mockUser.email, mockCartItem.id, 2
      );
    });

    it('should call removeFromCartHTTP when quantity is 1', async () => {
      cartSignal.set([{ ...mockCartItem, quantity: 1 }]);
      await component.decreaseQuantity(0);
      expect(dataService.removeFromCartHTTP).toHaveBeenCalled();
    });

    it('should show warning when user is not logged in', async () => {
      cartSignal.set([mockCartItem]);
      currentUserFn.and.returnValue(null);
      await component.decreaseQuantity(0);
      expect(notificationService.warning).toHaveBeenCalled();
    });
  });

  // ===================================
  // removeFromCart()
  // ===================================

  describe('removeFromCart()', () => {
    it('should call removeFromCartHTTP with correct params', async () => {
      cartSignal.set([mockCartItem]);
      await component.removeFromCart(0);
      expect(dataService.removeFromCartHTTP).toHaveBeenCalledWith(
        mockUser.email, mockCartItem.id
      );
    });

    it('should show warning when user is not logged in', async () => {
      cartSignal.set([mockCartItem]);
      currentUserFn.and.returnValue(null);
      await component.removeFromCart(0);
      expect(notificationService.warning).toHaveBeenCalled();
    });

    it('should show success notification on successful removal', async () => {
      cartSignal.set([mockCartItem]);
      await component.removeFromCart(0);
      expect(notificationService.success).toHaveBeenCalled();
    });
  });

  // ===================================
  // clearCart()
  // ===================================

  describe('clearCart()', () => {
    it('should show info notification when cart is already empty', async () => {
      cartSignal.set([]);
      await component.clearCart();
      expect(notificationService.info).toHaveBeenCalledWith('El carrito ya está vacío');
    });

    it('should show warning when user is not logged in', async () => {
      cartSignal.set([mockCartItem]);
      currentUserFn.and.returnValue(null);
      await component.clearCart();
      expect(notificationService.warning).toHaveBeenCalled();
    });

    it('should call clearCartHTTP when confirmed with items', async () => {
      cartSignal.set([mockCartItem]);
      spyOn(window, 'confirm').and.returnValue(true);

      await component.clearCart();

      expect(dataService.clearCartHTTP).toHaveBeenCalledWith(mockUser.email);
    });

    it('should NOT call clearCartHTTP when confirm is declined', async () => {
      cartSignal.set([mockCartItem]);
      spyOn(window, 'confirm').and.returnValue(false);

      await component.clearCart();

      expect(dataService.clearCartHTTP).not.toHaveBeenCalled();
    });
  });
});
